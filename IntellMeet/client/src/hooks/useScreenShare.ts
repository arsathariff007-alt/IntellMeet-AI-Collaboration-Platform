import { useState, useCallback } from 'react';

export const useScreenShare = () => {
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Activates the browser's native display picker window dialog grid
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false // Screen audio capture disabled to safeguard echo track loops
      });

      setScreenStream(stream);
      setIsSharing(true);

      // Listen for when a user clicks the native browser "Stop Sharing" floating button bubble
      stream.getVideoTracks()[0].onended = () => {
        stream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
        setIsSharing(false);
      };

      return stream;
    } catch (err) {
      console.error('Display media window sharing track allocation canceled:', err);
      return null;
    }
  }, []);

  // Safe manual shutdown anchor button event trigger action
  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsSharing(false);
    }
  }, [screenStream]);

  return {
    screenStream,
    isSharing,
    startScreenShare,
    stopScreenShare
  };
};
