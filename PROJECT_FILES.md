# 📁 Guía de Archivos del Proyecto

Descripción completa de cada archivo y carpeta en el proyecto ESP32 LDR Monitor.

---

## 📚 Archivos de Documentación

### 🎯 Centro de Referencia

| Archivo | Propósito | Tamaño | Público |
|---------|-----------|--------|---------|
| **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** | Índice maestro de toda la documentación | 8 KB | Todos |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Resumen ejecutivo del proyecto | 6 KB | Todos |

### 📖 Guías Principales

| Archivo | Para Quién | Contenido | Tamaño |
|---------|-----------|----------|--------|
| **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** | Principiantes | Docker, Postman, API, ejemplos completos | 25 KB |
| **[README.md](README.md)** | Todos | Descripción general e inicio rápido | 6 KB |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Usuarios avanzados | Comandos rápidos (cURL, PowerShell, Postman) | 12 KB |

### 🔧 Documentación Técnica

| Archivo | Propósito | Detalle | Tamaño |
|---------|-----------|--------|--------|
| **[API_DOCS.md](API_DOCS.md)** | Referencia de API | 30+ endpoints, parámetros, respuestas | 20 KB |
| **[ESP32_API_GUIDE.md](ESP32_API_GUIDE.md)** | Integración IoT | API Keys, autenticación, código Arduino | 8 KB |

### 📊 Archivos Especiales

| Archivo | Contenido |
|---------|----------|
| **API_SETUP_COMPLETE.md** | Verificación de que la API está lista |
| **QUICK_REFERENCE.md** | Referencia rápida de comandos |

---

## 🛠️ Archivos de Herramientas

### Postman

| Archivo | Propósito | Cómo Usar |
|---------|-----------|----------|
| **Postman_ESP32_Collection.json** | 20+ solicitudes pre-configuradas | Importar en Postman (Collections → Import) |

**Pasos para usar:**
1. Abre Postman
2. Collections → Import → Selecciona `Postman_ESP32_Collection.json`
3. Ejecuta las solicitudes (el token se genera en Login)

### Código de Ejemplo

| Archivo | Lenguaje | Propósito | Cómo Ejecutar |
|---------|----------|-----------|--------------|
| **ESP32_LDR_Example.ino** | Arduino/C++ | Código de ejemplo para ESP32 | Abrir en Arduino IDE |
| **test_api.sh** | Bash | Script de prueba (Linux/Mac) | `bash test_api.sh` |

---

## 📂 Carpeta: backend/

Contiene toda la lógica del servidor Node.js + Express.

### Archivo: backend/server.js
**Propósito**: Punto de entrada principal de la aplicación
- Inicializa Express
- Monta middleware (Helmet, CORS, Rate Limiting)
- Registra todas las rutas
- Sirve archivos frontend
- Escucha en puerto 3000

**Líneas de código**: ~100

### Carpeta: backend/config/

#### database.js
**Propósito**: Configuración de conexión a MySQL
- Pool de conexiones
- Credenciales desde variables de entorno
- Manejo de errores

### Carpeta: backend/controllers/

Contiene la lógica de negocio separada por dominio.

#### authController.js
- `register()` - Crear nuevo usuario
- `login()` - Autenticar y generar JWT
- `me()` - Obtener datos del usuario actual
**Métodos**: 3 | Líneas: ~80

#### dashboardController.js
- `getLatest()` - Última lectura
- `getRealtimeData()` - Últimas N lecturas
- `getHistoricalData()` - Histórico por horas
- `getStats()` - Estadísticas (min/max/avg)
- `getAlerts()` - Lista de alertas
- `markAlertRead()` - Marcar alerta como leída
**Métodos**: 6 | Líneas: ~150

#### configController.js
- `getConfig()` - Obtener configuración del usuario
- `updateConfig()` - Actualizar umbrales, zona horaria, etc
**Métodos**: 2 | Líneas: ~60

#### deviceController.js
- `createApiKey()` - Generar nueva API Key
- `listApiKeys()` - Listar todas las claves
- `deleteApiKey()` - Eliminar una clave
- `toggleApiKey()` - Activar/desactivar clave
**Métodos**: 4 | Líneas: ~120

#### ledController.js
- `getLedState()` - Consultar estado actual del LED
- `setLedState()` - Cambiar estado del LED
- `getLedStateForDevice()` - Versión para dispositivos
**Métodos**: 3 | Líneas: ~70

#### reportController.js
- `getPeriodData()` - Datos de un período
- `downloadCSV()` - Generar CSV
- `downloadPDF()` - Generar PDF
- `sendByEmail()` - Enviar por correo
**Métodos**: 4 | Líneas: ~180

### Carpeta: backend/routes/

Mapeo de endpoints HTTP a controladores.

| Archivo | Endpoints | Métodos |
|---------|-----------|---------|
| **auth.js** | `/auth/register`, `/auth/login`, `/auth/me` | 3 |
| **dashboard.js** | `/dashboard/*` | 6 |
| **config.js** | `/config` | 2 |
| **devices.js** | `/devices/keys*`, `/devices/led-state` | 5 |
| **data.js** | `/data`, `/data/cleanup`, `/data/led-state` | 3 |
| **reports.js** | `/reports/*` | 4 |

**Total de rutas**: 30+

### Carpeta: backend/middleware/

#### auth.js
**Funciones de Autenticación**:
- `authenticateToken()` - JWT validation para usuarios web
- `authenticateDevice()` - JWT o API Key validation para dispositivos

**Líneas de código**: ~80

### Carpeta: backend/utils/

#### dataCleanup.js
**Propósito**: Limpieza automática de datos antiguos
- Función para eliminar datos por días de antigüedad
- Limpieza de alertas antiguas
- Ejecutable manualmente o en scheduled tasks

**Líneas de código**: ~40

#### emailSender.js
**Propósito**: Envío de emails (reportes)
- Configuración de Nodemailer
- Plantillas de email
- Envío de reportes PDF/CSV

**Líneas de código**: ~60

### Archivo: backend/package.json
**Propósito**: Dependencias y scripts npm
- `npm start` - Inicia servidor
- `npm install` - Instala dependencias
- Especifica versiones de librerías

### Archivo: backend/.env.example
**Propósito**: Plantilla de variables de entorno
**Contiene**:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `PORT`
- `SMTP_*` (correo)

---

## 📄 Carpeta: frontend/

Contiene HTML, CSS, JavaScript para el navegador.

### Archivos HTML (7 páginas)

#### index.html
**Propósito**: Página de login
- Formulario de entrada
- Validación en cliente
- Redirección al dashboard

#### register.html
**Propósito**: Página de registro
- Formulario de nuevo usuario
- Validaciones
- Link a login

#### dashboard.html
**Propósito**: Panel principal (⭐ Más importante)
- Gráfico de tiempo real
- Últimas lecturas
- Estadísticas
- Sistema de alertas
- Acceso a otras páginas

#### led.html
**Propósito**: Control del LED
- Botones encender/apagar
- Estado actual
- Logs de cambios

#### config.html
**Propósito**: Configuración de usuario
- Umbrales de luz
- Zona horaria
- Formato de hora
- Retención de datos

#### reports.html
**Propósito**: Generación de reportes
- Selectores de fecha
- Botones descargar CSV/PDF
- Enviar por correo
- Preview de datos

#### credits.html
**Propósito**: Créditos y ayuda
- Enlaces a documentación
- Información del proyecto
- Contacto

### Carpeta: frontend/css/

#### style.css (~500 líneas)
- Estilos generales
- Colores, tipografía
- Layout base

#### dashboard.css (~300 líneas)
- Estilos específicos del dashboard
- Tarjetas de estadísticas
- Gráficos

#### responsive.css (~200 líneas)
- Media queries
- Adaptación a móviles
- Tablet y desktop

### Carpeta: frontend/js/

#### auth.js (~150 líneas)
**Propósito**: Manejo de autenticación
- Funciones: login(), register(), logout()
- Validación de formularios
- Almacenamiento de token

#### main.js (~100 líneas)
**Propósito**: Singleton de Auth global
- Clase `Auth` compartida
- Gestión de token/usuario
- Fetch wrapper para requests

#### dashboard.js (~200 líneas)
**Propósito**: Lógica del panel principal
- Carga datos en tiempo real
- Actualiza gráficos
- Maneja alertas

#### led.js (~80 líneas)
**Propósito**: Control del LED
- Botones encender/apagar
- Muestra estado actual
- Registra cambios

#### config.js (~120 líneas)
**Propósito**: Gestión de configuración
- Carga configuración actual
- Actualiza parámetros
- Validaciones

#### reports.js (~150 líneas)
**Propósito**: Generación de reportes
- Selección de fechas
- Descargar CSV/PDF
- Envío por correo

#### charts.js (~80 líneas)
**Propósito**: Funciones de Chart.js
- `crearGraficoTiempoReal()`
- `crearGraficoHistorico()`
- Actualización de datos

---

## 💾 Carpeta: sql/

#### schema.sql (~400 líneas)
**Propósito**: Esquema completo de MySQL
- Crea base de datos `esp32_ldr_monitor`
- Define 6 tablas:
  - `usuarios` - Usuarios registrados
  - `sensor_data` - Lecturas del LDR
  - `config_usuario` - Configuración por usuario
  - `alertas` - Historial de alertas
  - `device_api_keys` - API Keys para dispositivos
  - `led_control_states` - Estado actual del LED
- Define índices y relaciones

---

## 🐳 Carpeta: docker/

#### docker-compose.yml
**Propósito**: Orquestación de 2 servicios

**Servicios**:
1. **mysql** (puerto 3306)
   - Imagen: mysql:8.0
   - Variables: root password, usuario, base de datos
   - Volumen: para persistencia de datos
   - Healthcheck: mysqladmin ping
   - Init script: schema.sql

2. **app** (puerto 3000)
   - Build desde: backend.Dockerfile
   - Depende de: mysql (con healthcheck)
   - Variables de entorno: conexión DB, JWT secret

#### backend.Dockerfile
**Propósito**: Imagen Docker del backend

**Pasos**:
1. Base: node:20-alpine
2. Workdir: /app
3. Copia package.json
4. npm ci --omit=dev (instala en modo producción)
5. Copia backend + frontend
6. Expone: puerto 3000
7. CMD: npm start

**Tamaño final**: ~200 MB

#### mysql-init/README.txt
**Propósito**: Información sobre init scripts

---

## 📋 Archivos Especiales

### API_SETUP_COMPLETE.md
- Checklist de verificación
- Estado de cada componente
- Links a documentación

### Archivos de Configuración

#### .env.example (backend/)
- Template de variables de entorno
- Copiar a `.env` antes de ejecutar

#### docker-compose.yml (docker/)
- Configuración de contenedores
- Puertos y volúmenes

---

## 📊 Resumen de Líneas de Código

| Componente | Archivos | Líneas Aprox |
|-----------|----------|-------------|
| Backend (js) | 10 archivos | 1500+ |
| Frontend (js) | 7 archivos | 800+ |
| Frontend (html) | 7 páginas | 600+ |
| Frontend (css) | 3 estilos | 1000+ |
| SQL | 1 archivo | 400+ |
| Documentación | 6 archivos | 3000+ |
| Configuración | 3 archivos | 100+ |
| **TOTAL** | **40+ archivos** | **~8000+ líneas** |

---

## 🗂️ Jerarquía Completa

```
ESP32 LDR Monitor/
│
├── 📚 DOCUMENTACIÓN
│   ├── DOCUMENTATION_INDEX.md          ← Empieza aquí
│   ├── PROJECT_SUMMARY.md              (Resumen ejecutivo)
│   ├── COMPLETE_SETUP_GUIDE.md         (Guía completa)
│   ├── README.md                       (Descripción general)
│   ├── QUICK_REFERENCE.md              (Comandos rápidos)
│   ├── API_DOCS.md                     (Referencia API)
│   ├── ESP32_API_GUIDE.md              (Guía IoT)
│   └── PROJECT_FILES.md                (Este archivo)
│
├── 🛠️ HERRAMIENTAS
│   ├── Postman_ESP32_Collection.json   (Solicitudes)
│   ├── test_api.sh                     (Script de prueba)
│   └── ESP32_LDR_Example.ino           (Código Arduino)
│
├── 🔧 BACKEND (Node.js)
│   ├── server.js                       (Punto de entrada)
│   ├── package.json                    (Dependencias)
│   ├── .env.example
│   ├── config/
│   │   └── database.js
│   ├── controllers/                    (6 módulos)
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── configController.js
│   │   ├── deviceController.js
│   │   ├── ledController.js
│   │   └── reportController.js
│   ├── routes/                         (6 rutas)
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── config.js
│   │   ├── devices.js
│   │   ├── data.js
│   │   └── reports.js
│   ├── middleware/
│   │   └── auth.js
│   └── utils/
│       ├── dataCleanup.js
│       └── emailSender.js
│
├── 🎨 FRONTEND (HTML/CSS/JS)
│   ├── index.html                      (Login)
│   ├── register.html                   (Registro)
│   ├── dashboard.html                  (Panel principal)
│   ├── led.html                        (Control LED)
│   ├── config.html                     (Configuración)
│   ├── reports.html                    (Reportes)
│   ├── credits.html                    (Créditos)
│   ├── css/
│   │   ├── style.css
│   │   ├── dashboard.css
│   │   └── responsive.css
│   └── js/
│       ├── auth.js
│       ├── main.js
│       ├── dashboard.js
│       ├── led.js
│       ├── config.js
│       ├── reports.js
│       └── charts.js
│
├── 💾 BASE DE DATOS
│   └── sql/
│       └── schema.sql                  (Esquema MySQL)
│
└── 🐳 DOCKER
    └── docker/
        ├── docker-compose.yml          (Orquestación)
        ├── backend.Dockerfile          (Imagen)
        └── mysql-init/
            └── README.txt
```

---

## 🔍 Cómo Encontrar Algo

### "Necesito cambiar algo en la API de usuarios"
→ `backend/routes/auth.js` + `backend/controllers/authController.js`

### "Necesito entender cómo se ven los datos"
→ `sql/schema.sql` + `API_DOCS.md`

### "Quiero modificar el dashboard"
→ `frontend/dashboard.html` + `frontend/js/dashboard.js` + `frontend/css/dashboard.css`

### "Necesito añadir un nuevo endpoint"
→ Crear función en `backend/controllers/`, crear ruta en `backend/routes/`, documentar en `API_DOCS.md`

### "Necesito probar la API desde Postman"
→ Importar `Postman_ESP32_Collection.json`

### "Necesito documentación"
→ Ir a `DOCUMENTATION_INDEX.md`

---

## 📅 Información

- **Última actualización**: 8 de mayo de 2026
- **Total de archivos**: 40+
- **Líneas de código**: ~8000+
- **Documentación**: 3000+ líneas
- **Estado**: ✅ Completo

---

**¿Necesitas información sobre un archivo específico? Consulta [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) 📚**
