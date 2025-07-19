use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: i32,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub role: UserRole,
    pub first_name: String,
    pub last_name: String,
    pub phone: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub verified: Option<bool>,
    pub verification_token: Option<String>,
    pub reset_password_token: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type, Clone)]
pub enum UserRole {
    Admin,
    HotelOwner,
    Customer,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateUserRequest {
    #[validate(email(message = "Email inválido"))]
    pub email: String,
    
    #[validate(length(min = 8, message = "Password debe tener al menos 8 caracteres"))]
    pub password: String,
    
    #[validate(length(min = 2, max = 50, message = "Nombre debe tener entre 2 y 50 caracteres"))]
    pub first_name: String,
    
    #[validate(length(min = 2, max = 50, message = "Apellido debe tener entre 2 y 50 caracteres"))]
    pub last_name: String,
    
    pub phone: Option<String>,
    pub role: Option<UserRole>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email(message = "Email inválido"))]
    pub email: String,
    
    #[validate(length(min = 1, message = "Password requerido"))]
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserInfo,
}

#[derive(Debug, Serialize, Clone)]
pub struct UserInfo {
    pub id: i32,
    pub email: String,
    pub role: UserRole,
    pub first_name: String,
    pub last_name: String,
    pub phone: Option<String>,
}

impl From<User> for UserInfo {
    fn from(user: User) -> Self {
        UserInfo {
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
        }
    }
}