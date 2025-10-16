import React, { useMemo, useEffect, useState } from 'react';
import { EmotionMetrics } from '../../domain/entities/EmotionMetrics';
import { DetectionQuality } from '../../domain/value-objects/DetectionQuality';
import { EmotionHistory } from '../../domain/entities/EmotionHistory';

interface MetricsChartProps {
  metrics: EmotionMetrics | null;
  quality: DetectionQuality | null;
  telemetry: {
    fps: number;
    latency: number;
    faceDetectedRatio: number;
  };
  history: EmotionHistory;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  metrics,
  quality,
  telemetry,
  history,
}) => {
  // Forzar actualización cada 5 segundos
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 5000); // Actualizar cada 5 segundos
    
    return () => clearInterval(interval);
  }, []);

  // Obtener últimos N minutos de datos
  const timelineData = useMemo(() => {
    const snapshots = history.getLastNMinutes(10); // Últimos 10 minutos
    
    if (snapshots.length === 0) return [];

    // Agrupar por minutos
    const grouped: Record<number, { valence: number[], intensidad: number[], count: number }> = {};
    
    snapshots.forEach(snapshot => {
      const minute = Math.floor((Date.now() - snapshot.timestamp) / (60 * 1000));
      if (!grouped[minute]) {
        grouped[minute] = { valence: [], intensidad: [], count: 0 };
      }
      grouped[minute].valence.push(snapshot.valence);
      grouped[minute].intensidad.push(snapshot.intensidad);
      grouped[minute].count++;
    });

    // Calcular promedios
    return Object.entries(grouped)
      .map(([minute, data]) => ({
        minutesAgo: parseInt(minute),
        avgValence: data.valence.reduce((a, b) => a + b, 0) / data.count,
        avgIntensidad: data.intensidad.reduce((a, b) => a + b, 0) / data.count,
        count: data.count,
      }))
      .sort((a, b) => b.minutesAgo - a.minutesAgo) // Más antiguo primero
      .slice(0, 10);
  }, [history, updateTrigger]); // Incluir updateTrigger para forzar recálculo

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

  const getIntensidadLabel = (intensidad: number) => {
    if (intensidad > 0.7) return '🔥 Muy activado';
    if (intensidad > 0.4) return '⚡ Activado';
    return '😌 Calmado';
  };

  const valencePercent = ((metrics.valence + 1) / 2) * 100;
  const arousalPercent = metrics.arousal * 100;
  const confidencePercent = metrics.confidence * 100;

  return (
    <div className="space-y-6">
      {/* Valores actuales */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-lg">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">📊 Valores Actuales</h3>
        
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {formatValue(metrics.valence)}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600 mt-1">Valencia</div>
            <div className="text-[9px] sm:text-xs text-gray-500 hidden sm:block">{getValenceLabel(metrics.valence)}</div>
          </div>
          
          <div>
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              {formatValue(metrics.arousal)}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600 mt-1">Intensidad</div>
            <div className="text-[9px] sm:text-xs text-gray-500 hidden sm:block">{getIntensidadLabel(metrics.arousal)}</div>
          </div>
          
          <div>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {confidencePercent.toFixed(0)}%
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600 mt-1">Confianza</div>
            <div className="text-[9px] sm:text-xs text-gray-500 hidden sm:block">
              {metrics.confidence > 0.7 ? 'Alta' : metrics.confidence > 0.4 ? 'Media' : 'Baja'}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas de línea temporal */}
      {timelineData.length > 0 && (
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
            📈 Evolución (Últimos {timelineData[0].minutesAgo + 1} minutos)
          </h3>
          
          {/* Gráfica de Valencia */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] sm:text-xs font-medium text-gray-700">Valencia</span>
              <span className="text-[10px] sm:text-xs text-gray-500">(-1 a +1)</span>
            </div>
            <div className="relative h-24 sm:h-32 bg-gray-50 rounded-lg p-2 sm:p-3">
              {/* Línea central (0) */}
              <div className="absolute left-3 right-3 top-1/2 border-t border-gray-300 border-dashed" />
              
              {/* Gráfica */}
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points={timelineData
                    .map((d, i) => {
                      const x = (i / (timelineData.length - 1 || 1)) * 100;
                      const y = 50 - (d.avgValence * 40); // Convertir -1,1 a 90,10
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Puntos */}
                {timelineData.map((d, i) => {
                  const x = (i / (timelineData.length - 1 || 1)) * 100;
                  const y = 50 - (d.avgValence * 40);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="2"
                      fill="#3b82f6"
                    />
                  );
                })}
              </svg>
              
              {/* Etiquetas del eje X */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] sm:text-xs text-gray-500 px-2 sm:px-3">
                <span>-{timelineData[0]?.minutesAgo}m</span>
                <span>Ahora</span>
              </div>
            </div>
          </div>

          {/* Gráfica de Intensidad */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] sm:text-xs font-medium text-gray-700">Intensidad</span>
              <span className="text-[10px] sm:text-xs text-gray-500">(0 a 1)</span>
            </div>
            <div className="relative h-24 sm:h-32 bg-gray-50 rounded-lg p-2 sm:p-3">
              {/* Gráfica */}
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points={timelineData
                    .map((d, i) => {
                      const x = (i / (timelineData.length - 1 || 1)) * 100;
                      const y = 100 - (d.avgIntensidad * 90); // Convertir 0,1 a 100,10
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Puntos */}
                {timelineData.map((d, i) => {
                  const x = (i / (timelineData.length - 1 || 1)) * 100;
                  const y = 100 - (d.avgIntensidad * 90);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="2"
                      fill="#8b5cf6"
                    />
                  );
                })}
              </svg>
              
              {/* Etiquetas del eje X */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] sm:text-xs text-gray-500 px-2 sm:px-3">
                <span>-{timelineData[0]?.minutesAgo}m</span>
                <span>Ahora</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {timelineData.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-xs sm:text-sm">
          <p>📊 Acumulando datos...</p>
          <p className="text-[10px] sm:text-xs mt-2">Las gráficas aparecerán después de algunos minutos</p>
        </div>
      )}

      {/* Barras actuales (referencia visual) */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Niveles Actuales</h3>
        
        {/* Valencia */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] sm:text-xs font-medium text-gray-700">Valencia</span>
            <span className="text-[10px] sm:text-xs text-gray-600">{formatValue(metrics.valence)}</span>
          </div>
          <div className="relative w-full h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full transition-all duration-300"
              style={{
                width: `${valencePercent}%`,
                background: `linear-gradient(to right, ${metrics.valence < 0 ? '#ef4444' : '#22c55e'} 0%, ${metrics.valence < 0 ? '#f87171' : '#4ade80'} 100%)`,
              }}
            />
          </div>
        </div>

        {/* Intensidad */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] sm:text-xs font-medium text-gray-700">Intensidad</span>
            <span className="text-[10px] sm:text-xs text-gray-600">{formatValue(metrics.arousal)}</span>
          </div>
          <div className="relative w-full h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
              style={{ width: `${arousalPercent}%` }}
            />
          </div>
        </div>

        {/* Confidence */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] sm:text-xs font-medium text-gray-700">Confianza</span>
            <span className="text-[10px] sm:text-xs text-gray-600">{confidencePercent.toFixed(0)}%</span>
          </div>
          <div className="relative w-full h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute h-full transition-all duration-300 ${
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
      </div>

      {/* Quality indicators */}
      {quality && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex gap-3 text-[10px] sm:text-xs text-gray-600">
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
      <div className="pt-3 border-t border-gray-200">
        <div className="text-[10px] sm:text-xs text-gray-500 space-y-1">
          <div>Procesamiento: {telemetry.fps.toFixed(1)} FPS</div>
          <div>Detección: {(telemetry.faceDetectedRatio * 100).toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
};
