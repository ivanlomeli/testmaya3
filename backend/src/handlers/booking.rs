use actix_web::{web, HttpResponse, Result};
use sqlx::PgPool;
use serde_json::json;
use bigdecimal::BigDecimal;
use std::str::FromStr;
use validator::Validate;

use crate::models::*;
use crate::handlers::hotel::verify_hotel_ownership;

#[derive(serde::Serialize)]
pub struct HotelBookingDetail {
    id: i32,
    check_in: chrono::NaiveDate,
    check_out: chrono::NaiveDate,
    guests: i32,
    total_price: f64,
    status: String,
    created_at: chrono::DateTime<chrono::Utc>,
    customer_name: String,
    customer_email: String,
}

pub async fn create_booking(
    pool: web::Data<PgPool>,
    booking_req: web::Json<CreateBookingRequest>,
    user: UserInfo,
) -> Result<HttpResponse> {
    if let Err(errors) = booking_req.validate() {
        return Ok(HttpResponse::BadRequest().json(json!({ "error": "Datos inválidos", "details": errors })));
    }
    if booking_req.check_out <= booking_req.check_in {
        return Ok(HttpResponse::BadRequest().json(json!({ "error": "La fecha de check-out debe ser posterior a la de check-in" })));
    }
    let hotel = match sqlx::query!(
        "SELECT id, name, location, address, price FROM hotels WHERE id = $1 AND status = 'approved'",
        booking_req.hotel_id
    )
    .fetch_optional(pool.get_ref()).await {
        Ok(Some(hotel)) => hotel,
        Ok(None) => return Ok(HttpResponse::NotFound().json(json!({ "error": "Hotel no encontrado o no disponible" }))),
        Err(e) => {
            println!("Error al verificar hotel: {}", e);
            return Ok(HttpResponse::InternalServerError().json(json!({ "error": "Error del servidor" })));
        }
    };

    let nights = (booking_req.check_out - booking_req.check_in).num_days();
    let hotel_price: f64 = hotel.price.to_string().parse().unwrap_or(0.0);
    let base_price = hotel_price * nights as f64 * booking_req.rooms as f64;
    
    let addon_price = if let Some(addons) = &booking_req.addon_services {
        calculate_addon_price(addons)
    } else { 0.0 };

    let total_price = base_price + addon_price;
    let total_decimal = BigDecimal::from_str(&total_price.to_string()).unwrap();
    
    let new_booking_reference = uuid::Uuid::new_v4().to_string().replace("-", "")[..20].to_string();

    // --- CORRECCIÓN FINAL EN LA CONSULTA ---
    let booking = sqlx::query!(
        r#"
        INSERT INTO bookings 
        (user_id, hotel_id, check_in, check_out, guests, rooms, total_price, 
         special_requests, addon_services, status, payment_status, booking_reference)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, created_at
        "#,
        user.id,
        booking_req.hotel_id,
        booking_req.check_in,
        booking_req.check_out,
        booking_req.guests,
        booking_req.rooms,
        total_decimal,
        booking_req.special_requests,
        booking_req.addon_services.as_ref(),
        "pending", // Parámetro $10 para status
        "pending", // Parámetro $11 para payment_status
        new_booking_reference // Parámetro $12 para booking_reference
    )
    .fetch_one(pool.get_ref())
    .await;

    match booking {
        Ok(booking_record) => Ok(HttpResponse::Created().json(json!({
            "message": "Reserva creada exitosamente",
            "booking": {
                "id": booking_record.id,
                "reference": new_booking_reference,
                "hotel_name": hotel.name,
                "hotel_location": hotel.location,
                "check_in": booking_req.check_in,
                "check_out": booking_req.check_out,
                "guests": booking_req.guests,
                "rooms": booking_req.rooms,
                "total_price": total_price,
                "status": "pending",
                "created_at": booking_record.created_at
            }
        }))),
        Err(e) => {
            println!("Error al crear reserva: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({ "error": "Error al crear reserva" })))
        }
    }
}

pub async fn get_my_bookings(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse> {
    let bookings = sqlx::query!(
        r#"
        SELECT b.id, b.check_in, b.check_out, b.guests, b.rooms, 
               b.total_price::text as total_price_text, b.status, b.payment_status,
               b.special_requests, b.addon_services, b.created_at, b.booking_reference,
               h.name as hotel_name, h.location as hotel_location, h.address as hotel_address
        FROM bookings b
        JOIN hotels h ON b.hotel_id = h.id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
        "#,
        user.id
    )
    .fetch_all(pool.get_ref())
    .await;

    match bookings {
        Ok(bookings) => {
            let booking_list: Vec<serde_json::Value> = bookings
                .into_iter()
                .map(|b| json!({
                    "id": b.id, "hotel_name": b.hotel_name, "hotel_location": b.hotel_location, "hotel_address": b.hotel_address,
                    "check_in": b.check_in, "check_out": b.check_out, "guests": b.guests, "rooms": b.rooms,
                    "total_price": b.total_price_text.unwrap_or("0.0".to_string()).parse::<f64>().unwrap_or(0.0),
                    "status": b.status, "payment_status": b.payment_status, "special_requests": b.special_requests,
                    "addon_services": b.addon_services, "created_at": b.created_at, "booking_reference": b.booking_reference
                }))
                .collect();
            Ok(HttpResponse::Ok().json(json!({ "bookings": booking_list, "total": booking_list.len() })))
        }
        Err(e) => {
            println!("Error al obtener reservas: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({ "error": "Error al obtener reservas" })))
        }
    }
}

pub async fn cancel_booking(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    cancel_req: web::Json<UpdateBookingStatusRequest>,
    user: UserInfo,
) -> Result<HttpResponse> {
    let booking_id = path.into_inner();
    let result = sqlx::query!(
        r#"
        UPDATE bookings SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP,
            cancellation_reason = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2 AND status != 'cancelled'
        "#,
        booking_id, user.id, cancel_req.cancellation_reason
    )
    .execute(pool.get_ref()).await;
    match result {
        Ok(res) if res.rows_affected() > 0 => Ok(HttpResponse::Ok().json(json!({ "message": "Reserva cancelada exitosamente" }))),
        Ok(_) => Ok(HttpResponse::NotFound().json(json!({ "error": "Reserva no encontrada o ya cancelada" }))),
        Err(e) => {
            println!("Error al cancelar reserva: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({ "error": "Error al cancelar la reserva" })))
        }
    }
}

pub async fn get_hotel_bookings(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse> {
    let hotel_id = path.into_inner();
    match verify_hotel_ownership(pool.get_ref(), hotel_id, &user).await {
        Ok(true) => (),
        Ok(false) => return Ok(HttpResponse::Forbidden().json(json!({"error": "No tienes permiso para ver las reservas de este hotel"}))),
        Err(_) => return Ok(HttpResponse::InternalServerError().json(json!({"error": "Error al verificar permisos"}))),
    }
    let bookings = sqlx::query_as!(
        HotelBookingDetail,
        r#"
        SELECT b.id, b.check_in, b.check_out, b.guests,
               b.total_price::numeric::float8 as "total_price!",
               b.status as "status!", b.created_at as "created_at!",
               u.first_name || ' ' || u.last_name as "customer_name!",
               u.email as "customer_email!"
        FROM bookings b JOIN users u ON b.user_id = u.id
        WHERE b.hotel_id = $1 ORDER BY b.check_in DESC
        "#,
        hotel_id
    ).fetch_all(pool.get_ref()).await;
    match bookings {
        Ok(booking_list) => Ok(HttpResponse::Ok().json(json!({ "bookings": booking_list }))),
        Err(e) => {
            println!("Error al obtener reservas del hotel: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({ "error": "No se pudieron obtener las reservas del hotel" })))
        }
    }
}

fn calculate_addon_price(addons: &serde_json::Value) -> f64 {
    if let Some(addon_array) = addons.as_array() {
        addon_array.iter().fold(0.0, |acc, addon| {
            if let Some(price) = addon.get("price").and_then(|p| p.as_f64()) {
                acc + price
            } else { acc }
        })
    } else { 0.0 }
}