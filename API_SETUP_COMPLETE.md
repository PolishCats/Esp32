# 🔌 API de Integración ESP32 - SETUP COMPLETADO ✅

## 📊 Flujo de Comunicación

```
┌─────────────────────────────────────────────────────────────┐
│                    Tu ESP32 / Arduino                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ LDR Sensor ──> ADC (0-4095) ──> WiFi ──> API POST    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                  │
│                            │ HTTP POST                        │
│                            ▼                                  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ API Key en Header
                             │ { light_value: 2500 }
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Servidor Node.js (port 3000)                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ POST /api/data                                       │   │
│  │ • Valida API Key                                     │   │
│  │ • Verifica rango (0-4095)                           │   │
│  │ • Guarda en MySQL                                   │   │
│  │ • Detecta estado (oscuro/medio/brillante)           │   │
│  │ • Verifica alertas                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                  │
│                            ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     MySQL Database                                   │   │
│  │  ├─ usuarios                                         │   │
│  │  ├─ sensor_data         (guarda lecturas)           │   │
│  │  ├─ device_api_keys     (guarda API Keys)           │   │
│  │  ├─ config_usuario      (configuración)             │   │
│  │  └─ alertas             (alertas generadas)         │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                  │
│                            ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Frontend (Dashboard)                                │   │
│  │  • Consultar datos en tiempo real                    │   │
│  │  • Ver gráficos de histórico                         │   │
│  │  • Recibir alertas                                   │   │
│  │  • Gestionar API Keys                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Ya Implementado

### ✅ Autenticación IoT
- [x] API Keys para dispositivos ESP32
- [x] JWT Tokens para web
- [x] Middleware que soporta ambos métodos

### ✅ Endpoints API
| Método | Ruta | Descripción |
|--------|------|-----------|
| POST | `/api/data` | 📤 Enviar datos del sensor |
| POST | `/api/data/simulate` | 🎲 Generar datos de prueba |
| POST | `/api/devices/keys` | 🔑 Crear nueva API Key |
| GET | `/api/devices/keys` | 📋 Listar API Keys |
| DELETE | `/api/devices/keys/:id` | ❌ Eliminar API Key |
| PATCH | `/api/devices/keys/:id/toggle` | 🔄 Activar/Desactivar |

### ✅ Base de Datos
- Tabla `device_api_keys` para dispositivos IoT
- Relación con usuario que posee el dispositivo
- Tracking de último uso

### ✅ Seguridad
- API Keys encriptadas con 256 bits
- Rate limiting en endpoints
- CORS habilitado
- Headers de seguridad

---

## 🎯 Cómo Usar (Paso a Paso)

### Paso 1️⃣: Generar API Key

```bash
# Login con admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin1234!"}'

# Crear API Key
curl -X POST http://localhost:3000/api/devices/keys \
  -H "Authorization: Bearer <TOKEN_DEL_LOGIN>" \
  -H "Content-Type: application/json" \
  -d '{"device_name":"ESP32-LDR-01"}'

# Resultado: Copiar la API Key generada
```

### Paso 2️⃣: Configurar ESP32

```cpp
const char* API_KEY = "aa4497ccf5749ac0a58ca26ff90080fd66634a13ce37892bdfdb3ab7de3c441e";
const char* API_URL = "http://192.168.1.100:3000/api/data";
```

### Paso 3️⃣: Enviar Datos

```cpp
// El ESP32 lee el sensor cada 5 segundos
int lightValue = analogRead(34);  // ADC: 0-4095

// POST a la API
POST /api/data
Headers:
  X-API-Key: aa4497ccf5749ac0a58ca26ff90080fd66634a13ce37892bdfdb3ab7de3c441e
  Content-Type: application/json

Body:
  { "light_value": 2500 }

// Respuesta:
  { "success": true, "estado": "medio" }
```

---

## 📚 Archivos Creados

| Archivo | Descripción |
|---------|-----------|
| [ESP32_API_GUIDE.md](#) | 📖 Guía completa de integración |
| [ESP32_LDR_Example.ino](#) | 💻 Código Arduino listo para copiar |
| [test_api.sh](#) | 🧪 Script de prueba automática |
| `backend/controllers/deviceController.js` | ⚙️ Lógica de API Keys |
| `backend/routes/devices.js` | 🛣️ Rutas para dispositivos |
| `backend/middleware/auth.js` | 🔐 Autenticación mejorada |

---

## 📡 Respuesta de la API

### ✅ Éxito
```json
{
  "success": true,
  "estado": "medio"
}
```

### Estados Posibles
- `"oscuro"` - Luz débil (0-1000)
- `"medio"` - Luz media (1000-3000)
- `"brillante"` - Luz fuerte (3000-4095)

### ❌ Errores

| Código | Mensaje |
|--------|---------|
| 400 | `light_value debe ser un entero 0–4095` |
| 401 | `Token o API Key requerida` |
| 403 | `API Key inválida o desactivada` |
| 500 | `Error interno del servidor` |

---

## 🧪 Comandos de Prueba

```bash
# 1. Test rápido (genera API Key y envía datos)
bash /home/codespace/Esp32/test_api.sh

# 2. Enviar un dato manual
curl -X POST http://localhost:3000/api/data \
  -H "X-API-Key: tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{"light_value": 3500}'

# 3. Generar 50 datos de prueba
curl -X POST http://localhost:3000/api/data/simulate \
  -H "Authorization: Bearer tu_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'

# 4. Ver datos en tiempo real (en dashboard)
# Abre: http://localhost:3000
```

---

## 🔗 URLs Importantes

| Recurso | URL |
|---------|-----|
| 🌐 Web Dashboard | http://localhost:3000 |
| 📊 API Data | http://localhost:3000/api/data |
| 🔑 Device API Keys | http://localhost:3000/api/devices/keys |
| 💚 Health Check | http://localhost:3000/api/health |

---

## 💡 Próximos Pasos Opcionales

- [ ] Crear interfaz web para gestionar API Keys
- [ ] Agregar validación de velocidad de datos
- [ ] Implementar webhook para alertas
- [ ] Dashboard en tiempo real con WebSocket
- [ ] Exportar datos a CSV/PDF desde dispositivos

---

## 🆘 ¿Necesitas Ayuda?

Si tu ESP32 no conecta:

1. Verifica que el servidor está corriendo: `curl http://localhost:3000/api/health`
2. Verifica la API Key: `curl http://localhost:3000/api/devices/keys -H "Authorization: Bearer <TOKEN>"`
3. Prueba el endpoint: `bash test_api.sh`

---

## 📝 Licencia

Este proyecto está disponible para uso personal y educativo.
