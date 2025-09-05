// backend/src/handlers/booking.rs
use actix_web::{web, HttpResponse};
use sqlx::PgPool;
use chrono::{NaiveDate, Utc};
use bigdecimal::BigDecimal;
use serde::{Deserialize, Serialize};
use crate::{
    models::UserInfo,
    utils::errors::AppError,
};

#[derive(Debug, Deserialize)]
pub struct CreateBookingRequest {
    pub hotel_id: i32,
    pub check_in: String,  // Formato: "YYYY-MM-DD"
    pub check_out: String, // Formato: "YYYY-MM-DD"
    pub guests: i32,
    pub rooms: i32,
    pub special_requests: Option<String>,
    pub addon_services: Option<Vec<AddonService>>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AddonService {
    pub name: String,
    pub price: f64,
}

#[derive(Debug, Serialize)]
pub struct BookingResponse {
    pub id: i32,
    pub booking_reference: String,
    pub hotel_name: String,
    pub check_in: String,
    pub check_out: String,
    pub total_price: f64,
    pub status: String,
}

// Función para generar referencia única
fn generate_booking_reference() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let number: u32 = rng.gen_range(100000..999999);
    format!("MY{}", number)
}

// Función para calcular el total
fn calculate_total_price(
    base_price: &BigDecimal,
    nights: i32,
    rooms: i32,
    addon_services: &Option<Vec<AddonService>>,
) -> BigDecimal {
    let mut total = base_price * BigDecimal::from(nights * rooms);
    
    if let Some(services) = addon_services {
        for service in services {
            total += BigDecimal::from(service.price);
        }
    }
    
    total
}

pub async fn create_booking(
    pool: web::Data<PgPool>,
    body: web::Json<CreateBookingRequest>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let req = body.into_inner();
    
    // Validar fechas
    let check_in = NaiveDate::parse_from_str(&req.check_in, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("Formato de fecha check-in inválido".to_string()))?;
    
    let check_out = NaiveDate::parse_from_str(&req.check_out, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("Formato de fecha check-out inválido".to_string()))?;
    
    if check_out <= check_in {
        return Err(AppError::BadRequest(
            "La fecha de salida debe ser posterior a la fecha de entrada".to_string()
        ));
    }
    
    // Calcular noches
    let nights = (check_out - check_in).num_days() as i32;
    
    // Obtener información del hotel y precio
    let hotel_result = sqlx::query!(
        "SELECT id, name, location, address, price FROM hotels WHERE id = $1 AND status = 'approved'",
        req.hotel_id
    )
    .fetch_optional(pool.get_ref())
    .await
    .map_err(|e| {
        eprintln!("Error al buscar hotel: {:?}", e);
        AppError::DatabaseError(e)
    })?;
    
    let hotel = hotel_result.ok_or_else(|| {
        AppError::NotFound("Hotel no encontrado o no disponible".to_string())
    })?;
    
    // Calcular precio total
    let total_price = calculate_total_price(
        &hotel.price,
        nights,
        req.rooms,
        &req.addon_services,
    );
    
    // Generar referencia única
    let booking_reference = generate_booking_reference();
    
    // Convertir addon_services a JSON
    let addon_services_json = req.addon_services.as_ref().map(|services| {
        serde_json::to_value(services).unwrap_or(serde_json::json!([]))
    });
    
    // Crear la reserva
    let booking = sqlx::query!(
        r#"
        INSERT INTO bookings 
        (user_id, hotel_id, check_in, check_out, guests, rooms, total_price, 
         special_requests, addon_services, status, payment_status, booking_reference)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, created_at
        "#,
        user.id,
        req.hotel_id,
        check_in,
        check_out,
        req.guests,
        req.rooms,
        total_price,
        req.special_requests,
        addon_services_json,
        "confirmed",
        "pending",
        booking_reference
    )
    .fetch_one(pool.get_ref())
    .await
    .map_err(|e| {
        eprintln!("Error al crear reserva: {:?}", e);
        AppError::DatabaseError(e)
    })?;
    
    // Construir respuesta
    let response = BookingResponse {
        id: booking.id,
        booking_reference: booking_reference.clone(),
        hotel_name: hotel.name,
        check_in: check_in.to_string(),
        check_out: check_out.to_string(),
        total_price: total_price.to_string().parse::<f64>().unwrap_or(0.0),
        status: "confirmed".to_string(),
    };
    
    Ok(HttpResponse::Created().json(serde_json::json!({
        "message": "Reserva creada exitosamente",
        "booking": response
    })))
}

pub async fn get_my_bookings(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
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
    .await
    .map_err(|e| {
        eprintln!("Error al obtener reservas: {:?}", e);
        AppError::DatabaseError(e)
    })?;
    
    let booking_list: Vec<serde_json::Value> = bookings.into_iter().map(|b| {
        let total_price: f64 = b.total_price_text
            .as_ref()
            .and_then(|s| s.parse::<f64>().ok())
            .unwrap_or(0.0);
        
        serde_json::json!({
            "id": b.id,
            "hotel_name": b.hotel_name,
            "hotel_location": b.hotel_location,
            "hotel_address": b.hotel_address,
            "check_in": b.check_in.to_string(),
            "check_out": b.check_out.to_string(),
            "guests": b.guests,
            "rooms": b.rooms,
            "total_price": total_price,
            "status": b.status,
            "payment_status": b.payment_status,
            "special_requests": b.special_requests,
            "addon_services": b.addon_services,
            "booking_reference": b.booking_reference,
            "created_at": b.created_at
        })
    }).collect();
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "bookings": booking_list
    })))
}

pub async fn cancel_booking(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
    body: web::Json<CancelBookingRequest>,
) -> Result<HttpResponse, AppError> {
    let booking_id = path.into_inner();
    let req = body.into_inner();
    
    let result = sqlx::query!(
        r#"
        UPDATE bookings 
        SET status = 'cancelled', 
            cancelled_at = CURRENT_TIMESTAMP,
            cancellation_reason = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2 AND status != 'cancelled'
        "#,
        booking_id,
        user.id,
        req.reason
    )
    .execute(pool.get_ref())
    .await
    .map_err(|e| {
        eprintln!("Error al cancelar reserva: {:?}", e);
        AppError::DatabaseError(e)
    })?;
    
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(
            "Reserva no encontrada o ya cancelada".to_string()
        ));
    }
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Reserva cancelada exitosamente",
        "booking_id": booking_id
    })))
}

#[derive(Debug, Deserialize)]
pub struct CancelBookingRequest {
    pub reason: Option<String>,
}

pub async fn get_hotel_bookings(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let hotel_id = path.into_inner();
    
    // Verificar que el usuario es dueño del hotel
    let owner_check = sqlx::query!(
        "SELECT owner_id FROM hotels WHERE id = $1",
        hotel_id
    )
    .fetch_optional(pool.get_ref())
    .await
    .map_err(|e| AppError::DatabaseError(e))?;
    
    match owner_check {
        Some(hotel) if hotel.owner_id == user.id => {
            // El usuario es el dueño, proceder
        }
        Some(_) => {
            return Err(AppError::Forbidden(
                "No tienes permiso para ver estas reservas".to_string()
            ));
        }
        None => {
            return Err(AppError::NotFound("Hotel no encontrado".to_string()));
        }
    }
    
    // Obtener reservas del hotel
    let bookings = sqlx::query!(
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
    .await
    .map_err(|e| {
        eprintln!("Error al obtener reservas del hotel: {:?}", e);
        AppError::DatabaseError(e)
    })?;
    
    let booking_list: Vec<serde_json::Value> = bookings.into_iter().map(|b| {
        serde_json::json!({
            "id": b.id,
            "customer_name": b.customer_name,
            "customer_email": b.customer_email,
            "check_in": b.check_in.to_string(),
            "check_out": b.check_out.to_string(),
            "guests": b.guests,
            "total_price": b.total_price,
            "status": b.status,
            "created_at": b.created_at
        })
    }).collect();
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "hotel_id": hotel_id,
        "bookings": booking_list,
        "total_bookings": booking_list.len()
    })))
}