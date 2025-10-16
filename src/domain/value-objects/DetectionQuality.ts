/**
 * Quality metrics for the detection process
 */
export interface DetectionQuality {
  light: number;      // Light quality [0, 1]
  faceLost: boolean;  // True if face was lost in this frame
  blur?: number;      // Optional: blur level [0, 1]
}

export const createDetectionQuality = (
  light: number,
  faceLost: boolean,
  blur?: number
): DetectionQuality => {
  return {
    light: Math.max(0, Math.min(1, light)),
    faceLost,
    blur: blur !== undefined ? Math.max(0, Math.min(1, blur)) : undefined,
  };
};

export const isQualityGood = (quality: DetectionQuality): boolean => {
  return quality.light >= 0.3 && !quality.faceLost;
};

