import { useState, useEffect } from 'react';

interface AutoPiPBannerProps {
  isActive: boolean;
  isPipActive: boolean;
  onActivatePiP: () => void;
}

export const AutoPiPBanner: React.FC<AutoPiPBannerProps> = ({
  isActive,
  isPipActive,
  onActivatePiP,
}) => {
  const [hasActivatedOnce, setHasActivatedOnce] = useState(() => {
    // Check if user has activated PiP before
    return localStorage.getItem('pipActivatedOnce') === 'true';
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // If PiP becomes active, mark it as activated
    if (isPipActive && !hasActivatedOnce) {
      setHasActivatedOnce(true);
      localStorage.setItem('pipActivatedOnce', 'true');
    }
  }, [isPipActive, hasActivatedOnce]);

  // Don't show if:
  // - Camera not active
  // - Already activated PiP once
  // - PiP is currently active
  // - User dismissed
  if (!isActive || hasActivatedOnce || isPipActive || dismissed) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start gap-3">
      <div className="flex-shrink-0">
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-blue-900 mb-1">
          🪟 Activa Auto-PiP
        </h3>
        <p className="text-sm text-blue-800 mb-3">
          Haz clic en "Modo PiP" una vez para habilitar la activación automática
          cuando cambies de pestaña (como Google Meet).
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              onActivatePiP();
              setDismissed(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Activar PiP Ahora
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Más Tarde
          </button>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
        aria-label="Cerrar"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

