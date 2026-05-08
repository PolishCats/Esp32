# ESP32 LDR Monitor - Guía Completa de Configuración

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Requisitos Verificados](#requisitos-verificados)
3. [Configuración con Docker](#configuración-con-docker)
4. [Uso de Postman](#uso-de-postman)
5. [Documentación de la API](#documentación-de-la-api)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Solución de Problemas](#solución-de-problemas)

---

## 📱 Descripción del Proyecto

Sistema de monitoreo web para lecturas de sensor LDR conectado a ESP32, con:
- **Autenticación**: JWT para web y API Keys para dispositivos
- **Dashboard**: Panel en tiempo real con gráficos interactivos (Chart.js)
- **Historiales**: Lecturas, estadísticas y alertas
- **Configuración**: Umbrales, zonas horarias, retención de datos por usuario
- **Reportes**: Generación CSV y PDF, envío por correo
- **Control remoto**: LED en GPIO 32 controlable desde web o API
- **API REST**: Consume datos desde Postman, Insomnia o firmware

### Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| Backend | Node.js + Express 4.18.2 |
| Base de datos | MySQL 8.0 |
| Frontend | HTML5 + CSS3 + JavaScript vanilla |
| Gráficos | Chart.js |
| PDF | PDFKit |
| Correo | Nodemailer |
| Seguridad | Helmet, Rate Limiting, JWT, bcrypt |
| Contenedores | Docker + Docker Compose |

---

## 🐳 Configuración con Docker

### Opción 1: Instalación Rápida (Recomendado)

#### Requisitos previos
- **Docker** (Descargar de https://www.docker.com/products/docker-desktop)
- **Docker Compose** (Incluido en Docker Desktop)
- **2 GB de RAM** mínimo disponible

#### Pasos

1. **Navega al directorio Docker**
   ```bash
   cd docker
   ```

2. **Inicia los contenedores**
   ```bash
   docker compose up -d --build
   ```

3. **Espera a que MySQL esté listo** (~10 segundos)
   ```bash
   docker compose logs -f mysql
   ```
   Deberías ver:
   ```
   [Server] /usr/sbin/mysqld: ready for connections.
   ```

4. **Verifica que la app esté corriendo**
   ```bash
   docker ps
   ```
   Deberías ver 2 contenedores: `mysql` y `app`

5. **Accede a la aplicación**
   - URL: http://localhost:3000
   - API Base: http://localhost:3000/api

#### Información de Conexión

| Servicio | Host | Puerto | Usuario | Contraseña |
|----------|------|--------|---------|-----------|
| MySQL | localhost | 3306 | esp32_user | esp32_pass |
| Backend API | localhost | 3000 | - | - |

### Opción 2: Instalación Manual (Sin Docker)

Si prefieres no usar Docker:

1. **Instala MySQL 8.0** en tu máquina
2. **Copia el esquema de la base de datos**
   ```bash
   mysql -u root -p < sql/schema.sql
   ```
3. **Configura variables de entorno**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edita `backend/.env` con:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=esp32_ldr_monitor
   JWT_SECRET=tu_clave_secreta
   PORT=3000
   ```

4. **Instala dependencias y ejecuta**
   ```bash
   cd backend
   npm install
   npm start
   ```

5. **Abre la aplicación**
   - URL: http://localhost:3000

---

## 📮 Uso de Postman

Postman es una herramienta visual para probar la API sin escribir código.

### Descarga e Instalación

1. Descarga **Postman** desde https://www.postman.com/downloads/
2. Instala y abre la aplicación

### Importar Colección

1. En Postman, haz clic en **"Collections"** (izquierda)
2. Haz clic en **"Import"** (arriba a la derecha)
3. Selecciona el archivo: `Postman_ESP32_Collection.json`
4. Haz clic en **"Import"**

### Usar Variables en Postman

La colección incluye variables pre-configuradas:

```json
{
  "base_url": "http://localhost:3000/api",
  "token": "",
  "api_key": "",
  "device_name": "ESP32-LDR-01",
  "start_date": "2026-04-01",
  "end_date": "2026-05-08"
}
```

### Primeras 3 Solicitudes para Probar

#### 1️⃣ Registrar Usuario

1. Abre la carpeta **"Auth"** → **"POST Register"**
2. En la pestaña **"Body"**, cambia:
   - `"username"` → tu nombre de usuario
   - `"password"` → tu contraseña
3. Haz clic en **"Send"**
4. Deberías recibir: `{ "success": true, "message": "Usuario registrado" }`

#### 2️⃣ Login y Obtener Token

1. Abre la carpeta **"Auth"** → **"POST Login"**
2. En la pestaña **"Body"**, cambia:
   - `"username"` → el nombre que registraste
   - `"password"` → la contraseña
3. Haz clic en **"Send"**
4. Recibirás un `token`. Cópialo.
5. Haz clic en la pestaña **"Tests"** (abajo) - Postman lo guardará automáticamente en `{{token}}`

#### 3️⃣ Obtener Última Lectura del Sensor

1. Abre **"Dashboard"** → **"GET Latest Reading"**
2. Haz clic en **"Send"**
3. Deberías recibir datos de tu último sensor LDR

### Todas las Carpetas y Solicitudes

```
ESP32_Collection
├── Auth
│   ├── POST Register
│   ├── POST Login
│   └── GET Current User
├── Dashboard
│   ├── GET Latest Reading
│   ├── GET Realtime Data (últimas 30 lecturas)
│   ├── GET Historical Data (últimas 24 horas)
│   ├── GET Statistics
│   ├── GET Alerts
│   └── PATCH Mark Alert Read
├── Devices
│   ├── POST Create API Key
│   ├── GET List API Keys
│   ├── DELETE API Key
│   ├── PATCH Toggle API Key
│   └── GET/PATCH LED State
├── Data
│   ├── POST Send Sensor Reading
│   ├── DELETE Cleanup Data
│   └── GET LED State (para dispositivos)
└── Reports
    ├── GET Report Data
    ├── GET Report CSV
    ├── GET Report PDF
    └── POST Send Report by Email
```

---

## 📚 Documentación de la API

La API REST está completamente documentada en [API_DOCS.md](API_DOCS.md).

### Resumen de Endpoints Principales

#### Autenticación (sin API Key requerida)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Obtener token JWT |
| GET | `/auth/me` | Obtener datos del usuario actual |

#### Dashboard (requiere JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/dashboard/latest` | Última lectura de sensor |
| GET | `/dashboard/realtime` | Últimas N lecturas (tiempo real) |
| GET | `/dashboard/historical?hours=24` | Histórico de X horas |
| GET | `/dashboard/stats` | Estadísticas (min/max/promedio) |
| GET | `/dashboard/alerts` | Lista de alertas |
| PATCH | `/dashboard/alerts/:id/read` | Marcar alerta como leída |

#### Configuración del Usuario (requiere JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/config` | Obtener configuración de usuario |
| PUT | `/config` | Actualizar configuración |

#### Dispositivos (requiere JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/devices/keys` | Generar nueva API Key |
| GET | `/devices/keys` | Listar todas las API Keys |
| DELETE | `/devices/keys/:id` | Eliminar API Key |
| PATCH | `/devices/keys/:id/toggle` | Activar/desactivar API Key |
| GET | `/devices/led-state` | Ver estado del LED |
| PATCH | `/devices/led-state` | Controlar LED |

#### Datos del Sensor (requiere JWT o API Key)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/data` | Enviar lectura de sensor |
| GET | `/data/led-state` | Consultar estado LED (para ESP32) |
| DELETE | `/data/cleanup` | Limpiar datos antiguos |

#### Reportes (requiere JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/reports/data?start=...&end=...` | Datos de período |
| GET | `/reports/csv?start=...&end=...` | Descargar CSV |
| GET | `/reports/pdf?start=...&end=...` | Descargar PDF |
| POST | `/reports/send-email` | Enviar reporte por correo |

### Autenticación

Dos métodos disponibles:

**1. JWT (para web, Postman, scripts)**
```http
Authorization: Bearer <tu_token>
Content-Type: application/json
```

**2. API Key (para ESP32 y dispositivos)**
```http
X-API-Key: <tu_api_key>
Content-Type: application/json
```

### Códigos de Respuesta

| Código | Significado |
|--------|-----------|
| 200 | Éxito |
| 201 | Creado exitosamente |
| 400 | Datos inválidos |
| 401 | Autenticación requerida |
| 403 | Token o API Key inválida |
| 404 | Recurso no encontrado |
| 429 | Límite de peticiones excedido |
| 500 | Error interno del servidor |

### Límites de Peticiones (Rate Limiting)

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Auth | 20 | 15 minutos |
| Dashboard | 5000 | 15 minutos |
| Data | 8000 | 15 minutos |
| Otros | 100 | 15 minutos |

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Registrarse y Obtener Token (PowerShell)

```powershell
# 1. Registrar usuario
$registerResponse = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"username":"juan","password":"MiPassword123"}'

# 2. Login
$loginResponse = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"username":"juan","password":"MiPassword123"}'

# 3. Extraer token
$token = ($loginResponse.Content | ConvertFrom-Json).token
Write-Host "Token: $token"
```

### Ejemplo 2: Crear API Key para ESP32

```bash
#!/bin/bash

# Requiere: $TOKEN obtenido del login anterior

curl -X POST http://localhost:3000/api/devices/keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_name": "ESP32-LDR-01"
  }' | jq '.api_key'
```

Respuesta:
```json
{
  "success": true,
  "message": "API Key creada",
  "api_key": "a1b2c3d4e5f6...",
  "device_name": "ESP32-LDR-01"
}
```

### Ejemplo 3: Enviar Lectura de Sensor desde ESP32

```cpp
// Arduino/ESP32 code
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

String API_KEY = "a1b2c3d4e5f6..."; // Obtenida del Ejemplo 2
String SERVER_URL = "http://localhost:3000/api/data";

void sendSensorReading(int lightValue) {
  HTTPClient http;
  http.begin(SERVER_URL);
  
  // Header de autenticación
  http.addHeader("X-API-Key", API_KEY);
  http.addHeader("Content-Type", "application/json");
  
  // Crear payload JSON
  JsonDocument doc;
  doc["light_value"] = lightValue;
  doc["intervalo_recoleccion"] = 5;
  doc["max_datos_por_minuto"] = 60;
  
  String payload;
  serializeJson(doc, payload);
  
  // Enviar POST
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode == 200) {
    JsonDocument response;
    deserializeJson(response, http.getString());
    
    bool ledOn = response["is_on"]; // Consultar estado del LED
    Serial.printf("LED: %s\n", ledOn ? "ON" : "OFF");
  }
  
  http.end();
}
```

### Ejemplo 4: Consultar LED y Cambiar Estado (cURL)

```bash
# Consultar estado actual
curl -X GET http://localhost:3000/api/devices/led-state \
  -H "Authorization: Bearer $TOKEN"

# Respuesta:
# {"success":true,"led_pin":32,"is_on":false,"updated_at":"2026-05-08T10:30:00Z"}

# Encender LED
curl -X PATCH http://localhost:3000/api/devices/led-state \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_on":true}'

# Respuesta:
# {"success":true,"message":"LED actualizado","is_on":true}
```

### Ejemplo 5: Generar Reporte en CSV

```bash
# Descargar CSV de últimos 7 días
START_DATE=$(date -u -d '7 days ago' +%Y-%m-%d)
END_DATE=$(date -u +%Y-%m-%d)

curl -X GET "http://localhost:3000/api/reports/csv?start=$START_DATE&end=$END_DATE" \
  -H "Authorization: Bearer $TOKEN" \
  -o reporte_sensores.csv
```

Formato del CSV:
```
Timestamp,Valor de Luz,Estado,Promedio 1h
2026-05-08 10:00:00,2500,Medio,2400
2026-05-08 10:01:00,2550,Medio,2410
2026-05-08 10:02:00,2480,Medio,2405
```

---

## 🔧 Solución de Problemas

### Docker

#### Error: "Cannot connect to Docker daemon"
- **Solución**: Asegúrate de que Docker Desktop esté abierto y corriendo
- En Windows, verifica la bandeja del sistema

#### Error: "Port 3000 already in use"
- **Solución**: Detén otros contenedores o cambia el puerto en `docker-compose.yml`
  ```bash
  docker compose down
  ```

#### MySQL no inicia
- **Solución**: Revisa los logs
  ```bash
  docker compose logs mysql
  ```
- Si ves errores de permisos, elimina el volumen:
  ```bash
  docker compose down -v
  docker compose up -d --build
  ```

### API

#### Error 401: "Unauthorized"
- **Causa**: Token JWT inválido o expirado
- **Solución**: Obtén un nuevo token con login

#### Error 403: "Forbidden"
- **Causa**: API Key inactiva
- **Solución**: Verifica que la API Key esté activada (`PATCH /devices/keys/:id/toggle`)

#### Error 429: "Too Many Requests"
- **Causa**: Excediste el límite de peticiones
- **Solución**: Espera 15 minutos o reduce la frecuencia de peticiones

#### "Connection refused" al acceder a localhost:3000
- **Solución**:
  1. Verifica que Docker esté corriendo: `docker ps`
  2. Verifica que el contenedor esté en estado "Up": `docker compose ps`
  3. Reinicia: `docker compose restart app`

### Postman

#### Las variables están vacías ({{token}}, {{api_key}})
- **Solución**:
  1. Verifica que hayas seleccionado el entorno correcto (arriba a la derecha)
  2. Ejecuta una solicitud que las rellene (Login, Create Key)
  3. Las variables se guardan automáticamente en la sección "Tests"

#### Error CORS al hacer peticiones desde navegador
- **Solución**: Usa Postman o cURL en lugar del navegador (el servidor solo acepta desde localhost)

---

## 📁 Estructura del Proyecto

```
.
├── backend/
│   ├── server.js                    # Punto de entrada principal
│   ├── package.json
│   ├── config/
│   │   └── database.js              # Configuración de conexión MySQL
│   ├── controllers/
│   │   ├── authController.js        # Registro, login, info del usuario
│   │   ├── dashboardController.js   # Datos del dashboard
│   │   ├── configController.js      # Configuración del usuario
│   │   ├── deviceController.js      # Gestión de API Keys y LED
│   │   ├── ledController.js         # Control del LED
│   │   └── reportController.js      # Generación de reportes
│   ├── middleware/
│   │   └── auth.js                  # JWT y API Key authentication
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── config.js
│   │   ├── devices.js
│   │   ├── data.js
│   │   └── reports.js
│   └── utils/
│       ├── dataCleanup.js           # Limpieza automática de datos
│       └── emailSender.js           # Envío de reportes por correo
├── frontend/
│   ├── index.html                   # Página de login
│   ├── register.html
│   ├── dashboard.html               # Panel principal
│   ├── led.html                     # Control del LED
│   ├── config.html                  # Configuración
│   ├── reports.html
│   ├── css/
│   │   ├── style.css
│   │   ├── dashboard.css
│   │   └── responsive.css
│   └── js/
│       ├── auth.js                  # Manejo de autenticación
│       ├── main.js                  # Singleton de Auth
│       ├── dashboard.js
│       ├── led.js
│       ├── config.js
│       ├── reports.js
│       └── charts.js                # Gráficos con Chart.js
├── sql/
│   └── schema.sql                   # Esquema de base de datos MySQL
├── docker/
│   ├── docker-compose.yml           # Orquestación de contenedores
│   ├── backend.Dockerfile
│   └── mysql-init/
│       └── README.txt
├── Postman_ESP32_Collection.json    # Colección de solicitudes (importar en Postman)
├── test_api.sh                      # Script de prueba (Linux/Mac)
├── API_DOCS.md                      # Referencia completa de API
├── ESP32_API_GUIDE.md               # Guía específica para ESP32
├── QUICK_REFERENCE.md               # Referencia rápida de comandos
└── README.md                        # Este archivo
```

---

## 🚀 Próximos Pasos

1. **Configura Docker**: `cd docker && docker compose up -d`
2. **Accede a la app**: http://localhost:3000
3. **Importa en Postman**: Los archivos JSON están listos
4. **Prueba los endpoints**: Sigue los ejemplos de arriba
5. **Conecta tu ESP32**: Usa la guía `ESP32_API_GUIDE.md`
6. **Genera reportes**: Desde el dashboard o API

---

## 📖 Documentación Adicional

Para información más detallada, consulta:

- **API Completa**: [API_DOCS.md](API_DOCS.md)
- **Guía ESP32**: [ESP32_API_GUIDE.md](ESP32_API_GUIDE.md)
- **Referencia Rápida**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Código de Ejemplo**: [ESP32_LDR_Example.ino](ESP32_LDR_Example.ino)

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa la sección [Solución de Problemas](#solución-de-problemas)
2. Consulta los logs: `docker compose logs -f`
3. Verifica que todos los servicios estén corriendo: `docker ps`

---

**Última actualización**: 8 de mayo de 2026  
**Versión**: 1.0
