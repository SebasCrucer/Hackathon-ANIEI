import { useEffect, useRef } from 'react';

/**
 * Hook to automatically enter PiP when user switches tabs
 * Strategy: Like Google Meet - activate PiP on first manual interaction,
 * then keep it alive in background, showing it when user switches tabs
 */
export const useAutoPiP = (
  isActive: boolean,
  isPipActive: boolean,
  enterPiP: (videoElement: HTMLVideoElement | null) => Promise<boolean>,
  getVideoElement: () => HTMLVideoElement | null
) => {
  // Use refs to keep latest values without causing re-renders
  const isActiveRef = useRef(isActive);
  const isPipActiveRef = useRef(isPipActive);
  const enterPiPRef = useRef(enterPiP);
  const getVideoElementRef = useRef(getVideoElement);
  const hasUserGestureRef = useRef(false);

  // Update refs on every render
  useEffect(() => {
    isActiveRef.current = isActive;
    isPipActiveRef.current = isPipActive;
    enterPiPRef.current = enterPiP;
    getVideoElementRef.current = getVideoElement;
  });

  // Register user gesture - any click means we can use PiP later
  useEffect(() => {
    const handleUserGesture = () => {
      if (!hasUserGestureRef.current) {
        console.log('[Auto-PiP] User gesture detected, enabling auto-PiP');
        hasUserGestureRef.current = true;
      }
    };

    // Listen for any click on the page
    document.addEventListener('click', handleUserGesture, { once: true });

    return () => {
      document.removeEventListener('click', handleUserGesture);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      const currentIsActive = isActiveRef.current;
      const currentIsPipActive = isPipActiveRef.current;
      const hasGesture = hasUserGestureRef.current;

      console.log('[Auto-PiP] Visibility change:', {
        hidden: document.hidden,
        isActive: currentIsActive,
        isPipActive: currentIsPipActive,
        hasUserGesture: hasGesture,
      });

      // When tab becomes hidden - activate PiP
      if (document.hidden && currentIsActive && !currentIsPipActive && hasGesture) {
        const videoElement = getVideoElementRef.current();
        if (videoElement) {
          console.log('[Auto-PiP] Activating PiP automatically...');
          try {
            const success = await enterPiPRef.current(videoElement);
            console.log('[Auto-PiP] Result:', success);
          } catch (error) {
            console.error('[Auto-PiP] Error:', error);
          }
        } else {
          console.warn('[Auto-PiP] No video element available');
        }
      }
    };

    console.log('[Auto-PiP] Hook initialized, adding listener');
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('[Auto-PiP] Hook cleanup, removing listener');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
