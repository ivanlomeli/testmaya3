use actix_web::{web, HttpResponse, Result};
use sqlx::PgPool;
use bcrypt::{hash, verify, DEFAULT_COST};
use validator::Validate;

use crate::models::{CreateUserRequest, LoginRequest, LoginResponse, UserRole, UserInfo};
use crate::utils::create_jwt;

pub async fn register(
    pool: web::Data<PgPool>,
    req: web::Json<CreateUserRequest>,
) -> Result<HttpResponse> {
    // Validar datos de entrada
    if let Err(errors) = req.validate() {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Datos inválidos",
            "details": errors
        })));
    }

    // Verificar si el email ya existe
    let existing_user = sqlx::query!(
        "SELECT id FROM users WHERE email = $1",
        req.email
    )
    .fetch_optional(pool.get_ref())
    .await;

    match existing_user {
        Ok(Some(_)) => {
            return Ok(HttpResponse::Conflict().json(serde_json::json!({
                "error": "El email ya está registrado"
            })));
        }
        Ok(None) => {
            // Email disponible, continuar
        }
        Err(_) => {
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Error del servidor"
            })));
        }
    }

    // Hash del password
    let password_hash = match hash(&req.password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(_) => {
            return Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Error al procesar la contraseña"
            })));
        }
    };

    // Determinar rol (por defecto customer)
    let role = req.role.as_ref().unwrap_or(&UserRole::Customer);
    let role_str = match role {
        UserRole::Admin => "admin",
        UserRole::HotelOwner => "hotel_owner",
        UserRole::Customer => "customer",
    };

    // Insertar usuario en la base de datos
    let user_result = sqlx::query!(
        r#"
        INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name, last_name, phone
        "#,
        req.email,
        password_hash,
        role_str,
        req.first_name,
        req.last_name,
        req.phone
    )
    .fetch_one(pool.get_ref())
    .await;

    match user_result {
        Ok(user_row) => {
            // Crear JWT token
            match create_jwt(user_row.id, &user_row.email, role_str) {
                Ok(token) => {
                    let user_info = UserInfo {
                        id: user_row.id,
                        email: user_row.email,
                        role: role.clone(),
                        first_name: user_row.first_name,
                        last_name: user_row.last_name,
                        phone: user_row.phone,
                    };
                    
                    let response = LoginResponse {
                        token,
                        user: user_info,
                    };
                    Ok(HttpResponse::Created().json(response))
                }
                Err(_) => {
                    Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Error al generar token"
                    })))
                }
            }
        }
        Err(e) => {
            println!("Error al crear usuario: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Error al crear usuario"
            })))
        }
    }
}

pub async fn login(
    pool: web::Data<PgPool>,
    req: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    // Validar datos de entrada
    if let Err(errors) = req.validate() {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Datos inválidos",
            "details": errors
        })));
    }

    // Buscar usuario por email
    let user_result = sqlx::query!(
        r#"
        SELECT id, email, password_hash, role, first_name, last_name, phone
        FROM users 
        WHERE email = $1
        "#,
        req.email
    )
    .fetch_optional(pool.get_ref())
    .await;

    match user_result {
        Ok(Some(user_row)) => {
            // Verificar password
            match verify(&req.password, &user_row.password_hash) {
                Ok(true) => {
                    // Password correcto, convertir role y generar JWT
                    let role = match user_row.role.as_str() {
                        "admin" => UserRole::Admin,
                        "hotel_owner" => UserRole::HotelOwner,
                        "customer" => UserRole::Customer,
                        _ => UserRole::Customer,
                    };

                    match create_jwt(user_row.id, &user_row.email, &user_row.role) {
                        Ok(token) => {
                            let user_info = UserInfo {
                                id: user_row.id,
                                email: user_row.email,
                                role,
                                first_name: user_row.first_name,
                                last_name: user_row.last_name,
                                phone: user_row.phone,
                            };
                            
                            let response = LoginResponse {
                                token,
                                user: user_info,
                            };
                            Ok(HttpResponse::Ok().json(response))
                        }
                        Err(_) => {
                            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                                "error": "Error al generar token"
                            })))
                        }
                    }
                }
                Ok(false) => {
                    Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                        "error": "Credenciales inválidas"
                    })))
                }
                Err(_) => {
                    Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Error del servidor"
                    })))
                }
            }
        }
        Ok(None) => {
            Ok(HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Credenciales inválidas"
            })))
        }
        Err(e) => {
            println!("Error al buscar usuario: {}", e);
            Ok(HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Error del servidor"
            })))
        }
    }
}

pub async fn me(user: UserInfo) -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(user))
}