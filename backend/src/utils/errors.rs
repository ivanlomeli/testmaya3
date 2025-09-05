// backend/src/utils/errors.rs
use actix_web::{HttpResponse, ResponseError};
use serde_json::json;
use std::fmt;

#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    Unauthorized(String),
    Forbidden(String),
    NotFound(String),  // ✅ AHORA requiere String
    Conflict(String),
    InternalServerError(String),
    DatabaseError(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::BadRequest(msg) => write!(f, "Bad Request: {}", msg),
            AppError::Unauthorized(msg) => write!(f, "Unauthorized: {}", msg),
            AppError::Forbidden(msg) => write!(f, "Forbidden: {}", msg),
            AppError::NotFound(msg) => write!(f, "Not Found: {}", msg),
            AppError::Conflict(msg) => write!(f, "Conflict: {}", msg),
            AppError::InternalServerError(msg) => write!(f, "Internal Server Error: {}", msg),
            AppError::DatabaseError(msg) => write!(f, "Database Error: {}", msg),
        }
    }
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        match self {
            AppError::BadRequest(msg) => HttpResponse::BadRequest().json(json!({"error": msg})),
            AppError::Unauthorized(msg) => HttpResponse::Unauthorized().json(json!({"error": msg})),
            AppError::Forbidden(msg) => HttpResponse::Forbidden().json(json!({"error": msg})),
            AppError::NotFound(msg) => HttpResponse::NotFound().json(json!({"error": msg})),
            AppError::Conflict(msg) => HttpResponse::Conflict().json(json!({"error": msg})),
            AppError::InternalServerError(msg) => HttpResponse::InternalServerError().json(json!({"error": msg})),
            AppError::DatabaseError(msg) => HttpResponse::InternalServerError().json(json!({"error": msg})),
        }
    }
}

// ✅ IMPLEMENTAR From traits para las dependencias
impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        AppError::DatabaseError(format!("Database error: {}", err))
    }
}

impl From<bcrypt::BcryptError> for AppError {
    fn from(_: bcrypt::BcryptError) -> Self {
        AppError::InternalServerError("Error procesando contraseña".to_string())
    }
}

impl From<jsonwebtoken::errors::Error> for AppError {
    fn from(_: jsonwebtoken::errors::Error) -> Self {
        AppError::InternalServerError("Error procesando token".to_string())
    }
}