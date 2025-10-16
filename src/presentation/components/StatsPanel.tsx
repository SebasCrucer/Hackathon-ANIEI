import React, { useMemo, useEffect, useState } from 'react';
import { EmotionHistory } from '../../domain/entities/EmotionHistory';

interface StatsPanelProps {
  history: EmotionHistory;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ history }) => {
  // Forzar actualización cada 10 segundos
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 10000); // Actualizar cada 10 segundos
    
    return () => clearInterval(interval);
  }, []);

  const todayStats = useMemo(() => history.getDailyStats(), [history, updateTrigger]);
  const yesterdayStats = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return history.getDailyStats(yesterday);
  }, [history, updateTrigger]);

  const todaySnapshots = useMemo(() => history.getTodaySnapshots(), [history, updateTrigger]);

  // Preparar datos para la gráfica de línea de tiempo
  const timelineData = useMemo(() => {
    if (todaySnapshots.length === 0) return [];

    // Agrupar por hora
    const hourlyData: Record<number, { stress: number[], valence: number[], count: number }> = {};
    
    todaySnapshots.forEach(snapshot => {
      const hour = new Date(snapshot.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { stress: [], valence: [], count: 0 };
      }
      hourlyData[hour].stress.push(snapshot.stressLevel);
      hourlyData[hour].valence.push(snapshot.valence);
      hourlyData[hour].count++;
    });

    // Calcular promedios por hora
    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        avgStress: data.stress.reduce((a, b) => a + b, 0) / data.count,
        avgValence: data.valence.reduce((a, b) => a + b, 0) / data.count,
        count: data.count,
      }))
      .sort((a, b) => a.hour - b.hour);
  }, [todaySnapshots, updateTrigger]);

  if (!todayStats || todaySnapshots.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-xs sm:text-sm">No hay suficientes datos para mostrar estadísticas</p>
        <p className="text-[10px] sm:text-xs mt-2">Las estadísticas aparecerán después de algunas mediciones</p>
      </div>
    );
  }

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      fear: '😰',
      surprise: '😲',
      disgust: '🤢',
      neutral: '😐',
    };
    return emojis[emotion] || '😐';
  };

  const compareWithYesterday = (todayValue: number, yesterdayValue: number | undefined) => {
    if (yesterdayValue === undefined) return null;
    const diff = todayValue - yesterdayValue;
    const percentChange = ((diff / Math.abs(yesterdayValue)) * 100).toFixed(1);
    return {
      diff,
      percent: percentChange,
      isPositive: diff > 0,
    };
  };

  return (
    <div className="space-y-6">
      {/* Resumen del día */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
          📊 Resumen de Hoy
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <div className="text-[10px] sm:text-xs text-gray-600 mb-1">Estrés Promedio</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-700">
              {todayStats.averageStress.toFixed(0)}%
            </div>
            {yesterdayStats && (
              <div className="text-[9px] sm:text-xs text-gray-500 mt-1">
                {(() => {
                  const comp = compareWithYesterday(
                    todayStats.averageStress,
                    yesterdayStats.averageStress
                  );
                  return comp ? (
                    <span className={comp.diff < 0 ? 'text-green-600' : 'text-red-600'}>
                      {comp.diff < 0 ? '↓' : '↑'} {Math.abs(parseFloat(comp.percent))}% vs ayer
                    </span>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
            <div className="text-[10px] sm:text-xs text-gray-600 mb-1">Valencia Promedio</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-700">
              {todayStats.averageValence > 0 ? '+' : ''}
              {todayStats.averageValence.toFixed(2)}
            </div>
            <div className="text-[9px] sm:text-xs text-gray-500 mt-1">
              {todayStats.averageValence > 0.3 ? '😊 Positivo' : 
               todayStats.averageValence < -0.3 ? '😔 Negativo' : '😐 Neutral'}
            </div>
          </div>

          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <div className="text-[10px] sm:text-xs text-gray-600 mb-1">Momento más tranquilo</div>
            <div className="text-base sm:text-xl font-bold text-green-700">
              {todayStats.calmestTime || '--:--'}
            </div>
          </div>

          <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
            <div className="text-[10px] sm:text-xs text-gray-600 mb-1">Pico de estrés</div>
            <div className="text-base sm:text-xl font-bold text-red-700">
              {todayStats.peakStressTime || '--:--'}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de línea de tiempo */}
      <div>
        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
          📈 Evolución del Estrés (por hora)
        </h4>
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <div className="relative h-32 sm:h-40">
            {/* Eje Y */}
            <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 flex flex-col justify-between text-[9px] sm:text-xs text-gray-500">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            {/* Gráfica */}
            <div className="absolute left-8 sm:left-10 right-0 top-0 bottom-6 flex items-end gap-1">
              {timelineData.map((data) => {
                const height = (data.avgStress / 100) * 100;
                const color = data.avgStress > 70 ? 'bg-red-500' :
                             data.avgStress > 40 ? 'bg-yellow-500' : 'bg-green-500';
                
                return (
                  <div key={data.hour} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full ${color} rounded-t transition-all duration-300 hover:opacity-80 relative group`}
                      style={{ height: `${height}%` }}
                      title={`${formatTime(data.hour)}: ${data.avgStress.toFixed(0)}%`}
                    >
                      <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[9px] sm:text-xs px-1 sm:px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {data.avgStress.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Eje X */}
            <div className="absolute left-8 sm:left-10 right-0 bottom-0 h-6 flex justify-between text-[9px] sm:text-xs text-gray-500 overflow-x-auto">
              {timelineData.map(data => (
                <span key={data.hour} className="flex-1 text-center min-w-[20px]">
                  {data.hour}h
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribución de emociones */}
      <div>
        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
          🎭 Distribución de Emociones
        </h4>
        <div className="space-y-2">
          {Object.entries(todayStats.emotionCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([emotion, count]) => {
              const percentage = (count / todayStats.totalMeasurements) * 100;
              return (
                <div key={emotion} className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl w-6 sm:w-8 flex-shrink-0">
                    {getEmotionEmoji(emotion)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px] sm:text-xs mb-1 gap-2">
                      <span className="capitalize text-gray-700 truncate">{emotion}</span>
                      <span className="text-gray-600 flex-shrink-0">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Comparación con ayer */}
      {yesterdayStats && (
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
            📅 Comparación con Ayer
          </h4>
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-700 truncate">Estrés promedio</span>
              <div className="text-right flex-shrink-0">
                <div className="text-xs sm:text-sm font-semibold">
                  Hoy: {todayStats.averageStress.toFixed(0)}% • 
                  Ayer: {yesterdayStats.averageStress.toFixed(0)}%
                </div>
                {(() => {
                  const comp = compareWithYesterday(
                    todayStats.averageStress,
                    yesterdayStats.averageStress
                  );
                  return comp ? (
                    <div className={`text-[10px] sm:text-xs ${comp.diff < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {comp.diff < 0 ? '↓ Mejor' : '↑ Peor'} en {Math.abs(parseFloat(comp.percent))}%
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-700 truncate">Mediciones</span>
              <div className="text-xs sm:text-sm font-semibold flex-shrink-0">
                Hoy: {todayStats.totalMeasurements} • Ayer: {yesterdayStats.totalMeasurements}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-[10px] sm:text-xs text-gray-500 text-center pt-4 border-t">
        Total de mediciones hoy: {todayStats.totalMeasurements}
      </div>
    </div>
  );
};
