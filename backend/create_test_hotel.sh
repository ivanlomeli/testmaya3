# Comandos cURL para crear un hotel de prueba en Maya Digital

# ==============================================================================
# PASO 1: Crear un usuario dueño de hotel
# ==============================================================================

echo "🔧 Paso 1: Creando usuario dueño de hotel..."

curl -X POST http://127.0.0.1:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hotel.owner@test.com",
    "password": "password123",
    "first_name": "Carlos",
    "last_name": "Hernández",
    "phone": "+52 999 123 4567",
    "role": "HotelOwner"
  }' | jq '.'

echo -e "\n✅ Usuario creado. Guarda el token para el siguiente paso.\n"

# ==============================================================================
# PASO 2: Iniciar sesión para obtener el token (si no lo guardaste del paso 1)
# ==============================================================================

echo "🔧 Paso 2: Iniciando sesión para obtener token..."

TOKEN_RESPONSE=$(curl -X POST http://127.0.0.1:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hotel.owner@test.com",
    "password": "password123"
  }')

echo $TOKEN_RESPONSE | jq '.'

# Extraer el token de la respuesta (necesitas jq instalado)
TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token')

echo -e "\n🔑 Token obtenido: $TOKEN\n"

# ==============================================================================
# PASO 3: Crear el hotel usando el token
# ==============================================================================

echo "🔧 Paso 3: Creando hotel..."

curl -X POST http://127.0.0.1:8080/api/hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Hotel Maya Paradise",
    "description": "Un hermoso hotel boutique en el corazón de la Riviera Maya. Disfruta de vistas espectaculares al mar Caribe, habitaciones de lujo y 
servicios de primera clase en un ambiente íntimo y exclusivo.",
    "location": "Tulum, Quintana Roo",
    "address": "Carretera Tulum-Bocapaila Km 8.5, Zona Hotelera, 77780 Tulum, Q.R.",
    "price": 3500.00,
    "image_url": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop",
    "phone": "+52 984 123 4567",
    "email": "reservas@mayaparadise.com",
    "website": "https://www.mayaparadise.com",
    "rooms_available": 12
  }' | jq '.'

echo -e "\n✅ Hotel creado (estado: pending). Ahora necesita aprobación de admin.\n"

# ==============================================================================
# PASO 4: Crear usuario administrador
# ==============================================================================

echo "🔧 Paso 4: Creando usuario administrador..."

curl -X POST http://127.0.0.1:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mayadigital.com",
    "password": "admin123",
    "first_name": "Admin",
    "last_name": "Maya Digital",
    "phone": "+52 999 999 9999",
    "role": "Admin"
  }' | jq '.'

echo -e "\n✅ Usuario administrador creado.\n"

# ==============================================================================
# PASO 5: Iniciar sesión como administrador
# ==============================================================================

echo "🔧 Paso 5: Iniciando sesión como administrador..."

ADMIN_TOKEN_RESPONSE=$(curl -X POST http://127.0.0.1:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mayadigital.com",
    "password": "admin123"
  }')

echo $ADMIN_TOKEN_RESPONSE | jq '.'

# Extraer el token de admin
ADMIN_TOKEN=$(echo $ADMIN_TOKEN_RESPONSE | jq -r '.token')

echo -e "\n🔑 Token de admin obtenido: $ADMIN_TOKEN\n"

# ==============================================================================
# PASO 6: Obtener hoteles pendientes de aprobación
# ==============================================================================

echo "🔧 Paso 6: Obteniendo hoteles pendientes..."

PENDING_HOTELS=$(curl -X GET http://127.0.0.1:8080/api/admin/hotels/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo $PENDING_HOTELS | jq '.'

# Extraer el ID del primer hotel pendiente
HOTEL_ID=$(echo $PENDING_HOTELS | jq -r '.hotels[0].id')

echo -e "\n🏨 ID del hotel a aprobar: $HOTEL_ID\n"

# ==============================================================================
# PASO 7: Aprobar el hotel
# ==============================================================================

echo "🔧 Paso 7: Aprobando hotel..."

curl -X PUT http://127.0.0.1:8080/api/admin/hotels/$HOTEL_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

echo -e "\n✅ Hotel aprobado!\n"

# ==============================================================================
# PASO 8: Verificar que el hotel aparece en la lista pública
# ==============================================================================

echo "🔧 Paso 8: Verificando hoteles públicos..."

curl -X GET http://127.0.0.1:8080/api/hoteles | jq '.'

echo -e "\n🎉 ¡Listo! El hotel debería aparecer ahora en tu frontend.\n"

# ==============================================================================
# PASO OPCIONAL: Crear más hoteles de prueba
# ==============================================================================

echo "🔧 Paso Opcional: Creando hoteles adicionales..."

# Hotel 2
curl -X POST http://127.0.0.1:8080/api/hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Hacienda Uxmal",
    "description": "Histórica hacienda convertida en hotel boutique, rodeada de jardines tropicales y cerca de las ruinas de Uxmal.",
    "location": "Uxmal, Yucatán",
    "address": "Km 78 Carretera Mérida-Campeche, 97844 Uxmal, Yuc.",
    "price": 2800.00,
    "image_url": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2032&auto=format&fit=crop",
    "phone": "+52 997 976 2012",
    "email": "reservas@haciendauxmal.com",
    "website": "https://www.haciendauxmal.com",
    "rooms_available": 8
  }' | jq '.'

# Hotel 3
curl -X POST http://127.0.0.1:8080/api/hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Casa Zazil-Ha",
    "description": "Íntimo hotel frente al mar en Isla Mujeres, perfecto para una escapada romántica con vista al atardecer.",
    "location": "Isla Mujeres, Quintana Roo",
    "address": "Punta Norte, 77400 Isla Mujeres, Q.R.",
    "price": 4200.00,
    "image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
    "phone": "+52 998 877 0615",
    "email": "info@casazazilha.com",
    "website": "https://www.casazazilha.com",
    "rooms_available": 6
  }' | jq '.'

# Aprobar los hoteles adicionales
echo "🔧 Aprobando hoteles adicionales..."

# Obtener todos los hoteles pendientes y aprobarlos
PENDING_HOTELS_ALL=$(curl -X GET http://127.0.0.1:8080/api/admin/hotels/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN")

# Aprobar cada hotel pendiente (esto requiere procesamiento de JSON más avanzado)
for hotel_id in $(echo $PENDING_HOTELS_ALL | jq -r '.hotels[].id'); do
  echo "Aprobando hotel ID: $hotel_id"
  curl -X PUT http://127.0.0.1:8080/api/admin/hotels/$hotel_id/approve \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
done

echo -e "\n🎉 ¡Todos los hoteles creados y aprobados!\n"

# ==============================================================================
# VERIFICACIÓN FINAL
# ==============================================================================

echo "🔧 Verificación final - Hoteles públicos disponibles:"
curl -X GET http://127.0.0.1:8080/api/hoteles | jq '.'

echo -e "\n✅ ¡Proceso completado! Ahora deberías ver los hoteles en tu frontend."
