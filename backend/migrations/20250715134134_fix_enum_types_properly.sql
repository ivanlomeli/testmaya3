-- Primero, agregar columnas temporales con tipo TEXT
ALTER TABLE users ADD COLUMN role_temp TEXT;
ALTER TABLE hotels ADD COLUMN status_temp TEXT;

-- Copiar datos convirtiendo el enum a texto
UPDATE users SET role_temp = role::text;
UPDATE hotels SET status_temp = status::text;

-- Eliminar las columnas originales
ALTER TABLE users DROP COLUMN role;
ALTER TABLE hotels DROP COLUMN status;

-- Renombrar las columnas temporales
ALTER TABLE users RENAME COLUMN role_temp TO role;
ALTER TABLE hotels RENAME COLUMN status_temp TO status;

-- Agregar restricciones para mantener la integridad
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('admin', 'hotel_owner', 'customer'));

ALTER TABLE hotels ADD CONSTRAINT hotels_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- Establecer valores por defecto
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';
ALTER TABLE hotels ALTER COLUMN status SET DEFAULT 'pending';

-- Hacer las columnas NOT NULL
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE hotels ALTER COLUMN status SET NOT NULL;

-- Eliminar los tipos enum ahora que no se usan
DROP TYPE user_role;
DROP TYPE hotel_status;