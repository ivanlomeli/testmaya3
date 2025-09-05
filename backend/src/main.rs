use std::{env, net::TcpListener};
use sqlx::postgres::PgPoolOptions;
use backend::run; // Usa la función `run` de tu nueva librería

#[tokio::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL debe estar configurada");
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    let address = "0.0.0.0:8080";
    let listener = TcpListener::bind(address)?;
    println!("🚀 Servidor iniciado en http://{}", address);
    
    run(listener, pool)?.await
}
