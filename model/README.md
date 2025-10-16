# Backend API - Emotion Detection

API de detección de emociones usando DeepFace y FastAPI.

## Inicio Rápido

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python api_server.py
```

La API estará disponible en: http://localhost:8000

## Endpoints

### `POST /analyze-emotion`

Analiza una imagen y retorna emociones detectadas.

**Request:**
```json
{
  "image": "base64_encoded_image"
}
```

**Response:**
```json
{
  "valence": 0.5,
  "arousal": 0.7,
  "confidence": 0.95,
  "emotions": {
    "happy": 75.2,
    "sad": 5.1,
    "angry": 3.2,
    "fear": 2.1,
    "surprise": 8.4,
    "disgust": 1.5,
    "neutral": 4.5
  },
  "dominantEmotion": "happy",
  "stressLevel": 25.3
}
```

### `GET /health`

Verifica el estado del servidor.

## Dependencias

- FastAPI
- DeepFace 0.0.95
- TensorFlow 2.16
- OpenCV
- Uvicorn

## Docker

El backend también puede ejecutarse con Docker:

```bash
docker-compose up -d api
```
