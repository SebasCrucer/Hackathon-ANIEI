/**
 * Possible states of the camera and processing pipeline
 */
export enum CameraState {
  IDLE = 'idle',              // No camera permission or not started
  NO_FACE = 'no-face',        // Camera active but no face detected
  LOW_LIGHT = 'low-light',    // Face detected but lighting quality is poor
  RUNNING = 'running',        // Normal operation
  PIP_ACTIVE = 'pip-active',  // Picture-in-Picture mode active
  ERROR = 'error',            // Error state
}

export const getStateLabel = (state: CameraState): string => {
  switch (state) {
    case CameraState.IDLE:
      return 'Inactivo';
    case CameraState.NO_FACE:
      return 'Esperando rostro...';
    case CameraState.LOW_LIGHT:
      return 'Luz baja detectada';
    case CameraState.RUNNING:
      return 'Procesando';
    case CameraState.PIP_ACTIVE:
      return 'PiP Activo';
    case CameraState.ERROR:
      return 'Error';
    default:
      return 'Desconocido';
  }
};

