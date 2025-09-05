// handlers/auth.rs

use actix_web::{web, HttpResponse, Result};
use sqlx::PgPool;
use serde_json::json;
use bcrypt::{hash, verify, DEFAULT_COST};
use validator::Validate;

use crate::models::{RegisterUserRequest, LoginRequest, LoginResponse, UserRole, UserInfo};
use crate::utils::create_jwt;

pub async fn register(
    pool: web::Data<PgPool>,
    req: web::Json<RegisterUserRequest>,
) -> Result<HttpResponse> {
    // Validación con validator
    if let Err(validation_errors) = req.validate() {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Datos de entrada inválidos",
            "details": validation_errors
        })));
    }

    // Validación manual adicional
    if req.email.is_empty() || req.password.is_empty() || req.first_name.is_empty() || req.last_name.is_empty() {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Email, contraseña, nombre y apellido son requeridos"
        })));
    }

    println!("Intentando registrar usuario: {}", req.email);

    // Verificar si el usuario ya existe
    let existing_user = sqlx::query!("SELECT id FROM users WHERE email = $1", req.email)
        .fetch_optional(pool.as_ref())
        .await;

    match existing_user {
        Ok(Some(_)) => {
            println!("Email ya registrado: {}", req.email);
            return Ok(HttpResponse::Conflict().json(json!({
                "error": "El email ya está registrado"
            })));
        }
        Ok(None) => {
            // Usuario no existe, continuar
            println!("Email disponible, procediendo con el registro");
        }
        Err(e) => {
            println!("Error verificando usuario existente: {}", e);
            return Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error interno del servidor"
            })));
        }
    }

    // Hash de la contraseña
    let password_hash = match hash(req.password.as_bytes(), DEFAULT_COST) {
        Ok(h) => h,
        Err(e) => {
            println!("Error hasheando contraseña: {}", e);
            return Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error procesando contraseña"
            })));
        }
    };

    // Convertir string a enum para el rol
    let user_role = UserRole::from_string(&req.role);
    let role_str = user_role.to_string();
    
    println!("Registrando usuario con rol: {} -> {}", req.role, role_str);

    // Insertar usuario en la base de datos
    let result = sqlx::query!(
        r#"
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name, last_name, phone, role, created_at
        "#,
        req.email,
        password_hash,
        req.first_name,
        req.last_name,
        req.phone,
        role_str
    )
    .fetch_one(pool.as_ref())
    .await;

    match result {
        Ok(user_record) => {
            println!("Usuario insertado en BD con ID: {}", user_record.id);

            // Convertir string role de la BD a enum
            let role_enum = UserRole::from_string(&user_record.role);

            let user_info = UserInfo {
                id: user_record.id,
                email: user_record.email,
                role: role_enum,
                first_name: user_record.first_name,
                last_name: user_record.last_name,
                phone: user_record.phone,
            };

            // Generar token JWT
            let token = match create_jwt(user_info.id, &user_info.email, &role_str) {
                Ok(token) => {
                    println!("Token JWT generado exitosamente");
                    token
                }
                Err(e) => {
                    println!("Error generando token: {}", e);
                    return Ok(HttpResponse::InternalServerError().json(json!({
                        "error": "Error generando token de autenticación"
                    })));
                }
            };

            let response = LoginResponse {
                token,
                user: user_info,
            };

            println!("✅ Usuario registrado exitosamente: {}", req.email);
            Ok(HttpResponse::Created().json(response))
        }
        Err(e) => {
            println!("Error insertando usuario en BD: {}", e);
            
            // Verificar si es un error de constraint único
            if e.to_string().contains("unique") || e.to_string().contains("duplicate") {
                Ok(HttpResponse::Conflict().json(json!({
                    "error": "El email ya está registrado"
                })))
            } else {
                Ok(HttpResponse::InternalServerError().json(json!({
                    "error": "Error al registrar usuario"
                })))
            }
        }
    }
}

pub async fn login(
    pool: web::Data<PgPool>,
    req: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    // Validación básica
    if req.email.is_empty() || req.password.is_empty() {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Email y contraseña son requeridos"
        })));
    }

    println!("Intento de login para: {}", req.email);

    // Buscar usuario por email
    let user = sqlx::query!(
        "SELECT id, email, password_hash, first_name, last_name, phone, role FROM users WHERE email = $1",
        req.email
    )
    .fetch_optional(pool.as_ref())
    .await;

    match user {
        Ok(Some(user_record)) => {
            println!("Usuario encontrado en BD: {}", user_record.email);

            // Verificar contraseña
            let password_valid = match verify(&req.password, &user_record.password_hash) {
                Ok(valid) => valid,
                Err(e) => {
                    println!("Error verificando contraseña: {}", e);
                    return Ok(HttpResponse::InternalServerError().json(json!({
                        "error": "Error de autenticación"
                    })));
                }
            };

            if !password_valid {
                println!("Contraseña incorrecta para: {}", req.email);
                return Ok(HttpResponse::Unauthorized().json(json!({
                    "error": "Credenciales inválidas"
                })));
            }

            // Convertir string role de la BD a enum
            let role_enum = UserRole::from_string(&user_record.role);

            let user_info = UserInfo {
                id: user_record.id,
                email: user_record.email,
                role: role_enum,
                first_name: user_record.first_name,
                last_name: user_record.last_name,
                phone: user_record.phone,
            };

            // Generar token JWT
            let token = match create_jwt(user_info.id, &user_info.email, &user_record.role) {
                Ok(token) => {
                    println!("Token JWT generado para login");
                    token
                }
                Err(e) => {
                    println!("Error generando token: {}", e);
                    return Ok(HttpResponse::InternalServerError().json(json!({
                        "error": "Error generando token de autenticación"
                    })));
                }
            };

            let response = LoginResponse {
                token,
                user: user_info,
            };

            println!("✅ Login exitoso para: {}", req.email);
            Ok(HttpResponse::Ok().json(response))
        }
        Ok(None) => {
            println!("Usuario no encontrado: {}", req.email);
            Ok(HttpResponse::Unauthorized().json(json!({
                "error": "Credenciales inválidas"
            })))
        }
        Err(e) => {
            println!("Error buscando usuario en BD: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error de autenticación"
            })))
        }
    }
}

pub async fn me(user: UserInfo) -> Result<HttpResponse> {
    println!("Endpoint /me accedido por usuario: {}", user.email);
    Ok(HttpResponse::Ok().json(user))
}