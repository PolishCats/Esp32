# Referencia Rapida

## 0) Levantar con Docker

```bash
cd docker
docker compose up -d --build
```

URL: `http://localhost:3000`

## 1) Login y token

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin1234!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)
```

## 2) Crear API Key de ESP32

```bash
curl -X POST http://localhost:3000/api/devices/keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_name":"ESP32-LDR-01"}'
```

## 3) Enviar lectura desde dispositivo

```bash
curl -X POST http://localhost:3000/api/data \
  -H "X-API-Key: <api_key>" \
  -H "Content-Type: application/json" \
  -d '{"light_value": 2500}'
```

## 4) Consultar LED para ESP32

```bash
curl -X GET http://localhost:3000/api/data/led-state \
  -H "X-API-Key: <api_key>"
```

## 5) Controlar LED desde web/API

```bash
# Ver estado
curl -X GET http://localhost:3000/api/devices/led-state \
  -H "Authorization: Bearer $TOKEN"

# Cambiar estado
curl -X PATCH http://localhost:3000/api/devices/led-state \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_on":true}'
```

## 6) Limpieza manual

```bash
curl -X DELETE http://localhost:3000/api/data/cleanup \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"clearAllAlerts":true}'
```

## 7) Reportes

```bash
# Datos del periodo
curl -X GET "http://localhost:3000/api/reports/data?days=7" \
  -H "Authorization: Bearer $TOKEN"

# CSV
curl -X GET "http://localhost:3000/api/reports/csv?days=7" \
  -H "Authorization: Bearer $TOKEN"

# PDF
curl -X GET "http://localhost:3000/api/reports/pdf?days=7" \
  -H "Authorization: Bearer $TOKEN"
```

## 8) Configuracion de hora

`PUT /api/config` soporta:
- `hora_modo`: `auto` | `manual`
- `zona_horaria`: ej. `America/Bogota`
- `formato_hora`: `12` | `24`
