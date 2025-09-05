use actix_web::{web, HttpResponse};
use sqlx::{PgPool, Row};
use crate::{
    models::{UserInfo, booking::CreateBookingRequest},
    utils::errors::AppError,
};

pub async fn create_booking(
    pool: web::Data<PgPool>,
    body: web::Json<CreateBookingRequest>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let req = body.into_inner();
    let customer_id = user.id;

    let booking = sqlx::query(
        "INSERT INTO bookings (hotel_id, customer_id, check_in_date, check_out_date, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, hotel_id, customer_id, check_in_date, check_out_date, status, created_at"
    )
    .bind(req.hotel_id)
    .bind(customer_id)
    .bind(req.check_in_date)
    .bind(req.check_out_date)
    .bind("confirmed")
    .fetch_one(pool.get_ref())
    .await?;

    Ok(HttpResponse::Created().json(serde_json::json!({
        "message": "Reserva creada exitosamente",
        "booking_id": booking.get::<i32, _>("id")
    })))
}

pub async fn get_my_bookings(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let customer_id = user.id;

    let bookings = sqlx::query(
        "SELECT id, hotel_id, customer_id, check_in_date, check_out_date, status, created_at
         FROM bookings WHERE customer_id = $1"
    )
    .bind(customer_id)
    .fetch_all(pool.get_ref())
    .await?;

    let booking_list: Vec<serde_json::Value> = bookings.into_iter().map(|b| serde_json::json!({
        "id": b.get::<i32, _>("id"),
        "hotel_id": b.get::<i32, _>("hotel_id"),
        "customer_id": b.get::<i32, _>("customer_id"),
        "check_in_date": b.get::<chrono::DateTime<chrono::Utc>, _>("check_in_date"),
        "check_out_date": b.get::<chrono::DateTime<chrono::Utc>, _>("check_out_date"),
        "status": b.get::<String, _>("status"),
        "created_at": b.get::<chrono::DateTime<chrono::Utc>, _>("created_at")
    })).collect();

    Ok(HttpResponse::Ok().json(booking_list))
}

pub async fn cancel_booking(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let booking_id = path.into_inner();
    let customer_id = user.id;

    let result = sqlx::query(
        "UPDATE bookings SET status = $1 WHERE id = $2 AND customer_id = $3"
    )
    .bind("cancelled")
    .bind(booking_id)
    .bind(customer_id)
    .execute(pool.get_ref())
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Reserva cancelada"})))
}

pub async fn get_hotel_bookings(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let hotel_id = path.into_inner();
    let owner_id = user.id;

    let bookings = sqlx::query(
        "SELECT b.id, b.hotel_id, b.customer_id, b.check_in_date, b.check_out_date, b.status, b.created_at
         FROM bookings b
         JOIN hotels h ON b.hotel_id = h.id
         WHERE h.id = $1 AND h.owner_id = $2"
    )
    .bind(hotel_id)
    .bind(owner_id)
    .fetch_all(pool.get_ref())
    .await?;

    let booking_list: Vec<serde_json::Value> = bookings.into_iter().map(|b| serde_json::json!({
        "id": b.get::<i32, _>("id"),
        "hotel_id": b.get::<i32, _>("hotel_id"),
        "customer_id": b.get::<i32, _>("customer_id"),
        "check_in_date": b.get::<chrono::DateTime<chrono::Utc>, _>("check_in_date"),
        "check_out_date": b.get::<chrono::DateTime<chrono::Utc>, _>("check_out_date"),
        "status": b.get::<String, _>("status"),
        "created_at": b.get::<chrono::DateTime<chrono::Utc>, _>("created_at")
    })).collect();

    Ok(HttpResponse::Ok().json(booking_list))
}
