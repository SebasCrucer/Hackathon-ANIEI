import { create } from 'zustand';
import { EmotionMetrics } from '../../domain/entities/EmotionMetrics';
import { CameraState } from '../../domain/entities/CameraState';
import { DetectionQuality } from '../../domain/value-objects/DetectionQuality';

interface Telemetry {
  fps: number;
  latency: number;
  faceDetectedRatio: number;
}

interface EmotionStore {
  // State
  cameraState: CameraState;
  currentMetrics: EmotionMetrics | null;
  quality: DetectionQuality | null;
  telemetry: Telemetry;
  isPipActive: boolean;
  error: string | null;

  // Actions
  setCameraState: (state: CameraState) => void;
  setMetrics: (metrics: EmotionMetrics) => void;
  setQuality: (quality: DetectionQuality) => void;
  setTelemetry: (telemetry: Partial<Telemetry>) => void;
  setIsPipActive: (active: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  cameraState: CameraState.IDLE,
  currentMetrics: null,
  quality: null,
  telemetry: {
    fps: 0,
    latency: 0,
    faceDetectedRatio: 0,
  },
  isPipActive: false,
  error: null,
};

export const useEmotionStore = create<EmotionStore>((set) => ({
  ...initialState,

  setCameraState: (cameraState) => set({ cameraState }),

  setMetrics: (currentMetrics) => set({ currentMetrics }),

  setQuality: (quality) => set({ quality }),

  setTelemetry: (newTelemetry) =>
    set((state) => ({
      telemetry: { ...state.telemetry, ...newTelemetry },
    })),

  setIsPipActive: (isPipActive) => set({ isPipActive }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

