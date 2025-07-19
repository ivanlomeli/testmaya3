use actix_web::{Error, FromRequest, HttpRequest};
use actix_web::error::ErrorUnauthorized;
use futures_util::future::{ok, err, Ready};

use crate::models::{UserInfo, UserRole};
use crate::utils::verify_jwt;

impl FromRequest for UserInfo {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let auth_header = req.headers().get("Authorization");
        
        if let Some(auth_value) = auth_header {
            if let Ok(auth_str) = auth_value.to_str() {
                if auth_str.starts_with("Bearer ") {
                    let token = &auth_str[7..]; // Remove "Bearer " prefix
                    
                    // Use your existing verify_jwt function
                    if let Ok(claims) = verify_jwt(token) {
                        // Convert role string to UserRole
                        let role = match claims.role.as_str() {
                            "admin" => UserRole::Admin,
                            "hotel_owner" => UserRole::HotelOwner,
                            "customer" => UserRole::Customer,
                            _ => UserRole::Customer,
                        };
                        
                        let user_info = UserInfo {
                            id: claims.sub.parse().unwrap_or(0),
                            email: claims.email,
                            role,
                            first_name: "".to_string(), // We don't store this in JWT
                            last_name: "".to_string(),  // We don't store this in JWT
                            phone: None,
                        };
                        
                        return ok(user_info);
                    }
                }
            }
        }
        
        err(ErrorUnauthorized("Invalid or missing authorization token"))
    }
}

pub fn require_role(required_role: &str) -> impl Fn(&UserInfo) -> bool + '_ {
    move |user: &UserInfo| {
        match (&user.role, required_role) {
            (UserRole::Admin, _) => true, // Admin can access everything
            (UserRole::HotelOwner, "hotel_owner") => true,
            (UserRole::Customer, "customer") => true,
            _ => false,
        }
    }
}