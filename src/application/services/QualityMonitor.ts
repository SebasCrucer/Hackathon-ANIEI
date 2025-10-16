/**
 * Monitors quality metrics over time
 */
export interface QualityStats {
  averageFps: number;
  averageLatency: number;
  faceDetectedRatio: number;
  averageConfidence: number;
}

export class QualityMonitor {
  private fpsHistory: number[] = [];
  private latencyHistory: number[] = [];
  private faceDetectedCount: number = 0;
  private totalFrames: number = 0;
  private confidenceSum: number = 0;
  private confidenceCount: number = 0;
  private maxHistorySize: number = 100;

  recordFps(fps: number): void {
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.maxHistorySize) {
      this.fpsHistory.shift();
    }
  }

  recordLatency(latency: number): void {
    this.latencyHistory.push(latency);
    if (this.latencyHistory.length > this.maxHistorySize) {
      this.latencyHistory.shift();
    }
  }

  recordFaceDetection(detected: boolean): void {
    this.totalFrames++;
    if (detected) {
      this.faceDetectedCount++;
    }
  }

  recordConfidence(confidence: number): void {
    this.confidenceSum += confidence;
    this.confidenceCount++;
  }

  getStats(): QualityStats {
    const avgFps =
      this.fpsHistory.length > 0
        ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
        : 0;

    const avgLatency =
      this.latencyHistory.length > 0
        ? this.latencyHistory.reduce((a, b) => a + b, 0) /
          this.latencyHistory.length
        : 0;

    const faceRatio =
      this.totalFrames > 0 ? this.faceDetectedCount / this.totalFrames : 0;

    const avgConfidence =
      this.confidenceCount > 0 ? this.confidenceSum / this.confidenceCount : 0;

    return {
      averageFps: Math.round(avgFps * 10) / 10,
      averageLatency: Math.round(avgLatency),
      faceDetectedRatio: Math.round(faceRatio * 100) / 100,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
    };
  }

  reset(): void {
    this.fpsHistory = [];
    this.latencyHistory = [];
    this.faceDetectedCount = 0;
    this.totalFrames = 0;
    this.confidenceSum = 0;
    this.confidenceCount = 0;
  }
}

