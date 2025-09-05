pub mod auth;
pub mod hotel;
pub mod booking;
pub mod admin;
pub mod business;

pub use auth::{register, login};
pub use hotel::{
    create_hotel,
    get_my_hotels,
    get_public_hotels,
    verify_hotel_ownership,
};
pub use booking::{
    create_booking,
    get_my_bookings,
    cancel_booking,
    get_hotel_bookings,
};
pub use admin::{
    get_pending_hotels,
    approve_hotel,
    reject_hotel,
    get_all_hotels,
    get_pending_businesses,
    approve_business,
    reject_business,
    get_dashboard_stats,
};
pub use business::{
    create_business,
    get_my_businesses,
    get_business_detail,
    update_business,
    delete_business,
};
