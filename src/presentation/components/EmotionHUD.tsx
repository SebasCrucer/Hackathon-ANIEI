import { EmotionMetrics } from '../../domain/entities/EmotionMetrics';
import { DetectionQuality } from '../../domain/value-objects/DetectionQuality';

interface EmotionHUDProps {
  metrics: EmotionMetrics | null;
  quality: DetectionQuality | null;
  telemetry: {
    fps: number;
    latency: number;
    faceDetectedRatio: number;
  };
}

export const EmotionHUD: React.FC<EmotionHUDProps> = ({
  metrics,
  quality,
  telemetry,
}) => {
  if (!metrics) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Esperando métricas...</p>
      </div>
    );
  }

  const formatValue = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const getValenceLabel = (valence: number) => {
    if (valence > 0.3) return '😊 Positivo';
    if (valence < -0.3) return '😔 Negativo';
    return '😐 Neutral';
  };

  const getArousalLabel = (arousal: number) => {
    if (arousal > 0.7) return '🔥 Muy activado';
    if (arousal > 0.4) return '⚡ Activado';
    return '😌 Calmado';
  };

  // Convert valence from [-1, 1] to [0, 100] for progress bar
  const valencePercent = ((metrics.valence + 1) / 2) * 100;
  // Arousal is already [0, 1]
  const arousalPercent = metrics.arousal * 100;
  const confidencePercent = metrics.confidence * 100;

  return (
    <div className="space-y-4">
      {/* Valence */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Valencia</span>
          <span className="text-xs text-gray-600">
            {getValenceLabel(metrics.valence)}
          </span>
        </div>
        <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full transition-all duration-300 ease-out"
            style={{
              width: `${valencePercent}%`,
              background: `linear-gradient(to right, 
                ${metrics.valence < 0 ? '#ef4444' : '#22c55e'} 0%, 
                ${metrics.valence < 0 ? '#f87171' : '#4ade80'} 100%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-800 mix-blend-difference">
              {formatValue(metrics.valence)}
            </span>
          </div>
        </div>
      </div>

      {/* Arousal */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Arousal</span>
          <span className="text-xs text-gray-600">
            {getArousalLabel(metrics.arousal)}
          </span>
        </div>
        <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${arousalPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-800 mix-blend-difference">
              {formatValue(metrics.arousal)}
            </span>
          </div>
        </div>
      </div>

      {/* Confidence */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Confianza
          </span>
          <span className="text-xs text-gray-600">
            {confidencePercent.toFixed(0)}%
          </span>
        </div>
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute h-full transition-all duration-300 ease-out ${
              metrics.confidence > 0.7
                ? 'bg-green-500'
                : metrics.confidence > 0.4
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      {/* Quality indicators */}
      {quality && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span>💡</span>
              <span>Luz: {(quality.light * 100).toFixed(0)}%</span>
            </div>
            {quality.faceLost && (
              <div className="flex items-center gap-1 text-orange-600">
                <span>⚠️</span>
                <span>Rostro perdido</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Telemetry */}
      <div className="pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Procesamiento: {telemetry.fps.toFixed(1)} FPS</div>
          <div>
            Detección: {(telemetry.faceDetectedRatio * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};

