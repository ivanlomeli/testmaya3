#!/bin/bash
set -e

echo "Esperando a que PostgreSQL esté listo..."

# Función para verificar si PostgreSQL está listo
wait_for_postgres() {
    until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
        echo "PostgreSQL no está listo - esperando..."
        sleep 2
    done
    echo "PostgreSQL está listo!"
}

# Extraer información de DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed 's/.*@\([^:]*\):.*/\1/')
DB_USER=$(echo $DATABASE_URL | sed 's/.*:\/\/\([^:]*\):.*/\1/')
DB_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')
POSTGRES_PASSWORD="password123"

# Instalar psql si no existe
if ! command -v psql &> /dev/null; then
    apt-get update && apt-get install -y postgresql-client
fi

wait_for_postgres

echo "Iniciando servidor backend..."
exec /usr/local/bin/backend
