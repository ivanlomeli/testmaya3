// handlers/mod.rs

pub mod auth;
pub mod hotel;
pub mod booking;
pub mod admin;
pub mod business;

// Re-exportar de forma más específica
pub use auth::{register, login};

// Para hotel, exportar todo EXCEPTO get_hotel_bookings
pub use hotel::{
    create_hotel, 
    get_my_hotels, 
    update_hotel, 
    delete_hotel, 
    get_hotel_detail,
    get_all_approved_hotels,
    verify_hotel_ownership,
    // NO exportar get_hotel_bookings aquí
};

// Para booking, exportar específicamente las funciones
pub use booking::{
    create_booking,
    get_my_bookings,
    cancel_booking,
    get_hotel_bookings, // Usar la versión de booking
};

// Admin exports
pub use admin::*;

// Business exports  
pub use business::*;