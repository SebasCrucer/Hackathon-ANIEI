import { EmotionMetrics } from '../entities/EmotionMetrics';

/**
 * Interface for temporal smoothing of emotion metrics
 * Uses exponential weighted moving average (EWMA)
 */
export interface ITemporalSmoother {
  /**
   * Initialize the smoother with a time window
   * @param windowSeconds - Time window in seconds for smoothing
   */
  initialize(windowSeconds: number): void;

  /**
   * Add a new metric and get the smoothed result
   */
  smooth(metric: EmotionMetrics): EmotionMetrics;

  /**
   * Reset the smoother state
   */
  reset(): void;

  /**
   * Get the current smoothed value without adding new data
   */
  getCurrent(): EmotionMetrics | null;
}

