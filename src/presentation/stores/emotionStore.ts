import { create } from 'zustand';
import { EmotionMetrics } from '../../domain/entities/EmotionMetrics';
import { CameraState } from '../../domain/entities/CameraState';
import { DetectionQuality } from '../../domain/value-objects/DetectionQuality';
import { EmotionHistory, EmotionSnapshot } from '../../domain/entities/EmotionHistory';

interface Telemetry {
  fps: number;
  latency: number;
  faceDetectedRatio: number;
}

interface ExtendedEmotionData {
  dominantEmotion: string;
  emotions: {
    angry: number;
    disgust: number;
    fear: number;
    happy: number;
    sad: number;
    surprise: number;
    neutral: number;
  };
  stressLevel: number;
}

interface EmotionStore {
  // State
  cameraState: CameraState;
  currentMetrics: EmotionMetrics | null;
  extendedData: ExtendedEmotionData | null;
  quality: DetectionQuality | null;
  telemetry: Telemetry;
  isPipActive: boolean;
  error: string | null;
  history: EmotionHistory;
  smoothedStress: number; // Estrés suavizado

  // Actions
  setCameraState: (state: CameraState) => void;
  setMetrics: (metrics: EmotionMetrics) => void;
  setExtendedData: (data: ExtendedEmotionData) => void;
  setQuality: (quality: DetectionQuality) => void;
  setTelemetry: (telemetry: Partial<Telemetry>) => void;
  setIsPipActive: (active: boolean) => void;
  setError: (error: string | null) => void;
  addToHistory: (snapshot: EmotionSnapshot) => void;
  reset: () => void;
}

const emotionHistory = new EmotionHistory();
emotionHistory.loadFromLocalStorage();

const initialState = {
  cameraState: CameraState.IDLE,
  currentMetrics: null,
  extendedData: null,
  quality: null,
  telemetry: {
    fps: 0,
    latency: 0,
    faceDetectedRatio: 0,
  },
  isPipActive: false,
  error: null,
  history: emotionHistory,
  smoothedStress: 0, // Inicializar el estrés suavizado
};

export const useEmotionStore = create<EmotionStore>((set, get) => ({
  ...initialState,

  setCameraState: (cameraState) => set({ cameraState }),

  setMetrics: (currentMetrics) => set({ currentMetrics }),

  setExtendedData: (extendedData) => {
    const { smoothedStress } = get();
    
    // Suavizar el nivel de estrés usando EWMA (Exponentially Weighted Moving Average)
    // Alpha = 0.15 significa que el nuevo valor tiene 15% de peso y el histórico 85%
    // Esto crea una transición MUY suave y progresiva (menos fluctuaciones)
    const alpha = 0.05;
    const newSmoothedStress = smoothedStress === 0 
      ? extendedData.stressLevel // Primera vez, usar el valor directo
      : alpha * extendedData.stressLevel + (1 - alpha) * smoothedStress;
    
    // Actualizar con el estrés suavizado
    set({ 
      extendedData: {
        ...extendedData,
        stressLevel: Math.round(newSmoothedStress) // Redondear para evitar decimales
      },
      smoothedStress: newSmoothedStress
    });
  },

  setQuality: (quality) => set({ quality }),

  setTelemetry: (newTelemetry) =>
    set((state) => ({
      telemetry: { ...state.telemetry, ...newTelemetry },
    })),

  setIsPipActive: (isPipActive) => set({ isPipActive }),

  setError: (error) => set({ error }),

  addToHistory: (snapshot) => {
    const { history } = get();
    history.addSnapshot(snapshot);
    // Guardar en localStorage cada 10 snapshots
    if (history.getSnapshots().length % 10 === 0) {
      history.saveToLocalStorage();
    }
  },

  reset: () => set(initialState),
}));

