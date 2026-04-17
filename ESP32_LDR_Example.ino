/*
 * =====================================================================
 * ESP32 LDR Sensor to Cloud API
 * Código de Ejemplo -- Envía datos de sensor LDR a la API
 * =====================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// 🔧 CONFIGURACIÓN - CAMBIAR ESTOS VALORES
const char* SSID = "TU_SSID";                           // Tu red WiFi
const char* PASSWORD = "TU_CONTRASEÑA";                 // Contraseña WiFi
const char* API_URL = "http://192.168.1.17:3000/api/data";  // IP real del servidor
const char* API_KEY = "tu_api_key_generada_aqui";           // Tu API Key
const char* API_HOST = "192.168.1.17";
const uint16_t API_PORT = 3000;
const char* API_PATH = "/api/data";

// Sensor ADC
const int LDR_PIN = 34;                                 // GPIO34 (ADC1_CH6)
const unsigned long SEND_INTERVAL = 5000;              // Intervalo en ms
const int SEND_INTERVAL_SECONDS = (int)(SEND_INTERVAL / 1000);

// Variables
unsigned long lastSendTime = 0;
WiFiClient wifiClient;

const char* httpErrorMessage(int code) {
  switch (code) {
    case -1: return "conexion rechazada o servidor inalcanzable";
    case -2: return "send header failed";
    case -3: return "send payload failed";
    case -4: return "not connected";
    case -5: return "connection lost";
    case -6: return "no stream";
    case -7: return "too less ram";
    case -8: return "not connected to server";
    case -9: return "could not parse URL";
    default: return "error HTTP desconocido";
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n\n╔══════════════════════════════════════╗");
  Serial.println("║  ESP32 LDR Monitor - Cloud Connect  ║");
  Serial.println("╚══════════════════════════════════════╝\n");
  
  connectToWiFi();
}

void loop() {
  // Reconectar WiFi si es necesario
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Desconectado. Reconectando...");
    connectToWiFi();
    return;
  }

  // Enviar dato cada SEND_INTERVAL ms
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = millis();
    int lightValue = readSensorAverage();
    Serial.printf("[📊 Sensor] Valor: %d\n", lightValue);
    sendToAPI(lightValue);
  }

  delay(100);
}

// ═══════════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════════

void connectToWiFi() {
  Serial.printf("[📡 WiFi] Conectando a: %s\n", SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("[✅ WiFi] Conectado!");
    Serial.print("[📍 IP] ");
    Serial.println(WiFi.localIP());
    WiFi.setSleep(false);
  } else {
    Serial.println("[❌ WiFi] Fallo en la conexión");
  }
}

int readSensorAverage() {
  // Promediar 10 lecturas
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(LDR_PIN);
    delay(10);
  }
  return (int)(sum / 10);
}

void sendToAPI(int lightValue) {
  HTTPClient http;
  wifiClient.setTimeout(10000);

  bool started = http.begin(wifiClient, API_HOST, API_PORT, API_PATH);

  if (!started) {
    Serial.printf("[❌ API] No se pudo inicializar la conexión a %s\n", API_URL);
    Serial.println("    Verifica que la IP responda desde el ESP32, que el puerto 3000 esté abierto y que no haya aislamiento entre clientes WiFi.");
    return;
  }

  http.setTimeout(10000);
  http.setReuse(false);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);

  // Crear JSON
  StaticJsonDocument<200> doc;
  doc["light_value"] = lightValue;
  doc["intervalo_recoleccion"] = SEND_INTERVAL_SECONDS;
  String json;
  serializeJson(doc, json);

  // Enviar POST
  Serial.printf("[🚀 API] POST: %s\n", API_URL);
  int httpCode = http.POST(json);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("[✅ API] HTTP %d\n", httpCode);
    Serial.printf("    Response: %s\n", response.c_str());
  } else {
    Serial.printf("[❌ API] HTTP Error %d (%s)\n", httpCode, httpErrorMessage(httpCode));
    Serial.println("    Revisa la IP del servidor, el puerto 3000, la red WiFi y la API Key.");
  }

  http.end();
}
