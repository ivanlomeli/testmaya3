use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use serde_json::json;
use sqlx::Error as SqlxError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Error de base de datos: {0}")]
    DatabaseError(#[from] SqlxError),

    #[error("Recurso no encontrado")]
    NotFound,
    
    #[error("Credenciales incorrectas")]
    Unauthorized,

    #[error("Error interno del servidor")]
    InternalServerError(String),
}

impl ResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::NotFound => StatusCode::NOT_FOUND,
            AppError::Unauthorized => StatusCode::UNAUTHORIZED,
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
