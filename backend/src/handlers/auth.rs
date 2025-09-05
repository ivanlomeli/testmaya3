use actix_web::{web, HttpResponse, post};
use sqlx::{PgPool, Row};
use bcrypt::{hash, verify, DEFAULT_COST};
use serde_json::json;

use crate::models::{CreateUserRequest, LoginRequest, UserRole};
use crate::utils::{jwt::create_jwt, errors::AppError};

#[post("/api/register")]
pub async fn register(
    pool: web::Data<PgPool>,
    req: web::Json<CreateUserRequest>,
) -> Result<HttpResponse, AppError> {
    let email = req.email.trim().to_lowercase();
    
    if email.is_empty() || !email.contains('@') {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Email inválido"
        })));
    }

    if req.password.len() < 6 {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "La contraseña debe tener al menos 6 caracteres"
        })));
    }

    let existing_user = sqlx::query("SELECT id FROM users WHERE email = $1")
        .bind(&email)
        .fetch_optional(pool.get_ref())
        .await?;

    if existing_user.is_some() {
        return Ok(HttpResponse::Conflict().json(json!({
            "error": "El email ya está registrado"
        })));
    }

    let password_hash = hash(&req.password, DEFAULT_COST)
        .map_err(|_| AppError::InternalServerError)?;

    let role_str = req.role.to_string();

    let result = sqlx::query(
        r#"
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name, last_name, phone, role, created_at
        "#
    )
    .bind(&email)
    .bind(&password_hash)
    .bind(req.first_name.as_deref())
    .bind(req.last_name.as_deref())
    .bind(req.phone.as_deref())
    .bind(&role_str)
    .fetch_one(pool.get_ref())
    .await?;

    let user_id: i32 = result.get("id");
    let user_email: String = result.get("email");
    let user_role: String = result.get("role");
    let first_name: Option<String> = result.try_get("first_name").ok();
    let last_name: Option<String> = result.try_get("last_name").ok();
    let phone: Option<String> = result.try_get("phone").ok();

    let token = create_jwt(
        user_id, 
        &user_email, 
        &user_role,
        first_name.as_deref(),
        last_name.as_deref(),
        phone.as_deref()
    ).map_err(|_| AppError::InternalServerError)?;

    Ok(HttpResponse::Created().json(json!({
        "message": "Usuario registrado exitosamente",
        "token": token,
        "user": {
            "id": user_id,
            "email": user_email,
            "role": user_role,
            "first_name": first_name,
            "last_name": last_name,
            "phone": phone
        }
    })))
}

#[post("/api/login")]
pub async fn login(
    pool: web::Data<PgPool>,
    req: web::Json<LoginRequest>,
) -> Result<HttpResponse, AppError> {
    let email = req.email.trim().to_lowercase();

    if email.is_empty() {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Email es requerido"
        })));
    }

    let user = sqlx::query(
        "SELECT id, email, password_hash, first_name, last_name, phone, role FROM users WHERE email = $1"
    )
    .bind(&email)
    .fetch_optional(pool.get_ref())
    .await?;

    match user {
        Some(user_record) => {
            let stored_hash: String = user_record.get("password_hash");
            
            if verify(&req.password, &stored_hash).unwrap_or(false) {
                let user_id: i32 = user_record.get("id");
                let user_email: String = user_record.get("email");
                let user_role: String = user_record.get("role");
                let first_name: Option<String> = user_record.try_get("first_name").ok();
                let last_name: Option<String> = user_record.try_get("last_name").ok();
                let phone: Option<String> = user_record.try_get("phone").ok();

                let token = create_jwt(
                    user_id, 
                    &user_email, 
                    &user_role,
                    first_name.as_deref(),
                    last_name.as_deref(),
                    phone.as_deref()
                ).map_err(|_| AppError::InternalServerError)?;

                Ok(HttpResponse::Ok().json(json!({
                    "message": "Login exitoso",
                    "token": token,
                    "user": {
                        "id": user_id,
                        "email": user_email,
                        "role": user_role,
                        "first_name": first_name,
                        "last_name": last_name,
                        "phone": phone
                    }
                })))
            } else {
                Ok(HttpResponse::Unauthorized().json(json!({
                    "error": "Credenciales inválidas"
                })))
            }
        }
        None => {
            Ok(HttpResponse::Unauthorized().json(json!({
                "error": "Credenciales inválidas"
            })))
        }
    }
}
