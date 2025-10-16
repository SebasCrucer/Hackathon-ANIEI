import { IEmotionDetector } from '../../domain/repositories/IEmotionDetector';
import {
  EmotionMetrics,
  createEmotionMetrics,
} from '../../domain/entities/EmotionMetrics';
import { VideoFrameData } from '../../domain/entities/VideoFrameData';
import { DetectorConfig } from '../../domain/value-objects/WorkerMessage';

interface EmotionResponse {
  valence: number;
  arousal: number;
  confidence: number;
  reasoning: string;
}

export class OpenAIEmotionService implements IEmotionDetector {
  private apiEndpoint: string = '';
  private ready: boolean = false;

  async initialize(config: DetectorConfig): Promise<void> {
    // Use API endpoint instead of direct OpenAI calls
    // This keeps the API key secure on the server
    this.apiEndpoint = config.apiKey || '/api/analyze-emotion';
    
    // For Netlify, use: '/.netlify/functions/analyze-emotion'
    // For Vercel, use: '/api/analyze-emotion' (default)
    
    this.ready = true;
  }

  async detect(frame: VideoFrameData): Promise<EmotionMetrics> {
    if (!this.ready) {
      throw new Error('OpenAI service not initialized');
    }

    try {
      // Convert ImageData to base64
      const base64Image = await this.imageDataToBase64(frame.imageData);

      // Call our secure serverless API endpoint
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

      const result: EmotionResponse = await response.json();

      return createEmotionMetrics(
        result.valence,
        result.arousal,
        result.confidence
      );
    } catch (error) {
      console.error('Emotion detection error:', error);
      // Return neutral values with low confidence on error
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

    // Convert ImageData to Blob then to base64
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

