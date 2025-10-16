import { useEmotionStore } from '../stores/emotionStore';
import { useEmotionPipeline } from '../hooks/useEmotionPipeline';
import { usePiP } from '../hooks/usePiP';
import { useAutoPiP } from '../hooks/useAutoPiP';
import { StatusIndicator } from './StatusIndicator';
import { PrivacyBanner } from './PrivacyBanner';
import { AutoPiPBanner } from './AutoPiPBanner';
import { EmotionHUD } from './EmotionHUD';
import { Controls } from './Controls';
import { CameraView } from './CameraView';
import { PiPContent } from './PiPContent';
import { CameraState } from '../../domain/entities/CameraState';

export const App: React.FC = () => {
  const {
    cameraState,
    currentMetrics,
    quality,
    telemetry,
    error,
  } = useEmotionStore();

  const { startCamera, stopCamera, getVideoElement, isActive } =
    useEmotionPipeline();

  const { isPipActive, enterPiP, exitPiP, capabilities, pipWindow } = usePiP();

  // Auto-activate PiP when user switches tabs
  useAutoPiP(
    isActive,
    isPipActive,
    async (videoElement) => {
      console.log('[App] Auto-PiP triggered, calling enterPiP');
      const success = await enterPiP(videoElement);
      if (success) {
        console.log('[App] Auto-PiP success, updating store');
        useEmotionStore.getState().setIsPipActive(true);
      }
      return success;
    },
    getVideoElement
  );

  const handleTogglePiP = async () => {
    if (isPipActive) {
      await exitPiP();
      useEmotionStore.getState().setIsPipActive(false);
    } else {
      const videoElement = getVideoElement();
      const success = await enterPiP(videoElement);
      if (success) {
        useEmotionStore.getState().setIsPipActive(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Emotion Detection MVP
          </h1>
          <p className="text-gray-600">
            Detección de emociones en tiempo real con Valencia y Arousal
          </p>
        </header>

        {/* Privacy Banner */}
        <PrivacyBanner />

        {/* Auto-PiP Banner - shown once to activate auto-PiP */}
        <AutoPiPBanner
          isActive={isActive}
          isPipActive={isPipActive}
          onActivatePiP={handleTogglePiP}
        />

        {/* Status Indicator */}
        <div className="mb-6 flex justify-center">
          <StatusIndicator state={cameraState} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Camera View */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Vista de Cámara
            </h2>
            <CameraView
              videoElement={getVideoElement()}
              show={isActive}
            />
            {!isActive && (
              <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p>Cámara inactiva</p>
                </div>
              </div>
            )}
          </div>

          {/* Emotion HUD */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Métricas de Emoción
            </h2>
            <div id="emotion-hud">
              <EmotionHUD
                metrics={currentMetrics}
                quality={quality}
                telemetry={telemetry}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <Controls
            cameraState={cameraState}
            isPipActive={isPipActive}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
            onTogglePiP={handleTogglePiP}
            pipCapabilities={capabilities}
          />
        </div>

        {/* Info Cards */}
        {cameraState === CameraState.IDLE && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <div className="text-3xl mb-2">😊</div>
                <h3 className="font-semibold text-gray-800 mb-1">Valencia</h3>
                <p className="text-xs text-gray-600">
                  Mide la positividad o negatividad emocional (-1 a 1)
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-800 mb-1">Arousal</h3>
                <p className="text-xs text-gray-600">
                  Mide la intensidad o activación emocional (0 a 1)
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Confianza
                </h3>
                <p className="text-xs text-gray-600">
                  Nivel de certeza en la detección (0 a 1)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            Powered by OpenAI GPT-4 Vision • DDD Architecture • React + TypeScript
          </p>
        </footer>
      </div>

      {/* PiP Content - renders in PiP window when active */}
      {isPipActive && pipWindow && <PiPContent pipWindow={pipWindow} />}
    </div>
  );
};

