-- migrations/create_hotels_table.sql
CREATE TYPE hotel_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    status hotel_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Campos adicionales
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    check_in_time TIME DEFAULT '15:00',
    check_out_time TIME DEFAULT '11:00',
    rooms_available INTEGER DEFAULT 1,
    rating DECIMAL(2,1) DEFAULT 0.0
);

-- Índices
CREATE INDEX idx_hotels_owner ON hotels(owner_id);
CREATE INDEX idx_hotels_status ON hotels(status);
CREATE INDEX idx_hotels_location ON hotels(location);