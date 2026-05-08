# Guia ESP32 -> API (LDR + LED)

## 1. Objetivo

Conectar tu ESP32 para:
- Enviar lecturas LDR al backend
- Consultar el estado remoto del LED (GPIO 32)
- Visualizar todo en el dashboard autenticado

## 2. Requisitos

- Backend ejecutandose en `http://<ip_servidor>:3000`
- Usuario autenticado en la web si vas a crear API Keys
- API Key de dispositivo generada desde Configuracion

Opcionalmente, puedes levantar backend + base de datos con Docker:

```bash
cd docker
docker compose up -d --build
```

## 3. Generar API Key

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"<tu_usuario>","password":"<tu_password>"}'
```

### Crear API Key

```bash
curl -X POST http://localhost:3000/api/devices/keys \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"device_name":"ESP32-LDR-01"}'
```

Guarda el `api_key` devuelto.

## 4. Autenticacion para dispositivos

El backend acepta dos opciones para `POST /api/data` y `GET /api/data/led-state`:
- `X-API-Key: <api_key>`
- `Authorization: Bearer <jwt>`

## 5. Endpoints para ESP32

### 5.1 Enviar dato LDR

`POST /api/data`

Headers:
- `X-API-Key: <api_key>`
- `Content-Type: application/json`

Body:
```json
{
  "light_value": 2450,
  "intervalo_recoleccion": 5
}
```

Respuesta esperada:
```json
{
  "success": true,
  "estado": "medio",
  "intervalo_recoleccion": 5,
  "max_datos_por_minuto": 60
}
```

### 5.2 Consultar estado LED

`GET /api/data/led-state`

Headers:
- `X-API-Key: <api_key>`

Respuesta:
```json
{
  "success": true,
  "led_pin": 32,
  "is_on": false,
  "updated_at": "2026-04-19T16:30:00.000Z"
}
```

## 6. Codigo base recomendado

Usa como base el archivo:
- `ESP32_LDR_Example.ino`

Ese ejemplo ya incluye:
- Lectura ADC de LDR (`GPIO34`)
- POST a `/api/data`
- Polling de `/api/data/led-state`
- Aplicacion del estado LED en `GPIO32`

## 7. Validaciones y limites

- `light_value` debe estar entre `0` y `4095`
- `intervalo_recoleccion` debe estar entre `1` y `3600`
- Limite de datos por dispositivo
- API Key debe existir y estar activa

## 8. Pruebas rapidas

```bash
# Health
curl http://localhost:3000/api/health

# Enviar lectura manual
curl -X POST http://localhost:3000/api/data \
  -H "X-API-Key: <api_key>" \
  -H "Content-Type: application/json" \
  -d '{"light_value": 1800, "intervalo_recoleccion": 5}'

# Leer estado LED
curl -X GET http://localhost:3000/api/data/led-state \
  -H "X-API-Key: <api_key>"
```

## 9. Troubleshooting

- `401 Token o API Key requerida`
  - Falta `X-API-Key` o `Authorization: Bearer <jwt>`
- `403 API Key invalida o desactivada`
  - API Key incorrecta o desactivada
- `400 light_value...`
  - Valor fuera de rango o formato invalido
- Timeout/red
  - Verifica IP del servidor, puerto 3000 y red WiFi
