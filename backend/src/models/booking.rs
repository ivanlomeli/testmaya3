use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "booking_status", rename_all = "snake_case")]
pub enum BookingStatus { // "pub" añadido aquí
    Confirmed,
    Cancelled,
    Pending,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Booking {
    pub id: i32,
    pub hotel_id: i32,
    pub customer_id: i32,
    pub check_in_date: DateTime<Utc>,
    pub check_out_date: DateTime<Utc>,
    pub status: BookingStatus,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBookingRequest {
    pub hotel_id: i32,
    pub check_in_date: DateTime<Utc>,
    pub check_out_date: DateTime<Utc>,
}
