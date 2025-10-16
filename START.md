# 🚀 Cómo Iniciar el Proyecto

## Configuración Actual: DeepFace (Modelo Local)

El proyecto está configurado para usar **solo DeepFace**, el modelo local 100% privado.

---

## 📋 Requisitos Previos

- **Python 3.8-3.10** instalado
- **Node.js 18+** instalado
- **Webcam** conectada

---

## ⚡ Inicio Rápido (2 pasos)

### 1️⃣ Instalar y Iniciar API de DeepFace

**Primera vez** (solo necesitas hacer esto una vez):

```bash
# En la raíz del proyecto
./setup_deepface.sh
```

Esto instalará todas las dependencias de Python automáticamente.

**Iniciar el servidor** (cada vez que quieras usar la app):

```bash
cd model
./start_api.sh
```

O manualmente:

```bash
cd model
source venv/bin/activate
python api_server.py
```

Deberías ver:
```
🚀 Starting Emotion Detection API...
🌐 Server will be available at http://localhost:8000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Deja esta terminal abierta** (el servidor debe estar corriendo)

---

### 2️⃣ Iniciar Frontend

**En una nueva terminal**, desde la raíz del proyecto:

```bash
# Primera vez: instalar dependencias
npm install

# Copiar configuración (si no existe .env)
cp .env.example .env

# Iniciar aplicación
npm run dev
```

Deberías ver:
```
  VITE v7.1.10  ready in 234 ms

  ➜  Local:   http://localhost:3000/
```

---

## 🎮 Usar la Aplicación

1. Abre **http://localhost:3000** en tu navegador

2. Click en **"Iniciar Cámara"**

3. Permite permisos de cámara

4. ¡Listo! Verás las métricas de emoción en tiempo real:
   - **Valencia**: Positivo/Negativo (-1 a 1)
   - **Arousal**: Nivel de activación (0 a 1)
   - **Confianza**: Qué tan seguro está el modelo (0 a 1)

5. (Opcional) Click en **"Activar PiP"** para ventana flotante

6. Cambia de pestaña y el PiP se activará automáticamente

---

## ✅ Verificar que Funciona

### API DeepFace

En otra terminal:
```bash
curl http://localhost:8000/health
```

Deberías ver:
```json
{"status":"ok","model_loaded":true}
```

### Frontend

Abre la consola del navegador (F12) y busca:
```
🎭 Using DeepFace (Local Model)
```

---

## 🛑 Detener

1. **Frontend**: Ctrl+C en la terminal donde corre `npm run dev`

2. **API DeepFace**: Ctrl+C en la terminal donde corre `python api_server.py`

---

## 🔧 Troubleshooting

### Error: "Python not found"

```bash
# Instala Python 3.10
# Mac:
brew install python@3.10

# O descarga de:
https://www.python.org/downloads/
```

### Error: "ModuleNotFoundError"

```bash
cd model
source venv/bin/activate
pip install -r requirements_api.txt
```

### Error: "API not responding"

Verifica que el servidor API esté corriendo:
```bash
curl http://localhost:8000/health
```

Si no responde, reinicia:
```bash
cd model
./start_api.sh
```

### Error: "Cannot find module 'react'"

```bash
npm install
```

### Detección muy lenta

**Opción 1**: Baja el FPS en `.env`:
```env
VITE_TARGET_FPS=10
```

**Opción 2**: Usa GPU (si tienes Mac M1/M2/M3):
```bash
cd model
source venv/bin/activate
pip install tensorflow-macos tensorflow-metal
```

---

## 📚 Más Documentación

- **Guía completa**: `DEEPFACE_INTEGRATION.md`
- **Arquitectura**: `ARCHITECTURE_DIAGRAM.md`
- **Comparación de modelos**: `MODELS_COMPARISON.md`

---

## 💡 Resumen Rápido

```bash
# Terminal 1: API (déjala corriendo)
cd model && ./start_api.sh

# Terminal 2: Frontend
npm run dev

# Navegador
# http://localhost:3000
```

¡Eso es todo! 🎉

