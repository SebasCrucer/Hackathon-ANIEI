import { EmotionMetrics } from '../entities/EmotionMetrics';
import { VideoFrameData } from '../entities/VideoFrameData';
import { DetectorConfig } from '../value-objects/WorkerMessage';

/**
 * Interface for emotion detection services
 * Can be implemented by OpenAI, ONNX, or any other detector
 */
export interface IEmotionDetector {
  /**
   * Initialize the detector with configuration
   */
  initialize(config: DetectorConfig): Promise<void>;

  /**
   * Detect emotions from a video frame
   */
  detect(frame: VideoFrameData): Promise<EmotionMetrics>;

  /**
   * Check if the detector is ready to process frames
   */
  isReady(): boolean;

  /**
   * Clean up resources
   */
  dispose(): Promise<void>;
}

