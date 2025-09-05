// backend/src/handlers/booking.rs - CÓDIGO COMPLETO CORREGIDO
use actix_web::{web, HttpResponse, Result};
use sqlx::PgPool;
use serde_json::json;
use bigdecimal::BigDecimal;
use std::str::FromStr;
use validator::Validate;

use crate::models::*;
use crate::utils::errors::AppError;
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
) -> Result<HttpResponse, AppError> {
    println!("🚀 [BOOKING] Iniciando creación de reserva para usuario {}", user.id);
    println!("📦 [BOOKING] Datos recibidos: {:?}", booking_req);

    // Validar datos de entrada
    if let Err(errors) = booking_req.validate() {
        println!("❌ [BOOKING] Error de validación: {:?}", errors);
        return Err(AppError::BadRequest(format!("Datos inválidos: {}", errors)));
    }

    // Validar fechas
    if booking_req.check_out <= booking_req.check_in {
        println!("❌ [BOOKING] Error: fecha checkout <= checkin");
        return Err(AppError::BadRequest("La fecha de check-out debe ser posterior a la de check-in".to_string()));
    }

    // Verificar que el hotel existe y está aprobado
    println!("🏨 [BOOKING] Verificando hotel ID: {}", booking_req.hotel_id);
    let hotel = sqlx::query!(
        "SELECT id, name, location, address, price FROM hotels WHERE id = $1 AND status = 'approved'",
        booking_req.hotel_id
    )
    .fetch_optional(pool.get_ref())
    .await?;

    let hotel = match hotel {
        Some(hotel) => {
            println!("✅ [BOOKING] Hotel encontrado: {}", hotel.name);
            hotel
        },
        None => {
            println!("❌ [BOOKING] Hotel no encontrado o no aprobado");
            return Err(AppError::NotFound("Hotel no encontrado o no disponible".to_string()));
        }
    };

    // Calcular precio total
    let nights = (booking_req.check_out - booking_req.check_in).num_days();
    println!("📊 [BOOKING] Noches: {}", nights);
    
    let hotel_price: f64 = match hotel.price.to_string().parse() {
        Ok(price) => price,
        Err(e) => {
            println!("❌ [BOOKING] Error parseando precio del hotel: {}", e);
            return Err(AppError::InternalServerError("Error en el precio del hotel".to_string()));
        }
    };
    
    let base_price = hotel_price * nights as f64 * booking_req.rooms as f64;
    println!("💰 [BOOKING] Precio base: {}", base_price);
    
    let addon_price = if let Some(addons) = &booking_req.addon_services {
        calculate_addon_price(addons)
    } else { 
        0.0 
    };
    println!("➕ [BOOKING] Precio addons: {}", addon_price);

    let total_price = base_price + addon_price;
    println!("🎯 [BOOKING] Precio total: {}", total_price);
    
    // ✅ CORREGIR conversión a BigDecimal
    let total_decimal = match BigDecimal::from_str(&total_price.to_string()) {
        Ok(decimal) => decimal,
        Err(e) => {
            println!("❌ [BOOKING] Error convirtiendo precio a decimal: {}", e);
            return Err(AppError::InternalServerError("Error calculando precio total".to_string()));
        }
    };
    
    // Generar referencia única
    let booking_reference = loop {
        let reference = format!("MY{}", uuid::Uuid::new_v4().to_string().replace("-", "")[..6].to_uppercase());
        
        // Verificar que no exista
        let exists = sqlx::query!(
            "SELECT id FROM bookings WHERE booking_reference = $1",
            reference
        )
        .fetch_optional(pool.get_ref())
        .await?;
        
        match exists {
            None => break reference, // No existe, podemos usarla
            Some(_) => continue, // Existe, generar otra
        }
    };
    
    println!("🎫 [BOOKING] Referencia generada: {}", booking_reference);

    // Crear la reserva en la base de datos
    println!("💾 [BOOKING] Insertando en BD...");
    let booking = sqlx::query!(
        r#"
        INSERT INTO bookings 
        (user_id, hotel_id, check_in, check_out, guests, rooms, total_price, 
         special_requests, addon_services, status, payment_status, booking_reference)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', 'pending', $10)
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
        booking_reference
    )
    .fetch_one(pool.get_ref())
    .await?;

    println!("✅ [BOOKING] Reserva creada exitosamente! ID: {}", booking.id);
    
    let response_data = json!({
        "message": "Reserva creada exitosamente",
        "booking": {
            "id": booking.id,
            "reference": booking_reference,
            "hotel_name": hotel.name,
            "hotel_location": hotel.location,
            "check_in": booking_req.check_in,
            "check_out": booking_req.check_out,
            "guests": booking_req.guests,
            "rooms": booking_req.rooms,
            "total_price": total_price,
            "status": "pending",
            "created_at": booking.created_at
        }
    });
    
    println!("📤 [BOOKING] Enviando respuesta: {}", response_data);
    Ok(HttpResponse::Created().json(response_data))
}

pub async fn get_my_bookings(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    println!("📋 [BOOKINGS] Obteniendo reservas para usuario {}", user.id);
    
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
    .await?;

    println!("✅ [BOOKINGS] Encontradas {} reservas", bookings.len());
    
    let booking_list: Vec<serde_json::Value> = bookings
        .into_iter()
        .map(|b| json!({
            "id": b.id, 
            "hotel_name": b.hotel_name, 
            "hotel_location": b.hotel_location, 
            "hotel_address": b.hotel_address,
            "check_in": b.check_in, 
            "check_out": b.check_out, 
            "guests": b.guests, 
            "rooms": b.rooms,
            "total_price": b.total_price_text.unwrap_or("0.0".to_string()).parse::<f64>().unwrap_or(0.0),
            "status": b.status, 
            "payment_status": b.payment_status, 
            "special_requests": b.special_requests,
            "addon_services": b.addon_services, 
            "created_at": b.created_at, 
            "booking_reference": b.booking_reference
        }))
        .collect();
        
    Ok(HttpResponse::Ok().json(json!({ 
        "bookings": booking_list, 
        "total": booking_list.len() 
    })))
}

pub async fn cancel_booking(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    cancel_req: web::Json<UpdateBookingStatusRequest>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let booking_id = path.into_inner();
    println!("🚫 [BOOKING] Cancelando reserva {} para usuario {}", booking_id, user.id);
    
    let result = sqlx::query!(
        r#"
        UPDATE bookings 
        SET status = 'cancelled', 
            cancelled_at = CURRENT_TIMESTAMP,
            cancellation_reason = $3, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2 AND status != 'cancelled'
        RETURNING id
        "#,
        booking_id, 
        user.id, 
        cancel_req.cancellation_reason
    )
    .fetch_optional(pool.get_ref())
    .await?;
    
    match result {
        Some(_) => {
            println!("✅ [BOOKING] Reserva {} cancelada", booking_id);
            Ok(HttpResponse::Ok().json(json!({ 
                "message": "Reserva cancelada exitosamente" 
            })))
        },
        None => {
            println!("❌ [BOOKING] Reserva {} no encontrada o ya cancelada", booking_id);
            Err(AppError::NotFound("Reserva no encontrada o ya cancelada".to_string()))
        }
    }
}

pub async fn get_hotel_bookings(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let hotel_id = path.into_inner();
    
    // Verificar ownership del hotel
    if !verify_hotel_ownership(pool.get_ref(), hotel_id, &user).await.unwrap_or(false) {
        return Err(AppError::Forbidden("No tienes permiso para ver las reservas de este hotel".to_string()));
    }
    
    let bookings = sqlx::query_as!(
        HotelBookingDetail,
        r#"
        SELECT b.id, b.check_in, b.check_out, b.guests,
               b.total_price::numeric::float8 as "total_price!",
               b.status as "status!", b.created_at as "created_at!",
               u.first_name || ' ' || u.last_name as "customer_name!",
               u.email as "customer_email!"
        FROM bookings b 
        JOIN users u ON b.user_id = u.id
        WHERE b.hotel_id = $1 
        ORDER BY b.check_in DESC
        "#,
        hotel_id
    )
    .fetch_all(pool.get_ref())
    .await?;
    
    Ok(HttpResponse::Ok().json(json!({ 
        "bookings": bookings 
    })))
}

// ✅ FUNCIÓN CORREGIDA para calcular precio de addons
fn calculate_addon_price(addons: &serde_json::Value) -> f64 {
    if let Some(addon_array) = addons.as_array() {
        addon_array.iter().fold(0.0, |acc, addon| {
            if let Some(price) = addon.get("price").and_then(|p| p.as_f64()) {
                acc + price
            } else { 
                acc 
            }
        })
    } else { 
        0.0 
    }
}