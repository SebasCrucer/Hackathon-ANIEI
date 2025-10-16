# 🎭 Integración de DeepFace (Modelo Local)

Este documento explica cómo usar el modelo local de DeepFace en lugar de OpenAI para la detección de emociones.

## 🎯 Ventajas del Modelo Local

✅ **100% Privado**: Todo el procesamiento ocurre localmente, sin enviar imágenes a servicios externos.

✅ **Sin Costos**: No requiere API keys ni pagos por uso.

✅ **Más Rápido**: Sin latencia de red externa, solo comunicación local.

✅ **Control Total**: Puedes ajustar el modelo, umbrales y parámetros.

✅ **Offline**: Funciona sin conexión a internet.

## 📋 Requisitos

### Hardware
- **CPU**: Dual-core 2.0 GHz o superior
- **RAM**: 4 GB mínimo, 8 GB recomendado
- **GPU** (Opcional, para mayor velocidad):
  - Mac: Apple Silicon (M1/M2/M3)
  - Windows/Linux: NVIDIA con CUDA

### Software
- **Python**: 3.8 - 3.10
- **Node.js**: 18+
- **Webcam**: Integrada o externa

## 🚀 Instalación

### 1. Instalar Dependencias Python

```bash
cd model

# Crear entorno virtual (recomendado)
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements_api.txt
```

#### Para Mac con Apple Silicon (M1/M2/M3)

Edita `requirements_api.txt` y descomenta las líneas de TensorFlow Metal:

```txt
tensorflow-macos==2.16.2
tensorflow-metal==1.1.0
```

Luego instala:

```bash
pip install -r requirements_api.txt
```

#### Para GPU NVIDIA

Descomenta en `requirements_api.txt`:

```txt
tensorflow==2.16.2
```

Y asegúrate de tener CUDA instalado.

### 2. Iniciar el Servidor API

```bash
# En Mac/Linux
cd model
chmod +x start_api.sh
./start_api.sh

# En Windows
cd model
start_api.bat
```

O manualmente:

```bash
cd model
python api_server.py
```

Deberías ver:

```
🚀 Starting Emotion Detection API...
📊 Using DeepFace model
🌐 Server will be available at http://localhost:8000
📚 Docs at http://localhost:8000/docs
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 3. Configurar el Frontend

Actualiza el archivo `.env` en la raíz del proyecto:

```bash
# Para usar DeepFace (modelo local)
VITE_API_ENDPOINT=http://localhost:8000/api/analyze-emotion
VITE_USE_DEEPFACE=true

# Otros parámetros
VITE_TARGET_FPS=15
VITE_SMOOTHING_WINDOW=2.5
```

### 4. Actualizar el Worker

Edita `src/infrastructure/workers/emotion-worker.ts` para usar DeepFace:

```typescript
import { DeepFaceEmotionService } from '../services/DeepFaceEmotionService';

// ... en el handler de INIT:
detector = new DeepFaceEmotionService(); // En lugar de OpenAIEmotionService
```

## 🔄 Cambiar Entre Modelos

El proyecto usa arquitectura DDD, por lo que cambiar entre modelos es fácil:

### Usar DeepFace (Local)

```typescript
// src/infrastructure/workers/emotion-worker.ts
import { DeepFaceEmotionService } from '../services/DeepFaceEmotionService';

detector = new DeepFaceEmotionService();
```

### Usar OpenAI (Remoto)

```typescript
// src/infrastructure/workers/emotion-worker.ts
import { OpenAIEmotionService } from '../services/OpenAIEmotionService';

detector = new OpenAIEmotionService();
```

## 🎯 Modelo DeepFace: Detalles Técnicos

### Emociones Detectadas

DeepFace detecta 7 emociones básicas:

1. **Angry** (Enojado) 😠
2. **Disgust** (Disgusto) 🤢
3. **Fear** (Miedo) 😨
4. **Happy** (Feliz) 😊
5. **Sad** (Triste) 😢
6. **Surprise** (Sorpresa) 😲
7. **Neutral** (Neutral) 😐

### Conversión a Valencia/Arousal

El servicio convierte estas emociones al espacio dimensional Valencia-Arousal:

**Valencia** (Positivo/Negativo: -1 a 1):
- `happy`: +1.0 (muy positivo)
- `neutral`: 0.0
- `surprise`: +0.2
- `sad`: -0.7
- `angry`: -1.0 (muy negativo)
- `fear`: -0.8
- `disgust`: -0.9

**Arousal** (Activación: 0 a 1):
- `angry`: 0.95 (muy activado)
- `fear`: 0.90
- `surprise`: 0.75
- `happy`: 0.70
- `disgust`: 0.45
- `sad`: 0.30
- `neutral`: 0.20 (poco activado)

### Cálculo de Estrés

El nivel de estrés se calcula basándose en:

**Aumentan el estrés** (emociones negativas):
- `angry` × 1.5
- `fear` × 1.3
- `sad` × 0.8
- `disgust` × 1.0

**Reducen el estrés** (emociones positivas):
- `happy` × 2.0
- `neutral` × 0.5

Fórmula:
```
stress = 50 + (stress_emotions × 0.5) - (calm_emotions × 0.3)
```

Resultado: 0-100 (% de estrés)

## 📊 Rendimiento

### Tiempos Típicos

| Hardware | Tiempo por Frame | FPS Máximo |
|----------|-----------------|------------|
| CPU (Intel i5) | ~150-200ms | 5-7 FPS |
| Apple M1/M2 | ~50-80ms | 12-15 FPS |
| NVIDIA GPU | ~30-50ms | 15-20 FPS |

### Optimizaciones Aplicadas

1. **Detector rápido**: Usa `opencv` backend (más rápido que `retinaface`)
2. **Sin detección estricta**: `enforce_detection=False` evita errores si no hay cara
3. **Caché del modelo**: Se carga una sola vez al inicio
4. **Compresión de imagen**: JPEG con quality 0.8 reduce tamaño de transferencia

## 🔧 Troubleshooting

### El servidor no inicia

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solución**:
```bash
cd model
pip install -r requirements_api.txt
```

### TensorFlow no detecta GPU

**Mac con Apple Silicon**:
```bash
pip uninstall tensorflow
pip install tensorflow-macos tensorflow-metal
```

**Verificar GPU**:
```python
import tensorflow as tf
print("GPU available:", len(tf.config.list_physical_devices('GPU')) > 0)
```

### Error de CORS

**Error**: `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solución**: El servidor ya tiene CORS habilitado. Verifica que el servidor esté corriendo en el puerto correcto.

### Detección lenta

1. **Baja la resolución** del video:
```typescript
// src/infrastructure/services/CameraService.ts
const constraints = {
  video: {
    width: { ideal: 480 },  // Más bajo = más rápido
    height: { ideal: 360 },
    frameRate: { ideal: 15 }
  }
};
```

2. **Aumenta el intervalo** entre frames:
```env
VITE_TARGET_FPS=10  # Procesar menos frames por segundo
```

3. **Usa GPU** si está disponible

### No se detecta cara

DeepFace funciona mejor con:
- Iluminación frontal adecuada
- Cara visible y sin oclusiones
- Distancia media de la cámara (50-100cm)

## 🎮 Uso

Una vez que el servidor API esté corriendo y el frontend configurado:

1. **Inicia el servidor API** (en una terminal):
   ```bash
   cd model
   python api_server.py
   ```

2. **Inicia el frontend** (en otra terminal):
   ```bash
   npm run dev
   ```

3. **Abre el navegador** en `http://localhost:3000`

4. **Activa la cámara** y el sistema comenzará a detectar emociones localmente

## 📈 Comparación: DeepFace vs OpenAI

| Característica | DeepFace (Local) | OpenAI GPT-4 Vision |
|---------------|------------------|---------------------|
| **Privacidad** | ✅ 100% local | ⚠️ Envía a OpenAI |
| **Costo** | ✅ Gratis | ❌ $0.01 por imagen |
| **Velocidad** | ✅ 50-200ms | ⚠️ 500-2000ms |
| **Offline** | ✅ Sí | ❌ No |
| **Precisión** | ⚠️ Buena | ✅ Excelente |
| **Contexto** | ❌ Solo cara | ✅ Escena completa |
| **Setup** | ⚠️ Requiere Python | ✅ Solo API key |

## 🔮 Próximas Mejoras

- [ ] Suavizado temporal acumulativo (como en `main.py`)
- [ ] Detección de calidad (luz, desenfoque)
- [ ] Historial de emociones con gráficos
- [ ] Exportación de datos a CSV
- [ ] Calibración de baseline neutral
- [ ] Soporte para múltiples caras

## 📚 Referencias

- [DeepFace GitHub](https://github.com/serengil/deepface)
- [Russell's Circumplex Model](https://en.wikipedia.org/wiki/Emotion_classification#Circumplex_model)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

