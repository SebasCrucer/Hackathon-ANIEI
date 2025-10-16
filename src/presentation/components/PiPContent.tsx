import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useEmotionStore } from '../stores/emotionStore';

interface PiPContentProps {
  pipWindow: Window | null;
}

const EMOTION_CONFIG: Record<string, {emoji: string, label: string}> = {
  happy: { emoji: '😊', label: 'Feliz' },
  sad: { emoji: '😢', label: 'Triste' },
  angry: { emoji: '😠', label: 'Enojado' },
  fear: { emoji: '😰', label: 'Miedo' },
  surprise: { emoji: '��', label: 'Sorpresa' },
  disgust: { emoji: '🤢', label: 'Disgusto' },
  neutral: { emoji: '😐', label: 'Neutral' },
};

export const PiPContent: React.FC<PiPContentProps> = ({ pipWindow }) => {
  const { extendedData, history } = useEmotionStore();

  const lastAlert = useMemo(() => {
    const recentStress = history.getAverageStress(5);
    const trend = history.getStressTrend(10);
    
    if (recentStress > 70) {
      return { icon: '⚠️', message: 'Estrés alto', type: 'warning' };
    }
    if (trend === 'increasing' && recentStress > 50) {
      return { icon: '📈', message: 'Estrés en aumento', type: 'warning' };
    }
    if (trend === 'decreasing' && recentStress < 40) {
      return { icon: '🌟', message: '¡Vas muy bien!', type: 'success' };
    }
    return { icon: '✅', message: 'Todo bien', type: 'info' };
  }, [history]);

  useEffect(() => {
    if (!pipWindow) return;
    const style = pipWindow.document.createElement('style');
    const css = '* { margin: 0; padding: 0; box-sizing: border-box; } body { margin: 0; padding: 16px; font-family: system-ui; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; min-height: 100vh; } #pip-container { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; padding: 20px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); width: 100%; } .pip-emotion { text-align: center; margin-bottom: 20px; } .pip-emoji { font-size: 64px; margin-bottom: 8px; } .pip-emotion-label { font-size: 16px; font-weight: 700; color: #1f2937; } .pip-stress { margin-bottom: 16px; } .pip-stress-label { display: flex; justify-content: space-between; margin-bottom: 8px; } .pip-stress-title { font-size: 12px; font-weight: 600; color: #374151; } .pip-stress-value { font-size: 14px; font-weight: 700; } .stress-low { color: #10b981; } .stress-medium { color: #f59e0b; } .stress-high { color: #ef4444; } .pip-stress-bar { height: 12px; background: rgba(0,0,0,0.1); border-radius: 6px; overflow: hidden; } .pip-stress-fill { height: 100%; border-radius: 6px; transition: width 0.5s ease-out; } .pip-stress-fill.low { background: linear-gradient(90deg, #10b981, #34d399); } .pip-stress-fill.medium { background: linear-gradient(90deg, #f59e0b, #fbbf24); } .pip-stress-fill.high { background: linear-gradient(90deg, #ef4444, #f87171); } .pip-alert { background: rgba(255,255,255,0.6); border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 10px; } .pip-alert.warning { background: rgba(251,191,36,0.2); border: 1.5px solid #f59e0b; } .pip-alert.success { background: rgba(16,185,129,0.2); border: 1.5px solid #10b981; } .pip-alert.info { background: rgba(59,130,246,0.2); border: 1.5px solid #3b82f6; } .pip-alert-icon { font-size: 24px; } .pip-alert-message { font-size: 12px; font-weight: 600; color: #1f2937; flex: 1; } .waiting { text-align: center; padding: 30px 10px; color: #6b7280; } .waiting-icon { font-size: 48px; margin-bottom: 12px; } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } } .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }';
    style.textContent = css;
    pipWindow.document.head.appendChild(style);
  }, [pipWindow]);

  if (!pipWindow) return null;

  let container = pipWindow.document.getElementById('pip-container');
  if (!container) {
    container = pipWindow.document.createElement('div');
    container.id = 'pip-container';
    pipWindow.document.body.appendChild(container);
  }

  const getStressClass = (level: number) => {
    if (level > 70) return 'high';
    if (level > 40) return 'medium';
    return 'low';
  };

  const getStressLabel = (level: number) => {
    if (level > 70) return 'Alto';
    if (level > 40) return 'Moderado';
    return 'Bajo';
  };

  const config = extendedData ? EMOTION_CONFIG[extendedData.dominantEmotion] || EMOTION_CONFIG.neutral : EMOTION_CONFIG.neutral;

  return createPortal(
    <div>
      {extendedData ? (
        <>
          <div className="pip-emotion">
            <div className="pip-emoji">{config.emoji}</div>
            <div className="pip-emotion-label">{config.label}</div>
          </div>
          <div className="pip-stress">
            <div className="pip-stress-label">
              <span className="pip-stress-title">Nivel de Estrés</span>
              <span className={'pip-stress-value stress-' + getStressClass(extendedData.stressLevel)}>
                {getStressLabel(extendedData.stressLevel)}
              </span>
            </div>
            <div className="pip-stress-bar">
              <div
                className={'pip-stress-fill ' + getStressClass(extendedData.stressLevel)}
                style={{ width: extendedData.stressLevel + '%' }}
              />
            </div>
          </div>
          <div className={'pip-alert ' + lastAlert.type}>
            <div className="pip-alert-icon">{lastAlert.icon}</div>
            <div className="pip-alert-message">{lastAlert.message}</div>
          </div>
        </>
      ) : (
        <div className="waiting">
          <div className="waiting-icon pulse">🎭</div>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>Esperando datos...</div>
        </div>
      )}
    </div>,
    container
  );
};
