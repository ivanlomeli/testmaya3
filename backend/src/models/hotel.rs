use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use bigdecimal::BigDecimal;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize)]
pub struct Hotel {
    pub id: i32,
    pub owner_id: i32,
    pub name: String,
    pub description: Option<String>,
    pub location: String,
    pub address: Option<String>,
    pub price: BigDecimal,
    pub image_url: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub rooms_available: i32,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub approved_at: Option<DateTime<Utc>>,
    pub admin_notes: Option<String>,
    pub rating: Option<BigDecimal>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "hotel_status", rename_all = "lowercase")]
pub enum HotelStatus {
    Pending,
    Approved,
    Rejected,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CreateHotelRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    #[validate(length(max = 1000))]
    pub description: Option<String>,
    #[validate(length(min = 1, max = 255))]
    pub location: String,
    #[validate(length(max = 500))]
    pub address: Option<String>,
    pub price: f64,
    #[validate(url)]
    pub image_url: Option<String>,
    pub phone: Option<String>,
    #[validate(email)]
    pub email: Option<String>,
    #[validate(url)]
    pub website: Option<String>,
    #[validate(range(min = 1))]
    pub rooms_available: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PublicHotel {
    pub id: i32,
    pub name: String,
    pub location: String,
    pub price: f64,
    pub image_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RejectReason {
    pub reason: String,
}
