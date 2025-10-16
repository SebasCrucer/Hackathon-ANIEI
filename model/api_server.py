"""
FastAPI Server para Detección de Emociones con DeepFace
Expone el modelo local como API REST
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deepface import DeepFace
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import logging

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Emotion Detection API")

# CORS para permitir requests desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica tu dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de request/response
class ImageRequest(BaseModel):
    imageBase64: str

class EmotionResponse(BaseModel):
    valence: float  # -1 a 1
    arousal: float  # 0 a 1
    confidence: float  # 0 a 1
    stress_level: float  # 0 a 100
    dominant_emotion: str
    emotions: dict
    reasoning: str

# Cache del modelo (se carga en la primera request)
model_loaded = False

def load_model():
    """Pre-carga el modelo de DeepFace"""
    global model_loaded
    if not model_loaded:
        logger.info("Loading DeepFace model...")
        try:
            # Forzar la carga del modelo con una imagen dummy
            dummy = np.zeros((224, 224, 3), dtype=np.uint8)
            DeepFace.analyze(dummy, actions=['emotion'], enforce_detection=False, silent=True)
            model_loaded = True
            logger.info("Model loaded successfully!")
        except Exception as e:
            logger.warning(f"Model preload failed: {e}")

def base64_to_image(base64_string: str) -> np.ndarray:
    """Convierte imagen base64 a numpy array (BGR para OpenCV)"""
    # Remover el prefijo data:image/...;base64, si existe
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decodificar base64
    img_bytes = base64.b64decode(base64_string)
    
    # Convertir a imagen
    img = Image.open(BytesIO(img_bytes))
    
    # Convertir a numpy array (RGB)
    img_array = np.array(img)
    
    # Convertir RGB a BGR (OpenCV usa BGR)
    if len(img_array.shape) == 3 and img_array.shape[2] == 3:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    
    return img_array

def emotions_to_valence_arousal(emotions: dict) -> tuple:
    """
    Convierte emociones de DeepFace a dimensiones de Valencia y Arousal
    
    Valencia (Positivo/Negativo):
    - Positivo: happy
    - Negativo: angry, sad, disgust, fear
    - Neutral: neutral, surprise
    
    Arousal (Activación):
    - Alto: angry, fear, surprise, happy
    - Bajo: sad, disgust, neutral
    """
    # Normalizar emociones (DeepFace da porcentajes)
    total = sum(emotions.values())
    if total == 0:
        return 0.0, 0.5  # Neutro si no hay detección
    
    normalized = {k: v / total for k, v in emotions.items()}
    
    # VALENCIA: -1 (muy negativo) a 1 (muy positivo)
    valence = (
        normalized.get('happy', 0) * 1.0 +
        normalized.get('neutral', 0) * 0.0 +
        normalized.get('surprise', 0) * 0.2 +
        normalized.get('sad', 0) * (-0.7) +
        normalized.get('angry', 0) * (-1.0) +
        normalized.get('fear', 0) * (-0.8) +
        normalized.get('disgust', 0) * (-0.9)
    )
    
    # AROUSAL: 0 (muy calmado) a 1 (muy activado)
    arousal = (
        normalized.get('angry', 0) * 0.95 +
        normalized.get('fear', 0) * 0.90 +
        normalized.get('surprise', 0) * 0.75 +
        normalized.get('happy', 0) * 0.70 +
        normalized.get('disgust', 0) * 0.45 +
        normalized.get('sad', 0) * 0.30 +
        normalized.get('neutral', 0) * 0.20
    )
    
    # Clamp values
    valence = max(-1.0, min(1.0, valence))
    arousal = max(0.0, min(1.0, arousal))
    
    return valence, arousal

def calculate_stress_level(emotions: dict) -> float:
    """
    Calcula nivel de estrés basado en emociones
    Similar a la lógica del main.py
    """
    # Emociones que aumentan el estrés
    stress_emotions = (
        emotions.get('angry', 0) * 1.5 +
        emotions.get('fear', 0) * 1.3 +
        emotions.get('sad', 0) * 0.8 +
        emotions.get('disgust', 0) * 1.0
    )
    
    # Emociones que reducen el estrés
    calm_emotions = (
        emotions.get('happy', 0) * 2.0 +
        emotions.get('neutral', 0) * 0.5
    )
    
    # Nivel base de 50, ajustado por emociones
    stress = 50 + (stress_emotions * 0.5) - (calm_emotions * 0.3)
    
    # Clamp entre 0-100
    return max(0.0, min(100.0, stress))

@app.on_event("startup")
async def startup_event():
    """Pre-carga el modelo al iniciar el servidor"""
    load_model()

@app.get("/")
async def root():
    return {
        "name": "Emotion Detection API",
        "status": "running",
        "model": "DeepFace",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model_loaded}

@app.post("/api/analyze-emotion", response_model=EmotionResponse)
async def analyze_emotion(request: ImageRequest):
    """
    Analiza emociones en una imagen
    Compatible con la interfaz de OpenAI
    """
    try:
        # Convertir base64 a imagen
        img_array = base64_to_image(request.imageBase64)
        
        # Analizar con DeepFace
        logger.info("Analyzing image with DeepFace...")
        result = DeepFace.analyze(
            img_array,
            actions=['emotion'],
            enforce_detection=False,  # No fallar si no detecta cara
            detector_backend='opencv',  # Más rápido
            silent=True
        )
        
        # DeepFace puede retornar lista o dict
        if isinstance(result, list):
            result = result[0]
        
        # Extraer emociones
        emotions = result.get('emotion', {})
        dominant_emotion = result.get('dominant_emotion', 'neutral')
        
        # Calcular valencia y arousal
        valence, arousal = emotions_to_valence_arousal(emotions)
        
        # Calcular nivel de estrés
        stress_level = calculate_stress_level(emotions)
        
        # Calcular confianza (basado en qué tan dominante es la emoción principal)
        max_emotion_value = max(emotions.values()) if emotions else 0
        confidence = min(1.0, max_emotion_value / 100.0)
        
        # Generar reasoning
        reasoning = f"Dominant emotion: {dominant_emotion} ({max_emotion_value:.1f}%). "
        reasoning += f"Valence: {'positive' if valence > 0 else 'negative'}, "
        reasoning += f"Arousal: {'high' if arousal > 0.6 else 'moderate' if arousal > 0.3 else 'low'}. "
        reasoning += f"Stress level: {stress_level:.1f}%."
        
        logger.info(f"Analysis complete: {dominant_emotion}, valence={valence:.2f}, arousal={arousal:.2f}")
        
        return EmotionResponse(
            valence=valence,
            arousal=arousal,
            confidence=confidence,
            stress_level=stress_level,
            dominant_emotion=dominant_emotion,
            emotions=emotions,
            reasoning=reasoning
        )
        
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Emotion Detection API...")
    print("📊 Using DeepFace model")
    print("🌐 Server will be available at http://vk73m8n4-8000.usw3.devtunnels.ms")
    print("📚 Docs at http://vk73m8n4-8000.usw3.devtunnels.ms/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

