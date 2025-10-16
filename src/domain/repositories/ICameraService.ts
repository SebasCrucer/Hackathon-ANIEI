/**
 * Interface for camera capture service
 */
export interface CameraCapabilities {
  width: number;
  height: number;
  frameRate: number;
}

export interface ICameraService {
  /**
   * Initialize and request camera permissions
   */
  initialize(constraints?: MediaStreamConstraints): Promise<void>;

  /**
   * Start capturing video
   */
  start(): Promise<void>;

  /**
   * Stop capturing and release camera
   */
  stop(): void;

  /**
   * Capture a single frame as ImageData
   */
  captureFrame(): ImageData | null;

  /**
   * Get the video element for display/PiP
   */
  getVideoElement(): HTMLVideoElement | null;

  /**
   * Get current camera capabilities
   */
  getCapabilities(): CameraCapabilities | null;

  /**
   * Check if camera is currently active
   */
  isActive(): boolean;
}

