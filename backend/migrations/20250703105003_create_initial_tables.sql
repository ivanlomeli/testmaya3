-- Add migration script here
-- migrations/{timestamp}_create_initial_tables.sql

-- Tabla para las reglas de precios
CREATE TABLE pricing_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(50) NOT NULL UNIQUE,
    value DECIMAL(10, 2) NOT NULL,
    description TEXT
);

-- Tabla para las configuraciones de la plataforma
CREATE TABLE platform_settings (
    id SERIAL PRIMARY KEY,
    setting_name VARCHAR(50) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL
);

-- Insertar algunas reglas y configuraciones iniciales
INSERT INTO pricing_rules (rule_name, value, description) VALUES
    ('BASE_FARE_MXN', 25.00, 'Tarifa de inicio de cada viaje'),
    ('PER_KM_RATE_MXN', 8.50, 'Costo por cada kilómetro recorrido'),
    ('PER_MINUTE_RATE_MXN', 2.50, 'Costo por cada minuto de viaje');

INSERT INTO platform_settings (setting_name, setting_value) VALUES
    ('PLATFORM_COMMISSION_RATE', '0.20'); -- 20% de comisión