# 🚀 Guía de Inicio Rápido

## ❓ ¿Primera vez aquí?

Este proyecto detecta emociones en tiempo real usando tu cámara. Puedes elegir entre **2 modelos**:

### 🏠 DeepFace (Local) - **RECOMENDADO**
- ✅ **Privado**: Todo corre en tu computadora
- ✅ **Gratis**: Sin costos
- ⚠️ Requiere: Python + instalación (~5 min)

### ☁️ OpenAI (Remoto)
- ✅ **Fácil**: Solo necesitas API key
- ✅ **Preciso**: Mejor detección
- ⚠️ Costo: ~$0.01 por imagen
- ⚠️ Privacidad: Envía imágenes a OpenAI

## 🎯 ¿Cuál elegir?

### Elige DeepFace si:
- Valoras la privacidad
- Uso prolongado (>1 hora)
- No quieres gastar dinero
- Tienes 5 minutos para instalar

### Elige OpenAI si:
- Quieres probar YA (2 min setup)
- Solo demos/pruebas cortas
- Tienes API key de OpenAI
- No te importa el costo

---

## 🏠 Setup: DeepFace (Local)

### 1️⃣ Instalación Automática

```bash
./setup_deepface.sh
```

**Windows:**
```bash
setup_deepface.bat
```

Esto instalará:
- Python virtual environment
- DeepFace y dependencias
- FastAPI server
- TensorFlow (CPU o GPU según tu hardware)

### 2️⃣ Iniciar Servidor

```bash
cd model
./start_api.sh      # Mac/Linux
```

**Windows:**
```bash
cd model
start_api.bat
```

Verás:
```
🚀 Starting Emotion Detection API...
🌐 Server will be available at http://localhost:8000
```

### 3️⃣ Configurar Frontend

```bash
# En la raíz del proyecto
cp .env.deepface .env
```

O manualmente, crea `.env`:
```env
VITE_API_ENDPOINT=http://localhost:8000/api/analyze-emotion
VITE_TARGET_FPS=15
VITE_SMOOTHING_WINDOW=2.5
```

### 4️⃣ Iniciar Aplicación

```bash
npm install   # Solo la primera vez
npm run dev
```

### 5️⃣ Abrir en Navegador

```
http://localhost:3000
```

¡Listo! 🎉

---

## ☁️ Setup: OpenAI (Remoto)

### 1️⃣ Obtener API Key

1. Ve a: https://platform.openai.com/api-keys
2. Crea una API key
3. Cópiala (empieza con `sk-...`)

### 2️⃣ Configurar API Key

Crea archivo `.env.local` en la raíz:

```env
OPENAI_API_KEY=sk-proj-tu-api-key-aqui
```

### 3️⃣ Configurar Frontend

```bash
cp .env.openai .env
```

O manualmente, crea `.env`:
```env
VITE_API_ENDPOINT=/api/analyze-emotion
VITE_TARGET_FPS=15
VITE_SMOOTHING_WINDOW=2.5
```

### 4️⃣ Iniciar Aplicación

**Local (desarrollo):**
```bash
npm install   # Solo la primera vez
vercel dev    # O: npm run dev
```

**Deploy (producción):**
```bash
vercel
```

### 5️⃣ Abrir en Navegador

```
http://localhost:3000
```

¡Listo! 🎉

---

## 🎮 Uso

### Controles Básicos

1. **"Iniciar Cámara"**: Pide permiso y activa detección
2. **"PiP"**: Abre ventana flotante compacta
3. **"Detener"**: Apaga la cámara

### Qué verás

- **Valencia**: Emoción positiva/negativa (-1 a 1)
  - Verde = Positivo (feliz)
  - Rojo = Negativo (enojado, triste)
  
- **Arousal**: Nivel de activación (0 a 1)
  - Alto = Energía (enojado, sorprendido)
  - Bajo = Calma (neutral, triste)

- **Confianza**: Qué tan seguro está el modelo (0 a 1)

### Picture-in-Picture (PiP)

1. Click en "Activar PiP Ahora" (primera vez)
2. Cambia a otra pestaña
3. La ventana flotante aparece automáticamente
4. Siempre visible mientras trabajas

---

## 🔧 Troubleshooting

### DeepFace: Servidor no inicia

**Error:** `command not found: python3`
```bash
# Mac con Homebrew
brew install python@3.10

# O descarga de:
https://www.python.org/downloads/
```

**Error:** `ModuleNotFoundError`
```bash
cd model
source venv/bin/activate
pip install -r requirements_api.txt
```

**Error:** Puerto ocupado
```bash
# En model/api_server.py, cambia:
uvicorn.run(app, host="0.0.0.0", port=8001)  # Cambia 8000 a 8001

# Y en .env:
VITE_API_ENDPOINT=http://localhost:8001/api/analyze-emotion
```

### OpenAI: API Key no funciona

**Error:** `401 Unauthorized`
- Verifica que `.env.local` existe en la raíz
- API key empieza con `sk-`
- Tienes créditos en tu cuenta OpenAI

**Error:** `CORS policy`
- Usa `vercel dev` en lugar de `npm run dev`
- O despliega en Vercel/Netlify

### Ambos: Cámara no detectada

**Error:** `Permission denied`
- Permite cámara en el navegador
- Chrome/Edge: `chrome://settings/content/camera`
- Safari: Preferencias > Sitios web > Cámara

**Error:** `No camera found`
- Verifica que tu webcam está conectada
- Cierra otras apps usando la cámara (Zoom, Meet, etc.)

### Ambos: Detección lenta

Baja el FPS en `.env`:
```env
VITE_TARGET_FPS=10  # O incluso 5
```

### DeepFace: Quiero usar GPU

**Mac con M1/M2/M3:**
```bash
cd model
source venv/bin/activate
pip install tensorflow-macos tensorflow-metal
```

**NVIDIA GPU:**
```bash
# 1. Instala CUDA Toolkit
# 2. Instala:
pip install tensorflow
```

Verifica:
```python
import tensorflow as tf
print("GPU:", len(tf.config.list_physical_devices('GPU')) > 0)
```

---

## 🔄 Cambiar entre Modelos

Es fácil! Solo cambia el archivo `.env`:

### DeepFace → OpenAI
```bash
cp .env.openai .env
# Y crea .env.local con OPENAI_API_KEY=...
```

### OpenAI → DeepFace
```bash
cp .env.deepface .env
# E inicia: cd model && python api_server.py
```

Reinicia el dev server:
```bash
npm run dev
```

---

## 📊 Verificar que Funciona

### Test DeepFace API

```bash
curl http://localhost:8000/health
# Debería retornar: {"status":"ok","model_loaded":true}
```

### Test OpenAI API

```bash
curl http://localhost:3000/api/analyze-emotion \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"..."}'
```

### Test Frontend

1. Abre http://localhost:3000
2. Abre consola del navegador (F12)
3. Busca: `🎭 Using DeepFace` o `🤖 Using OpenAI`

---

## 📚 Más Documentación

- **Comparación detallada**: `MODELS_COMPARISON.md`
- **DeepFace completo**: `DEEPFACE_INTEGRATION.md`
- **OpenAI serverless**: `SERVERLESS_UPDATE.md`
- **Arquitectura**: `emotion-detection-mvp.plan.md`

---

## 🆘 Ayuda

### Logs útiles

**DeepFace API:**
```bash
cd model
python api_server.py
# Verás logs en tiempo real
```

**Frontend:**
- Abre consola del navegador (F12)
- Pestaña "Console"

### Issues comunes

| Problema | Solución Rápida |
|----------|----------------|
| Servidor no inicia | `pip install -r requirements_api.txt` |
| Frontend no conecta | Verifica URL en `.env` |
| Cámara no funciona | Permite permisos en navegador |
| Muy lento | Baja `VITE_TARGET_FPS` en `.env` |
| CORS error | Usa `vercel dev` (OpenAI) |

### Contacto

Si nada funciona:
1. Verifica que seguiste **todos** los pasos
2. Lee la documentación específica del modelo
3. Busca el error en los logs

---

## 🎉 ¡Todo Listo!

Ahora tienes:
- ✅ Detección de emociones en tiempo real
- ✅ Picture-in-Picture flotante
- ✅ Valencia y Arousal científicos
- ✅ Arquitectura DDD modular

**Próximos pasos:**
- Experimenta con diferentes expresiones
- Prueba el auto-PiP cambiando de pestaña
- Compara DeepFace vs OpenAI
- Lee la documentación avanzada

**¡Diviértete! 🎭**

