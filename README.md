# ESP32 LDR Monitor

**Sistema web completo para monitorear sensor LDR en ESP32** con autenticación, dashboard en tiempo real, reportes y control remoto de LED.

> � **Centro de Documentación → [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)**  
> 📖 **Guía Completa → [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)**  
> ⚡ **Referencia Rápida → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)**

## ⚡ Inicio Rápido (30 segundos)

```bash
cd docker
docker compose up -d
```

Luego abre: **http://localhost:3000**

## ✨ Características

- ✅ Autenticación con JWT para web y API Keys para dispositivos
- ✅ Dashboard en tiempo real con gráficos interactivos (Chart.js)
- ✅ Histórico de lecturas, estadísticas y alertas
- ✅ Configuración por usuario: umbrales, zona horaria, retención
- ✅ Reportes CSV y PDF por rango de fechas
- ✅ Envío de reportes por correo automático
- ✅ Control LED remoto en GPIO 32
- ✅ Gestión de API Keys para dispositivos
- ✅ API REST completa (30+ endpoints)

## 📚 Documentación

| Documento | Para Quién | Descripción |
|-----------|-----------|------------|
| **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** | Todos | Guía maestra: Docker, Postman, API, ejemplos |
| **[API_DOCS.md](API_DOCS.md)** | Desarrolladores | Referencia detallada de todos los endpoints |
| **[ESP32_API_GUIDE.md](ESP32_API_GUIDE.md)** | Usuarios ESP32 | Cómo conectar firmware a la API |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Usuarios cURL | Comandos rápidos para probar la API |

## 🏗️ Stack

- **Backend**: Node.js 18+ + Express
- **Base de datos**: MySQL 8.0
- **Frontend**: HTML5 + CSS3 + JavaScript vanilla
- **Gráficos**: Chart.js
- **Seguridad**: Helmet, JWT, bcrypt, Rate Limiting
- **Contenedores**: Docker + Docker Compose

## 🐳 Docker (Recomendado)

```bash
# Levantar contenedores
cd docker
docker compose up -d --build

# Verificar que está corriendo
docker ps

# Ver logs
docker compose logs -f app
```

Accede en: http://localhost:3000

## 🔧 Sin Docker

```bash
# 1. Instala MySQL 8.0

# 2. Crea la base de datos
mysql -u root -p < sql/schema.sql

# 3. Configura variables de entorno
cp backend/.env.example backend/.env
# Edita backend/.env con tus credenciales

# 4. Ejecuta el backend
cd backend
npm install
npm start
```

## 🚀 Usar Postman

1. Descarga [Postman](https://www.postman.com/downloads/)
2. Importa: `Postman_ESP32_Collection.json` (Collections → Import)
3. Ve a [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md) para pasos detallados

## 🧪 Ejemplo Rápido (cURL)

```bash
# 1. Registrarse
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"Test123"}'

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"Test123"}' \
  | python -c "import json,sys; print(json.load(sys.stdin)['token'])")

# 3. Ver última lectura
curl -X GET http://localhost:3000/api/dashboard/latest \
  -H "Authorization: Bearer $TOKEN"
```

## 📁 Estructura del Proyecto

```
├── backend/              # Node.js + Express API
│   ├── controllers/      # Lógica de negocio
│   ├── routes/          # Endpoints
│   ├── middleware/      # JWT y autenticación
│   └── utils/           # Utilidades
├── frontend/            # HTML + CSS + JS
├── sql/schema.sql       # Esquema de MySQL
├── docker/              # Docker Compose
├── Postman_*.json       # Archivos para Postman
├── COMPLETE_SETUP_GUIDE.md  # 👈 Guía maestra
├── API_DOCS.md
├── ESP32_API_GUIDE.md
└── QUICK_REFERENCE.md
```

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| Puerto 3000 ocupado | `docker compose down` o cambia puerto en `docker-compose.yml` |
| MySQL no conecta | Verifica: `docker compose logs mysql` |
| Token inválido | Haz login de nuevo para obtener token actual |
| CORS error | Usa Postman o cURL (no navegador) |

Para más ayuda → [COMPLETE_SETUP_GUIDE.md - Solución de Problemas](COMPLETE_SETUP_GUIDE.md#-solución-de-problemas)

---

**Última actualización**: 8 de mayo de 2026 | [Ver todos los documentos](COMPLETE_SETUP_GUIDE.md)
- Si necesitas login, crea primero un usuario en `/register` o usa la API

## Despliegue con Docker

Tambien puedes desplegar todo el stack (MySQL + App) con Docker Compose.

```bash
cd docker
docker compose up -d --build
```

Servicios levantados:
- App: http://localhost:3000
- MySQL: localhost:3306

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

Todas las rutas cuelgan de `/api`. La autenticacion puede ser:
- JWT: `Authorization: Bearer <token>`
- API Key de dispositivo: `X-API-Key: <api_key>` o `Authorization: Bearer <api_key>` en dispositivos

### Auth

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| POST | /api/auth/register | No | Registrar usuario |
| POST | /api/auth/login | No | Login y obtencion de token |
| GET | /api/auth/me | JWT | Usuario actual |

### Datos y dispositivo

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| POST | /api/data | JWT o API Key | Guardar lectura del sensor |
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
| GET | /api/dashboard/realtime?limit=20 | JWT | Ultimas N lecturas |
| GET | /api/dashboard/historical?hours=24 | JWT | Historico |
| GET | /api/dashboard/stats | JWT | Estadisticas |
| GET | /api/dashboard/alerts | JWT | Alertas |
| PATCH | /api/dashboard/alerts/:id/read | JWT | Marcar alerta leida |

### Configuracion

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| GET | /api/config | JWT | Obtener configuracion |
| PUT | /api/config | JWT | Actualizar configuracion |

Campos soportados:
- `hora_modo`: `auto` o `manual`
- `zona_horaria`: IANA timezone, por ejemplo `America/Mexico_City`
- `formato_hora`: `12` o `24`

### Dispositivos y LED

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| POST | /api/devices/keys | JWT | Crear API Key |
| GET | /api/devices/keys | JWT | Listar API Keys |
| DELETE | /api/devices/keys/:id | JWT | Eliminar API Key |
| PATCH | /api/devices/keys/:id/toggle | JWT | Activar o desactivar API Key |
| GET | /api/devices/led-state | JWT | Estado LED para panel web |
| PATCH | /api/devices/led-state | JWT | Encender o apagar LED |

### Reportes

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| GET | /api/reports/data?days=7 | JWT | Datos del periodo |
| GET | /api/reports/csv?days=7 | JWT | Descargar CSV |
| GET | /api/reports/pdf?days=7 | JWT | Descargar PDF |
| POST | /api/reports/send-email | JWT | Enviar reporte por correo |

## Integracion ESP32

- Sensor LDR: GPIO34 (ADC)
- LED remoto: GPIO32
- Ejemplo completo: `ESP32_LDR_Example.ino`

Flujo tipico:
1. Crear API Key en la web.
2. Configurar la API Key en el firmware.
3. Enviar lecturas a `/api/data`.
4. Consultar el estado LED en `/api/data/led-state` y aplicar el valor en GPIO32.

