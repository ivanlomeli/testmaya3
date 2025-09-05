#!/bin/bash

echo "Convirtiendo queries de SQLx..."

# Convertir sqlx::query! a sqlx::query
find backend/src -name "*.rs" -type f -exec sed -i 's/sqlx::query!/sqlx::query/g' {} \;

# Convertir sqlx::query_as! a sqlx::query_as
find backend/src -name "*.rs" -type f -exec sed -i 's/sqlx::query_as!/sqlx::query_as/g' {} \;

echo "Conversión completada"
