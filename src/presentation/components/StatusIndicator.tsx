import { CameraState, getStateLabel } from '../../domain/entities/CameraState';

interface StatusIndicatorProps {
  state: CameraState;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state }) => {
  const getStatusColor = () => {
    switch (state) {
      case CameraState.RUNNING:
      case CameraState.PIP_ACTIVE:
        return 'bg-green-500';
      case CameraState.LOW_LIGHT:
        return 'bg-yellow-500';
      case CameraState.NO_FACE:
        return 'bg-orange-500';
      case CameraState.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const isActive =
    state !== CameraState.IDLE && state !== CameraState.ERROR;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${getStatusColor()} ${
            isActive ? 'animate-pulse' : ''
          }`}
        />
        {isActive && (
          <div
            className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor()} opacity-50 animate-ping`}
          />
        )}
      </div>
      <span className="text-sm font-medium text-gray-700">
        {getStateLabel(state)}
      </span>
    </div>
  );
};

