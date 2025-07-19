use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc, NaiveDate};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Booking {
    pub id: i32,
    pub user_id: i32,
    pub hotel_id: i32,
    pub check_in: NaiveDate,
    pub check_out: NaiveDate,
    pub guests: i32,
    pub rooms: i32,
    pub total_price: f64,
    pub status: String,
    pub payment_status: String,
    pub special_requests: Option<String>,
    pub addon_services: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub cancelled_at: Option<DateTime<Utc>>,
    pub cancellation_reason: Option<String>,
    pub booking_reference: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateBookingRequest {
    pub hotel_id: i32,
    pub check_in: NaiveDate,
    pub check_out: NaiveDate,
    
    #[validate(range(min = 1, max = 10, message = "Número de huéspedes debe ser entre 1 y 10"))]
    pub guests: i32,
    
    #[validate(range(min = 1, max = 5, message = "Número de habitaciones debe ser entre 1 y 5"))]
    pub rooms: i32,
    
    pub special_requests: Option<String>,
    pub addon_services: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBookingStatusRequest {
    pub status: String,
    pub cancellation_reason: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct BookingResponse {
    pub id: i32,
    pub hotel_name: String,
    pub hotel_location: String,
    pub hotel_address: String,
    pub check_in: NaiveDate,
    pub check_out: NaiveDate,
    pub guests: i32,
    pub rooms: i32,
    pub total_price: f64,
    pub status: String,
    pub payment_status: String,
    pub special_requests: Option<String>,
    pub addon_services: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub booking_reference: String,
}
