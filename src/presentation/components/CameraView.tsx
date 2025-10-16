import { useEffect, useRef } from 'react';

interface CameraViewProps {
  videoElement: HTMLVideoElement | null;
  show?: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoElement,
  show = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoElement && containerRef.current && show) {
      // Clone or display the video element
      containerRef.current.innerHTML = '';
      const videoClone = document.createElement('video');
      videoClone.srcObject = videoElement.srcObject;
      videoClone.autoplay = true;
      videoClone.playsInline = true;
      videoClone.muted = true;
      videoClone.className = 'w-full h-full object-cover rounded-lg';
      containerRef.current.appendChild(videoClone);
      videoClone.play();
    }
  }, [videoElement, show]);

  if (!show) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg"
    />
  );
};

