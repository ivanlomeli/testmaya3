// lib.rs

// --- Módulos de la Aplicación ---
pub mod models;
pub mod handlers;
pub mod middleware;
pub mod utils;

use actix_web::{dev::Server, web, App, HttpServer, HttpResponse, Responder, get, middleware::Logger};
use actix_cors::Cors;
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::net::TcpListener;

// Importaciones de handlers (igual que en main.rs)
use handlers::{
    // ... (todas tus importaciones de handlers)
};

// ... (todos tus endpoints estáticos como get_restaurantes, etc.)

// --- La función RUN ---
// Esta es la función clave que será llamada tanto por main.rs como por las pruebas.
pub fn run(listener: TcpListener, db_pool: PgPool) -> Result<Server, std::io::Error> {
    let db_pool = web::Data::new(db_pool);
    let server = HttpServer::new(move || {
        let cors = Cors::default()
            // ... tu configuración de CORS
            ;

        App::new()
            .app_data(db_pool.clone())
            .wrap(cors)
            .wrap(Logger::default())
            // ... (todo el registro de rutas y servicios que tenías en main.rs)
    })
    .listen(listener)?
    .run();
    
    Ok(server)
}
