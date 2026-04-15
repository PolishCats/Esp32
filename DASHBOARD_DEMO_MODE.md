# 🧪 ¿Por Qué No Aparecen los Datos en el Dashboard?

## ❌ Problema

Cuando ejecutas el `test_api.sh` y envías datos, estos se guardan en la base de datos PERO no aparecen en el dashboard.

## ✅ Solución

Hay **dos formas** de ver los datos:

---

## 📊 Opción 1: DEMO MODE (Sin autenticación) ⭐ RECOMENDADO

Accede al dashboard en **MODO DEMO** que no requiere login:

```
http://localhost:3000/dashboard.html?demo=1
```

### ✨ Ventajas del Demo Mode
- ✅ Sin necesidad de login
- ✅ Ver datos en tiempo real
- ✅ Perfecto para testing
- ✅ Actualiza automáticamente cada 5 segundos

**Todo lo que puedes ver:**
- 📊 Gráfico en tiempo real (últimas 20 lecturas)
- 📈 Gráfico histórico (últimas 24 horas)
- 🎨 Gráfico de estados (oscuro/medio/brillante)
- 📉 Estadísticas (promedio, min, max)
- 🔔 Badge indicando "DEMO MODE"

---

## 📝 Opción 2: Login Tradicional

Si prefieres usar la autenticación normal:

### Paso 1: Ir al Login
```
http://localhost:3000
```

### Paso 2: Hacer Login
```
Usuario: admin
Contraseña: Admin1234!
```

### Paso 3: Ir al Dashboard
```
http://localhost:3000/dashboard.html
```

**Ventajas:**
- ✅ Ver datos solo de tu usuario
- ✅ Acceso a alertas personalizadas
- ✅ Gestionar API Keys de dispositivos
- ✅ Configuración personalizada

---

## 📱 Flujo Completo

```
┌─────────────────────────────────┐
│   Ejecutar prueba               │
│   bash test_api.sh              │
│   ✓ Envía datos a /api/data    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Datos guardados en MySQL      │
│   user_id=1 (admin)            │
│   light_value=2500             │
│   estado=medio                 │
└────────────┬────────────────────┘
             │
             ▼
         ¿Ver datos?
         /  \
        /    \
       ▼      ▼
   DEMO      LOGIN
   MODE      
   
   http://    http://
   localhost: localhost:
   3000/      3000
   dashboard.
   html?demo=1
```

---

## 🧪 Qué Pasa en Demo Mode

Acceder a cualquiera de estos mostrará los datos del admin sin login:

```
GET /api/dashboard/demo/latest        ← Último dato
GET /api/dashboard/demo/realtime      ← Últimas 20 lecturas
GET /api/dashboard/demo/historical    ← Últimas 24 horas
GET /api/dashboard/demo/stats         ← Estadísticas
```

---

## 🚀 Comandos Útiles

### Ver datos del servidor
```bash
docker exec esp32-mysql mysql -u root esp32_ldr_monitor \
  -e "SELECT * FROM sensor_data ORDER BY id DESC LIMIT 5;"
```

### Test del endpoint de demo
```bash
curl http://localhost:3000/api/dashboard/demo/latest | jq .
```

### Enviar datos nuevos
```bash
curl -X POST http://localhost:3000/api/data \
  -H "X-API-Key: aa4497ccf5749ac0a58ca26ff90080fd66634a13ce37892bdfdb3ab7de3c441e" \
  -H "Content-Type: application/json" \
  -d '{"light_value": 3200}'
```

---

## 🔄 Flujo Data-Driven

### Ciclo Normal (ESP32 → API → DB → Dashboard)

```
1. ESP32 lee sensor: 2500
   ↓
2. Envía POST /api/data
   Header: X-API-Key: ...
   Body: { light_value: 2500 }
   ↓
3. Servidor:
   ✓ Valida API Key
   ✓ Verifica rango (0-4095)
   ✓ Detecta estado = "medio"
   ✓ Inserta en sensor_data
   ✓ Verifica alertas
   ↓
4. MySQL guarda:
   id: 13
   user_id: 1
   light_value: 2500
   estado: "medio"
   timestamp: 2026-04-15 03:52:49
   ↓
5. Dashboard (demo mode):
   GET /api/dashboard/demo/realtime
   └─> Obtiene últimas 20 lecturas
   ↓
6. Renderiza en gráficos ✅
```

---

## 💡 Diferencias DEMO vs LOGIN

| Característica | Demo Mode | Auth Mode |
|--------|----------|-----------|
| Requiere login | ❌ No | ✅ Sí |
| Ver datos | ✅ User 1 (admin) | ✅ Tu usuario |
| Ver alertas | ❌ No | ✅ Sí |
| Gestionar dispositivos | ❌ No | ✅ Sí |
| Perfecto testing | ✅ Sí | ❌ No |

---

## 🎯 Recomendación

Para **desarrollo y testing de ESP32**:
- Usa **DEMO MODE**: `?demo=1`
- Cambia la URL en tu ESP32 Arduino para enviar datos
- Abre el dashboard en demo mode
- ¡Verás los datos en tiempo real! 📊

Para **uso en producción**:
- Usa **AUTH MODE**: Login normal
- Cada usuario ve solo sus datos
- Acceso a alertas personalizadas
- Control de dispositivos

---

## ✅ Quick Start

```bash
# Terminal 1: Enviar datos continuamente
while true; do
  curl -s -X POST http://localhost:3000/api/data \
    -H "X-API-Key: aa4497ccf5749ac0a58ca26ff90080fd66634a13ce37892bdfdb3ab7de3c441e" \
    -H "Content-Type: application/json" \
    -d "{\"light_value\": $((RANDOM % 4096))}" > /dev/null
  echo "✅ Dato enviado: $((RANDOM % 4096))"
  sleep 5
done

# Terminal 2: Abrir browser
# Accede a: http://localhost:3000/dashboard.html?demo=1
# ¡Verás los datos actualizándose en tiempo real!
```

---

## 🆘 Si aún no ves datos...

1. Verifica que el servidor está corriendo:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Verifica que los datos se guardaron:
   ```bash
   docker exec esp32-mysql mysql -u root esp32_ldr_monitor -e "SELECT COUNT(*) FROM sensor_data;"
   ```

3. Prueba el endpoint de demo directamente:
   ```bash
   curl http://localhost:3000/api/dashboard/demo/latest | jq .
   ```

4. Abre la consola del navegador (F12) y revisa si hay errores

---

**🎉 ¡Listo! Ya sabes cómo ver los datos en el dashboard!**
