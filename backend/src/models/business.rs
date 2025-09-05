use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use sqlx::types::JsonValue;

#[derive(Debug, Serialize, Deserialize)]
pub struct Business {
    pub id: i32,
    pub owner_id: i32,
    pub business_type: String,
    pub name: String,
    pub description: Option<String>,
    pub location: String,
    pub address: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub status: String,
    pub business_data: JsonValue,
    pub operating_hours: JsonValue,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub approved_at: Option<DateTime<Utc>>,
    pub approved_by: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct BusinessResponse {
    pub id: i32,
    pub business_type: String,
    pub name: String,
    pub description: Option<String>,
    pub location: String,
    pub address: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub status: String,
    pub business_data: JsonValue,
    pub operating_hours: JsonValue,
    pub images: Vec<BusinessImage>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BusinessImage {
    pub id: i32,
    pub business_id: i32,
    pub image_url: String,
    pub image_type: String,
    pub display_order: Option<i32>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBusinessRequest {
    pub business_type: String,
    pub name: String,
    pub description: Option<String>,
    pub location: String,
    pub address: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub business_data: JsonValue,
    pub operating_hours: JsonValue,
    pub images: Option<Vec<BusinessImageInput>>,
}

#[derive(Debug, Deserialize)]
pub struct BusinessImageInput {
    pub image_url: String,
    pub image_type: String,
    pub display_order: i32,
}
