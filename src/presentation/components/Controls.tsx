import { CameraState } from '../../domain/entities/CameraState';

interface ControlsProps {
  cameraState: CameraState;
  isPipActive: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onTogglePiP: () => void;
  pipCapabilities: {
    documentPiP: boolean;
    videoPiP: boolean;
  };
}

export const Controls: React.FC<ControlsProps> = ({
  cameraState,
  isPipActive,
  onStartCamera,
  onStopCamera,
  onTogglePiP,
  pipCapabilities,
}) => {
  const isActive =
    cameraState !== CameraState.IDLE && cameraState !== CameraState.ERROR;

  const canUsePiP = pipCapabilities.documentPiP || pipCapabilities.videoPiP;

  return (
    <div className="flex gap-3">
      {!isActive ? (
        <button
          onClick={onStartCamera}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          🎥 Iniciar Cámara
        </button>
      ) : (
        <>
          <button
            onClick={onStopCamera}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            ⏹️ Detener
          </button>
          {canUsePiP && (
            <button
              onClick={onTogglePiP}
              className={`flex-1 ${
                isPipActive
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg`}
            >
              {isPipActive ? '📺 Salir PiP' : '🪟 Modo PiP'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

