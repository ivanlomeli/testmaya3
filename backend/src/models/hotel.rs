// ... (resto de tu archivo hotel.rs) ...

#[derive(Debug, Serialize, Deserialize)]
pub struct RejectReason { // "pub" añadido aquí
    pub reason: String,
}

// ... (asegúrate que HotelStatus también sea `pub enum`)
