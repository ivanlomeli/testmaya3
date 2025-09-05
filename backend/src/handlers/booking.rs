use actix_web::{web, HttpResponse, post, get, put};
use sqlx::PgPool;
use crate::{
    models::booking::{Booking, CreateBookingRequest, BookingStatus},
    middleware::auth::JwtMiddleware,
    utils::errors::AppError,
};

#[post("/api/bookings")]
pub async fn create_booking(
    pool: web::Data<PgPool>,
    body: web::Json<CreateBookingRequest>,
    user: JwtMiddleware,
) -> Result<HttpResponse, AppError> {
    let customer_id = user.user_id;
    let booking_data = body.into_inner();

    // Aquí iría la lógica de validación (ej. verificar disponibilidad, precios, etc.)
    // Por ahora, insertamos directamente.

    let booking = sqlx::query_as!(
        Booking,
        "INSERT INTO bookings (hotel_id, customer_id, check_in_date, check_out_date, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, hotel_id, customer_id, check_in_date, check_out_date, status, created_at",
        booking_data.hotel_id,
        customer_id,
        booking_data.check_in_date,
        booking_data.check_out_date,
        BookingStatus::Confirmed as BookingStatus
    )
    .fetch_one(pool.get_ref())
    .await?;

    Ok(HttpResponse::Created().json(booking))
}

#[get("/api/bookings/my-bookings")]
pub async fn get_my_bookings(
    pool: web::Data<PgPool>,
    user: JwtMiddleware,
) -> Result<HttpResponse, AppError> {
    let customer_id = user.user_id;
    let bookings = sqlx::query_as!(
        Booking,
        "SELECT id, hotel_id, customer_id, check_in_date, check_out_date, status, created_at
         FROM bookings WHERE customer_id = $1",
        customer_id
    )
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(bookings))
}

#[put("/api/bookings/{id}/cancel")]
pub async fn cancel_booking(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: JwtMiddleware,
) -> Result<HttpResponse, AppError> {
    let booking_id = path.into_inner();
    let customer_id = user.user_id;

    let result = sqlx::query!(
        "UPDATE bookings SET status = $1 WHERE id = $2 AND customer_id = $3",
        BookingStatus::Cancelled as BookingStatus,
        booking_id,
        customer_id
    )
    .execute(pool.get_ref())
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound); // O no es el dueño o no existe
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Booking cancelled successfully"})))
}

// Handler para que el dueño del hotel vea sus reservas.
#[get("/api/portal/hotels/{hotel_id}/bookings")]
pub async fn get_hotel_bookings(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: JwtMiddleware,
) -> Result<HttpResponse, AppError> {
    let hotel_id = path.into_inner();
    let owner_id = user.user_id;

    // Verificar que el usuario es dueño del hotel antes de mostrar las reservas
    let bookings = sqlx::query_as!(
        Booking,
        "SELECT b.id, b.hotel_id, b.customer_id, b.check_in_date, b.check_out_date, b.status, b.created_at
         FROM bookings b
         JOIN hotels h ON b.hotel_id = h.id
         WHERE b.hotel_id = $1 AND h.owner_id = $2",
        hotel_id,
        owner_id
    )
    .fetch_all(pool.get_ref())
    .await?;

    Ok(HttpResponse::Ok().json(bookings))
}
