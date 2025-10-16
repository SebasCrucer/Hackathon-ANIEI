import { EmotionMetrics } from '../entities/EmotionMetrics';
import { DetectionQuality } from './DetectionQuality';

/**
 * Message types for Worker communication
 */
export enum WorkerMessageType {
  INIT = 'INIT',
  FRAME = 'FRAME',
  STOP = 'STOP',
  READY = 'READY',
  METRICS = 'METRICS',
  ERROR = 'ERROR',
}

/**
 * Configuration for detector initialization
 */
export interface DetectorConfig {
  apiKey: string;
  targetFps?: number;
  smoothingWindow?: number;
  backend?: 'webgl' | 'webgpu' | 'cpu';
}

/**
 * Messages from UI to Worker
 */
export interface InitMessage {
  type: WorkerMessageType.INIT;
  config: DetectorConfig;
}

export interface FrameMessage {
  type: WorkerMessageType.FRAME;
  timestamp: number;
  imageData: ImageData;
}

export interface StopMessage {
  type: WorkerMessageType.STOP;
}

export type UIToWorkerMessage = InitMessage | FrameMessage | StopMessage;

/**
 * Messages from Worker to UI
 */
export interface ReadyMessage {
  type: WorkerMessageType.READY;
}

export interface MetricsMessage {
  type: WorkerMessageType.METRICS;
  metrics: EmotionMetrics;
  quality: DetectionQuality;
  fpsProc: number;
  extended?: {
    dominantEmotion: string;
    emotions: {
      angry: number;
      disgust: number;
      fear: number;
      happy: number;
      sad: number;
      surprise: number;
      neutral: number;
    };
    stressLevel: number;
  };
}

export interface ErrorMessage {
  type: WorkerMessageType.ERROR;
  code: string;
  message: string;
}

export type WorkerToUIMessage = ReadyMessage | MetricsMessage | ErrorMessage;

