use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Hotel {
    pub id: i32,
    pub owner_id: i32,
    pub name: String,
    pub description: Option<String>,
    pub location: String,
    pub address: String,
    pub price: f64,
    pub image_url: Option<String>,
    pub status: HotelStatus,
    pub admin_notes: Option<String>,
    pub approved_by: Option<i32>,
    pub approved_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub rooms_available: Option<i32>,
    pub rating: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "hotel_status", rename_all = "lowercase")]
pub enum HotelStatus {
    Pending,
    Approved,
    Rejected,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateHotelRequest {
    #[validate(length(min = 2, max = 255, message = "Nombre debe tener entre 2 y 255 caracteres"))]
    pub name: String,
    
    pub description: Option<String>,
    
    #[validate(length(min = 2, max = 255, message = "Ubicación requerida"))]
    pub location: String,
    
    #[validate(length(min = 5, message = "Dirección debe ser más específica"))]
    pub address: String,
    
    #[validate(range(min = 0.01, message = "Precio debe ser mayor a 0"))]
    pub price: f64,
    
    pub image_url: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub rooms_available: Option<i32>,
}