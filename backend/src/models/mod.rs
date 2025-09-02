// models/mod.rs

pub mod user;
pub mod hotel;
pub mod booking;
pub mod business;

// Re-export main types
pub use user::*;
pub use hotel::*;
pub use booking::*;
// 🔥 COMENTADO para evitar warning si no se usa
// pub use business::*;