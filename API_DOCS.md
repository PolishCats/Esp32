# API Reference

Documentacion de la API REST del proyecto ESP32 LDR Monitor.

## Base URL

- Local: `http://localhost:3000/api`
- Servidor remoto: `http://<host>:3000/api`

## Autenticacion

### JWT de usuario

Usado por el panel web, Postman, Insomnia y scripts de prueba.

```http
Authorization: Bearer <token>
```

### API Key de dispositivo

Usado por el ESP32 para enviar lecturas y consultar el LED.

Headers aceptados:

```http
X-API-Key: <api_key>
```

o

```http
Authorization: Bearer <api_key>
```

## Códigos de respuesta comunes

- `200` exito
- `400` datos invalidos
- `401` autenticacion requerida
- `403` token o API Key invalida
- `404` recurso no encontrado
- `429` limite de peticiones excedido
- `500` error interno

## Endpoints

### Auth

#### POST /auth/register

Registra un usuario nuevo.

Body:

```json
{
  "username": "tu_usuario",
  "email": "tu_email@example.com",
  "password": "TuPassword123"
}
```

Respuesta:

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

#### POST /auth/login

Inicia sesion y devuelve token JWT.

Body:

```json
{
  "username": "tu_usuario",
  "password": "TuPassword123"
}
```

Respuesta:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

#### GET /auth/me

Devuelve el usuario autenticado.

Header:

```http
Authorization: Bearer <token>
```

### Dashboard

#### GET /dashboard/latest

Devuelve la ultima lectura del usuario autenticado.

#### GET /dashboard/realtime?limit=20

Devuelve las ultimas N lecturas. `limit` maximo: `100`.

#### GET /dashboard/historical?hours=24

Devuelve lecturas historicas de las ultimas horas indicadas.

#### GET /dashboard/stats

Devuelve estadisticas del periodo consultado por el controlador.

#### GET /dashboard/alerts

Lista alertas del usuario.

#### PATCH /dashboard/alerts/:id/read

Marca una alerta como leida.

### Configuracion

#### GET /config

Obtiene la configuracion del usuario.

#### PUT /config

Actualiza configuracion de umbrales, retencion y hora.

Campos comunes:

```json
{
  "rango_oscuro_max": 1000,
  "rango_medio_max": 3000,
  "alerta_minima": 200,
  "alerta_maxima": 3800,
  "intervalo_recoleccion": 5,
  "max_datos_por_minuto": 60,
  "hora_modo": "auto",
  "zona_horaria": "America/Mexico_City",
  "formato_hora": "24",
  "retencion_dias": 30
}
```

### Datos y LED

#### POST /data

Recibe una lectura del sensor LDR.

Headers:

```http
X-API-Key: <api_key>
Content-Type: application/json
```

Body:

```json
{
  "light_value": 2450,
  "intervalo_recoleccion": 5
}
```

Respuesta:

```json
{
  "success": true,
  "estado": "medio",
  "intervalo_recoleccion": 5,
  "max_datos_por_minuto": 60
}
```

#### GET /data/led-state

Consulta el estado actual del LED para el ESP32.

Respuesta:

```json
{
  "success": true,
  "led_pin": 32,
  "is_on": false,
  "updated_at": "2026-05-08T12:30:45.000Z"
}
```

#### DELETE /data/cleanup

Limpieza manual de datos y alertas.

Body opcional:

```json
{
  "days": 7,
  "clearAllAlerts": true
}
```

### Dispositivos

#### POST /devices/keys

Crea una nueva API Key para un dispositivo.

Body:

```json
{
  "device_name": "ESP32-LDR-01"
}
```

#### GET /devices/keys

Lista las API Keys del usuario.

Query opcional:
- `full=1` para ver la API Key completa

#### DELETE /devices/keys/:id

Elimina una API Key.

#### PATCH /devices/keys/:id/toggle

Activa o desactiva una API Key.

#### GET /devices/led-state

Lee el estado del LED para el panel web.

#### PATCH /devices/led-state

Enciende o apaga el LED.

Body:

```json
{
  "is_on": true
}
```

### Reportes

#### GET /reports/data?days=7

Devuelve los datos del periodo para vistas y exportacion.

#### GET /reports/csv?days=7

Descarga un CSV.

#### GET /reports/pdf?days=7

Descarga un PDF.

#### POST /reports/send-email

Envía un reporte por correo.

Body:

```json
{
  "email": "destino@example.com",
  "days": 7
}
```

## Flujo recomendado de prueba

1. `POST /auth/login`
2. `POST /devices/keys`
3. `POST /data` o `GET /data/led-state`
4. `GET /dashboard/latest`
5. `GET /reports/data?days=7`

## Ejemplos rapidos con cURL

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123456"}'
```

```bash
curl -X GET http://localhost:3000/api/dashboard/latest \
  -H "Authorization: Bearer <token>"
```

```bash
curl -X POST http://localhost:3000/api/data \
  -H "X-API-Key: <api_key>" \
  -H "Content-Type: application/json" \
  -d '{"light_value":2500,"intervalo_recoleccion":5}'
```

## Integracion con herramientas externas

- Postman: usa `Authorization` o `X-API-Key`
- Insomnia: mismo esquema de headers
- ESP32: usa `X-API-Key` para el flujo de dispositivo
