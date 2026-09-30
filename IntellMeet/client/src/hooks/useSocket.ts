import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

// Dynamic production endpoint routing logic switcher channel map
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useSocket = (roomCode: string | undefined) => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!roomCode || !user) return;

    // Connects dynamically to your live production cloud server URL or your local fallback engine path
    socketRef.current = io(BACKEND_URL);

    // Triggered the second the connection handshake completes successfully
    socketRef.current.on('connect', () => {
      console.log(`[Socket] Frontend connected cleanly to server with ID: ${socketRef.current?.id}`);

      // Emit a 'join-room' notification event to notify the backend room engine
      socketRef.current?.emit('join-room', {
        roomCode,
        userId: user._id,
        userName: user.name
      });
    });

    // Cleanup: Disconnect the socket line instantly when the participant leaves the room
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('[Socket] Frontend disconnected from server.');
      }
    };
  }, [roomCode, user]);

  return socketRef.current;
};
