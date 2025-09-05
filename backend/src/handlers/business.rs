use actix_web::{web, HttpResponse};
use sqlx::{PgPool, Row};
use crate::{
    models::{
        UserInfo,
        business::{CreateBusinessRequest, BusinessResponse, BusinessImage}
    },
    utils::errors::AppError,
};

pub async fn create_business(
    pool: web::Data<PgPool>,
    user: UserInfo,
    req: web::Json<CreateBusinessRequest>,
) -> Result<HttpResponse, AppError> {
    let req = req.into_inner();
    
    let business_data_json = serde_json::to_value(&req.business_data)
        .map_err(|_| AppError::BadRequest("Error en datos del negocio".to_string()))?;
    
    let operating_hours_json = serde_json::to_value(&req.operating_hours)
        .map_err(|_| AppError::BadRequest("Error en horarios".to_string()))?;

    let result = sqlx::query(
        r#"
        INSERT INTO businesses (
            owner_id, business_type, name, description, location, address,
            phone, email, website, status, business_data, operating_hours
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, business_type, name, location, status, created_at
        "#
    )
    .bind(user.id)
    .bind(&req.business_type)
    .bind(&req.name)
    .bind(req.description.as_deref())
    .bind(&req.location)
    .bind(req.address.as_deref())
    .bind(req.phone.as_deref())
    .bind(req.email.as_deref())
    .bind(req.website.as_deref())
    .bind("pending")
    .bind(&business_data_json)
    .bind(&operating_hours_json)
    .fetch_one(pool.get_ref())
    .await
    .map_err(AppError::DatabaseError)?;

    Ok(HttpResponse::Created().json(serde_json::json!({
        "message": "Negocio creado exitosamente",
        "business": {
            "id": result.get::<i32, _>("id"),
            "name": result.get::<String, _>("name"),
            "business_type": result.get::<String, _>("business_type"),
            "location": result.get::<String, _>("location"),
            "status": result.get::<String, _>("status"),
            "created_at": result.get::<chrono::DateTime<chrono::Utc>, _>("created_at")
        }
    })))
}

pub async fn get_my_businesses(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let businesses = sqlx::query(
        r#"
        SELECT id, business_type, name, location, status, created_at
        FROM businesses 
        WHERE owner_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(user.id)
    .fetch_all(pool.get_ref())
    .await
    .map_err(AppError::DatabaseError)?;

    let business_list: Vec<serde_json::Value> = businesses.into_iter().map(|b| serde_json::json!({
        "id": b.get::<i32, _>("id"),
        "name": b.get::<String, _>("name"),
        "business_type": b.get::<String, _>("business_type"),
        "location": b.get::<String, _>("location"),
        "status": b.get::<String, _>("status"),
        "created_at": b.get::<chrono::DateTime<chrono::Utc>, _>("created_at")
    })).collect();

    Ok(HttpResponse::Ok().json(business_list))
}

pub async fn get_business_detail(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let business_id = path.into_inner();

    let business = sqlx::query(
        r#"
        SELECT id, business_type, name, description, location, address,
               phone, email, website, status, business_data, operating_hours, created_at
        FROM businesses 
        WHERE id = $1 AND owner_id = $2
        "#
    )
    .bind(business_id)
    .bind(user.id)
    .fetch_optional(pool.get_ref())
    .await
    .map_err(AppError::DatabaseError)?;

    match business {
        Some(business) => {
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "id": business.get::<i32, _>("id"),
                "business_type": business.get::<String, _>("business_type"),
                "name": business.get::<String, _>("name"),
                "description": business.try_get::<Option<String>, _>("description").unwrap_or(None),
                "location": business.get::<String, _>("location"),
                "address": business.try_get::<Option<String>, _>("address").unwrap_or(None),
                "phone": business.try_get::<Option<String>, _>("phone").unwrap_or(None),
                "email": business.try_get::<Option<String>, _>("email").unwrap_or(None),
                "website": business.try_get::<Option<String>, _>("website").unwrap_or(None),
                "status": business.get::<String, _>("status"),
                "business_data": business.get::<sqlx::types::JsonValue, _>("business_data"),
                "operating_hours": business.get::<sqlx::types::JsonValue, _>("operating_hours"),
                "images": Vec::<serde_json::Value>::new(),
                "created_at": business.get::<chrono::DateTime<chrono::Utc>, _>("created_at")
            })))
        }
        None => Err(AppError::NotFound),
    }
}

pub async fn update_business(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    req: web::Json<CreateBusinessRequest>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let business_id = path.into_inner();
    let req = req.into_inner();

    let result = sqlx::query(
        r#"
        UPDATE businesses 
        SET name = $1, description = $2, location = $3, address = $4,
            phone = $5, email = $6, website = $7, business_type = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9 AND owner_id = $10
        "#
    )
    .bind(&req.name)
    .bind(req.description.as_deref())
    .bind(&req.location)
    .bind(req.address.as_deref())
    .bind(req.phone.as_deref())
    .bind(req.email.as_deref())
    .bind(req.website.as_deref())
    .bind(&req.business_type)
    .bind(business_id)
    .bind(user.id)
    .execute(pool.get_ref())
    .await
    .map_err(AppError::DatabaseError)?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Negocio actualizado"})))
}

pub async fn delete_business(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse, AppError> {
    let business_id = path.into_inner();

    let result = sqlx::query("DELETE FROM businesses WHERE id = $1 AND owner_id = $2")
        .bind(business_id)
        .bind(user.id)
        .execute(pool.get_ref())
        .await
        .map_err(AppError::DatabaseError)?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({"message": "Negocio eliminado"})))
}
