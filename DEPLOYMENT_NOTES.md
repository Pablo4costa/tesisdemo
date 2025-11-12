# 🚀 DEPLOYMENT NOTES - Housegur Frontend

**Versión:** Production-Ready v1.0  
**Fecha:** 2025-11-12  
**Status:** ✅ Frontend Listo | ⚠️ Backend Pendiente | ⚠️ Netlify Config Pendiente

---

## 📋 Checklist Previo al Deploy

### ✅ Frontend (COMPLETADO)
- [x] Código production-ready sin localhost
- [x] API integration con endpoints correctos
- [x] Chat convertido a cliente dumb
- [x] Config centralizado en `js/config.js`
- [x] localStorage para sesión de usuario
- [x] Commit realizado: `f00d737`

### ⚠️ Backend (TAREAS PENDIENTES)

**Ubicación:** Repositorio backend separado (Railway)  
**Archivo:** `app/main.py`

#### Tarea 1: Agregar CORS Middleware

Inserta esto **inmediatamente después de** `app = FastAPI()`:

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ===== AGREGAR ESTO =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",        # Local testing (Live Server)
        "http://localhost:5500",        # Local testing
        "http://localhost:3000",        # Local frontend dev
        "https://housegur.netlify.app", # Production Netlify (CAMBIAR A TU DOMINIO)
        "*"                             # Wildcard (remove en strict production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ===== FIN =====
```

#### Tarea 2: Agregar MySQL Startup Check

Agregar esta función **antes de** los routes principales:

```python
from sqlalchemy import create_engine, text
import os

# ===== AGREGAR ESTO =====
@app.on_event("startup")
async def test_db_connection():
    """
    Test MySQL connection on app startup.
    Logs success or failure without exposing credentials.
    """
    try:
        # Asume que tienes DATABASE_URL configurado como variable de entorno
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("[DB] ⚠️  No DATABASE_URL configured")
            return
        
        engine = create_engine(database_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[DB] ✅ Connected successfully to Railway MySQL")
    except Exception as e:
        error_type = type(e).__name__
        print(f"[DB] ❌ Connection error: {error_type}")
        print("[DB] Check credentials and network connectivity")
        # Opcionalmente: re-raise para fallar fast en startup
        # raise
# ===== FIN =====
```

**Después de hacer cambios:**
```bash
# En el repo backend
git add app/main.py
git commit -m "fix: add CORS middleware and MySQL startup check"
git push origin main
# Railway redeploy automático
```

---

### ⚠️ Netlify (TAREAS PENDIENTES)

#### Opción A: Netlify UI (Más fácil)

1. Ve a https://app.netlify.com
2. Crea nuevo site:
   - Click "New site from Git"
   - Selecciona repositorio `Pablo4costa/tesisdemo`
   - Branch: `main`
   - Build command: (dejar vacío - es frontend estático)
   - Publish directory: `.` (raíz del repo)
   - Deploy

3. Configura dominio personalizado:
   - Site settings → Domain management
   - Add custom domain: `housegur.netlify.app` (o el que uses)

4. Espera a que complete el deploy (< 1 min)

#### Opción B: Netlify CLI (Más control)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Dentro del repo del frontend
cd "c:\Users\bacic\Documents\Tesis Proto\tesisdemo"

# Deploy
netlify deploy --prod --dir=.

# Sigue las instrucciones interactivas
```

---

### ✅ n8n Webhook (VERIFICACIONES)

Asegúrate que tu webhook en n8n:

1. **Es accesible públicamente**
   ```
   https://palasino.app.n8n.cloud/webhook/housegur-chat
   ```

2. **Acepta POST con estructura:**
   ```json
   {
     "message": "Hola, ¿qué propiedades tienes en Alicante?",
     "user": "Pablo"
   }
   ```

3. **Retorna JSON con campo `reply` o `message`:**
   ```json
   {
     "reply": "Tenemos 3 propiedades en Alicante..."
   }
   ```
   
   O:
   ```json
   {
     "message": "Tenemos 3 propiedades en Alicante..."
   }
   ```

4. **Test local:**
   ```bash
   curl -X POST "https://palasino.app.n8n.cloud/webhook/housegur-chat" \
     -H "Content-Type: application/json" \
     -d '{"message":"test","user":"test"}'
   ```

---

## 🧪 Testing End-to-End

### 1. Local Testing (antes de push a Netlify)

**Servir frontend localmente:**
```bash
cd "c:\Users\bacic\Documents\Tesis Proto\tesisdemo"

# Opción A: Live Server (VS Code extension)
# Click "Go Live" en la esquina abajo-derecha

# Opción B: Python
python -m http.server 5500

# Opción C: Node.js
npx http-server -p 5500
```

**Abre:** http://127.0.0.1:5500

**Tests:**
1. **Login**
   - Ingresa nombre y email
   - Abre DevTools → Network → Filter "login"
   - Verifica POST a `https://housegur-api.up.railway.app/auth/login`
   - Verifica localStorage: `localStorage.getItem('usuario_id')` debe retornar un número
   - Verifica localStorage: `localStorage.getItem('nombre')` debe retornar tu nombre

2. **Properties List**
   - Click "Propiedades" o ir a `http://127.0.0.1:5500/propiedades.html`
   - Abre DevTools → Network → Filter "properties"
   - Verifica GET a `https://housegur-api.up.railway.app/properties`
   - Verifica que se renderizan tarjetas

3. **Buy Tokens**
   - Click "Comprar tokens" en una propiedad
   - Verifica redirect a `confirm.html` con parámetros
   - Ingresa cantidad y click "Confirmar"
   - Verifica POST a `https://housegur-api.up.railway.app/transactions/buy`

4. **Chat**
   - En el sidebar derecho, ve el chat
   - Escribe un mensaje: "¿Qué propiedades tienes?"
   - Abre DevTools → Network → Filter "webhook"
   - Verifica POST a tu webhook n8n
   - Verifica que recibe respuesta y la renderiza en el chat

### 2. Production Testing (después de deploy en Netlify)

**URL:** `https://housegur.netlify.app` (o tu dominio)

**Tests:** Repite los 4 tests anteriores con la URL de producción

**Verifica CORS:**
- Si ves errores "CORS" en DevTools Console, significa que el backend no tiene CORS configurado
- Solución: Agregar CORSMiddleware en backend (ver tareas arriba)

---

## 📝 Configuración de Entornos

### Production (`js/config.js` - ya configurado)
```javascript
const CONFIG = {
  API_BASE: 'https://housegur-api.up.railway.app',
  CHAT_WEBHOOK: 'https://palasino.app.n8n.cloud/webhook/housegur-chat',
};
```

### Local Development (uncomment en `js/config.js`)
```javascript
const CONFIG = {
  // API_BASE: 'https://housegur-api.up.railway.app',
  // CHAT_WEBHOOK: 'https://palasino.app.n8n.cloud/webhook/housegur-chat',
  
  // Para local, uncomment:
  API_BASE: 'http://localhost:8000',
  CHAT_WEBHOOK: 'http://localhost:3000/webhook/chat',
};
```

---

## 🔐 Seguridad & Best Practices

1. **Nunca expongas credenciales:**
   - No guardes API keys en el código frontend
   - Usa variables de entorno en el backend
   - Netlify: usa "Build settings" → "Build environment variables" si es necesario

2. **CORS en producción:**
   - Remove `"*"` de allow_origins en backend (es solo para testing)
   - Usa dominios específicos: `"https://housegur.netlify.app"`

3. **Rate limiting:**
   - Considera agregar rate limiting en el backend para evitar abuso del chat webhook

4. **Monitoring:**
   - Configure CloudWatch/DataDog en Railway para monitorear API
   - Configure logs en Netlify para debugging

---

## 🐛 Troubleshooting

### "CORS error: Access-Control-Allow-Origin missing"
**Causa:** Backend no tiene CORS configurado  
**Solución:** Agrega CORSMiddleware en `app/main.py` (ver tareas arriba)

### "Network error sending to webhook"
**Causa:** n8n webhook no está accesible o retorna error  
**Solución:** 
- Verifica que la URL es correcta en `js/config.js`
- Test con `curl` (ver sección n8n arriba)
- Revisa logs en n8n

### "No data displayed in properties list"
**Causa:** API `/properties` no retorna datos o está abajo  
**Solución:**
- Verifica que backend está up en Railway
- Revisa logs en Railway dashboard
- Test endpoint directamente: `curl https://housegur-api.up.railway.app/properties`

### "Chat sends message but no response"
**Causa:** Webhook retorna algo diferente a `{ reply: ... }`  
**Solución:**
- Abre DevTools → Network → click en request POST al webhook
- Mira tab "Response" para ver qué retorna
- Ajusta el parser en `js/chat.js` si es necesario

---

## 📞 Recursos Útiles

- **Netlify Docs:** https://docs.netlify.com/
- **FastAPI CORS:** https://fastapi.tiangolo.com/tutorial/cors/
- **n8n Webhooks:** https://docs.n8n.io/nodes/n8n-nodes-base.webhook/
- **Railway Dashboard:** https://railway.app/dashboard

---

## 📅 Timeline Recomendado

1. **Hoy:** Backend edits + test local (30 min)
2. **Hoy:** Deploy backend a Railway + test (10 min)
3. **Hoy:** Setup Netlify + deploy frontend (15 min)
4. **Hoy:** E2E testing en producción (20 min)

**Total: ~1.5 horas**

---

## ✅ Final Checklist Antes de Go-Live

- [ ] Backend: CORS + MySQL startup check en `app/main.py`
- [ ] Backend: Push a GitHub y redeploy en Railway
- [ ] Frontend: Local testing completado sin errores
- [ ] Netlify: Site creado y domain configurado
- [ ] Netlify: Deploy completado
- [ ] n8n: Webhook funciona con curl
- [ ] E2E: Login → Properties → Chat → Buy Tokens
- [ ] DevTools: Sin CORS errors en consola
- [ ] DevTools Network: Todos los requests exitosos (status 200/201)

**Una vez todo ✅, tu Housegur frontend está LIVE en producción! 🎉**
