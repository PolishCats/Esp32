#!/bin/bash
# Quick test script para generar API Key y enviar datos

set -e

API_URL="http://localhost:3000"
USERNAME="admin"
PASSWORD="Admin1234!"
DEVICE_NAME="ESP32-LDR-01"

echo "🚀 Script de Prueba - ESP32 API Integration"
echo "═════════════════════════════════════════════"

# Step 1: Login
echo -e "\n📋 Paso 1: Obteniendo JWT Token..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"$PASSWORD\"
  }")

echo "Respuesta: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener el token"
  exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."

# Step 2: Generate API Key
echo -e "\n📋 Paso 2: Generando API Key para dispositivo..."
API_KEY_RESPONSE=$(curl -s -X POST "$API_URL/api/devices/keys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"device_name\": \"$DEVICE_NAME\"
  }")

echo "Respuesta: $API_KEY_RESPONSE"

API_KEY=$(echo $API_KEY_RESPONSE | grep -o '"api_key":"[^"]*' | cut -d'"' -f4)
if [ -z "$API_KEY" ]; then
  echo "❌ Error: No se pudo generar la API Key"
  exit 1
fi

echo "✅ API Key generada: ${API_KEY:0:20}..."

# Step 3: List API Keys
echo -e "\n📋 Paso 3: Listando API Keys..."
LIST_RESPONSE=$(curl -s -X GET "$API_URL/api/devices/keys" \
  -H "Authorization: Bearer $TOKEN")

echo "Respuesta: $LIST_RESPONSE" | head -c 200
echo ""

# Step 4: Send Test Data
echo -e "\n📋 Paso 4: Enviando datos de prueba (light_value=2500)..."
SEND_RESPONSE=$(curl -s -X POST "$API_URL/api/data" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"light_value\": 2500
  }")

echo "Respuesta: $SEND_RESPONSE"
SUCCESS=$(echo $SEND_RESPONSE | grep -o '"success":true')

if [ -n "$SUCCESS" ]; then
  echo -e "\n✅ ¡Éxito! Los datos fueron registrados"
else
  echo -e "\n❌ Error al enviar datos"
  exit 1
fi

# Step 5: Summary
echo -e "\n🎉 Template para tu código ESP32/Arduino:"
echo "═════════════════════════════════════════════"
echo ""
echo "const char* API_KEY = \"$API_KEY\";"
echo "const char* API_URL = \"http://localhost:3000/api/data\";"
echo ""
echo "📝 Guarda estos valores en tu código Arduino"
echo ""
echo "👀 Para ver el dato enviado en el dashboard:"
echo "   Inicia sesión con $USERNAME y abre http://localhost:3000/dashboard.html"
echo "   Nota: los datos se guardan para el usuario autenticado al crear la API key."
echo ""
