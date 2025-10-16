import { IEmotionDetector } from '../../domain/repositories/IEmotionDetector';
import {
  EmotionMetrics,
  createEmotionMetrics,
} from '../../domain/entities/EmotionMetrics';
import { VideoFrameData } from '../../domain/entities/VideoFrameData';
import { DetectorConfig } from '../../domain/value-objects/WorkerMessage';

interface DeepFaceEmotionResponse {
  valence: number;
  arousal: number;
  confidence: number;
  stress_level: number;
  dominant_emotion: string;
  emotions: {
    angry: number;
    disgust: number;
    fear: number;
    happy: number;
    sad: number;
    surprise: number;
    neutral: number;
  };
  reasoning: string;
}

/**
 * DeepFaceEmotionService
 * 
 * Servicio de detección de emociones usando modelo local DeepFace
 * a través de una API Python (FastAPI).
 * 
 * Ventajas sobre OpenAI:
 * - 100% local y privado
 * - Sin costos de API
 * - Más rápido (sin latencia de red externa)
 * - Control total del modelo
 * 
 * Requiere servidor Python corriendo en vk73m8n4-8000.usw3.devtunnels.ms
 */
export class DeepFaceEmotionService implements IEmotionDetector {
  private apiEndpoint: string = '';
  private ready: boolean = false;

  async initialize(config: DetectorConfig): Promise<void> {
    // Usar endpoint local del servidor DeepFace
    this.apiEndpoint = config.apiKey || 'http://vk73m8n4-8000.usw3.devtunnels.ms/api/analyze-emotion';
    
    // Verificar que el servidor esté disponible
    try {
      const healthCheck = await fetch(this.apiEndpoint.replace('/api/analyze-emotion', '/health'));
      if (!healthCheck.ok) {
        throw new Error('DeepFace API server not responding');
      }
      this.ready = true;
      console.log('✅ DeepFace service initialized successfully');
    } catch (error) {
      console.error('❌ DeepFace API server not available:', error);
      throw new Error(
        'DeepFace API server not running. Please start it with: cd model && python api_server.py'
      );
    }
  }

  async detect(frame: VideoFrameData): Promise<EmotionMetrics> {
    if (!this.ready) {
      throw new Error('DeepFace service not initialized');
    }

    try {
      // Convertir ImageData a base64
      const base64Image = await this.imageDataToBase64(frame.imageData);

      // Llamar a la API local de DeepFace
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result: DeepFaceEmotionResponse = await response.json();

      // Log para debugging
      console.log('🎭 Emotion detected:', {
        dominant: result.dominant_emotion,
        valence: result.valence.toFixed(2),
        arousal: result.arousal.toFixed(2),
        confidence: result.confidence.toFixed(2),
        stress: result.stress_level.toFixed(1),
      });

      // Crear métricas básicas
      const metrics = createEmotionMetrics(
        result.valence,
        result.arousal,
        result.confidence
      );

      // Agregar datos extendidos como propiedad adicional
      (metrics as any).extended = {
        dominantEmotion: result.dominant_emotion,
        emotions: result.emotions,
        stressLevel: result.stress_level,
      };

      return metrics;
    } catch (error) {
      console.error('Emotion detection error:', error);
      // Retornar valores neutrales con baja confianza en caso de error
      return createEmotionMetrics(0, 0.5, 0.1);
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  async dispose(): Promise<void> {
    this.apiEndpoint = '';
    this.ready = false;
  }

  private async imageDataToBase64(
    imageData: ImageData | Blob
  ): Promise<string> {
    if (imageData instanceof Blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageData);
      });
    }

    // Convertir ImageData a Blob, luego a base64
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.putImageData(imageData, 0, 0);
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

