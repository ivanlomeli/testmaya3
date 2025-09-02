use actix_web::{web, HttpResponse, Result};

pub async fn test_business() -> Result<HttpResponse> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "message": "Business route is working"
    })))
}