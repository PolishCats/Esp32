# ⚡ Referencia Rápida - API ESP32

## 🎯 1. Obtener API Key (Una sola vez)

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin1234!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Generar API Key
curl -X POST http://localhost:3000/api/devices/keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_name":"ESP32-LDR-01"}'

# 📋 Copiar el api_key de la respuesta
```

## 📤 2. Código Arduino Mínimo

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* API_KEY = "tu_api_key_aqui";
const char* API_URL = "http://192.168.1.100:3000/api/data";
const int LDR_PIN = 34;

void setup() {
  Serial.begin(115200);
  WiFi.begin("SSID", "PASSWORD");
}

void loop() {
  if (WiFi.connected()) {
    int light = analogRead(LDR_PIN);
    
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", API_KEY);
    
    StaticJsonDocument<200> doc;
    doc["light_value"] = light;
    String json;
    serializeJson(doc, json);
    
    int code = http.POST(json);
    Serial.println(code == 200 ? "✅ OK" : "❌ Error");
    http.end();
  }
  delay(5000);
}
```

## 🧪 3. Pruebas (desde terminal)

```bash
# Enviar dato único
curl -X POST http://localhost:3000/api/data \
  -H "X-API-Key: tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{"light_value": 2500}'

# Ver datos en dashboard
# http://localhost:3000

# Verificar servidor
curl http://localhost:3000/api/health
```

## 📊 4. Respuestas

| Código | Significado |
|--------|-----------|
| 200 OK | ✅ Datos guardados |
| 400 Bad Request | ❌ Valor inválido (0-4095) |
| 401 Unauthorized | ❌ API Key faltante |
| 403 Forbidden | ❌ API Key inválida |

## 🎨 5. Estados Automáticos

El servidor detecta automáticamente:
- **oscuro** si light_value ≤ 1000
- **medio** si 1000 < light_value ≤ 3000
- **brillante** si light_value > 3000

## 📍 6. Configuración de Pines ESP32

| Sensor | Pin | Descripción |
|--------|-----|-----------|
| LDR Signal | GPIO34 | Entrada analógica |
| GND | GND | Tierra |
| 3V3 | 3V3 | Voltaje (o divisor) |

## ⏱️ 7. Intervalo Recomendado

```cpp
delay(5000);  // Enviar cada 5 segundos
// Ajusta según tu aplicación (1000-60000 ms)
```

---

**📚 Documentación completa:** Ver [ESP32_API_GUIDE.md](ESP32_API_GUIDE.md)
