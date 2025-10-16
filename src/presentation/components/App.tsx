import { useEmotionStore } from '../stores/emotionStore';
import { useEmotionPipeline } from '../hooks/useEmotionPipeline';
import { usePiP } from '../hooks/usePiP';
import { useAutoPiP } from '../hooks/useAutoPiP';
import { StatusIndicator } from './StatusIndicator';
import { AutoPiPBanner } from './AutoPiPBanner';
import { MetricsChart } from './MetricsChart';
import { EmotionDisplay } from './EmotionDisplay';
import { AlertsPanel } from './AlertsPanel';
import { StatsPanel } from './StatsPanel';
import { Controls } from './Controls';
import { CameraView } from './CameraView';
import { PiPContent } from './PiPContent';
import { CameraState } from '../../domain/entities/CameraState';
import { useState } from 'react';

type TabType = 'metrics' | 'emotions' | 'alerts' | 'stats';

export const App: React.FC = () => {
  const {
    cameraState,
    currentMetrics,
    extendedData,
    quality,
    telemetry,
    error,
    history,
  } = useEmotionStore();

  const [activeTab, setActiveTab] = useState<TabType>('emotions');

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
            <img 
              src="/logo.svg" 
              alt="RITMO Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16"
            />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">
              RITMO
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Sistema de Detección Emocional en Tiempo Real
          </p>
        </header>

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
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-red-400"
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
                <p className="text-xs sm:text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Camera View */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
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
                    className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2"
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
                  <p className="text-sm">Cámara inactiva</p>
                </div>
              </div>
            )}
          </div>

          {/* Emotion HUD */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              Análisis Emocional
            </h2>
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('emotions')}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'emotions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="hidden sm:inline">🎭 Emociones</span>
                <span className="sm:hidden">🎭</span>
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'metrics'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="hidden sm:inline">📊 Métricas</span>
                <span className="sm:hidden">📊</span>
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'alerts'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="hidden sm:inline">🔔 Alertas</span>
                <span className="sm:hidden">🔔</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'stats'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="hidden sm:inline">📈 Estadísticas</span>
                <span className="sm:hidden">📈</span>
              </button>
            </div>

            {/* Tab Content */}
            <div id="emotion-content" className="min-h-[300px] sm:min-h-[400px] overflow-x-hidden">
              {activeTab === 'emotions' && (
                <EmotionDisplay
                  emotions={extendedData?.emotions || null}
                  dominantEmotion={extendedData?.dominantEmotion || null}
                  stressLevel={extendedData?.stressLevel || null}
                />
              )}
              {activeTab === 'metrics' && (
                <MetricsChart
                  metrics={currentMetrics}
                  quality={quality}
                  telemetry={telemetry}
                  history={history}
                />
              )}
              {activeTab === 'alerts' && (
                <AlertsPanel history={history} />
              )}
              {activeTab === 'stats' && (
                <StatsPanel history={history} />
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
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
          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-2">😊</div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">Valencia</h3>
                <p className="text-[10px] sm:text-xs text-gray-600">
                  Mide la positividad o negatividad emocional (-1 a 1)
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-2">⚡</div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">Intensidad</h3>
                <p className="text-[10px] sm:text-xs text-gray-600">
                  Mide la intensidad o activación emocional (0 a 1)
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-2">🎯</div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">
                  Confianza
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-600">
                  Nivel de certeza en la detección (0 a 1)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
          <p>
            Powered by DeepFace • DDD Architecture • React + TypeScript
          </p>
        </footer>
      </div>

      {/* PiP Content - renders in PiP window when active */}
      {isPipActive && pipWindow && <PiPContent pipWindow={pipWindow} />}
    </div>
  );
};

