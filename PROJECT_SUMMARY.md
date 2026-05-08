# Resumen Ejecutivo del Proyecto

## 📊 Overview

**ESP32 LDR Monitor** es una plataforma web completa de **monitoreo IoT** que permite capturar datos de un sensor LDR (Light Dependent Resistor) conectado a un ESP32, visualizarlos en tiempo real, generar reportes y controlar dispositivos remotamente.

---

## 🎯 Características Principales

### 🔐 Seguridad
- JWT (JSON Web Tokens) para usuarios web
- API Keys para dispositivos IoT
- Contraseñas hasheadas con bcrypt
- Headers de seguridad con Helmet
- Rate limiting por endpoint
- CORS habilitado

### 📊 Dashboard
- Gráficos interactivos (Chart.js)
- Lectura en tiempo real del sensor
- Histórico de lecturas
- Estadísticas (min/max/promedio)
- Sistema de alertas
- Estado del LED

### 📱 Configuración por Usuario
- Umbrales de luz (oscuro/medio/brillante)
- Zona horaria personalizada
- Formato de hora (12/24h)
- Políticas de retención de datos
- Intervalos de recolección

### 📋 Reportes
- Generación CSV
- Generación PDF
- Envío automático por correo
- Filtrado por fechas
- Estadísticas incluidas

### 🔴 Control LED
- Encender/apagar remotamente
- Consultar estado actual
- GPIO 32 del ESP32
- Sincronización en tiempo real

---

## 🏗️ Stack Técnico

```
Frontend                  Backend                   Base de Datos
├─ HTML5                 ├─ Node.js 18+            ├─ MySQL 8.0
├─ CSS3                  ├─ Express 4.18.2         └─ 6 Tablas
├─ JavaScript vanilla    ├─ JWT Auth               
└─ Chart.js              ├─ Rate Limiting          Almacenamiento
                         ├─ Nodemailer             └─ Docker Volumes
Seguridad               └─ PDFKit
├─ bcrypt               
├─ Helmet               Deployment
├─ CORS                 ├─ Docker
└─ Rate Limiting        └─ Docker Compose
```

---

## 📁 Estructura del Proyecto

```
└─ ESP32 LDR Monitor/
   ├─ backend/
   │  ├─ server.js                 # Punto de entrada
   │  ├─ controllers/              # Lógica de negocio (6 módulos)
   │  ├─ routes/                   # Endpoints (6 rutas)
   │  ├─ middleware/               # Autenticación
   │  └─ utils/                    # Utilidades
   ├─ frontend/                    # HTML + CSS + JS (7 páginas)
   ├─ sql/schema.sql               # Esquema MySQL
   ├─ docker/                      # Docker Compose + Dockerfile
   ├─ Postman_*.json               # Colecciones para Postman
   ├─ test_api.*                   # Scripts de prueba
   └─ [Documentación]              # 5 guías + referencias
```

---

## 🔌 API REST - Resumen

### Base URL
- **Local**: `http://localhost:3000/api`
- **Producción**: `http://<host>:3000/api`

### Autenticación (2 Métodos)

**1. JWT Token (Web/Postman)**
```http
Authorization: Bearer <token>
```

**2. API Key (Dispositivos)**
```http
X-API-Key: <api_key>
```

### Endpoints por Categoría

| Categoría | Método | Ruta | Datos |
|-----------|--------|------|-------|
| **Auth** | POST | `/auth/register` | 3 endpoints |
| **Dashboard** | GET/PATCH | `/dashboard/*` | 6 endpoints |
| **Config** | GET/PUT | `/config` | 1 endpoint |
| **Devices** | POST/GET/DELETE/PATCH | `/devices/keys` | 5 endpoints |
| **Data** | POST/GET/DELETE | `/data` | 3 endpoints |
| **Reports** | GET/POST | `/reports/*` | 4 endpoints |

**Total: 30+ Endpoints documentados**

---

## 🚀 Despliegue

### Con Docker (Recomendado - 30 segundos)
```bash
cd docker
docker compose up -d
```

### Sin Docker (2 minutos)
```bash
cd backend
npm install
npm start
```

---

## 📊 Base de Datos

### 6 Tablas Principales

| Tabla | Filas | Propósito |
|-------|-------|----------|
| `usuarios` | 1+ | Autenticación y datos de usuario |
| `sensor_data` | 1000s | Lecturas del LDR |
| `config_usuario` | 1 por usuario | Configuración personalizada |
| `alertas` | 100s | Registro de alertas |
| `device_api_keys` | 10s | API Keys para dispositivos |
| `led_control_states` | 1 por usuario | Estado actual del LED |

---

## 💡 Casos de Uso

### 1️⃣ Monitor Ambiental
- Empresa monitorea nivel de luz en múltiples oficinas
- Alertas cuando luz es muy baja/alta
- Reportes semanales por correo

### 2️⃣ Greenhouse Inteligente
- ESP32 mide luz en invernadero
- Controla LED de crecimiento automáticamente
- Dashboard muestra condiciones en tiempo real

### 3️⃣ Investigación
- Estudiante recopila datos de luz
- Exporta CSV para análisis
- Genera reportes PDF para tesis

### 4️⃣ Domótica
- Sistema integra múltiples sensores
- Controla iluminación automáticamente
- API permite integración con otros sistemas

---

## 🔒 Seguridad Implementada

✅ **Autenticación**
- JWT con expiración configurable
- API Keys para dispositivos
- Contraseñas hasheadas (bcrypt)

✅ **Protección**
- Headers de seguridad (Helmet)
- CORS configurado
- Validación de entrada

✅ **Rate Limiting**
- Auth: 20 req / 15 min
- Dashboard: 5000 req / 15 min
- Data: 8000 req / 15 min
- Otros: 100 req / 15 min

✅ **Base de Datos**
- Conexión segura a MySQL
- Prepared statements
- Índices para performance

---

## 📦 Dependencias Principales

### Backend
```json
{
  "express": "^4.18.2",
  "jsonwebtoken": "^9.1.0",
  "bcryptjs": "^2.4.3",
  "mysql2": "^3.6.4",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.7.0",
  "nodemailer": "^6.9.4",
  "pdfkit": "^0.14.0"
}
```

### Frontend
- HTML5, CSS3, JavaScript vanilla
- Chart.js para gráficos
- Fetch API para peticiones HTTP

---

## 📈 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Endpoints API | 30+ |
| Archivos documentación | 5 |
| Ejemplos incluidos | 50+ |
| Herramientas listas | 4 (Postman, PowerShell, cURL, Arduino) |
| Líneas de código backend | 1500+ |
| Líneas de código frontend | 800+ |
| Base de datos: Tablas | 6 |
| Base de datos: Índices | 10+ |

---

## 🎓 Documentación Disponible

| Documento | Propósito | Tiempo |
|-----------|-----------|--------|
| **DOCUMENTATION_INDEX.md** | Centro de referencia | 5 min |
| **COMPLETE_SETUP_GUIDE.md** | Guía completa | 20 min |
| **API_DOCS.md** | Referencia técnica | 30 min |
| **ESP32_API_GUIDE.md** | Guía IoT | 15 min |
| **QUICK_REFERENCE.md** | Comandos rápidos | 5 min |

---

## 🚀 Próximos Pasos Recomendados

### Para Usuario General
1. Leer: [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)
2. Ejecutar: `docker compose up -d`
3. Acceder: http://localhost:3000
4. Registrarse y explorar dashboard

### Para Desarrollador
1. Leer: [API_DOCS.md](API_DOCS.md)
2. Importar: Colección Postman
3. Probar: Endpoints desde Postman
4. Explorar: Código fuente en `backend/`

### Para Usuario IoT
1. Leer: [ESP32_API_GUIDE.md](ESP32_API_GUIDE.md)
2. Generar: API Key desde dashboard
3. Programar: ESP32 con código de ejemplo
4. Conectar: Sensor y empezar a enviar datos

---

## 🆘 Soporte Rápido

**¿Dónde empiezo?**
→ [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

**¿Cómo configuro Docker?**
→ [COMPLETE_SETUP_GUIDE.md - Docker](COMPLETE_SETUP_GUIDE.md#-configuración-con-docker)

**¿Necesito un comando rápido?**
→ [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

**¿Tengo un error?**
→ [COMPLETE_SETUP_GUIDE.md - Solución de Problemas](COMPLETE_SETUP_GUIDE.md#-solución-de-problemas)

---

## 📅 Información del Proyecto

- **Estado**: ✅ Completamente funcional
- **Versión**: 1.0
- **Última actualización**: 8 de mayo de 2026
- **Licencia**: Privado

---

**¿Listo para comenzar? → [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) 🚀**
