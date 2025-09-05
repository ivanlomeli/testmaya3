// middleware/auth.rs

use actix_web::{Error, FromRequest, HttpRequest, HttpResponse};
use actix_web::error::{ErrorUnauthorized, ErrorInternalServerError};
use futures_util::future::{ok, err, Ready};
use sqlx::PgPool;

use crate::models::{UserInfo, UserRole};
use crate::utils::verify_jwt;

impl FromRequest for UserInfo {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        // Extraer el header de autorización
        let auth_header = req.headers().get("Authorization");
        
        if let Some(auth_value) = auth_header {
            if let Ok(auth_str) = auth_value.to_str() {
                if auth_str.starts_with("Bearer ") {
                    let token = &auth_str[7..]; // Remover "Bearer " prefix
                    
                    println!("Token recibido en middleware: {}", &token[..20.min(token.len())]); // Log solo los primeros 20 caracteres
                    
                    // Verificar el token JWT
                    match verify_jwt(token) {
                        Ok(claims) => {
                            println!("Token verificado exitosamente para usuario: {}", claims.email);
                            
                            // Convertir role string a UserRole enum
                            let role = UserRole::from_string(&claims.role);
                            
                            // Parsear user ID desde los claims
                            let user_id = match claims.sub.parse::<i32>() {
                                Ok(id) => id,
                                Err(e) => {
                                    println!("Error parseando user ID del token: {}", e);
                                    return err(ErrorUnauthorized("ID de usuario inválido en token"));
                                }
                            };
                            
                            // TODO: Para una implementación más robusta, podrías consultar la BD
                            // para obtener los datos completos del usuario aquí
                            let user_info = UserInfo {
                                id: user_id,
                                email: claims.email,
                                role,
                                first_name: "Usuario".to_string(), // Temporal
                                last_name: "".to_string(),        // Temporal
                                phone: None,
                            };
                            
                            println!("Usuario autenticado: ID={}, email={}, role={:?}", user_info.id, user_info.email, user_info.role);
                            return ok(user_info);
                        }
                        Err(e) => {
                            println!("Error verificando JWT: {}", e);
                            return err(ErrorUnauthorized("Token JWT inválido"));
                        }
                    }
                } else {
                    println!("Header de autorización no tiene formato Bearer");
                }
            } else {
                println!("No se pudo parsear el header de autorización");
            }
        } else {
            println!("No se encontró header de autorización");
        }
        
        err(ErrorUnauthorized("Token de autorización inválido o faltante"))
    }
}

// Función auxiliar para verificar roles específicos
pub fn require_role(required_role: UserRole) -> impl Fn(&UserInfo) -> bool {
    move |user: &UserInfo| {
        match (&user.role, &required_role) {
            (UserRole::Admin, _) => true, // Admin puede acceder a todo
            (role, required) => role == required,
        }
    }
}

// Middleware más robusto que consulta la BD (opcional)
pub async fn get_user_from_token_with_db(
    token: &str,
    pool: &PgPool,
) -> Result<UserInfo, Error> {
    // Verificar token
    let claims = verify_jwt(token)
        .map_err(|e| ErrorUnauthorized(format!("Token inválido: {}", e)))?;
    
    // Parsear user ID
    let user_id: i32 = claims.sub.parse()
        .map_err(|_| ErrorUnauthorized("ID de usuario inválido"))?;
    
    // Consultar usuario en la BD
    let user_record = sqlx::query!(
        "SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = $1",
        user_id
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| ErrorInternalServerError(format!("Error de BD: {}", e)))?;
    
    match user_record {
        Some(user) => {
            let role = UserRole::from_string(&user.role);
            Ok(UserInfo {
                id: user.id,
                email: user.email,
                role,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
            })
        }
        None => Err(ErrorUnauthorized("Usuario no encontrado"))
    }
}

// Macro para verificar permisos específicos
#[macro_export]
macro_rules! require_admin {
    ($user:expr) => {
        if !matches!($user.role, UserRole::Admin) {
            return Ok(HttpResponse::Forbidden().json(serde_json::json!({
                "error": "Se requieren permisos de administrador"
            })));
        }
    };
}

#[macro_export]
macro_rules! require_hotel_owner_or_admin {
    ($user:expr) => {
        if !matches!($user.role, UserRole::Admin | UserRole::HotelOwner) {
            return Ok(HttpResponse::Forbidden().json(serde_json::json!({
                "error": "Se requieren permisos de dueño de hotel o administrador"
            })));
        }
    };
}

#[macro_export]
macro_rules! require_business_owner_or_admin {
    ($user:expr) => {
        if !matches!($user.role, UserRole::Admin | UserRole::BusinessOwner) {
            return Ok(HttpResponse::Forbidden().json(serde_json::json!({
                "error": "Se requieren permisos de dueño de negocio o administrador"
            })));
        }
    };
}