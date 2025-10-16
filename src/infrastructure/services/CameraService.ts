import {
  ICameraService,
  CameraCapabilities,
} from '../../domain/repositories/ICameraService';

export class CameraService implements ICameraService {
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  async initialize(constraints?: MediaStreamConstraints): Promise<void> {
    const defaultConstraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 360 },
        frameRate: { ideal: 30, max: 30 },
        facingMode: 'user',
      },
      audio: false,
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      );

      // Create hidden video element
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
      this.videoElement.style.display = 'none';
      document.body.appendChild(this.videoElement);

      // Create canvas for frame capture
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      await this.videoElement.play();
    } catch (error) {
      throw new Error(
        `Failed to initialize camera: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async start(): Promise<void> {
    if (!this.videoElement) {
      throw new Error('Camera not initialized');
    }
    await this.videoElement.play();
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      if (this.videoElement.parentElement) {
        this.videoElement.parentElement.removeChild(this.videoElement);
      }
      this.videoElement = null;
    }

    if (this.canvas) {
      this.canvas = null;
      this.ctx = null;
    }
  }

  captureFrame(): ImageData | null {
    if (!this.videoElement || !this.canvas || !this.ctx) {
      return null;
    }

    if (this.videoElement.readyState !== this.videoElement.HAVE_ENOUGH_DATA) {
      return null;
    }

    // Set canvas size to match video
    this.canvas.width = this.videoElement.videoWidth;
    this.canvas.height = this.videoElement.videoHeight;

    // Draw current video frame to canvas
    this.ctx.drawImage(this.videoElement, 0, 0);

    // Get image data
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  getCapabilities(): CameraCapabilities | null {
    if (!this.videoElement) {
      return null;
    }

    return {
      width: this.videoElement.videoWidth,
      height: this.videoElement.videoHeight,
      frameRate: 30, // Approximation
    };
  }

  isActive(): boolean {
    return this.stream !== null && this.videoElement !== null;
  }
}

