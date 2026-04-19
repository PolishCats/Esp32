# API Setup - Estado Actual

## Resumen

La integracion API para ESP32 esta operativa con:

- Ingestion de lecturas LDR por API Key o JWT
- Clasificacion automatica de estado (`oscuro`, `medio`, `brillante`)
- Alertas por umbrales configurables
- Gestion de API Keys por usuario
- Control LED remoto (panel web y endpoint para dispositivo)
- Configuracion de zona horaria y formato de hora para reportes
- Limpieza manual y automatica de datos/alertas

## Despliegue con Docker

El proyecto tambien puede desplegarse con Docker Compose.

```bash
cd docker
docker compose up -d --build
```

Esto levanta:
- `esp32_mysql` (MySQL)
- `esp32_app` (API + frontend)

URL de acceso:
- `http://localhost:3000`

## Endpoints IoT esenciales

### 1) Enviar lectura

`POST /api/data`

Headers:
- `X-API-Key: <api_key>`
- `Content-Type: application/json`

Body:
```json
{ "light_value": 2500 }
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

### 2) Consultar estado LED para ESP32

`GET /api/data/led-state`

Headers:
- `X-API-Key: <api_key>`

Respuesta esperada:
```json
{
  "success": true,
  "led_pin": 32,
  "is_on": true,
  "updated_at": "2026-04-19T16:00:00.000Z"
}
```

## Endpoints web de control

### API Keys de dispositivos

- `POST /api/devices/keys`
- `GET /api/devices/keys`
- `DELETE /api/devices/keys/:id`
- `PATCH /api/devices/keys/:id/toggle`

### Control LED desde panel

- `GET /api/devices/led-state`
- `PATCH /api/devices/led-state`

Body para update:
```json
{ "is_on": true }
```

## Limpieza manual

`DELETE /api/data/cleanup`

Body opcional:
```json
{
  "days": 30,
  "clearAllAlerts": true
}
```

- `days`: elimina lecturas/alertas antiguas segun dias
- `clearAllAlerts: true`: elimina todas las alertas del usuario

## Configuracion de hora para reportes

Se guarda en `config_usuario` y afecta tabla de reportes, CSV y PDF:

- `hora_modo`: `auto` o `manual`
- `zona_horaria`: timezone IANA (ej. `America/Mexico_City`)
- `formato_hora`: `12` o `24`

Comportamiento:
- `auto`: usa hora/zona del servidor
- `manual`: usa la zona horaria seleccionada por el usuario

## Validaciones clave

- `light_value`: entero entre 0 y 4095
- Rate limit por dispositivo (ventana de 10 minutos)
- API Key activa requerida para dispositivos

## Nota importante

- Demo mode eliminado del proyecto.
- Dashboard y APIs privadas requieren autenticacion obligatoria.
