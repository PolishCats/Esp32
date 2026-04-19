# ESP32 LDR Monitor

Aplicacion web completa para monitorear lecturas de un sensor LDR conectado a ESP32, con autenticacion obligatoria, reportes y control de LED remoto.

## Caracteristicas

- Autenticacion con JWT (registro/login)
- Dashboard en tiempo real con estado del ESP32
- Historico de lecturas y estadisticas
- Alertas por umbrales minimos/maximos
- Configuracion por usuario (rangos, limites, retencion)
- Configuracion de hora:
  - Modo automatico (hora del servidor)
  - Modo manual (zona horaria elegida)
  - Formato de hora 12/24
- Reportes CSV/PDF con fecha y hora separadas
- Envio de reportes por correo
- Limpieza manual de datos y alertas
- Limpieza automatica por retencion
- Control LED remoto (GPIO 32 en ESP32)
- Gestion de API Keys para dispositivos IoT

## Stack

- Backend: Node.js + Express
- Base de datos: MySQL
- Frontend: HTML, CSS, JavaScript (vanilla)
- Graficos: Chart.js
- PDF: PDFKit
- Correo: Nodemailer
- Seguridad: Helmet, rate limiting, JWT, bcrypt

## Estructura

```text
.
├── backend/
│   ├── server.js
│   ├── config/database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── configController.js
│   │   ├── dashboardController.js
│   │   ├── deviceController.js
│   │   ├── ledController.js
│   │   └── reportController.js
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── config.js
│   │   ├── dashboard.js
│   │   ├── data.js
│   │   ├── devices.js
│   │   └── reports.js
│   └── utils/
│       ├── dataCleanup.js
│       └── emailSender.js
├── frontend/
│   ├── index.html
│   ├── register.html
│   ├── dashboard.html
│   ├── config.html
│   ├── led.html
│   ├── reports.html
│   ├── credits.html
│   ├── css/
│   └── js/
├── sql/schema.sql
├── ESP32_LDR_Example.ino
└── test_api.sh
```

## Inicio rapido

### 1) Base de datos

```bash
mysql -u root -p < sql/schema.sql
```

### 2) Variables de entorno

```bash
cp .env.example backend/.env
```

Configura credenciales DB/SMTP en `backend/.env`.

### 3) Ejecutar backend

```bash
cd backend
npm install
npm start
```

### 4) Abrir app

- URL: http://localhost:3000
- Usuario por defecto:
  - username: `admin`
  - password: `Admin1234!`

## Despliegue con Docker

Tambien puedes desplegar todo el stack (MySQL + App) con Docker Compose.

```bash
cd docker
docker compose up -d --build
```

Servicios levantados:
- App: `http://localhost:3000`
- MySQL: `localhost:3306`

Comandos utiles:

```bash
# Ver estado de contenedores
docker compose ps

# Ver logs
docker compose logs -f app

# Rebuild rapido solo de la app
docker compose up -d --build app

# Detener todo
docker compose down
```

## API principal

### Auth

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| POST | /api/auth/register | No | Registrar usuario |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | JWT | Usuario actual |

### Ingestion de datos (ESP32)

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| POST | /api/data | JWT o API Key | Guardar lectura del sensor |
| POST | /api/data/simulate | JWT | Generar lecturas aleatorias |
| DELETE | /api/data/cleanup | JWT | Limpieza manual |
| GET | /api/data/led-state | JWT o API Key | Leer estado LED para ESP32 |

Notas de limpieza:
- `DELETE /api/data/cleanup` acepta body opcional:
  - `days` (int)
  - `clearAllAlerts` (bool)

### Dashboard

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| GET | /api/dashboard/latest | JWT | Ultima lectura |
| GET | /api/dashboard/realtime | JWT | Ultimas N lecturas |
| GET | /api/dashboard/historical | JWT | Historico |
| GET | /api/dashboard/stats | JWT | Estadisticas |
| GET | /api/dashboard/alerts | JWT | Alertas |
| PATCH | /api/dashboard/alerts/:id/read | JWT | Marcar alerta leida |

### Configuracion

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| GET | /api/config | JWT | Obtener configuracion |
| PUT | /api/config | JWT | Actualizar configuracion |

Campos de hora soportados en configuracion:
- `hora_modo`: `auto` o `manual`
- `zona_horaria`: string IANA (ej. `America/Mexico_City`)
- `formato_hora`: `12` o `24`

### Dispositivos / LED

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| POST | /api/devices/keys | JWT | Crear API Key |
| GET | /api/devices/keys | JWT | Listar API Keys |
| DELETE | /api/devices/keys/:id | JWT | Eliminar API Key |
| PATCH | /api/devices/keys/:id/toggle | JWT | Activar/Desactivar API Key |
| GET | /api/devices/led-state | JWT | Estado LED para panel web |
| PATCH | /api/devices/led-state | JWT | Encender/Apagar LED |

### Reportes

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| GET | /api/reports/data?days=N | JWT | Datos del periodo |
| GET | /api/reports/csv?days=N | JWT | Descargar CSV |
| GET | /api/reports/pdf?days=N | JWT | Descargar PDF |
| POST | /api/reports/send-email | JWT | Enviar reporte por correo |

## Integracion ESP32

- Sensor LDR: GPIO34 (ADC)
- LED remoto: GPIO32
- Ejemplo completo: `ESP32_LDR_Example.ino`

Flujo tipico:
1. Crear API Key en la web.
2. Configurar API Key en el firmware.
3. Enviar lecturas a `/api/data`.
4. Consultar estado LED en `/api/data/led-state` y aplicar en GPIO32.

