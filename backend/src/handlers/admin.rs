use actix_web::{web, HttpResponse, Result};
use sqlx::PgPool;
use serde_json::json;
use serde::Serialize;
use chrono::{DateTime, Utc};

use crate::models::{UserInfo, UserRole};

// Middleware para verificar que el usuario sea admin
pub fn require_admin(user: &UserInfo) -> Result<(), actix_web::Error> {
    match user.role {
        UserRole::Admin => Ok(()),
        _ => Err(actix_web::error::ErrorForbidden("Se requieren permisos de administrador"))
    }
}

#[derive(Serialize)]
pub struct AdminMetrics {
    pub total_hotels: i64,
    pub total_restaurants: i64,
    pub total_experiences: i64,
    pub total_users: i64,
    pub total_bookings: i64,
    pub total_revenue: f64,
    pub bookings_this_month: i64,
    pub new_users_this_month: i64,
    pub pending_hotels: i64,
}

#[derive(Serialize)]
pub struct BusinessItem {
    pub id: i32,
    pub name: String,
    pub business_type: String,
    pub location: String,
    pub status: String,
    pub total_bookings: i64,
    pub total_revenue: f64,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct BookingDetail {
    pub id: i32,
    pub user_email: String,
    pub service_type: String,
    pub service_name: String,
    pub total_amount: f64,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub booking_reference: String,
}

// ========== FUNCIONES DE MÉTRICAS Y ESTADÍSTICAS ==========

// Obtener métricas completas del dashboard
pub async fn get_admin_metrics(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse> {
    // Verificar que sea admin
    if let Err(e) = require_admin(&user) {
        return Err(e);
    }

    // Contar hoteles por status
    let hotel_stats = sqlx::query!(
        r#"
        SELECT 
            COUNT(*) FILTER (WHERE status = 'approved') as approved_hotels,
            COUNT(*) FILTER (WHERE status = 'pending') as pending_hotels
        FROM hotels
        "#
    )
    .fetch_one(pool.get_ref())
    .await;

    let (approved_hotels, pending_hotels) = match hotel_stats {
        Ok(stats) => (
            stats.approved_hotels.unwrap_or(0),
            stats.pending_hotels.unwrap_or(0)
        ),
        Err(_) => (0, 0)
    };

    // Contar usuarios
    let user_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM users"
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or((0,));

    // Contar reservas y revenue total
    let booking_stats: (i64, Option<f64>) = sqlx::query_as(
        "SELECT COUNT(*), SUM(total_price::numeric) FROM bookings"
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or((0, None));

    // Reservas este mes
    let this_month_bookings: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM bookings WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or((0,));

    // Nuevos usuarios este mes
    let new_users_this_month: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM users WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
    )
    .fetch_one(pool.get_ref())
    .await
    .unwrap_or((0,));

    let metrics = AdminMetrics {
        total_hotels: approved_hotels,
        total_restaurants: 0,
        total_experiences: 0,
        total_users: user_count.0,
        total_bookings: booking_stats.0,
        total_revenue: booking_stats.1.unwrap_or(0.0),
        bookings_this_month: this_month_bookings.0,
        new_users_this_month: new_users_this_month.0,
        pending_hotels,
    };

    Ok(HttpResponse::Ok().json(metrics))
}

// Estadísticas del panel de admin
pub async fn get_admin_stats(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse> {
    // Verificar que sea admin
    if let Err(e) = require_admin(&user) {
        return Err(e);
    }

    let stats = sqlx::query!(
        r#"
        SELECT 
            COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
            COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
            COUNT(*) as total_count
        FROM hotels
        "#
    )
    .fetch_one(pool.get_ref())
    .await;

    match stats {
        Ok(stats) => {
            Ok(HttpResponse::Ok().json(json!({
                "pending": stats.pending_count.unwrap_or(0),
                "approved": stats.approved_count.unwrap_or(0),
                "rejected": stats.rejected_count.unwrap_or(0),
                "total": stats.total_count.unwrap_or(0)
            })))
        }
        Err(e) => {
            println!("Error al obtener estadísticas: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al obtener estadísticas"
            })))
        }
    }
}

// Obtener analytics de búsquedas (placeholder por ahora)
pub async fn get_search_analytics(
    _pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse> {
    // Verificar que sea admin
    if let Err(e) = require_admin(&user) {
        return Err(e);
    }

    let analytics = json!({
        "total_searches": 0,
        "unique_terms": 0,
        "top_searches_today": []
    });

    Ok(HttpResponse::Ok().json(analytics))
}

// ========== FUNCIONES DE HOTELES ==========

// Ver todos los hoteles pendientes de aprobación
pub async fn get_pending_hotels(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse> {
    // Verificar que sea admin
    if let Err(e) = require_admin(&user) {
        return Err(e);
    }

    let hotels = sqlx::query!(
        r#"
        SELECT h.id, h.name, h.location, h.address, h.price::text as price_text, 
               h.image_url, h.status, h.created_at, h.phone, h.email, h.website,
               u.first_name, u.last_name, u.email as owner_email
        FROM hotels h
        JOIN users u ON h.owner_id = u.id
        WHERE h.status = 'pending'
        ORDER BY h.created_at ASC
        "#
    )
    .fetch_all(pool.get_ref())
    .await;

    match hotels {
        Ok(hotels) => {
            let hotel_list: Vec<serde_json::Value> = hotels
                .into_iter()
                .map(|h| json!({
                    "id": h.id,
                    "name": h.name,
                    "location": h.location,
                    "address": h.address,
                    "price": h.price_text,
                    "image_url": h.image_url,
                    "status": h.status,
                    "created_at": h.created_at,
                    "phone": h.phone,
                    "email": h.email,
                    "website": h.website,
                    "owner": {
                        "first_name": h.first_name,
                        "last_name": h.last_name,
                        "owner_email": h.owner_email
                    }
                }))
                .collect();

            Ok(HttpResponse::Ok().json(json!({
                "hotels": hotel_list,
                "total": hotel_list.len()
            })))
        }
        Err(e) => {
            println!("Error al obtener hoteles pendientes: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al obtener hoteles pendientes"
            })))
        }
    }
}

// Aprobar un hotel
pub async fn approve_hotel(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse> {
    // Verificar que sea admin
    if let Err(e) = require_admin(&user) {
        return Err(e);
    }

    let hotel_id = path.into_inner();

    let result = sqlx::query!(
        r#"
        UPDATE hotels 
        SET status = 'approved', 
            approved_by = $1, 
            approved_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND status = 'pending'
        "#,
        user.id,
        hotel_id
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(query_result) => {
            if query_result.rows_affected() > 0 {
                Ok(HttpResponse::Ok().json(json!({
                    "message": "Hotel aprobado exitosamente",
                    "hotel_id": hotel_id,
                    "approved_by": user.id
                })))
            } else {
                Ok(HttpResponse::NotFound().json(json!({
                    "error": "Hotel no encontrado o ya fue procesado"
                })))
            }
        }
        Err(e) => {
            println!("Error al aprobar hotel: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al aprobar hotel"
            })))
        }
    }
}

// Rechazar un hotel
pub async fn reject_hotel(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    body: web::Json<serde_json::Value>,
    user: UserInfo,
) -> Result<HttpResponse> {
    // Verificar que sea admin
    if let Err(e) = require_admin(&user) {
        return Err(e);
    }

    let hotel_id = path.into_inner();
    let admin_notes = body.get("admin_notes")
        .and_then(|v| v.as_str())
        .unwrap_or("Hotel rechazado por el administrador");

    let result = sqlx::query!(
        r#"
        UPDATE hotels 
        SET status = 'rejected', 
            approved_by = $1, 
            approved_at = CURRENT_TIMESTAMP,
            admin_notes = $3
        WHERE id = $2 AND status = 'pending'
        "#,
        user.id,
        hotel_id,
        admin_notes
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(query_result) => {
            if query_result.rows_affected() > 0 {
                Ok(HttpResponse::Ok().json(json!({
                    "message": "Hotel rechazado",
                    "hotel_id": hotel_id,
                    "admin_notes": admin_notes,
                    "rejected_by": user.id
                })))
            } else {
                Ok(HttpResponse::NotFound().json(json!({
                    "error": "Hotel no encontrado o ya fue procesado"
                })))
            }
        }
        Err(e) => {
            println!("Error al rechazar hotel: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al rechazar hotel"
            })))
        }
    }
}

// Ver todos los hoteles con filtros simples
pub async fn get_all_hotels(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse> {
    // Verificar que sea admin
    if let Err(e) = require_admin(&user) {
        return Err(e);
    }

    let hotels = sqlx::query!(
        r#"
        SELECT h.id, h.name, h.location, h.address, h.price::text as price_text,
               h.image_url, h.status, h.created_at, h.approved_at, h.admin_notes,
               u.first_name, u.last_name, u.email as owner_email
        FROM hotels h
        JOIN users u ON h.owner_id = u.id
        ORDER BY h.created_at DESC
        LIMIT 100
        "#
    )
    .fetch_all(pool.get_ref())
    .await;

    match hotels {
        Ok(hotels) => {
            let hotel_list: Vec<serde_json::Value> = hotels
                .into_iter()
                .map(|h| json!({
                    "id": h.id,
                    "name": h.name,
                    "location": h.location,
                    "address": h.address,
                    "price": h.price_text,
                    "image_url": h.image_url,
                    "status": h.status,
                    "created_at": h.created_at,
                    "approved_at": h.approved_at,
                    "admin_notes": h.admin_notes,
                    "owner": {
                        "first_name": h.first_name,
                        "last_name": h.last_name,
                        "email": h.owner_email
                    }
                }))
                .collect();

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

// ========== FUNCIONES DE NEGOCIOS/RESTAURANTES ==========

// Obtener negocios pendientes de aprobación
pub async fn get_pending_businesses(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse> {
    // Verificar que es admin
    if user.role != UserRole::Admin {
        return Ok(HttpResponse::Forbidden().json(json!({
            "error": "Solo administradores pueden acceder"
        })));
    }

    let result = sqlx::query!(
        r#"
        SELECT 
            b.id, b.owner_id, b.business_type, b.name, b.description, 
            b.location, b.address, b.phone, b.email, b.website, 
            b.status, b.business_data, b.operating_hours, 
            b.created_at, b.updated_at, b.approved_at, b.approved_by,
            u.email as owner_email, u.first_name, u.last_name
        FROM businesses b
        JOIN users u ON b.owner_id = u.id
        WHERE b.status = 'pending'
        ORDER BY b.created_at ASC
        "#
    )
    .fetch_all(pool.as_ref())
    .await;

    match result {
        Ok(rows) => {
            let businesses: Vec<serde_json::Value> = rows
                .into_iter()
                .map(|row| {
                    let first_name = row.first_name;
                    let last_name = row.last_name;
                    let owner_name = format!("{} {}", first_name, last_name).trim().to_string();

                    json!({
                        "id": row.id,
                        "owner_id": row.owner_id,
                        "business_type": row.business_type,
                        "name": row.name,
                        "description": row.description,
                        "location": row.location,
                        "address": row.address,
                        "phone": row.phone,
                        "email": row.email,
                        "website": row.website,
                        "status": row.status,
                        "business_data": row.business_data,
                        "operating_hours": row.operating_hours,
                        "created_at": row.created_at,
                        "updated_at": row.updated_at,
                        "approved_at": row.approved_at,
                        "approved_by": row.approved_by,
                        "owner_email": row.owner_email,
                        "owner_name": if owner_name.is_empty() { "Usuario".to_string() } else { owner_name }
                    })
                })
                .collect();

            println!("Encontrados {} negocios pendientes", businesses.len());
            Ok(HttpResponse::Ok().json(businesses))
        }
        Err(e) => {
            eprintln!("Error obteniendo negocios pendientes: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al obtener negocios pendientes"
            })))
        }
    }
}

// Aprobar negocio
pub async fn approve_business(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse> {
    if user.role != UserRole::Admin {
        return Ok(HttpResponse::Forbidden().json(json!({
            "error": "Solo administradores pueden aprobar negocios"
        })));
    }

    let business_id = path.into_inner();

    let result = sqlx::query!(
        r#"
        UPDATE businesses 
        SET status = 'approved', 
            approved_by = $1, 
            approved_at = NOW(),
            updated_at = NOW()
        WHERE id = $2 AND status = 'pending'
        RETURNING id, name, business_type
        "#,
        user.id,
        business_id
    )
    .fetch_optional(pool.as_ref())
    .await;

    match result {
        Ok(Some(record)) => {
            println!("Negocio {} ({}) aprobado por admin {}", 
                record.name, record.business_type, user.id);
            
            Ok(HttpResponse::Ok().json(json!({
                "message": format!("Negocio {} aprobado exitosamente", record.name),
                "business_id": record.id,
                "business_type": record.business_type
            })))
        }
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(json!({
                "error": "Negocio no encontrado o ya procesado"
            })))
        }
        Err(e) => {
            eprintln!("Error aprobando negocio: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al aprobar negocio"
            })))
        }
    }
}

// Rechazar negocio
pub async fn reject_business(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse> {
    if user.role != UserRole::Admin {
        return Ok(HttpResponse::Forbidden().json(json!({
            "error": "Solo administradores pueden rechazar negocios"
        })));
    }

    let business_id = path.into_inner();

    let result = sqlx::query!(
        r#"
        UPDATE businesses 
        SET status = 'rejected',
            approved_by = $1,
            approved_at = NOW(),
            updated_at = NOW()
        WHERE id = $2 AND status = 'pending'
        RETURNING id, name, business_type
        "#,
        user.id,
        business_id
    )
    .fetch_optional(pool.as_ref())
    .await;

    match result {
        Ok(Some(record)) => {
            println!("Negocio {} ({}) rechazado por admin {}", 
                record.name, record.business_type, user.id);
            
            Ok(HttpResponse::Ok().json(json!({
                "message": format!("Negocio {} rechazado", record.name),
                "business_id": record.id,
                "business_type": record.business_type
            })))
        }
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(json!({
                "error": "Negocio no encontrado o ya procesado"
            })))
        }
        Err(e) => {
            eprintln!("Error rechazando negocio: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al rechazar negocio"
            })))
        }
    }
}

// Obtener todos los negocios para admin
pub async fn get_admin_businesses(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse> {
    // Verificar que sea admin
    if let Err(e) = require_admin(&user) {
        return Err(e);
    }

    // Obtener hoteles
    let hotels: Vec<(i32, String, String, String, DateTime<Utc>)> = sqlx::query_as(
        "SELECT id, name, location, status, created_at FROM hotels ORDER BY created_at DESC"
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_else(|_| vec![]);

    let mut businesses: Vec<BusinessItem> = vec![];

    // Agregar hoteles
    for (id, name, location, status, created_at) in hotels {
        let stats: (i64, Option<f64>) = sqlx::query_as(
            "SELECT COUNT(*), SUM(total_price::numeric) FROM bookings WHERE hotel_id = $1"
        )
        .bind(id)
        .fetch_one(pool.get_ref())
        .await
        .unwrap_or((0, None));

        businesses.push(BusinessItem {
            id,
            name,
            business_type: "Hotel".to_string(),
            location,
            status,
            total_bookings: stats.0,
            total_revenue: stats.1.unwrap_or(0.0),
            created_at,
        });
    }

    // Agregar restaurantes/negocios de la tabla businesses
    let business_rows = sqlx::query!(
        r#"
        SELECT 
            b.id, b.business_type, b.name, b.location, b.status, b.created_at
        FROM businesses b
        ORDER BY b.created_at DESC
        "#
    )
    .fetch_all(pool.as_ref())
    .await
    .unwrap_or_else(|_| vec![]);

    for row in business_rows {
        businesses.push(BusinessItem {
            id: row.id,
            name: row.name,
            business_type: row.business_type,
            location: row.location,
            status: row.status,
            total_bookings: 0, // Por ahora
            total_revenue: 0.0,
            created_at: row.created_at.unwrap_or_else(|| Utc::now()),
        });
    }

    Ok(HttpResponse::Ok().json(businesses))
}

// ========== FUNCIONES DE RESERVAS ==========

// Obtener detalles de reservas
pub async fn get_admin_bookings(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse> {
    // Verificar que sea admin
    if let Err(e) = require_admin(&user) {
        return Err(e);
    }

    let bookings: Vec<(i32, String, String, f64, String, DateTime<Utc>, String)> = sqlx::query_as(
        r#"
        SELECT 
            b.id,
            u.email,
            h.name,
            b.total_price::numeric::float8,
            b.status,
            b.created_at,
            b.booking_reference
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN hotels h ON b.hotel_id = h.id
        ORDER BY b.created_at DESC
        LIMIT 50
        "#
    )
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_else(|_| vec![]);

    let booking_details: Vec<BookingDetail> = bookings.into_iter().map(
        |(id, user_email, service_name, total_amount, status, created_at, booking_reference)| {
            BookingDetail {
                id,
                user_email,
                service_type: "hotel".to_string(),
                service_name,
                total_amount,
                status,
                created_at,
                booking_reference,
            }
        }
    ).collect();

    Ok(HttpResponse::Ok().json(booking_details))
}
