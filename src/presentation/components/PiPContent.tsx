import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEmotionStore } from '../stores/emotionStore';

interface PiPContentProps {
  pipWindow: Window | null;
}

export const PiPContent: React.FC<PiPContentProps> = ({ pipWindow }) => {
  const { currentMetrics } = useEmotionStore();

  // Setup minimal styles in PiP window
  useEffect(() => {
    if (!pipWindow) return;

    const style = pipWindow.document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        padding: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }
      
      #pip-container {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        width: 100%;
        max-width: 100%;
      }
      
      .pip-header {
        text-align: center;
        margin-bottom: 14px;
        padding-bottom: 10px;
        border-bottom: 1.5px solid rgba(102, 126, 234, 0.2);
      }
      
      .pip-title {
        font-size: 14px;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 2px;
      }
      
      .pip-subtitle {
        font-size: 10px;
        color: #6b7280;
      }
      
      .metric-row {
        margin-bottom: 12px;
      }
      
      .metric-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      
      .metric-name {
        font-size: 11px;
        font-weight: 600;
        color: #374151;
      }
      
      .metric-value {
        font-size: 16px;
        font-weight: 700;
        color: #111827;
        font-variant-numeric: tabular-nums;
      }
      
      .metric-bar {
        height: 8px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      }
      
      .metric-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease-out, background 0.3s ease-out;
      }
      
      .valence-fill {
        background: linear-gradient(90deg, #ef4444 0%, #10b981 100%);
      }
      
      .arousal-fill {
        background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
      }
      
      .confidence-fill {
        background: linear-gradient(90deg, #f59e0b 0%, #10b981 100%);
      }
      
      .waiting {
        text-align: center;
        padding: 20px 10px;
        color: #6b7280;
      }
      
      .waiting-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `;
    pipWindow.document.head.appendChild(style);
  }, [pipWindow]);

  if (!pipWindow) return null;

  // Create container in PiP window if not exists
  let container = pipWindow.document.getElementById('pip-container');
  if (!container) {
    container = pipWindow.document.createElement('div');
    container.id = 'pip-container';
    pipWindow.document.body.appendChild(container);
  }

  const formatValue = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const getValenceEmoji = (valence: number) => {
    if (valence > 0.3) return '😊';
    if (valence < -0.3) return '😔';
    return '😐';
  };

  const getArousalEmoji = (arousal: number) => {
    if (arousal > 0.7) return '🔥';
    if (arousal > 0.4) return '⚡';
    return '😌';
  };

  // Render minimal HUD into PiP window using Portal
  return createPortal(
    <>
      <div className="pip-header">
        <div className="pip-title">Emotion Monitor</div>
        <div className="pip-subtitle">Live Tracking</div>
      </div>

      {currentMetrics ? (
        <>
          {/* Valencia */}
          <div className="metric-row">
            <div className="metric-label">
              <span className="metric-name">
                {getValenceEmoji(currentMetrics.valence)} Valencia
              </span>
              <span className="metric-value">
                {formatValue(currentMetrics.valence)}
              </span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill valence-fill"
                style={{
                  width: `${((currentMetrics.valence + 1) / 2) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Arousal */}
          <div className="metric-row">
            <div className="metric-label">
              <span className="metric-name">
                {getArousalEmoji(currentMetrics.arousal)} Arousal
              </span>
              <span className="metric-value">
                {formatValue(currentMetrics.arousal)}
              </span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill arousal-fill"
                style={{
                  width: `${currentMetrics.arousal * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Confidence */}
          <div className="metric-row">
            <div className="metric-label">
              <span className="metric-name">🎯 Confidence</span>
              <span className="metric-value">
                {(currentMetrics.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill confidence-fill"
                style={{
                  width: `${currentMetrics.confidence * 100}%`,
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="waiting">
          <div className="waiting-icon pulse">🎭</div>
          <div style={{ fontSize: '11px', fontWeight: 600 }}>
            Waiting...
          </div>
        </div>
      )}
    </>,
    container
  );
};

