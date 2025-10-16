import React, { useEffect, useState } from 'react';
import { EmotionHistory } from '../../domain/entities/EmotionHistory';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  icon: string;
}

interface AlertsPanelProps {
  history: EmotionHistory;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ history }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const generateAlerts = () => {
      const newAlerts: Alert[] = [];
      
      // Analizar últimos 5 minutos
      const recentStress = history.getAverageStress(5);
      const trend = history.getStressTrend(10);
      const recentSnapshots = history.getLastNMinutes(5);

      // Alerta de estrés alto
      if (recentStress > 70) {
        newAlerts.push({
          id: 'high-stress',
          type: 'warning',
          title: 'Nivel de estrés alto',
          message: 'Tu nivel de estrés promedio en los últimos 5 minutos es alto. Considera tomar un descanso, hacer respiraciones profundas o dar un paseo corto.',
          icon: '⚠️',
        });
      }

      // Alerta de tendencia creciente de estrés
      if (trend === 'increasing' && recentStress > 50) {
        newAlerts.push({
          id: 'stress-increasing',
          type: 'warning',
          title: 'Estrés en aumento',
          message: 'Tu nivel de estrés está aumentando. Intenta identificar qué está causando tensión y toma medidas para relajarte.',
          icon: '📈',
        });
      }

      // Alerta de emociones negativas prolongadas
      if (recentSnapshots.length > 10) {
        const negativeCount = recentSnapshots.filter(
          s => s.valence < -0.3
        ).length;
        const negativeRatio = negativeCount / recentSnapshots.length;

        if (negativeRatio > 0.7) {
          newAlerts.push({
            id: 'prolonged-negative',
            type: 'warning',
            title: 'Emociones negativas prolongadas',
            message: 'Has experimentado emociones negativas durante un tiempo prolongado. Considera hablar con alguien o hacer una actividad que disfrutes.',
            icon: '😔',
          });
        }
      }

      // Mensaje positivo si está bien
      if (trend === 'decreasing' && recentStress < 40) {
        newAlerts.push({
          id: 'doing-well',
          type: 'success',
          title: '¡Vas muy bien!',
          message: 'Tu nivel de estrés está disminuyendo. Continúa con lo que estás haciendo.',
          icon: '🌟',
        });
      }

      // Recomendación de técnica de respiración
      if (recentStress > 60) {
        newAlerts.push({
          id: 'breathing-exercise',
          type: 'info',
          title: 'Técnica de respiración',
          message: 'Prueba la técnica 4-7-8: Inhala por 4 segundos, mantén por 7, exhala por 8. Repite 4 veces.',
          icon: '🫁',
        });
      }

      // Análisis de productividad (si hay suficientes datos)
      if (recentSnapshots.length > 20) {
        const focusScore = recentSnapshots.filter(
          s => s.arousal > 0.5 && s.valence > 0
        ).length / recentSnapshots.length;

        if (focusScore > 0.6) {
          newAlerts.push({
            id: 'good-focus',
            type: 'success',
            title: 'Buen estado de concentración',
            message: 'Estás en un estado emocional propicio para la productividad. ¡Aprovecha este momento!',
            icon: '🎯',
          });
        }
      }

      setAlerts(newAlerts);
    };

    // Generar alertas cada 30 segundos
    generateAlerts();
    const interval = setInterval(generateAlerts, 30000);

    return () => clearInterval(interval);
  }, [history]);

  if (alerts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">No hay alertas en este momento</p>
        <p className="text-xs mt-2">Las recomendaciones aparecerán basadas en tu histórico</p>
      </div>
    );
  }

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Alertas y Recomendaciones
      </h3>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border-2 ${getAlertStyles(alert.type)} transition-all duration-300`}
        >
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">{alert.icon}</span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
              <p className="text-xs leading-relaxed">{alert.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
