import { useState, useEffect, useCallback } from 'react';

export const useMediaStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoStopped, setVideoStopped] = useState(false);

  const startStream = useCallback(async () => {
    setError(null);
    try {
      const constraints = {
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true
      };

      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(localStream);
      return localStream;
    } catch (err: any) {
      console.error('Error accessing hardware tracks:', err);
      setError(err.message || 'Could not access camera or microphone.');
      return null;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const toggleAudio = useCallback(() => {
    if (stream) {
      const track = stream.getAudioTracks();
      if (track[0]) {
        track[0].enabled = !track[0].enabled;
        setAudioMuted(!track[0].enabled);
      }
    }
  }, [stream]);

  const toggleVideo = useCallback(() => {
    if (stream) {
      const track = stream.getVideoTracks();
      if (track[0]) {
        track[0].enabled = !track[0].enabled;
        setVideoStopped(!track[0].enabled);
      }
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    stream,
    error,
    audioMuted,
    videoStopped,
    startStream,
    stopStream,
    toggleAudio,
    toggleVideo
  };
};
