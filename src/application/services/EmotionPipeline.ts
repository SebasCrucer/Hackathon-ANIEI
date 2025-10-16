import { ICameraService } from '../../domain/repositories/ICameraService';
import {
  WorkerMessageType,
  WorkerToUIMessage,
  DetectorConfig,
} from '../../domain/value-objects/WorkerMessage';
import { EmotionMetrics } from '../../domain/entities/EmotionMetrics';
import { DetectionQuality } from '../../domain/value-objects/DetectionQuality';
import { CameraState } from '../../domain/entities/CameraState';

export interface PipelineCallbacks {
  onMetrics: (
    metrics: EmotionMetrics, 
    quality: DetectionQuality, 
    extended?: {
      dominantEmotion: string;
      emotions: Record<string, number>;
      stressLevel: number;
    }
  ) => void;
  onStateChange: (state: CameraState) => void;
  onError: (error: string) => void;
  onFpsUpdate: (fps: number) => void;
}

export class EmotionPipeline {
  private worker: Worker | null = null;
  private cameraService: ICameraService;
  private callbacks: PipelineCallbacks;
  private frameLoopId: number | null = null;
  private lastFrameTime: number = 0;
  private targetFrameInterval: number = 66; // ~15 FPS
  private isRunning: boolean = false;

  constructor(cameraService: ICameraService, callbacks: PipelineCallbacks) {
    this.cameraService = cameraService;
    this.callbacks = callbacks;
  }

  async initialize(config: DetectorConfig): Promise<void> {
    try {
      // Initialize camera
      await this.cameraService.initialize();
      await this.cameraService.start();

      // Create and initialize worker
      this.worker = new Worker(
        new URL('../../infrastructure/workers/emotion-worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Setup worker message handler
      this.worker.onmessage = (event: MessageEvent<WorkerToUIMessage>) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.callbacks.onError('Worker error: ' + error.message);
        this.callbacks.onStateChange(CameraState.ERROR);
      };

      // Send init message to worker
      this.worker.postMessage({
        type: WorkerMessageType.INIT,
        config,
      });

      // Wait for worker ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Worker initialization timeout'));
        }, 10000);

        const originalHandler = this.worker!.onmessage;
        this.worker!.onmessage = (event: MessageEvent<WorkerToUIMessage>) => {
          if (event.data.type === WorkerMessageType.READY) {
            clearTimeout(timeout);
            this.worker!.onmessage = originalHandler;
            resolve();
          }
          if (originalHandler && this.worker) {
            originalHandler.call(this.worker, event);
          }
        };
      });

      this.callbacks.onStateChange(CameraState.RUNNING);
    } catch (error) {
      this.callbacks.onError(
        error instanceof Error ? error.message : 'Initialization failed'
      );
      this.callbacks.onStateChange(CameraState.ERROR);
      throw error;
    }
  }

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.startFrameLoop();
  }

  stop(): void {
    this.isRunning = false;

    if (this.frameLoopId !== null) {
      cancelAnimationFrame(this.frameLoopId);
      this.frameLoopId = null;
    }

    if (this.worker) {
      this.worker.postMessage({ type: WorkerMessageType.STOP });
      this.worker.terminate();
      this.worker = null;
    }

    this.cameraService.stop();
    this.callbacks.onStateChange(CameraState.IDLE);
  }

  private startFrameLoop(): void {
    const loop = () => {
      if (!this.isRunning) return;

      const now = performance.now();
      const elapsed = now - this.lastFrameTime;

      // Throttle to target FPS
      if (elapsed >= this.targetFrameInterval) {
        this.processFrame();
        this.lastFrameTime = now;
      }

      this.frameLoopId = requestAnimationFrame(loop);
    };

    loop();
  }

  private processFrame(): void {
    if (!this.worker || !this.cameraService.isActive()) {
      return;
    }

    const frameData = this.cameraService.captureFrame();
    if (!frameData) {
      return;
    }

    // Send frame to worker
    this.worker.postMessage({
      type: WorkerMessageType.FRAME,
      timestamp: Date.now(),
      imageData: frameData,
    });
  }

  private handleWorkerMessage(message: WorkerToUIMessage): void {
    switch (message.type) {
      case WorkerMessageType.READY:
        // Already handled during initialization
        break;

      case WorkerMessageType.METRICS:
        this.callbacks.onMetrics(message.metrics, message.quality, message.extended);
        this.callbacks.onFpsUpdate(message.fpsProc);

        // Update state based on quality
        if (message.quality.faceLost) {
          this.callbacks.onStateChange(CameraState.NO_FACE);
        } else if (message.quality.light < 0.3) {
          this.callbacks.onStateChange(CameraState.LOW_LIGHT);
        } else {
          this.callbacks.onStateChange(CameraState.RUNNING);
        }
        break;

      case WorkerMessageType.ERROR:
        this.callbacks.onError(`${message.code}: ${message.message}`);
        break;

      default:
        console.warn('Unknown worker message:', message);
    }
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.cameraService.getVideoElement();
  }
}

