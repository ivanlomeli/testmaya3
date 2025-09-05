use actix_web::{Error, FromRequest, HttpRequest};
use actix_web::error::{ErrorUnauthorized, ErrorInternalServerError};
use futures::future::{ok, err, Ready};
use sqlx::{PgPool, Row};

use crate::models::{UserInfo, UserRole};
use crate::utils::jwt::verify_jwt;

pub struct JwtMiddleware;

impl FromRequest for JwtMiddleware {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        if let Some(auth_header) = req.headers().get("Authorization") {
            if let Ok(auth_str) = auth_header.to_str() {
                if auth_str.starts_with("Bearer ") {
                    let token = &auth_str[7..];
                    match verify_jwt(token) {
                        Ok(_claims) => {
                            return ok(JwtMiddleware);
                        }
                        Err(_) => {
                            return err(ErrorUnauthorized("Token JWT inválido"));
                        }
                    }
                }
            }
        }
        err(ErrorUnauthorized("Token de autorización inválido o faltante"))
    }
}

impl FromRequest for UserInfo {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        if let Some(auth_header) = req.headers().get("Authorization") {
            if let Ok(auth_str) = auth_header.to_str() {
                if auth_str.starts_with("Bearer ") {
                    let token = &auth_str[7..];
                    match verify_jwt(token) {
                        Ok(claims) => {
                            let role = UserRole::from_string(&claims.role);
                            let user_info = UserInfo {
                                id: claims.sub.parse().unwrap_or(0),
                                email: claims.email,
                                role,
                                first_name: claims.first_name.unwrap_or_else(|| "".to_string()).into(),
                                last_name: claims.last_name.unwrap_or_else(|| "".to_string()).into(),
                                phone: claims.phone.unwrap_or_else(|| "".to_string()).into(),
                            };
                            return ok(user_info);
                        }
                        Err(_) => {
                            return err(ErrorUnauthorized("Token JWT inválido"));
                        }
                    }
                }
            }
        }
        err(ErrorUnauthorized("Token de autorización inválido o faltante"))
    }
}

pub async fn get_user_from_token_with_db(
    token: &str,
    pool: &PgPool,
) -> Result<UserInfo, Error> {
    let claims = verify_jwt(token)
        .map_err(|e| ErrorUnauthorized(format!("Token inválido: {}", e)))?;
    
    let user_id: i32 = claims.sub.parse()
        .map_err(|_| ErrorUnauthorized("ID de usuario inválido"))?;
    
    let user_record = sqlx::query(
        "SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = $1"
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| ErrorInternalServerError(format!("Error de BD: {}", e)))?;
    
    match user_record {
        Some(user) => {
            let role = UserRole::from_string(&user.get::<String, _>("role"));
            Ok(UserInfo {
                id: user.get("id"),
                email: user.get("email"),
                role,
                first_name: user.try_get("first_name").ok(),
                last_name: user.try_get("last_name").ok(),
                phone: user.try_get("phone").ok(),
            })
        }
        None => Err(ErrorUnauthorized("Usuario no encontrado"))
    }
}
