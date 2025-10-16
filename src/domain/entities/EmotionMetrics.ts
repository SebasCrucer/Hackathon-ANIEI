/**
 * Core emotion metrics detected from a face
 * valence: emotional positivity/negativity [-1, 1]
 * arousal: emotional intensity/activation [0, 1]
 * confidence: detection confidence [0, 1]
 */
export interface EmotionMetrics {
  valence: number;    // -1 (negative) to 1 (positive)
  arousal: number;    // 0 (calm) to 1 (excited)
  confidence: number; // 0 (uncertain) to 1 (certain)
  timestamp: number;  // milliseconds since epoch
}

export const createEmotionMetrics = (
  valence: number,
  arousal: number,
  confidence: number
): EmotionMetrics => {
  return {
    valence: Math.max(-1, Math.min(1, valence)),
    arousal: Math.max(0, Math.min(1, arousal)),
    confidence: Math.max(0, Math.min(1, confidence)),
    timestamp: Date.now(),
  };
};

