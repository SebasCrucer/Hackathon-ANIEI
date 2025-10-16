import { useEffect, useRef, useCallback } from 'react';
import { EmotionPipeline } from '../../application/services/EmotionPipeline';
import { CameraService } from '../../infrastructure/services/CameraService';
import { QualityMonitor } from '../../application/services/QualityMonitor';
import { useEmotionStore } from '../stores/emotionStore';
import { CameraState } from '../../domain/entities/CameraState';

export const useEmotionPipeline = () => {
  const pipelineRef = useRef<EmotionPipeline | null>(null);
  const qualityMonitorRef = useRef<QualityMonitor>(new QualityMonitor());
  const cameraServiceRef = useRef<CameraService>(new CameraService());

  const {
    setCameraState,
    setMetrics,
    setExtendedData,
    setQuality,
    setTelemetry,
    setError,
    addToHistory,
    cameraState,
  } = useEmotionStore();

  const startCamera = useCallback(async () => {
    // Get API endpoint from environment (for Vercel or Netlify)
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '/api/analyze-emotion';
    
    // For Netlify: '/.netlify/functions/analyze-emotion'
    // For Vercel: '/api/analyze-emotion' (default)

    try {
      setCameraState(CameraState.IDLE);
      setError(null);

      const pipeline = new EmotionPipeline(cameraServiceRef.current, {
        onMetrics: (metrics, quality, extended) => {
          setMetrics(metrics);
          setQuality(quality);
          qualityMonitorRef.current.recordFaceDetection(!quality.faceLost);
          qualityMonitorRef.current.recordConfidence(metrics.confidence);

          // Si hay datos extendidos, guardarlos
          if (extended) {
            setExtendedData({
              dominantEmotion: extended.dominantEmotion,
              emotions: extended.emotions as any,
              stressLevel: extended.stressLevel,
            });

            // Agregar al historial
            addToHistory({
              timestamp: metrics.timestamp,
              valence: metrics.valence,
              intensidad: metrics.arousal,
              confidence: metrics.confidence,
              stressLevel: extended.stressLevel,
              dominantEmotion: extended.dominantEmotion,
              emotions: extended.emotions as any,
            });
          }
        },
        onStateChange: (state) => {
          setCameraState(state);
        },
        onError: (error) => {
          setError(error);
        },
        onFpsUpdate: (fps) => {
          qualityMonitorRef.current.recordFps(fps);
          const stats = qualityMonitorRef.current.getStats();
          setTelemetry({
            fps: stats.averageFps,
            faceDetectedRatio: stats.faceDetectedRatio,
          });
        },
      });

      await pipeline.initialize({
        apiKey: apiEndpoint, // Now it's the endpoint, not the API key
        targetFps: Number(import.meta.env.VITE_TARGET_FPS) || 15,
        smoothingWindow: Number(import.meta.env.VITE_SMOOTHING_WINDOW) || 2.5,
      });

      pipeline.start();
      pipelineRef.current = pipeline;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start camera';
      setError(message);
      setCameraState(CameraState.ERROR);
    }
  }, [setCameraState, setMetrics, setExtendedData, setQuality, setTelemetry, setError, addToHistory]);

  const stopCamera = useCallback(() => {
    if (pipelineRef.current) {
      pipelineRef.current.stop();
      pipelineRef.current = null;
    }
    qualityMonitorRef.current.reset();
    setCameraState(CameraState.IDLE);
  }, [setCameraState]);

  const getVideoElement = useCallback((): HTMLVideoElement | null => {
    return pipelineRef.current?.getVideoElement() || null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pipelineRef.current) {
        pipelineRef.current.stop();
      }
    };
  }, []);

  return {
    startCamera,
    stopCamera,
    getVideoElement,
    isActive: cameraState !== CameraState.IDLE && cameraState !== CameraState.ERROR,
  };
};

