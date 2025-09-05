use std::{env, net::TcpListener};
use actix_web::{web, App, HttpServer, HttpResponse, get, middleware::Logger};
use actix_cors::Cors;
use sqlx::postgres::PgPoolOptions;

mod models;
mod handlers;
mod middleware;
mod utils;

use handlers::{auth, hotel};

#[get("/health")]
async fn health() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "OK",
        "message": "Maya Digital Backend funcionando correctamente"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL debe estar configurada");
    
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Error al conectar con la base de datos");

    let listener = TcpListener::bind("0.0.0.0:8080")?;
    println!("🚀 Servidor iniciado en http://0.0.0.0:8080");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(cors)
            .wrap(Logger::default())
            .service(health)
            .service(auth::register)
            .service(auth::login)
            .service(
                web::scope("/api")
                    .route("/hotels", web::post().to(hotel::create_hotel))
                    .route("/hotels/my", web::get().to(hotel::get_my_hotels))
                    .route("/hotels/public", web::get().to(hotel::get_public_hotels))
            )
    })
    .listen(listener)?
    .run()
    .await
}
