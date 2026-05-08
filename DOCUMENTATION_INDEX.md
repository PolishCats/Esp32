# 📚 Centro de Documentación - ESP32 LDR Monitor

Bienvenido al centro de documentación del proyecto. Elige el documento que necesites según tu rol y objetivo.

---

## 🎯 Elige tu Ruta

### 👨‍💻 Soy Nuevo en el Proyecto

**Empiza aquí**: [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)
- Descripción del proyecto ✅
- Cómo levantar con Docker ✅
- Cómo usar Postman ✅
- Ejemplos completos ✅
- Solución de problemas ✅

**Tiempo estimado**: 15-20 minutos

---

### 🚀 Solo Quiero Empezar Rápido

**Ve a**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Docker en 1 línea ✅
- Login y obtener token ✅
- Crear API Key ✅
- Comandos cURL/PowerShell listos ✅

**Tiempo estimado**: 2-3 minutos

---

### 🔧 Desarrollador - Necesito Documentación de API

**Consulta**: [API_DOCS.md](API_DOCS.md)
- Todos los 30+ endpoints documentados
- Métodos HTTP y rutas exactas
- Parámetros y respuestas
- Códigos de error
- Límites de tasa

**Tiempo estimado**: 30 minutos para lectura completa

---

### 📱 Voy a Conectar un ESP32

**Lee**: [ESP32_API_GUIDE.md](ESP32_API_GUIDE.md)
- Cómo generar API Keys
- Autenticación para dispositivos
- Enviar lecturas de sensor
- Consultar estado del LED
- Código de ejemplo en Arduino

**Tiempo estimado**: 10-15 minutos

---

### 📖 Resumen del Proyecto

**Lee**: [README.md](README.md)
- Características principales
- Stack tecnológico
- Estructura del proyecto
- Enlaces a documentos

**Tiempo estimado**: 5 minutos

---

## 📂 Todos los Documentos

### Documentación Funcional

| Documento | Propósito | Público Objetivo |
|-----------|-----------|-----------------|
| **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** | Guía maestra completa con Docker, Postman, API y ejemplos | Todos (especialmente principiantes) |
| **[API_DOCS.md](API_DOCS.md)** | Referencia técnica detallada de todos los endpoints | Desarrolladores, DevOps |
| **[ESP32_API_GUIDE.md](ESP32_API_GUIDE.md)** | Guía específica para integración con firmware ESP32 | Usuarios de IoT, Makers |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Comandos rápidos (cURL, PowerShell, Postman) | Usuarios avanzados, desarrolladores |
| **[README.md](README.md)** | Descripción general y inicio rápido | Todos |

### Documentación de Referencia

| Documento | Propósito | Público Objetivo |
|-----------|-----------|-----------------|
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Resumen ejecutivo: características, requisitos, stack | Gerentes, arquitectos, nuevos usuarios |
| **[PROJECT_FILES.md](PROJECT_FILES.md)** | Guía de todos los archivos y carpetas del proyecto | Desarrolladores, mantenedores |

### Archivos de Herramientas

| Archivo | Propósito | Cómo Usar |
|---------|-----------|----------|
| **Postman_ESP32_Collection.json** | Colección de solicitudes para Postman | Importar en Postman (Collections → Import) |
| **test_api.sh** | Script de prueba (Linux/Mac) | `bash test_api.sh` |
| **ESP32_LDR_Example.ino** | Código de ejemplo para Arduino/ESP32 | Abrir en Arduino IDE |

### Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| **docker-compose.yml** | Orquestación de contenedores (MySQL + App) |
| **backend.Dockerfile** | Imagen Docker del backend |
| **schema.sql** | Esquema de base de datos MySQL |

---

## 🔍 Buscar por Tema

### Docker & Deployment
- 📖 [COMPLETE_SETUP_GUIDE.md - Configuración con Docker](COMPLETE_SETUP_GUIDE.md#-configuración-con-docker)
- 📖 [QUICK_REFERENCE.md - Inicio Rápido](QUICK_REFERENCE.md#-inicio-rápido-docker)

### Autenticación
- 📖 [COMPLETE_SETUP_GUIDE.md - Autenticación](COMPLETE_SETUP_GUIDE.md#-documentación-de-la-api)
- 📖 [API_DOCS.md - Autenticación](API_DOCS.md#autenticacion)
- 📖 [ESP32_API_GUIDE.md - Autenticación para Dispositivos](ESP32_API_GUIDE.md#autenticacion-para-dispositivos)

### Postman
- 📖 [COMPLETE_SETUP_GUIDE.md - Uso de Postman](COMPLETE_SETUP_GUIDE.md#-uso-de-postman)

### Endpoints API
- 📖 [API_DOCS.md - Todos los Endpoints](API_DOCS.md#endpoints)
- 📖 [QUICK_REFERENCE.md - Comandos Rápidos](QUICK_REFERENCE.md)

### Sensor LDR
- 📖 [ESP32_API_GUIDE.md - Enviar Lecturas](ESP32_API_GUIDE.md)
- 📖 [COMPLETE_SETUP_GUIDE.md - Ejemplo 3](COMPLETE_SETUP_GUIDE.md#ejemplo-3-enviar-lectura-de-sensor-desde-esp32)

### Control LED
- 📖 [COMPLETE_SETUP_GUIDE.md - Ejemplo 4](COMPLETE_SETUP_GUIDE.md#ejemplo-4-consultar-led-y-cambiar-estado-curl)
- 📖 [API_DOCS.md - LED Endpoints](API_DOCS.md#dispositivos-requiere-jwt)

### Reportes
- 📖 [COMPLETE_SETUP_GUIDE.md - Ejemplo 5](COMPLETE_SETUP_GUIDE.md#ejemplo-5-generar-reporte-en-csv)
- 📖 [API_DOCS.md - Reportes](API_DOCS.md#reportes-requiere-jwt)

### Problemas & Solución
- 📖 [COMPLETE_SETUP_GUIDE.md - Solución de Problemas](COMPLETE_SETUP_GUIDE.md#-solución-de-problemas)
- 📖 [README.md - Problemas Comunes](README.md#-problemas-comunes)

---

## 🚀 Inicio Rápido (Todas las Opciones)

### Opción 1: Docker (⭐ Recomendado - 1 minuto)
```bash
cd docker
docker compose up -d
```
Luego abre: http://localhost:3000

### Opción 2: Sin Docker (5 minutos)
```bash
cd backend
npm install
npm start
```

### Opción 3: Ver Desde Postman (2 minutos)
1. Descarga Postman
2. Importa `Postman_ESP32_Collection.json` (Collections → Import)
3. Ejecuta las solicitudes

---

## 📚 Estructura de Documentación

```
Documentación
├── 🎯 DOCUMENTATION_INDEX.md (TÚ ESTÁS AQUÍ)
│
├── 📖 Para Principiantes
│   └── COMPLETE_SETUP_GUIDE.md ← Empieza aquí
│
├── 🚀 Inicio Rápido
│   ├── README.md
│   └── QUICK_REFERENCE.md
│
├── 🔧 Técnica
│   ├── API_DOCS.md
│   └── ESP32_API_GUIDE.md
│
└── 🛠️ Herramientas
    ├── Postman_ESP32_Collection.json
    ├── test_api.sh
    └── ESP32_LDR_Example.ino
```

---

## 🆘 ¿Necesitas Ayuda?

1. **¿No sabes por dónde empezar?**
   → Lee [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)

2. **¿Quieres un comando específico rápido?**
   → Busca en [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

3. **¿Necesitas detalles técnicos de un endpoint?**
   → Consulta [API_DOCS.md](API_DOCS.md)

4. **¿Estás usando ESP32?**
   → Lee [ESP32_API_GUIDE.md](ESP32_API_GUIDE.md)

5. **¿Tienes un problema?**
   → Ve a [COMPLETE_SETUP_GUIDE.md - Solución de Problemas](COMPLETE_SETUP_GUIDE.md#-solución-de-problemas)

---

## 📊 Estadísticas de Documentación

- **Documentos totales**: 5 guías + referencias rápidas
- **Endpoints documentados**: 30+
- **Ejemplos incluidos**: 50+
- **Herramientas listas**: 4 (Postman, PowerShell, cURL, Arduino)
- **Tiempo total de lectura**: ~90 minutos (según profundidad)

---

## 🎓 Ruta de Aprendizaje Recomendada

### Para Usuario General (30 minutos)
1. Lee: [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md#-descripción-del-proyecto) (descripción)
2. Configura: Docker ([COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md#-configuración-con-docker))
3. Prueba: Postman ([COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md#-uso-de-postman))
4. Explora: [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md#-ejemplos-de-uso) (ejemplos)

### Para Desarrollador Backend (1 hora)
1. Lee: [API_DOCS.md](API_DOCS.md) (referencia completa)
2. Consulta: [README.md](README.md) (estructura)
3. Explora: Código fuente en `backend/`
4. Prueba: Usa cURL o Postman con [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### Para Usuario IoT/ESP32 (45 minutos)
1. Lee: [ESP32_API_GUIDE.md](ESP32_API_GUIDE.md) (guía IoT)
2. Configura: Docker ([QUICK_REFERENCE.md](QUICK_REFERENCE.md#-inicio-rápido-docker))
3. Obtén: API Key ([QUICK_REFERENCE.md](QUICK_REFERENCE.md#-crear-api-key-de-esp32))
4. Integra: Código ([ESP32_LDR_Example.ino](ESP32_LDR_Example.ino))

---

## 📅 Información de Documentación

- **Última actualización**: 8 de mayo de 2026
- **Versión del proyecto**: 1.0
- **Estado**: ✅ Completo y actualizado

---

**¿Listo? ¡Empieza con [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)! 🚀**
