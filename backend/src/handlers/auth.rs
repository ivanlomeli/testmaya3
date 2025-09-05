// backend/src/handlers/auth.rs - VERSIÓN CORREGIDA
use actix_web::{web, HttpResponse, Result};
use sqlx::PgPool;
use serde_json::json;
use bcrypt::{hash, verify, DEFAULT_COST}; // ✅ USAR BCRYPT REAL
use jsonwebtoken::{encode, Header, EncodingKey};
use chrono::{Utc, Duration};
use validator::Validate;

use crate::models::{RegisterRequest, LoginRequest, AuthResponse, UserInfo, JwtClaims, User};
use crate::utils::errors::AppError; // ✅ IMPORTAR AppError

// ✅ FUNCIÓN MEJORADA para crear JWT
fn create_jwt_simple(
    user_id: i32, 
    email: &str, 
    user_type: &str,
    first_name: Option<&str>,
    last_name: Option<&str>,
    phone: Option<&str>
) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(7))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = JwtClaims {
        user_id,
        email: email.to_string(),
        user_type: user_type.to_string(),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret("esta_es_una_clave_diferente_para_la_copia".as_ref()),
    )
}

pub async fn register(
    pool: web::Data<PgPool>,
    register_req: web::Json<RegisterRequest>,
) -> Result<HttpResponse, AppError> { // ✅ USAR AppError
    println!("🔐 [AUTH] Procesando registro para: {}", register_req.email);

    // Validar datos de entrada
    if let Err(errors) = register_req.validate() {
        println!("❌ [AUTH] Errores de validación: {:?}", errors);
        return Err(AppError::BadRequest(format!("Datos inválidos: {}", errors)));
    }

    // Verificar si el usuario ya existe
    let existing_user = sqlx::query!(
        "SELECT id FROM users WHERE email = $1",
        register_req.email
    )
    .fetch_optional(pool.get_ref())
    .await?; // ✅ USAR ? operator

    if existing_user.is_some() {
        println!("⚠️ [AUTH] Email ya registrado: {}", register_req.email);
        return Err(AppError::Conflict("Este email ya está registrado".to_string()));
    }

    // ✅ HASHEAR CONTRASEÑA CON BCRYPT REAL
    let password_hash = hash(&register_req.password, DEFAULT_COST)?;

    // Crear usuario en la base de datos
    let user_record = sqlx::query!(
        r#"
        INSERT INTO users (first_name, last_name, email, password_hash, user_type) 
        VALUES ($1, $2, $3, $4, 'customer') 
        RETURNING id, first_name, last_name, email, user_type, created_at
        "#,
        register_req.first_name,
        register_req.last_name,
        register_req.email,
        password_hash
    )
    .fetch_one(pool.get_ref())
    .await?; // ✅ USAR ? operator

    println!("✅ [AUTH] Usuario creado exitosamente con ID: {}", user_record.id);

    let user_info = UserInfo {
        id: user_record.id,
        first_name: user_record.first_name,
        last_name: user_record.last_name,
        email: user_record.email,
        user_type: user_record.user_type,
    };

    // ✅ GENERAR JWT CON MANEJO DE ERRORES CORRECTO
    let token = create_jwt_simple(
        user_record.id, 
        &user_info.email, 
        &user_info.user_type,
        Some(&user_info.first_name),
        Some(&user_info.last_name),
        None
    )?;

    println!("🎫 [AUTH] JWT generado exitosamente");

    let response = AuthResponse {
        message: "Usuario registrado exitosamente".to_string(),
        token,
        user: user_info,
    };

    Ok(HttpResponse::Created().json(response))
}

pub async fn login(
    pool: web::Data<PgPool>,
    login_req: web::Json<LoginRequest>,
) -> Result<HttpResponse, AppError> { // ✅ USAR AppError
    println!("🔐 [AUTH] Procesando login para: {}", login_req.email);

    // Validar datos de entrada
    if let Err(errors) = login_req.validate() {
        println!("❌ [AUTH] Errores de validación: {:?}", errors);
        return Err(AppError::BadRequest(format!("Datos inválidos: {}", errors)));
    }

    // Buscar usuario en la base de datos
    let user = sqlx::query_as!(
        User,
        "SELECT id, first_name, last_name, email, password_hash, user_type, created_at, updated_at FROM users WHERE email = $1",
        login_req.email
    )
    .fetch_optional(pool.get_ref())
    .await?; // ✅ USAR ? operator

    let user = match user {
        Some(u) => u,
        None => {
            println!("❌ [AUTH] Usuario no encontrado: {}", login_req.email);
            return Err(AppError::Unauthorized("Email o contraseña incorrectos".to_string()));
        }
    };

    println!("👤 [AUTH] Usuario encontrado: {}", user.email);

    // ✅ VERIFICAR CONTRASEÑA CON BCRYPT REAL
    if !verify(&login_req.password, &user.password_hash)? {
        println!("❌ [AUTH] Contraseña incorrecta");
        return Err(AppError::Unauthorized("Email o contraseña incorrectos".to_string()));
    }

    println!("✅ [AUTH] Contraseña correcta");

    let user_info = UserInfo {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        user_type: user.user_type,
    };

    // ✅ GENERAR JWT CON MANEJO DE ERRORES CORRECTO
    let token = create_jwt_simple(
        user_info.id, 
        &user_info.email, 
        &user_info.user_type,
        Some(&user_info.first_name),
        Some(&user_info.last_name),
        None
    )?;

    println!("🎫 [AUTH] Login exitoso, JWT generado");

    let response = AuthResponse {
        message: "Login exitoso".to_string(),
        token,
        user: user_info,
    };

    Ok(HttpResponse::Ok().json(response))
}

pub async fn me(user: UserInfo) -> Result<HttpResponse, AppError> {
    println!("👤 [AUTH] Obteniendo información del usuario: {}", user.email);
    
    Ok(HttpResponse::Ok().json(json!({
        "user": user
    })))
}