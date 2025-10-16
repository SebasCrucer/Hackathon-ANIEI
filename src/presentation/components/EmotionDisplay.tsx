import React from 'react';

interface EmotionDisplayProps {
  emotions: {
    angry: number;
    disgust: number;
    fear: number;
    happy: number;
    sad: number;
    surprise: number;
    neutral: number;
  } | null;
  dominantEmotion: string | null;
  stressLevel: number | null;
}

const EMOTION_CONFIG = {
  happy: { emoji: '😊', color: 'bg-green-500', label: 'Feliz' },
  sad: { emoji: '😢', color: 'bg-blue-500', label: 'Triste' },
  angry: { emoji: '😠', color: 'bg-red-500', label: 'Enojado' },
  fear: { emoji: '😰', color: 'bg-purple-500', label: 'Miedo' },
  surprise: { emoji: '😲', color: 'bg-yellow-500', label: 'Sorpresa' },
  disgust: { emoji: '🤢', color: 'bg-green-700', label: 'Disgusto' },
  neutral: { emoji: '😐', color: 'bg-gray-500', label: 'Neutral' },
};

export const EmotionDisplay: React.FC<EmotionDisplayProps> = ({
  emotions,
  dominantEmotion,
  stressLevel,
}) => {
  if (!emotions) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p className="text-sm">Esperando detección de emociones...</p>
      </div>
    );
  }

  const getStressColor = (level: number) => {
    if (level > 70) return 'text-red-600';
    if (level > 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStressLabel = (level: number) => {
    if (level > 70) return 'Alto';
    if (level > 40) return 'Moderado';
    return 'Bajo';
  };

  return (
    <div className="space-y-4">
      {/* Emoción Dominante */}
      {dominantEmotion && (
        <div className="text-center pb-4 border-b border-gray-200">
          <div className="text-4xl sm:text-6xl mb-2">
            {EMOTION_CONFIG[dominantEmotion as keyof typeof EMOTION_CONFIG]?.emoji || '😐'}
          </div>
          <p className="text-base sm:text-lg font-semibold text-gray-800">
            {EMOTION_CONFIG[dominantEmotion as keyof typeof EMOTION_CONFIG]?.label || dominantEmotion}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">Emoción dominante</p>
        </div>
      )}

      {/* Nivel de Estrés - Siempre visible */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-semibold text-gray-700">Nivel de Estrés</span>
          <span className={`text-xs sm:text-sm font-bold ${stressLevel !== null ? getStressColor(stressLevel) : 'text-gray-400'}`}>
            {stressLevel !== null ? getStressLabel(stressLevel) : 'Esperando...'}
          </span>
        </div>
        <div className="relative w-full h-5 sm:h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute h-full transition-all duration-500 ${
              stressLevel !== null
                ? stressLevel > 70
                  ? 'bg-red-500'
                  : stressLevel > 40
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                : 'bg-gray-300'
            }`}
            style={{ width: `${stressLevel !== null ? stressLevel : 0}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-800 mix-blend-difference">
              {stressLevel !== null ? `${stressLevel.toFixed(0)}%` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Todas las Emociones */}
      <div className="space-y-2">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
          Desglose de Emociones
        </h4>
        {Object.entries(emotions)
          .sort(([, a], [, b]) => b - a) // Ordenar por valor descendente
          .map(([emotion, value]) => {
            const config = EMOTION_CONFIG[emotion as keyof typeof EMOTION_CONFIG];
            return (
              <div key={emotion} className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl w-6 sm:w-8 flex-shrink-0">{config?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1 gap-2">
                    <span className="text-xs font-medium text-gray-700 truncate">
                      {config?.label}
                    </span>
                    <span className="text-xs text-gray-600 flex-shrink-0">
                      {value.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${config?.color} transition-all duration-300`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
