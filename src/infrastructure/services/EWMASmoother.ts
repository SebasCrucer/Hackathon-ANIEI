import { EmotionMetrics } from '../../domain/entities/EmotionMetrics';
import { ITemporalSmoother } from '../../domain/repositories/ITemporalSmoother';

/**
 * Exponential Weighted Moving Average (EWMA) smoother for emotion metrics
 */
export class EWMASmoother implements ITemporalSmoother {
  private alpha: number = 0.3; // Smoothing factor
  private currentSmoothed: EmotionMetrics | null = null;
  private lastTimestamp: number = 0;

  initialize(windowSeconds: number): void {
    // Calculate alpha based on desired time window
    // For EWMA, roughly 95% of weight comes from last (3/alpha) samples
    // So alpha ≈ 3 / (windowSeconds * targetFps)
    // Assuming ~15 FPS, alpha ≈ 3 / (windowSeconds * 15)
    const targetFps = 15;
    this.alpha = Math.min(1, Math.max(0.1, 3 / (windowSeconds * targetFps)));
    this.reset();
  }

  smooth(metric: EmotionMetrics): EmotionMetrics {
    if (!this.currentSmoothed) {
      // First measurement - no smoothing
      this.currentSmoothed = { ...metric };
      this.lastTimestamp = metric.timestamp;
      return this.currentSmoothed;
    }

    // Calculate time-based alpha adjustment
    const timeDelta = (metric.timestamp - this.lastTimestamp) / 1000; // seconds
    const adjustedAlpha = Math.min(1, this.alpha * (1 + timeDelta));

    // Apply EWMA: smoothed = alpha * new + (1 - alpha) * old
    this.currentSmoothed = {
      valence:
        adjustedAlpha * metric.valence +
        (1 - adjustedAlpha) * this.currentSmoothed.valence,
      arousal:
        adjustedAlpha * metric.arousal +
        (1 - adjustedAlpha) * this.currentSmoothed.arousal,
      confidence:
        adjustedAlpha * metric.confidence +
        (1 - adjustedAlpha) * this.currentSmoothed.confidence,
      timestamp: metric.timestamp,
    };

    this.lastTimestamp = metric.timestamp;
    return this.currentSmoothed;
  }

  reset(): void {
    this.currentSmoothed = null;
    this.lastTimestamp = 0;
  }

  getCurrent(): EmotionMetrics | null {
    return this.currentSmoothed ? { ...this.currentSmoothed } : null;
  }
}

