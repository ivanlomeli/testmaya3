#!/bin/bash
echo "🚀 Iniciando Maya Digital Platform..."

# Parar contenedores
docker-compose down --remove-orphans

# Iniciar servicios
docker-compose up -d

echo "✅ Listo!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8080"
echo "🗄️ PostgreSQL: localhost:5432"
