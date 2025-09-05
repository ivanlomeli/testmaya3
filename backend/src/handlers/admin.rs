use actix_web::{web, HttpResponse};
use sqlx::{PgPool, Row};
use crate::{
    models::UserInfo,
    utils::errors::AppError,
};

pub async fn get_pending_hotels(pool: web::Data<PgPool>, _user: UserInfo) -> Result<HttpResponse, AppError> {
    let hotels = sqlx::query("SELECT * FROM hotels WHERE status = $1")
        .bind("pending")
        .fetch_all(pool.get_ref())
        .await?;

    let hotel_list: Vec<serde_json::Value> = hotels.into_iter().map(|h| serde_json::json!({
        "id": h.get::<i32, _>("id"),
        "name": h.get::<String, _>("name"),
        "status": h.get::<String, _>("status")
    })).collect();

    Ok(HttpResponse::Ok().json(hotel_list))
}

pub async fn approve_hotel(pool: web::Data<PgPool>, path: web::Path<i32>, _user: UserInfo) -> Result<HttpResponse, AppError> {
    let hotel_id = path.into_inner();
    let result = sqlx::query("UPDATE hotels SET status = $1 WHERE id = $2")
        .bind("approved")
        .bind(hotel_id)
        .execute(pool.get_ref())
        .await?;
    
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }
    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Hotel approved"})))
}

pub async fn reject_hotel(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    _user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let hotel_id = path.into_inner();
    let result = sqlx::query("UPDATE hotels SET status = $1 WHERE id = $2")
        .bind("rejected")
        .bind(hotel_id)
        .execute(pool.get_ref())
        .await?;
    
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Hotel rejected"})))
}

pub async fn get_all_hotels(pool: web::Data<PgPool>, _user: UserInfo) -> Result<HttpResponse, AppError> {
    let hotels = sqlx::query("SELECT * FROM hotels")
        .fetch_all(pool.get_ref())
        .await?;

    let hotel_list: Vec<serde_json::Value> = hotels.into_iter().map(|h| serde_json::json!({
        "id": h.get::<i32, _>("id"),
        "name": h.get::<String, _>("name"),
        "status": h.get::<String, _>("status")
    })).collect();

    Ok(HttpResponse::Ok().json(hotel_list))
}

pub async fn get_pending_businesses(pool: web::Data<PgPool>, _user: UserInfo) -> Result<HttpResponse, AppError> {
    let businesses = sqlx::query("SELECT * FROM businesses WHERE status = $1")
        .bind("pending")
        .fetch_all(pool.get_ref())
        .await?;

    let business_list: Vec<serde_json::Value> = businesses.into_iter().map(|b| serde_json::json!({
        "id": b.get::<i32, _>("id"),
        "name": b.get::<String, _>("name"),
        "status": b.get::<String, _>("status")
    })).collect();

    Ok(HttpResponse::Ok().json(business_list))
}

pub async fn approve_business(pool: web::Data<PgPool>, path: web::Path<i32>, _user: UserInfo) -> Result<HttpResponse, AppError> {
    let business_id = path.into_inner();
    let result = sqlx::query("UPDATE businesses SET status = $1 WHERE id = $2")
        .bind("approved")
        .bind(business_id)
        .execute(pool.get_ref())
        .await?;
    
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }
    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Business approved"})))
}

pub async fn reject_business(pool: web::Data<PgPool>, path: web::Path<i32>, _user: UserInfo) -> Result<HttpResponse, AppError> {
    let business_id = path.into_inner();
    let result = sqlx::query("UPDATE businesses SET status = $1 WHERE id = $2")
        .bind("rejected")
        .bind(business_id)
        .execute(pool.get_ref())
        .await?;
    
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }
    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Business rejected"})))
}

pub async fn get_dashboard_stats(pool: web::Data<PgPool>, _user: UserInfo) -> Result<HttpResponse, AppError> {
    let user_count_row = sqlx::query("SELECT COUNT(*) as count FROM users").fetch_one(pool.get_ref()).await?;
    let hotel_count_row = sqlx::query("SELECT COUNT(*) as count FROM hotels").fetch_one(pool.get_ref()).await?;
    let business_count_row = sqlx::query("SELECT COUNT(*) as count FROM businesses").fetch_one(pool.get_ref()).await?;
    
    let user_count: i64 = user_count_row.get("count");
    let hotel_count: i64 = hotel_count_row.get("count");
    let business_count: i64 = business_count_row.get("count");

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "users": user_count,
        "hotels": hotel_count,
        "businesses": business_count
    })))
}
