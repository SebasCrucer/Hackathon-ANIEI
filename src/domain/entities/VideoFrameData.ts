/**
 * Represents a video frame ready for processing
 */
export interface VideoFrameData {
  imageData: ImageData | Blob;
  timestamp: number;
  roi?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const createVideoFrameData = (
  imageData: ImageData | Blob,
  roi?: { x: number; y: number; width: number; height: number }
): VideoFrameData => {
  return {
    imageData,
    timestamp: Date.now(),
    roi,
  };
};

