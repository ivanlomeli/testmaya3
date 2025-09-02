use actix_web::{web, HttpResponse, Result};
use sqlx::PgPool;
use serde_json::json;
use bcrypt::{hash, verify, DEFAULT_COST};

// 🔥 CORREGIDO: usar create_jwt en lugar de generate_jwt y quitar imports no usados
use crate::models::{RegisterUserRequest, LoginRequest, LoginResponse, UserRole, UserInfo};
use crate::utils::create_jwt; // 🔥 CAMBIÉ generate_jwt por create_jwt

pub async fn register(
    pool: web::Data<PgPool>,
    req: web::Json<RegisterUserRequest>,
) -> Result<HttpResponse> {
    // Validación manual básica
    if req.email.is_empty() || req.password.is_empty() || req.first_name.is_empty() || req.last_name.is_empty() {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Email, contraseña, nombre y apellido son requeridos"
        })));
    }

    // Verificar si el usuario ya existe
    let existing_user = sqlx::query!("SELECT id FROM users WHERE email = $1", req.email)
        .fetch_optional(pool.as_ref())
        .await;

    match existing_user {
        Ok(Some(_)) => {
            return Ok(HttpResponse::Conflict().json(json!({
                "error": "El email ya está registrado"
            })));
        }
        Ok(None) => {
            // Usuario no existe, continuar
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
    let user_role = match req.role.as_str() {
        "admin" => UserRole::Admin,
        "hotel_owner" => UserRole::HotelOwner,
        "business_owner" => UserRole::BusinessOwner,
        "customer" => UserRole::Customer,
        _ => UserRole::Customer, // Default
    };

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
        user_role as UserRole
    )
    .fetch_one(pool.as_ref())
    .await;

    match result {
        Ok(user_record) => {
            // 🔥 CORREGIDO: convertir string role de la BD a enum
            let role_enum = match user_record.role.as_str() {
                "admin" => UserRole::Admin,
                "hotel_owner" => UserRole::HotelOwner,
                "business_owner" => UserRole::BusinessOwner,
                "customer" => UserRole::Customer,
                _ => UserRole::Customer,
            };

            let user_info = UserInfo {
                id: user_record.id,
                email: user_record.email,
                role: role_enum, // 🔥 USAR enum convertido
                first_name: user_record.first_name,
                last_name: user_record.last_name,
                phone: user_record.phone,
            };

            // 🔥 CORREGIDO: usar create_jwt con conversión manual de role
            let role_str = match user_info.role {
                UserRole::Admin => "admin",
                UserRole::HotelOwner => "hotel_owner",
                UserRole::BusinessOwner => "business_owner",
                UserRole::Customer => "customer",
            };

            let token = match create_jwt(user_info.id, &user_info.email, role_str) {
                Ok(token) => token,
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
            println!("Error insertando usuario: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al registrar usuario"
            })))
        }
    }
}

pub async fn login(
    pool: web::Data<PgPool>,
    req: web::Json<LoginRequest>,
) -> Result<HttpResponse> {
    // Validación manual básica
    if req.email.is_empty() || req.password.is_empty() {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Email y contraseña son requeridos"
        })));
    }

    // Buscar usuario por email
    let user = sqlx::query!(
        "SELECT id, email, password_hash, first_name, last_name, phone, role FROM users WHERE email = $1",
        req.email
    )
    .fetch_optional(pool.as_ref())
    .await;

    match user {
        Ok(Some(user_record)) => {
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
                return Ok(HttpResponse::Unauthorized().json(json!({
                    "error": "Credenciales inválidas"
                })));
            }

            // 🔥 CORREGIDO: convertir string role de la BD a enum
            let role_enum = match user_record.role.as_str() {
                "admin" => UserRole::Admin,
                "hotel_owner" => UserRole::HotelOwner,
                "business_owner" => UserRole::BusinessOwner,
                "customer" => UserRole::Customer,
                _ => UserRole::Customer,
            };

            let user_info = UserInfo {
                id: user_record.id,
                email: user_record.email,
                role: role_enum, // 🔥 USAR enum convertido
                first_name: user_record.first_name,
                last_name: user_record.last_name,
                phone: user_record.phone,
            };

            // 🔥 CORREGIDO: usar create_jwt con conversión manual de role
            let role_str = match user_info.role {
                UserRole::Admin => "admin",
                UserRole::HotelOwner => "hotel_owner",
                UserRole::BusinessOwner => "business_owner",
                UserRole::Customer => "customer",
            };

            let token = match create_jwt(user_info.id, &user_info.email, role_str) {
                Ok(token) => token,
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
            Ok(HttpResponse::Unauthorized().json(json!({
                "error": "Credenciales inválidas"
            })))
        }
        Err(e) => {
            println!("Error buscando usuario: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error de autenticación"
            })))
        }
    }
}

pub async fn me(user: UserInfo) -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(user))
}