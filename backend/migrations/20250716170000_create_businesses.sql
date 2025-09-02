-- Crear tabla businesses sin datos de ejemplo
CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    status TEXT NOT NULL DEFAULT 'pending',
    business_data JSONB NOT NULL DEFAULT '{}',
    operating_hours JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by INTEGER REFERENCES users(id)
);

CREATE TABLE business_images (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE businesses ADD CONSTRAINT businesses_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'suspended'::text]));

CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_business_type ON businesses(business_type);
CREATE INDEX idx_businesses_location ON businesses(location);
CREATE INDEX idx_business_images_business_id ON business_images(business_id);

-- Permitir business_owner como rol
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('admin', 'hotel_owner', 'customer', 'business_owner'));
