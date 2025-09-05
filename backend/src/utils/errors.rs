// backend/src/utils/errors.rs
use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use serde_json::json;
use sqlx::Error as SqlxError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Error de base de datos: {0}")]
    DatabaseError(#[from] SqlxError),

    #[error("Recurso no encontrado: {0}")]
    NotFound(String),
    
    #[error("No autorizado")]
    Unauthorized,

    #[error("Acceso prohibido: {0}")]
    Forbidden(String),

    #[error("Solicitud incorrecta: {0}")]
    BadRequest(String),

    #[error("Error interno del servidor: {0}")]
    InternalServerError(String),
}

impl ResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::NotFound(_) => StatusCode::NOT_FOUND,
            AppError::Unauthorized => StatusCode::UNAUTHORIZED,
            AppError::Forbidden(_) => StatusCode::FORBIDDEN,
            AppError::BadRequest(_) => StatusCode::BAD_REQUEST,
            AppError::InternalServerError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        let status_code = self.status_code();
        let error_message = self.to_string();
        
        HttpResponse::build(status_code).json(json!({
            "status": "error",
            "statusCode": status_code.as_u16(),
            "message": error_message,
        }))
    }
}

// Constructor helpers para facilitar el uso
impl AppError {
    pub fn not_found(msg: &str) -> Self {
        AppError::NotFound(msg.to_string())
    }

    pub fn bad_request(msg: &str) -> Self {
        AppError::BadRequest(msg.to_string())
    }

    pub fn internal_error(msg: &str) -> Self {
        AppError::InternalServerError(msg.to_string())
    }

    pub fn forbidden(msg: &str) -> Self {
        AppError::Forbidden(msg.to_string())
    }
}