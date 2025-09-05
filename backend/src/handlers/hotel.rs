// handlers/hotel.rs

use actix_web::{web, HttpResponse, Result};
use sqlx::PgPool;
use validator::Validate;
use serde_json::json;
use bigdecimal::BigDecimal;
use std::str::FromStr;

use crate::models::{UserInfo, UserRole, CreateHotelRequest};
use crate::require_hotel_owner_or_admin;

// Verificar que el usuario tenga permisos para gestionar hoteles
fn check_hotel_permissions(user: &UserInfo) -> Result<(), actix_web::Error> {
    match user.role {
        UserRole::Admin | UserRole::HotelOwner => Ok(()),
        _ => Err(actix_web::error::ErrorForbidden("Se requieren permisos de dueño de hotel o administrador"))
    }
}

// Verificar que el usuario sea dueño del hotel específico o admin
pub async fn verify_hotel_ownership(
    pool: &PgPool,
    hotel_id: i32,
    user: &UserInfo,
) -> Result<bool, sqlx::Error> {
    if matches!(user.role, UserRole::Admin) {
        return Ok(true); // Admin puede todo
    }

    let result = sqlx::query!(
        "SELECT owner_id FROM hotels WHERE id = $1",
        hotel_id
    )
    .fetch_optional(pool)
    .await?;

    match result {
        Some(hotel) => Ok(hotel.owner_id == user.id),
        None => Ok(false),
    }
}

// Crear nuevo hotel
pub async fn create_hotel(
    pool: web::Data<PgPool>,
    req: web::Json<CreateHotelRequest>,
    user: UserInfo,
) -> Result<HttpResponse> {
    println!("Creando hotel para usuario: ID={}, role={:?}", user.id, user.role);
    
    // Verificar permisos
    if let Err(e) = check_hotel_permissions(&user) {
        println!("Permisos insuficientes para usuario: {:?}", user.role);
        return Err(e);
    }

    // Validar datos de entrada
    if let Err(errors) = req.validate() {
        println!("Errores de validación: {:?}", errors);
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Datos inválidos",
            "details": errors
        })));
    }

    // Validaciones adicionales
    if req.name.trim().is_empty() {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "El nombre del hotel es requerido"
        })));
    }

    if req.price <= 0.0 {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "El precio debe ser mayor a 0"
        })));
    }

    let price_decimal = BigDecimal::from_str(&req.price.to_string())
        .map_err(|_| actix_web::error::ErrorBadRequest("Precio inválido"))?;

    println!("Insertando hotel en BD: {}", req.name);

    let result = sqlx::query!(
        r#"
        INSERT INTO hotels (owner_id, name, description, location, address, price, 
                           image_url, phone, email, website, rooms_available, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
        RETURNING id, name, status, created_at
        "#,
        user.id,
        req.name.trim(),
        req.description.as_deref().map(|s| s.trim()),
        req.location.trim(),
        req.address.trim(),
        price_decimal,
        req.image_url.as_deref().map(|s| s.trim()),
        req.phone.as_deref().map(|s| s.trim()),
        req.email.as_deref().map(|s| s.trim()),
        req.website.as_deref().map(|s| s.trim()),
        req.rooms_available
    )
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(hotel) => {
            println!("Hotel creado exitosamente: ID={}", hotel.id);
            Ok(HttpResponse::Created().json(json!({
                "message": "Hotel registrado exitosamente",
                "hotel": {
                    "id": hotel.id,
                    "name": hotel.name,
                    "status": hotel.status,
                    "created_at": hotel.created_at
                },
                "note": "Su hotel está pendiente de aprobación por un administrador"
            })))
        }
        Err(e) => {
            println!("Error al crear hotel: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al registrar hotel"
            })))
        }
    }
}

// Ver mis hoteles (solo del dueño)
pub async fn get_my_hotels(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse> {
    if let Err(e) = check_hotel_permissions(&user) {
        return Err(e);
    }

    println!("Obteniendo hoteles para usuario: {}", user.id);

    let hotels = sqlx::query!(
        r#"
        SELECT id, name, description, location, address, price::text as price_text,
               image_url, status, created_at, approved_at, admin_notes,
               phone, email, website, rooms_available, rating::text as rating_text
        FROM hotels 
        WHERE owner_id = $1 
        ORDER BY created_at DESC
        "#,
        user.id
    )
    .fetch_all(pool.get_ref())
    .await;

    match hotels {
        Ok(hotels) => {
            let hotel_list: Vec<serde_json::Value> = hotels.into_iter().map(|h| json!({
                "id": h.id,
                "name": h.name,
                "description": h.description,
                "location": h.location,
                "address": h.address,
                "price": h.price_text,
                "image_url": h.image_url,
                "status": h.status,
                "created_at": h.created_at,
                "approved_at": h.approved_at,
                "admin_notes": h.admin_notes,
                "phone": h.phone,
                "email": h.email,
                "website": h.website,
                "rooms_available": h.rooms_available,
                "rating": h.rating_text
            })).collect();

            println!("Hoteles encontrados: {}", hotel_list.len());
            
            Ok(HttpResponse::Ok().json(json!({
                "hotels": hotel_list,
                "total": hotel_list.len()
            })))
        }
        Err(e) => {
            println!("Error al obtener hoteles: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al obtener hoteles"
            })))
        }
    }
}

// Editar mi hotel
pub async fn update_hotel(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    req: web::Json<CreateHotelRequest>,
    user: UserInfo,
) -> Result<HttpResponse> {
    let hotel_id = path.into_inner();

    // Verificar ownership
    match verify_hotel_ownership(pool.get_ref(), hotel_id, &user).await {
        Ok(true) => {},
        Ok(false) => {
            return Ok(HttpResponse::Forbidden().json(json!({
                "error": "No tienes permisos para editar este hotel"
            })));
        }
        Err(_) => {
            return Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al verificar permisos"
            })));
        }
    }

    // Validar datos
    if let Err(errors) = req.validate() {
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Datos inválidos",
            "details": errors
        })));
    }

    let price_decimal = BigDecimal::from_str(&req.price.to_string())
        .map_err(|_| actix_web::error::ErrorBadRequest("Precio inválido"))?;

    let result = sqlx::query!(
        r#"
        UPDATE hotels 
        SET name = $2, description = $3, location = $4, address = $5, price = $6, 
            image_url = $7, phone = $8, email = $9, website = $10, rooms_available = $11,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND (status = 'pending' OR status = 'rejected')
        "#,
        hotel_id,
        req.name.trim(),
        req.description.as_deref().map(|s| s.trim()),
        req.location.trim(),
        req.address.trim(),
        price_decimal,
        req.image_url.as_deref().map(|s| s.trim()),
        req.phone.as_deref().map(|s| s.trim()),
        req.email.as_deref().map(|s| s.trim()),
        req.website.as_deref().map(|s| s.trim()),
        req.rooms_available
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => {
            Ok(HttpResponse::Ok().json(json!({
                "message": "Hotel actualizado exitosamente",
                "hotel_id": hotel_id,
                "note": "Los hoteles aprobados no pueden ser editados"
            })))
        }
        Ok(_) => {
            Ok(HttpResponse::NotFound().json(json!({
                "error": "Hotel no encontrado o no puede ser editado (ya está aprobado)"
            })))
        }
        Err(e) => {
            println!("Error al actualizar hotel: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al actualizar hotel"
            })))
        }
    }
}

// Eliminar mi hotel
pub async fn delete_hotel(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse> {
    let hotel_id = path.into_inner();

    // Verificar ownership
    match verify_hotel_ownership(pool.get_ref(), hotel_id, &user).await {
        Ok(true) => {},
        Ok(false) => {
            return Ok(HttpResponse::Forbidden().json(json!({
                "error": "No tienes permisos para eliminar este hotel"
            })));
        }
        Err(_) => {
            return Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al verificar permisos"
            })));
        }
    }

    let result = sqlx::query!(
        "DELETE FROM hotels WHERE id = $1 AND (status = 'pending' OR status = 'rejected')",
        hotel_id
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => {
            Ok(HttpResponse::Ok().json(json!({
                "message": "Hotel eliminado exitosamente",
                "hotel_id": hotel_id
            })))
        }
        Ok(_) => {
            Ok(HttpResponse::NotFound().json(json!({
                "error": "Hotel no encontrado o no puede ser eliminado (ya está aprobado)"
            })))
        }
        Err(e) => {
            println!("Error al eliminar hotel: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al eliminar hotel"
            })))
        }
    }
}

// Ver detalle de un hotel específico (público para hoteles aprobados)
pub async fn get_hotel_detail(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
) -> Result<HttpResponse> {
    let hotel_id = path.into_inner();

    let hotel = sqlx::query!(
        r#"
        SELECT h.id, h.name, h.description, h.location, h.address, h.price::text as price_text, 
               h.image_url, h.status, h.created_at, h.phone, h.email, h.website, 
               h.rooms_available, h.rating::text as rating_text, u.first_name, u.last_name
        FROM hotels h 
        JOIN users u ON h.owner_id = u.id
        WHERE h.id = $1 AND h.status = 'approved'
        "#,
        hotel_id
    )
    .fetch_optional(pool.get_ref())
    .await;

    match hotel {
        Ok(Some(hotel)) => {
            Ok(HttpResponse::Ok().json(json!({
                "id": hotel.id,
                "name": hotel.name,
                "description": hotel.description,
                "location": hotel.location,
                "address": hotel.address,
                "price": hotel.price_text,
                "image_url": hotel.image_url,
                "status": hotel.status,
                "created_at": hotel.created_at,
                "phone": hotel.phone,
                "email": hotel.email,
                "website": hotel.website,
                "rooms_available": hotel.rooms_available,
                "rating": hotel.rating_text,
                "owner": {
                    "first_name": hotel.first_name,
                    "last_name": hotel.last_name
                }
            })))
        }
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(json!({
                "error": "Hotel no encontrado o no disponible"
            })))
        }
        Err(e) => {
            println!("Error al obtener hotel: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al obtener hotel"
            })))
        }
    }
}

// Obtener todos los hoteles aprobados (endpoint público)
#[derive(serde::Serialize, sqlx::FromRow)]
struct PublicHotel {
    id: i32,
    name: String,
    location: String,
    price: f64,
    image_url: Option<String>,
}

pub async fn get_all_approved_hotels(pool: web::Data<PgPool>) -> Result<HttpResponse> {
    let hotels = sqlx::query_as!(
        PublicHotel,
        r#"
        SELECT id, name, location, price::numeric::float8 as "price!", image_url 
        FROM hotels 
        WHERE status = 'approved' 
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(pool.get_ref())
    .await;

    match hotels {
        Ok(hotel_list) => {
            let response: Vec<serde_json::Value> = hotel_list.into_iter().map(|h| json!({
                "id": h.id,
                "name": h.name,
                "location": h.location,
                "price": h.price,
                "image": h.image_url.unwrap_or_default()
            })).collect();
            
            Ok(HttpResponse::Ok().json(response))
        },
        Err(e) => {
            println!("Error al cargar hoteles públicos: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al cargar hoteles"
            })))
        }
    }
}

// Obtener reservas de un hotel específico (solo para el dueño)
pub async fn get_hotel_bookings(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse> {
    let hotel_id = path.into_inner();

    // Verificar ownership
    match verify_hotel_ownership(pool.get_ref(), hotel_id, &user).await {
        Ok(true) => {},
        Ok(false) => {
            return Ok(HttpResponse::Forbidden().json(json!({
                "error": "No tienes permisos para ver las reservas de este hotel"
            })));
        }
        Err(_) => {
            return Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al verificar permisos"
            })));
        }
    }

    let bookings = sqlx::query!(
        r#"
        SELECT b.id, b.check_in_date, b.check_out_date, b.guests, b.total_price::text as price_text,
               b.status, b.booking_data, b.created_at, u.first_name, u.last_name, u.email
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.hotel_id = $1
        ORDER BY b.created_at DESC
        "#,
        hotel_id
    )
    .fetch_all(pool.get_ref())
    .await;

    match bookings {
        Ok(bookings) => {
            let booking_list: Vec<serde_json::Value> = bookings.into_iter().map(|b| json!({
                "id": b.id,
                "check_in_date": b.check_in_date,
                "check_out_date": b.check_out_date,
                "guests": b.guests,
                "total_price": b.price_text,
                "status": b.status,
                "booking_data": b.booking_data,
                "created_at": b.created_at,
                "guest": {
                    "first_name": b.first_name,
                    "last_name": b.last_name,
                    "email": b.email
                }
            })).collect();

            Ok(HttpResponse::Ok().json(json!({
                "bookings": booking_list,
                "total": booking_list.len()
            })))
        }
        Err(e) => {
            println!("Error al obtener reservas del hotel: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al obtener reservas"
            })))
        }
    }
}