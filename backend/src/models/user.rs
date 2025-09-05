use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: i32,
    pub email: String,
    pub password_hash: String,
    pub first_name: String,
    pub last_name: String,
    pub phone: Option<String>,
    pub role: UserRole,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
pub enum UserRole {
    Admin,
    HotelOwner,
    BusinessOwner,
    Customer,
}

impl UserRole {
    pub fn from_string(role: &str) -> Self {
        match role.to_lowercase().as_str() {
            "admin" => UserRole::Admin,
            "hotelowner" | "hotel_owner" => UserRole::HotelOwner,
            "businessowner" | "business_owner" => UserRole::BusinessOwner,
            "customer" => UserRole::Customer,
            _ => UserRole::Customer, // Default
        }
    }
    
    pub fn to_string(&self) -> String {
        match self {
            UserRole::Admin => "admin".to_string(),
            UserRole::HotelOwner => "hotelowner".to_string(),
            UserRole::BusinessOwner => "businessowner".to_string(),
            UserRole::Customer => "customer".to_string(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserInfo {
    pub id: i32,
    pub email: String,
    pub role: UserRole,
    pub first_name: String,
    pub last_name: String,
    pub phone: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterUserRequest {
    #[validate(email(message = "Email inválido"))]
    pub email: String,
    
    #[validate(length(min = 6, message = "La contraseña debe tener al menos 6 caracteres"))]
    pub password: String,
    
    #[validate(length(min = 1, max = 100, message = "El nombre es requerido"))]
    pub first_name: String,
    
    #[validate(length(min = 1, max = 100, message = "El apellido es requerido"))]
    pub last_name: String,
    
    pub phone: Option<String>,
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserInfo,
}