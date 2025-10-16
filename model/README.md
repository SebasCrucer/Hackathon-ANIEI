# 🎭 DeepFace Emotion Detection API

API REST para detección de emociones usando DeepFace (modelo local).

## ⚡ Quick Start

### 1. Instalación Automática

```bash
# En la raíz del proyecto
./setup_deepface.sh     # Mac/Linux
setup_deepface.bat      # Windows
```

### 2. Iniciar Servidor

```bash
cd model
./start_api.sh          # Mac/Linux
start_api.bat           # Windows
```

O manualmente:

```bash
cd model
source venv/bin/activate  # En Windows: venv\Scripts\activate
python api_server.py
```

### 3. Verificar

El servidor estará disponible en:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

## 📊 Endpoints

### POST `/api/analyze-emotion`

Analiza emociones en una imagen.

**Request:**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response:**
```json
{
  "valence": 0.75,
  "arousal": 0.60,
  "confidence": 0.85,
  "stress_level": 35.2,
  "dominant_emotion": "happy",
  "emotions": {
    "angry": 0.5,
    "disgust": 0.2,
    "fear": 1.0,
    "happy": 92.1,
    "sad": 2.5,
    "surprise": 3.2,
    "neutral": 0.5
  },
  "reasoning": "Dominant emotion: happy (92.1%). Valence: positive, Arousal: moderate. Stress level: 35.2%."
}
```

## 🔧 Configuración

### Hardware

- **CPU**: Funciona, pero más lento (~150-200ms por frame)
- **Apple Silicon (M1/M2/M3)**: Rápido (~50-80ms) con Metal
- **NVIDIA GPU**: Muy rápido (~30-50ms) con CUDA

### Instalar con GPU

**Mac con Apple Silicon:**

Edita `requirements_api.txt`:
```txt
tensorflow-macos==2.16.2
tensorflow-metal==1.1.0
```

**NVIDIA GPU:**
```txt
tensorflow==2.16.2
```

Luego:
```bash
pip install -r requirements_api.txt
```

## 🎯 Modelo

- **Base**: DeepFace con múltiples backends
- **Detector**: OpenCV (rápido, ideal para tiempo real)
- **Emociones**: 7 básicas (angry, disgust, fear, happy, sad, surprise, neutral)
- **Output**: Valencia/Arousal (modelo circumplex de Russell)

### Conversión a Valencia/Arousal

**Valencia** (-1 a 1):
- Positivo: happy
- Negativo: angry, fear, sad, disgust
- Neutral: neutral, surprise

**Arousal** (0 a 1):
- Alto: angry, fear, surprise
- Medio: happy, disgust
- Bajo: sad, neutral

## 🚀 Rendimiento

| Hardware | Tiempo/Frame | FPS |
|----------|--------------|-----|
| CPU i5 | 150-200ms | 5-7 |
| Apple M1 | 50-80ms | 12-15 |
| NVIDIA GPU | 30-50ms | 15-20 |

## 🔍 Troubleshooting

### Error: Módulo no encontrado

```bash
cd model
source venv/bin/activate
pip install -r requirements_api.txt
```

### GPU no detectada

**Mac:**
```bash
pip install tensorflow-macos tensorflow-metal
```

Verificar:
```python
import tensorflow as tf
print(len(tf.config.list_physical_devices('GPU')))
```

### Puerto ocupado

Cambiar puerto en `api_server.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)
```

Y en `.env` del frontend:
```
VITE_API_ENDPOINT=http://localhost:8001/api/analyze-emotion
```

## 📚 Archivos

- `api_server.py`: Servidor FastAPI principal
- `main.py`: Script original de detección en tiempo real
- `requirements_api.txt`: Dependencias del servidor API
- `requirements.txt`: Dependencias del script original
- `start_api.sh/bat`: Scripts de inicio
- `README_ESTRES.md`: Documentación original del modelo

## 🔗 Integración

Para usar este modelo en el frontend:

1. **Inicia el servidor** (este API)
2. **Configura el frontend**:
   ```env
   # .env
   VITE_API_ENDPOINT=http://localhost:8000/api/analyze-emotion
   ```
3. **Reinicia el dev server**:
   ```bash
   npm run dev
   ```

El worker detectará automáticamente que estás usando DeepFace (por el endpoint localhost:8000) y usará `DeepFaceEmotionService`.

## 📖 Más Info

Ver `DEEPFACE_INTEGRATION.md` en la raíz del proyecto para documentación completa.

