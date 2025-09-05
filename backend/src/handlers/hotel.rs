use actix_web::{web, HttpResponse};
use sqlx::{PgPool, Row};
use crate::{
    models::{UserInfo, UserRole, hotel::CreateHotelRequest},
    utils::errors::AppError,
};

pub async fn verify_hotel_ownership(
    pool: &PgPool,
    hotel_id: i32,
    user: &UserInfo,
) -> Result<bool, AppError> {
    if matches!(user.role, UserRole::Admin) {
        return Ok(true);
    }

    let result = sqlx::query("SELECT owner_id FROM hotels WHERE id = $1")
        .bind(hotel_id)
        .fetch_optional(pool)
        .await?;

    match result {
        Some(hotel) => Ok(hotel.get::<i32, _>("owner_id") == user.id),
        None => Ok(false),
    }
}

pub async fn create_hotel(
    pool: web::Data<PgPool>,
    req: web::Json<CreateHotelRequest>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let req = req.into_inner();

    let result = sqlx::query(
        r#"
        INSERT INTO hotels (owner_id, name, description, location, address, price, 
                           image_url, phone, email, website, rooms_available, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, name, status, created_at
        "#
    )
    .bind(user.id)
    .bind(&req.name)
    .bind(req.description.as_deref())
    .bind(&req.location)
    .bind(req.address.as_deref())
    .bind(req.price)
    .bind(req.image_url.as_deref())
    .bind(req.phone.as_deref())
    .bind(req.email.as_deref())
    .bind(req.website.as_deref())
    .bind(req.rooms_available)
    .bind("pending")
    .fetch_one(pool.get_ref())
    .await?;

    Ok(HttpResponse::Created().json(serde_json::json!({
        "message": "Hotel creado exitosamente",
        "hotel": {
            "id": result.get::<i32, _>("id"),
            "name": result.get::<String, _>("name"),
            "status": result.get::<String, _>("status"),
            "created_at": result.get::<chrono::DateTime<chrono::Utc>, _>("created_at")
        }
    })))
}

pub async fn get_my_hotels(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let hotels = sqlx::query(
        r#"
        SELECT id, name, description, location, address, price::text as price_text,
               image_url, status, created_at, approved_at, admin_notes,
               phone, email, website, rooms_available, rating::text as rating_text
        FROM hotels 
        WHERE owner_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(user.id)
    .fetch_all(pool.get_ref())
    .await?;

    let hotel_list: Vec<serde_json::Value> = hotels.into_iter().map(|h| serde_json::json!({
        "id": h.get::<i32, _>("id"),
        "name": h.get::<String, _>("name"),
        "description": h.try_get::<Option<String>, _>("description").unwrap_or(None),
        "location": h.get::<String, _>("location"),
        "address": h.try_get::<Option<String>, _>("address").unwrap_or(None),
        "price": h.get::<String, _>("price_text"),
        "image_url": h.try_get::<Option<String>, _>("image_url").unwrap_or(None),
        "status": h.get::<String, _>("status"),
        "created_at": h.get::<chrono::DateTime<chrono::Utc>, _>("created_at"),
        "approved_at": h.try_get::<Option<chrono::DateTime<chrono::Utc>>, _>("approved_at").unwrap_or(None),
        "admin_notes": h.try_get::<Option<String>, _>("admin_notes").unwrap_or(None),
        "phone": h.try_get::<Option<String>, _>("phone").unwrap_or(None),
        "email": h.try_get::<Option<String>, _>("email").unwrap_or(None),
        "website": h.try_get::<Option<String>, _>("website").unwrap_or(None),
        "rooms_available": h.get::<i32, _>("rooms_available"),
        "rating": h.try_get::<Option<String>, _>("rating_text").unwrap_or(None)
    })).collect();

    Ok(HttpResponse::Ok().json(hotel_list))
}

pub async fn get_public_hotels(
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, AppError> {
    let hotels = sqlx::query(
        r#"
        SELECT id, name, location, price::numeric::float8 as price, image_url 
        FROM hotels 
        WHERE status = 'approved'
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(pool.get_ref())
    .await?;

    let hotel_list: Vec<serde_json::Value> = hotels.into_iter().map(|h| serde_json::json!({
        "id": h.get::<i32, _>("id"),
        "name": h.get::<String, _>("name"),
        "location": h.get::<String, _>("location"),
        "price": h.get::<f64, _>("price"),
        "image_url": h.try_get::<Option<String>, _>("image_url").unwrap_or(None)
    })).collect();

    Ok(HttpResponse::Ok().json(hotel_list))
}
