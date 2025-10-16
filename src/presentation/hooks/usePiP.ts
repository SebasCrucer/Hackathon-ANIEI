import { useState, useCallback } from 'react';

export interface PiPCapabilities {
  documentPiP: boolean;
  videoPiP: boolean;
}

export const usePiP = () => {
  const [isPipActive, setIsPipActive] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  const checkCapabilities = useCallback((): PiPCapabilities => {
    return {
      documentPiP: 'documentPictureInPicture' in window,
      videoPiP: 'pictureInPictureEnabled' in document,
    };
  }, []);

  const enterPiP = useCallback(
    async (
      videoElement: HTMLVideoElement | null
    ): Promise<boolean> => {
      if (!videoElement) {
        console.error('No video element provided');
        return false;
      }

      const capabilities = checkCapabilities();

      // Try Document PiP first (preferred) - content will be rendered via Portal
      if (capabilities.documentPiP) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pipWin = await (window as any).documentPictureInPicture.requestWindow({
            width: 320,
            height: 280,
          });

          // Set basic body styles
          pipWin.document.body.style.cssText = `
            margin: 0;
            padding: 0;
            overflow: auto;
          `;

          setPipWindow(pipWin);
          setIsPipActive(true);

          pipWin.addEventListener('pagehide', () => {
            setIsPipActive(false);
            setPipWindow(null);
          });

          return true;
        } catch (error) {
          console.warn('Document PiP failed, trying video PiP:', error);
        }
      }

      // Fallback to Video PiP
      if (capabilities.videoPiP) {
        try {
          await videoElement.requestPictureInPicture();
          setIsPipActive(true);

          videoElement.addEventListener('leavepictureinpicture', () => {
            setIsPipActive(false);
          });

          return true;
        } catch (error) {
          console.error('Video PiP failed:', error);
          return false;
        }
      }

      console.error('No PiP capabilities available');
      return false;
    },
    [checkCapabilities]
  );

  const exitPiP = useCallback(async (): Promise<void> => {
    // Close Document PiP
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }

    // Exit Video PiP
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    }

    setIsPipActive(false);
  }, [pipWindow]);

  return {
    isPipActive,
    enterPiP,
    exitPiP,
    capabilities: checkCapabilities(),
    pipWindow,
  };
};

