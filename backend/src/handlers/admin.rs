use actix_web::{web, HttpResponse, get, put};
use sqlx::PgPool;
use crate::{
    models::{hotel::{Hotel, HotelStatus, RejectReason}, business::{Business, BusinessStatus}},
    middleware::auth::{JwtMiddleware, RoleGuard},
    utils::errors::AppError,
};

// --- Hotel Administration ---

#[get("/api/admin/hotels/pending", wrap = "RoleGuard::new(\"admin\")")]
pub async fn get_pending_hotels(pool: web::Data<PgPool>, _user: JwtMiddleware) -> Result<HttpResponse, AppError> {
    let hotels = sqlx::query_as!(
        Hotel,
        "SELECT * FROM hotels WHERE status = $1",
        HotelStatus::Pending as HotelStatus
    )
    .fetch_all(pool.get_ref())
    .await?;
    Ok(HttpResponse::Ok().json(hotels))
}

#[put("/api/admin/hotels/{id}/approve", wrap = "RoleGuard::new(\"admin\")")]
pub async fn approve_hotel(pool: web::Data<PgPool>, path: web::Path<i32>, _user: JwtMiddleware) -> Result<HttpResponse, AppError> {
    let hotel_id = path.into_inner();
    let result = sqlx::query!(
        "UPDATE hotels SET status = $1 WHERE id = $2",
        HotelStatus::Approved as HotelStatus,
        hotel_id
    )
    .execute(pool.get_ref())
    .await?;
    
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }
    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Hotel approved"})))
}

#[put("/api/admin/hotels/{id}/reject", wrap = "RoleGuard::new(\"admin\")")]
pub async fn reject_hotel(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    body: web::Json<RejectReason>,
    _user: JwtMiddleware,
) -> Result<HttpResponse, AppError> {
    let hotel_id = path.into_inner();
    let rejection_reason = body.into_inner().reason;

    // Aquí podrías guardar la razón del rechazo en otra tabla o columna si existiera.
    // Por ahora, solo actualizamos el estado.
    let result = sqlx::query!(
        "UPDATE hotels SET status = $1 WHERE id = $2",
        HotelStatus::Rejected as HotelStatus,
        hotel_id
    )
    .execute(pool.get_ref())
    .await?;
    
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Hotel rejected", "reason": rejection_reason})))
}

#[get("/api/admin/hotels", wrap = "RoleGuard::new(\"admin\")")]
pub async fn get_all_hotels(pool: web::Data<PgPool>, _user: JwtMiddleware) -> Result<HttpResponse, AppError> {
    let hotels = sqlx::query_as!(Hotel, "SELECT * FROM hotels")
        .fetch_all(pool.get_ref())
        .await?;
    Ok(HttpResponse::Ok().json(hotels))
}


// --- Business Administration ---

#[get("/api/admin/businesses/pending", wrap = "RoleGuard::new(\"admin\")")]
pub async fn get_pending_businesses(pool: web::Data<PgPool>, _user: JwtMiddleware) -> Result<HttpResponse, AppError> {
    let businesses = sqlx::query_as!(
        Business,
        "SELECT * FROM businesses WHERE status = $1",
        BusinessStatus::Pending as BusinessStatus
    )
    .fetch_all(pool.get_ref())
    .await?;
    Ok(HttpResponse::Ok().json(businesses))
}

#[put("/api/admin/businesses/{id}/approve", wrap = "RoleGuard::new(\"admin\")")]
pub async fn approve_business(pool: web::Data<PgPool>, path: web::Path<i32>, _user: JwtMiddleware) -> Result<HttpResponse, AppError> {
    let business_id = path.into_inner();
    let result = sqlx::query!(
        "UPDATE businesses SET status = $1 WHERE id = $2",
        BusinessStatus::Approved as BusinessStatus,
        business_id
    )
    .execute(pool.get_ref())
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }
    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Business approved"})))
}

#[put("/api/admin/businesses/{id}/reject", wrap = "RoleGuard::new(\"admin\")")]
pub async fn reject_business(pool: web::Data<PgPool>, path: web::Path<i32>, _user: JwtMiddleware) -> Result<HttpResponse, AppError> {
    let business_id = path.into_inner();
    let result = sqlx::query!(
        "UPDATE businesses SET status = $1 WHERE id = $2",
        BusinessStatus::Rejected as BusinessStatus,
        business_id
    )
    .execute(pool.get_ref())
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }
    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Business rejected"})))
}


// --- Otras funciones de Admin ---
// Estas funciones no estaban en tu main.rs pero existen en tu admin.rs original.
// Las refactorizo también para completitud.

#[get("/api/admin/stats", wrap = "RoleGuard::new(\"admin\")")]
pub async fn get_admin_stats(pool: web::Data<PgPool>, _user: JwtMiddleware) -> Result<HttpResponse, AppError> {
    // Implementación de ejemplo - la lógica real podría ser más compleja
    let user_count = sqlx::query!("SELECT COUNT(*) as count FROM users").fetch_one(pool.get_ref()).await?.count.unwrap_or(0);
    let hotel_count = sqlx::query!("SELECT COUNT(*) as count FROM hotels").fetch_one(pool.get_ref()).await?.count.unwrap_or(0);
    let business_count = sqlx::query!("SELECT COUNT(*) as count FROM businesses").fetch_one(pool.get_ref()).await?.count.unwrap_or(0);
    
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "users": user_count,
        "hotels": hotel_count,
        "businesses": business_count
    })))
}

// Resto de handlers de admin.rs que deben ser implementados o verificados
// get_admin_metrics, get_admin_businesses, get_admin_bookings, get_search_analytics
