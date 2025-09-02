// handlers/business.rs

use actix_web::{web, HttpResponse, Result};
use sqlx::PgPool;
use serde_json::json;

use crate::models::{
    UserInfo, 
    business::{CreateBusinessRequest, Business, BusinessResponse, BusinessImage}
};

pub async fn create_business(
    pool: web::Data<PgPool>,
    user: UserInfo,
    req: web::Json<CreateBusinessRequest>,
) -> Result<HttpResponse> {
    let req = req.into_inner();
    
    // Log para debugging
    println!("Recibiendo solicitud de negocio: {:?}", req);
    
    // Convertir business_data a JSON
    let business_data_json = match serde_json::to_value(&req.business_data) {
        Ok(json) => json,
        Err(e) => {
            eprintln!("Error serializando business_data: {}", e);
            return Ok(HttpResponse::BadRequest().json(json!({
                "error": "Error en los datos del negocio"
            })));
        }
    };
    
    // Convertir operating_hours a JSON
    let operating_hours_json = match serde_json::to_value(&req.operating_hours) {
        Ok(json) => json,
        Err(e) => {
            eprintln!("Error serializando operating_hours: {}", e);
            return Ok(HttpResponse::BadRequest().json(json!({
                "error": "Error en los horarios de operación"
            })));
        }
    };

    // Iniciar transacción
    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => {
            eprintln!("Error iniciando transacción: {}", e);
            return Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error interno del servidor"
            })));
        }
    };

    // Insertar el negocio
    let business_result = sqlx::query_as!(
        Business,
        r#"
        INSERT INTO businesses (
            owner_id, business_type, name, description, location, address,
            phone, email, website, status, business_data, operating_hours
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING 
            id, owner_id, business_type, name, description, location, address,
            phone, email, website, status, 
            business_data, operating_hours, created_at, updated_at, approved_at, approved_by
        "#,
        user.id,
        req.business_type,
        req.name,
        req.description,
        req.location,
        req.address,
        req.phone,
        req.email,
        req.website,
        "pending", // Usar string en lugar de enum
        business_data_json,
        operating_hours_json
    )
    .fetch_one(&mut *tx)
    .await;

    let business = match business_result {
        Ok(business) => business,
        Err(e) => {
            eprintln!("Error insertando negocio: {}", e);
            return Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al crear el negocio"
            })));
        }
    };

    // Insertar imágenes si las hay
    let mut images = Vec::new();
    if let Some(image_inputs) = req.images {
        for image_input in image_inputs {
            let image_result = sqlx::query!(
                r#"
                INSERT INTO business_images (business_id, image_url, image_type, display_order)
                VALUES ($1, $2, $3, $4)
                RETURNING id, business_id, image_url, image_type, display_order, created_at
                "#,
                business.id,
                image_input.image_url,
                image_input.image_type,
                image_input.display_order
            )
            .fetch_one(&mut *tx)
            .await;

            match image_result {
                Ok(row) => {
                    let image = BusinessImage {
                        id: row.id,
                        business_id: row.business_id,
                        image_url: row.image_url,
                        image_type: row.image_type,
                        display_order: row.display_order,
                        created_at: row.created_at,
                    };
                    images.push(image);
                }
                Err(e) => {
                    eprintln!("Error insertando imagen: {}", e);
                    // Continúa sin las imágenes si hay error
                }
            }
        }
    }

    // Confirmar transacción
    if let Err(e) = tx.commit().await {
        eprintln!("Error confirmando transacción: {}", e);
        return Ok(HttpResponse::InternalServerError().json(json!({
            "error": "Error al finalizar el registro"
        })));
    }

    // Crear respuesta
    let mut response = BusinessResponse::from(business);
    response.images = images;

    Ok(HttpResponse::Created().json(json!({
        "message": "Negocio registrado exitosamente",
        "business": response
    })))
}

pub async fn get_my_businesses(
    pool: web::Data<PgPool>,
    user: UserInfo,
) -> Result<HttpResponse> {
    let businesses = sqlx::query_as!(
        Business,
        r#"
        SELECT 
            id, owner_id, business_type, name, description, location, address,
            phone, email, website, status, 
            business_data, operating_hours, created_at, updated_at, approved_at, approved_by
        FROM businesses 
        WHERE owner_id = $1
        ORDER BY created_at DESC
        "#,
        user.id
    )
    .fetch_all(pool.as_ref())
    .await;

    match businesses {
        Ok(businesses) => {
            let responses: Vec<BusinessResponse> = businesses
                .into_iter()
                .map(BusinessResponse::from)
                .collect();
            
            Ok(HttpResponse::Ok().json(responses))
        }
        Err(e) => {
            eprintln!("Error obteniendo negocios: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al obtener los negocios"
            })))
        }
    }
}

pub async fn get_business_detail(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse> {
    let business_id = path.into_inner();

    // Obtener el negocio
    let business = sqlx::query_as!(
        Business,
        r#"
        SELECT 
            id, owner_id, business_type, name, description, location, address,
            phone, email, website, status, 
            business_data, operating_hours, created_at, updated_at, approved_at, approved_by
        FROM businesses 
        WHERE id = $1 AND owner_id = $2
        "#,
        business_id,
        user.id
    )
    .fetch_optional(pool.as_ref())
    .await;

    match business {
        Ok(Some(business)) => {
            // Obtener imágenes
            let image_rows = sqlx::query!(
                r#"
                SELECT id, business_id, image_url, image_type, display_order, created_at
                FROM business_images 
                WHERE business_id = $1
                ORDER BY display_order, id
                "#,
                business_id
            )
            .fetch_all(pool.as_ref())
            .await
            .unwrap_or_default();

            let images: Vec<BusinessImage> = image_rows
                .into_iter()
                .map(|row| BusinessImage {
                    id: row.id,
                    business_id: row.business_id,
                    image_url: row.image_url,
                    image_type: row.image_type,
                    display_order: row.display_order,
                    created_at: row.created_at,
                })
                .collect();

            let mut response = BusinessResponse::from(business);
            response.images = images;

            Ok(HttpResponse::Ok().json(response))
        }
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(json!({
                "error": "Negocio no encontrado"
            })))
        }
        Err(e) => {
            eprintln!("Error obteniendo negocio: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al obtener el negocio"
            })))
        }
    }
}

pub async fn update_business(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
    req: web::Json<CreateBusinessRequest>,
) -> Result<HttpResponse> {
    let business_id = path.into_inner();
    let req = req.into_inner();

    // Convertir datos a JSON
    let business_data_json = serde_json::to_value(&req.business_data).unwrap();
    let operating_hours_json = serde_json::to_value(&req.operating_hours).unwrap();

    let result = sqlx::query!(
        r#"
        UPDATE businesses 
        SET name = $1, description = $2, location = $3, address = $4,
            phone = $5, email = $6, website = $7, business_data = $8,
            operating_hours = $9, updated_at = NOW()
        WHERE id = $10 AND owner_id = $11
        "#,
        req.name,
        req.description,
        req.location,
        req.address,
        req.phone,
        req.email,
        req.website,
        business_data_json,
        operating_hours_json,
        business_id,
        user.id
    )
    .execute(pool.as_ref())
    .await;

    match result {
        Ok(result) => {
            if result.rows_affected() > 0 {
                Ok(HttpResponse::Ok().json(json!({
                    "message": "Negocio actualizado exitosamente"
                })))
            } else {
                Ok(HttpResponse::NotFound().json(json!({
                    "error": "Negocio no encontrado"
                })))
            }
        }
        Err(e) => {
            eprintln!("Error actualizando negocio: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al actualizar el negocio"
            })))
        }
    }
}

pub async fn delete_business(
    pool: web::Data<PgPool>,
    path: web::Path<i32>,
    user: UserInfo,
) -> Result<HttpResponse> {
    let business_id = path.into_inner();

    let result = sqlx::query!(
        "DELETE FROM businesses WHERE id = $1 AND owner_id = $2",
        business_id,
        user.id
    )
    .execute(pool.as_ref())
    .await;

    match result {
        Ok(result) => {
            if result.rows_affected() > 0 {
                Ok(HttpResponse::Ok().json(json!({
                    "message": "Negocio eliminado exitosamente"
                })))
            } else {
                Ok(HttpResponse::NotFound().json(json!({
                    "error": "Negocio no encontrado"
                })))
            }
        }
        Err(e) => {
            eprintln!("Error eliminando negocio: {}", e);
            Ok(HttpResponse::InternalServerError().json(json!({
                "error": "Error al eliminar el negocio"
            })))
        }
    }
}