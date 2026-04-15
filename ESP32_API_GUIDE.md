# 📡 Guía de Integración ESP32 - API de Sensor LDR

## 🚀 Inicio Rápido

### Paso 1: Generar API Key

Para que tu ESP32 pueda enviar datos, primero necesitas generar una API Key en el servidor.

**Opción A: Usar cURL**
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin1234!"
  }'

# Respuesta: { token: "eyJhbGc..." }

# Crear API Key
curl -X POST http://localhost:3000/api/devices/keys \
  -H "Authorization: Bearer <TOKEN_AQUI>" \
  -H "Content-Type: application/json" \
  -d '{
    "device_name": "ESP32-LDR-01"
  }'

# Respuesta:
# {
#   "success": true,
#   "data": {
#     "device_name": "ESP32-LDR-01",
#     "api_key": "a1b2c3d4e5f6...",
#     "warning": "Guarda esta API Key en un lugar seguro"
#   }
# }
```

**Opción B: Via WebUI (próximamente)**
- Accede a http://localhost:3000
- Login con admin/Admin1234!
- Ve a Settings → Device API Keys
- Click "Generate New Key"

### Paso 2: Configurar ESP32

Guarda la API Key en tu código de Arduino. Por ejemplo:

```cpp
const char* API_KEY = "a1b2c3d4e5f6...";
```

---

## 📤 Enviar Datos del Sensor

### Endpoint

```
POST http://<server_address>:3000/api/data
```

### Métodos de Autenticación

#### Opción 1: Header X-API-Key (RECOMENDADO para IoT)
```
Headers:
  X-API-Key: a1b2c3d4e5f6...
  Content-Type: application/json

Body (JSON):
{
  "light_value": 2450
}
```

#### Opción 2: Query Parameter
```
GET/POST http://localhost:3000/api/data?api_key=a1b2c3d4e5f6...
Body (JSON):
{
  "light_value": 2450
}
```

#### Opción 3: Bearer Token (JWT)
```
Headers:
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json

Body (JSON):
{
  "light_value": 2450
}
```

### Parámetros

| Campo | Tipo | Rango | Descripción |
|-------|------|-------|-----------|
| `light_value` | INT | 0-4095 | Valor del sensor LDR (raw ADC) |

### Respuesta Exitosa

```json
{
  "success": true,
  "estado": "medio"  // "oscuro" | "medio" | "brillante"
}
```

### Respuesta de Error

```json
{
  "success": false,
  "message": "light_value debe ser un entero 0–4095"
}
```

---

## 💻 Código Ejemplo - Arduino/ESP32

### Librerías Requeridas

```cpp
// Arduino IDE: 
// Librería: ArduinoJson (v6.x)
// Librería: WiFi (integrada)
// Librería: HTTPClient (integrada)
```

### Código Completo

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ════════════════════════════════════════════════════════════════════
// ⚙️  CONFIGURACIÓN
// ════════════════════════════════════════════════════════════════════

// WiFi
const char* SSID = "TU_SSID";
const char* PASSWORD = "TU_CONTRASEÑA";

// API
const char* API_URL = "http://192.168.1.100:3000/api/data";  // Cambiar IP del servidor
const char* API_KEY = "tu_api_key_aqui";

// Sensor
const int LDR_PIN = 34;  // ESP32 ADC pin (ej: GPIO34/A7)
const unsigned long SEND_INTERVAL = 5000;  // Enviar cada 5 segundos

// ════════════════════════════════════════════════════════════════════
// VARIABLES
// ════════════════════════════════════════════════════════════════════

unsigned long lastSendTime = 0;
WiFiClient wifiClient;

// ════════════════════════════════════════════════════════════════════
// SETUP
// ════════════════════════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n\n=== ESP32 LDR Monitor ===");
  
  // Conectar a WiFi
  connectToWiFi();
}

// ════════════════════════════════════════════════════════════════════
// LOOP
// ════════════════════════════════════════════════════════════════════

void loop() {
  // Verificar conexión WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Desconectado. Reconectando...");
    connectToWiFi();
    return;
  }

  // Enviar datos cada SEND_INTERVAL ms
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = millis();
    
    int lightValue = readSensor();
    Serial.printf("[Sensor] Light Value: %d\n", lightValue);
    
    sendDataToAPI(lightValue);
  }

  delay(100);
}

// ════════════════════════════════════════════════════════════════════
// FUNCIONES
// ════════════════════════════════════════════════════════════════════

/**
 * Conectar a la red WiFi
 */
void connectToWiFi() {
  Serial.print("[WiFi] Conectando a:");
  Serial.println(SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] ✅ Conectado");
    Serial.print("[WiFi] IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] ❌ No se pudo conectar");
  }
}

/**
 * Leer valor del sensor LDR
 */
int readSensor() {
  // Promediar 10 lecturas para reducir ruido
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(LDR_PIN);
    delay(10);
  }
  return (int)(sum / 10);
}

/**
 * Enviar datos a la API del servidor
 */
void sendDataToAPI(int lightValue) {
  HTTPClient http;
  
  // Configurar solicitud
  http.begin(wifiClient, API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);

  // Crear JSON
  StaticJsonDocument<200> doc;
  doc["light_value"] = lightValue;
  String jsonString;
  serializeJson(doc, jsonString);

  Serial.printf("[API] Enviando: %s\n", jsonString.c_str());

  // POST request
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("[API] HTTP %d\n", httpCode);
    Serial.printf("[API] Response: %s\n", response.c_str());

    // Parsear respuesta
    StaticJsonDocument<200> responseDoc;
    deserializeJson(responseDoc, response);
    
    if (responseDoc["success"]) {
      const char* estado = responseDoc["estado"];
      Serial.printf("[API] ✅ Estado registrado: %s\n", estado);
    } else {
      const char* error = responseDoc["message"];
      Serial.printf("[API] ❌ Error: %s\n", error);
    }
  } else {
    Serial.printf("[API] ❌ Error HTTP: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}
```

### Configuración de Pines ESP32

| Sensor | Pin ESP32 | Notas |
|--------|-----------|--------|
| LDR Signal | GPIO34 (A7) | Entrada ADC, 10-12 bits |
| GND | GND | Tierra común |
| 3V3 | 3V3 | O usar divisor de voltaje |

### Cambiar Intervalo de Envío

Edita esta línea en el código:

```cpp
const unsigned long SEND_INTERVAL = 5000;  // En milisegundos
// 1000 = 1 segundo
// 5000 = 5 segundos
// 60000 = 1 minuto
```

---

## 📊 Simular Datos (para Testing)

Si no tienes el hardware ESP32, puedes simular datos:

```bash
# Simular 50 lecturas aleatorias
curl -X POST http://localhost:3000/api/data/simulate \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "count": 50 }'
```

---

## 🔍 Verificar Estado de Conexiones

```bash
# Health check del servidor
curl http://localhost:3000/api/health

# Listar API Keys activas
curl -X GET http://localhost:3000/api/devices/keys \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🚨 Troubleshooting

### El ESP32 no conecta al WiFi
- Verifica SSID y contraseña
- Asegúrate de que el ESP32 soporta WiFi 2.4GHz
- Intenta acercarte al router

### Error 401 "Token requerido"
- Verifica que la API Key está correcta
- Verifique que está usando el header `X-API-Key` o `Authorization: Bearer`
- Re-genera una nueva API Key

### Error 403 "API Key inválida"
- Copia la API Key exactamente (sin espacios)
- Verifica que la API Key no está desactivada
- Re-genera una nueva API Key si es necesario

### Connection timeout
- Verifica que el servidor está corriendo (http://localhost:3000)
- Cambia la IP del servidor en `API_URL` a la correcta
- Verifica que el firewall permite puerto 3000

---

## 📚 Referencias

- [ESP32 WiFi Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/network/esp_wifi.html)
- [ArduinoJson Library](https://arduinojson.org/)
- [HTTP Client for Arduino](https://techtutorialsx.com/2017/09/20/esp32-http-client-requests/)

