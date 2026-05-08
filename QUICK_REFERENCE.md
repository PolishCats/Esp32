# Referencia Rápida

> 📖 **Para guía completa → [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)**

## 🚀 0) Inicio Rápido (Docker)

```bash
cd docker
docker compose up -d --build
```

Luego abre: **http://localhost:3000**

---

## 🔐 1) Registrarse y Obtener Token

### Opción A: cURL

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"Test123"}'

# Login y guardar token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"Test123"}' \
  | python -c "import json,sys; print(json.load(sys.stdin)['token'])")

echo "Token: $TOKEN"
```

### Opción B: PowerShell

```powershell
# Registrar
Invoke-WebRequest `
  -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"username":"juan","password":"Test123"}'

# Login
$response = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"username":"juan","password":"Test123"}'

$TOKEN = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $TOKEN"
```

### Opción C: Postman

1. Importa `Postman_ESP32_Collection.json`
2. Abre carpeta **Auth** → **POST Login**
3. Cambia username/password y haz clic en **Send**
4. El token se guarda automáticamente en `{{token}}`

---

## 🔑 2) Crear API Key de ESP32

### cURL

```bash
curl -X POST http://localhost:3000/api/devices/keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_name":"ESP32-LDR-01"}'
```

Respuesta:
```json
{
  "success": true,
  "api_key": "a1b2c3d4e5f6789..."
}
```

### Postman

1. Abre carpeta **Devices** → **POST Create API Key**
2. El token se usa automáticamente de `{{token}}`
3. Haz clic en **Send**

---

## 📤 3) Enviar Lectura de Sensor

### Desde ESP32 (X-API-Key)

```bash
curl -X POST http://localhost:3000/api/data \
  -H "X-API-Key: a1b2c3d4e5f6789..." \
  -H "Content-Type: application/json" \
  -d '{
    "light_value": 2500,
    "intervalo_recoleccion": 5,
    "max_datos_por_minuto": 60
  }'
```

### Desde Web/Postman (JWT Token)

```bash
curl -X POST http://localhost:3000/api/data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"light_value": 2500}'
```

---

## 💡 4) Obtener Última Lectura

```bash
curl -X GET http://localhost:3000/api/dashboard/latest \
  -H "Authorization: Bearer $TOKEN"
```

Respuesta:
```json
{
  "success": true,
  "light_value": 2500,
  "estado": "Medio",
  "timestamp": "2026-05-08T10:30:00Z"
}
```

---

## 🔴 5) Controlar LED Remoto

### Ver estado

```bash
curl -X GET http://localhost:3000/api/devices/led-state \
  -H "Authorization: Bearer $TOKEN"
```

### Encender

```bash
curl -X PATCH http://localhost:3000/api/devices/led-state \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_on":true}'
```

### Apagar

```bash
curl -X PATCH http://localhost:3000/api/devices/led-state \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_on":false}'
```

### Desde ESP32 (consultar LED)

```bash
curl -X GET http://localhost:3000/api/data/led-state \
  -H "X-API-Key: a1b2c3d4e5f6789..."
```

Respuesta: `{"is_on":true}` o `{"is_on":false}`

---

## 📊 6) Obtener Datos del Dashboard

### Última lectura
```bash
curl -X GET http://localhost:3000/api/dashboard/latest \
  -H "Authorization: Bearer $TOKEN"
```

### Últimas 30 lecturas (tiempo real)
```bash
curl -X GET "http://localhost:3000/api/dashboard/realtime?limit=30" \
  -H "Authorization: Bearer $TOKEN"
```

### Últimas 24 horas
```bash
curl -X GET "http://localhost:3000/api/dashboard/historical?hours=24" \
  -H "Authorization: Bearer $TOKEN"
```

### Estadísticas
```bash
curl -X GET "http://localhost:3000/api/dashboard/stats?hours=24" \
  -H "Authorization: Bearer $TOKEN"
```

Respuesta:
```json
{
  "min_value": 500,
  "max_value": 4000,
  "avg_value": 2500,
  "total_readings": 150
}
```

### Alertas
```bash
curl -X GET http://localhost:3000/api/dashboard/alerts \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧹 7) Limpiar Datos Antiguos

```bash
curl -X DELETE http://localhost:3000/api/data/cleanup \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "days": 7,
    "clearAllAlerts": false
  }'
```

---

## 📋 8) Reportes

### Obtener datos de período

```bash
curl -X GET "http://localhost:3000/api/reports/data?days=7" \
  -H "Authorization: Bearer $TOKEN"
```

### Descargar CSV

```bash
curl -X GET "http://localhost:3000/api/reports/csv?days=7" \
  -H "Authorization: Bearer $TOKEN" \
  -o reporte.csv
```

### Descargar PDF

```bash
curl -X GET "http://localhost:3000/api/reports/pdf?days=7" \
  -H "Authorization: Bearer $TOKEN" \
  -o reporte.pdf
```

### Enviar por correo

```bash
curl -X POST http://localhost:3000/api/reports/send-email \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "destino@example.com",
    "days": 7,
    "format": "pdf"
  }'
```

---

## ⚙️ 9) Configuración de Usuario

### Ver configuración actual

```bash
curl -X GET http://localhost:3000/api/config \
  -H "Authorization: Bearer $TOKEN"
```

### Actualizar umbrales de luz

```bash
curl -X PUT http://localhost:3000/api/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rango_oscuro_max": 1000,
    "rango_medio_max": 3000,
    "alerta_minima": 200,
    "alerta_maxima": 3800
  }'
```

### Actualizar zona horaria

```bash
curl -X PUT http://localhost:3000/api/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "zona_horaria": "America/Bogota",
    "formato_hora": 24
  }'
```

### Configuración disponible

| Campo | Valores Ejemplo |
|-------|-----------------|
| `hora_modo` | `auto` \| `manual` |
| `zona_horaria` | `America/Bogota`, `Europe/Madrid`, `Asia/Tokyo` |
| `formato_hora` | `12` \| `24` |
| `retencion_dias` | `30`, `60`, `365` |
| `rango_oscuro_max` | `0` - `4095` |
| `rango_medio_max` | `0` - `4095` |
| `alerta_minima` | `0` - `4095` |
| `alerta_maxima` | `0` - `4095` |

---

## 🔗 Documentación Completa

| Documento | Contenido |
|-----------|----------|
| **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** | Guía completa con todo: Docker, Postman, ejemplos |
| **[API_DOCS.md](API_DOCS.md)** | Referencia detallada de todos los 30+ endpoints |
| **[ESP32_API_GUIDE.md](ESP32_API_GUIDE.md)** | Guía específica para firmware ESP32 |
| **[README.md](README.md)** | Descripción general del proyecto |

---

## 🛠️ Solución Rápida de Problemas

| Error | Solución |
|-------|----------|
| **Token inválido (401)** | Login de nuevo: `curl -X POST .../auth/login ...` |
| **API Key inactiva (403)** | Actívala: `PATCH /devices/keys/:id/toggle` |
| **Puerto ocupado** | `docker compose down && docker compose up -d` |
| **MySQL no conecta** | `docker compose logs mysql` |

---

**Última actualización**: 8 de mayo de 2026  
**Para ayuda: [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)**
