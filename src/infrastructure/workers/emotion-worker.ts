// Using DeepFace (Local Model) only
// import { OpenAIEmotionService } from '../services/OpenAIEmotionService';
import { DeepFaceEmotionService } from '../services/DeepFaceEmotionService';
import { EWMASmoother } from '../services/EWMASmoother';
import { createVideoFrameData } from '../../domain/entities/VideoFrameData';
import { createDetectionQuality } from '../../domain/value-objects/DetectionQuality';
import { IEmotionDetector } from '../../domain/repositories/IEmotionDetector';
import {
  WorkerMessageType,
  UIToWorkerMessage,
  DetectorConfig,
} from '../../domain/value-objects/WorkerMessage';

let emotionService: IEmotionDetector | null = null;
let smoother: EWMASmoother | null = null;
let isProcessing = false;
let frameCount = 0;
let fpsStartTime = Date.now();

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<UIToWorkerMessage>) => {
  const message = event.data;

  try {
    switch (message.type) {
      case WorkerMessageType.INIT:
        await handleInit(message.config);
        break;

      case WorkerMessageType.FRAME:
        await handleFrame(message.timestamp, message.imageData);
        break;

      case WorkerMessageType.STOP:
        handleStop();
        break;

      default:
        console.warn('Unknown message type:', message);
    }
  } catch (error) {
    self.postMessage({
      type: WorkerMessageType.ERROR,
      code: 'WORKER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

async function handleInit(config: DetectorConfig): Promise<void> {
  try {
    // Using DeepFace (Local Model) only
    console.log('🎭 Using DeepFace (Local Model)');
    emotionService = new DeepFaceEmotionService();
    
    // OpenAI option disabled for now
    // Uncomment to enable OpenAI:
    // const useDeepFace = config.apiKey?.includes('vk73m8n4-8000.usw3.devtunnels.ms') || 
    //                     config.apiKey?.includes('127.0.0.1:8000');
    // if (useDeepFace) {
    //   console.log('🎭 Using DeepFace (Local Model)');
    //   emotionService = new DeepFaceEmotionService();
    // } else {
    //   console.log('🤖 Using OpenAI GPT-4 Vision');
    //   emotionService = new OpenAIEmotionService();
    // }
    
    await emotionService.initialize(config);

    // Initialize smoother
    smoother = new EWMASmoother();
    smoother.initialize(config.smoothingWindow || 2.5);

    // Reset metrics
    frameCount = 0;
    fpsStartTime = Date.now();

    self.postMessage({
      type: WorkerMessageType.READY,
    });
  } catch (error) {
    self.postMessage({
      type: WorkerMessageType.ERROR,
      code: 'INIT_FAILED',
      message: error instanceof Error ? error.message : 'Initialization failed',
    });
  }
}

async function handleFrame(
  _timestamp: number,
  imageData: ImageData
): Promise<void> {
  // Skip if already processing
  if (isProcessing) {
    return;
  }

  if (!emotionService || !smoother) {
    self.postMessage({
      type: WorkerMessageType.ERROR,
      code: 'NOT_INITIALIZED',
      message: 'Worker not initialized',
    });
    return;
  }

  isProcessing = true;

  try {
    // Create video frame data
    const frameData = createVideoFrameData(imageData);

    // Detect emotions
    const rawMetrics = await emotionService.detect(frameData);

    // Apply smoothing
    const smoothedMetrics = smoother.smooth(rawMetrics);

    // Calculate processing FPS
    frameCount++;
    const elapsed = (Date.now() - fpsStartTime) / 1000;
    const fpsProc = elapsed > 0 ? frameCount / elapsed : 0;

    // Reset FPS counter every 5 seconds
    if (elapsed > 5) {
      frameCount = 0;
      fpsStartTime = Date.now();
    }

    // Estimate quality (simplified for now)
    // DeepFace always detects a face (enforce_detection=False)
    // So we only mark face as lost if confidence is extremely low
    const quality = createDetectionQuality(
      rawMetrics.confidence > 0.3 ? 0.8 : 0.5, // Light quality approximation
      rawMetrics.confidence < 0.05 // Face lost only if confidence is extremely low
    );

    // Extract extended data if available
    const extended = (rawMetrics as any).extended;

    // Send metrics back to main thread
    self.postMessage({
      type: WorkerMessageType.METRICS,
      metrics: smoothedMetrics,
      quality,
      fpsProc,
      extended: extended || undefined,
    });
  } catch (error) {
    self.postMessage({
      type: WorkerMessageType.ERROR,
      code: 'PROCESSING_ERROR',
      message: error instanceof Error ? error.message : 'Processing failed',
    });
  } finally {
    isProcessing = false;
  }
}

function handleStop(): void {
  if (emotionService) {
    emotionService.dispose();
    emotionService = null;
  }

  if (smoother) {
    smoother.reset();
    smoother = null;
  }

  isProcessing = false;
  frameCount = 0;
}

// Export empty object for TypeScript
export {};

