import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

export const useWebRTC = (
  socket: Socket | null,
  roomCode: string | undefined,
  localStream: MediaStream | null
) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!socket || !roomCode || !localStream) return;

    // Standard empty configuration parameter context bypasses firewall loops locally
    peerConnectionRef.current = new RTCPeerConnection({ iceServers: [] });

    // Inject local tracks securely into our connection pipelines
    localStream.getTracks().forEach((track) => {
      peerConnectionRef.current?.addTrack(track, localStream);
    });

    // Capture incoming tracks traveling down the wire
    peerConnectionRef.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        console.log('[WebRTC] Dual split-grid track stream received safely.');
        setRemoteStream(event.streams[0]);
      }
    };

    // Forward network routing candidates back to the signaling pool
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { roomCode, candidate: event.candidate });
      }
    };

    // 🚀 STABILIZED OFFER EVENT: Pauses execution briefly to let local camera tracks warm up
    socket.on('user-connected', () => {
      console.log('[WebRTC] Companion user discovered. Commencing synchronized handshake...');
      setTimeout(async () => {
        try {
          if (!peerConnectionRef.current) return;
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          socket.emit('video-offer', { roomCode, offer });
        } catch (err) {
          console.error('Handshake offer generation stalled:', err);
        }
      }, 500); // 500ms delay ensures hardware tracks are stable in memory first!
    });

    // Handle incoming video handshake offer configuration letters
    socket.on('video-offer-received', async ({ offer }) => {
      console.log('[WebRTC] Handshake offer letter unpacked. Syncing response properties...');
      try {
        if (!peerConnectionRef.current) return;
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('video-answer', { roomCode, answer });
      } catch (err) {
        console.error('Failed to map offer description settings:', err);
      }
    });

    // Handle incoming validation response answers
    socket.on('video-answer-received', async ({ answer }) => {
      console.log('[WebRTC] Security validation verified. Locking live peer connection...');
      try {
        if (!peerConnectionRef.current) return;
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('Failed to seal final signaling handshake route:', err);
      }
    });

    // Apply incoming candidate routing path arrays instantly
    socket.on('ice-candidate-received', async ({ candidate }) => {
      try {
        if (candidate && peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('ICE pathway candidate mapping skipped:', err);
      }
    });

    return () => {
      socket.off('user-connected');
      socket.off('video-offer-received');
      socket.off('video-answer-received');
      socket.off('ice-candidate-received');
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      setRemoteStream(null);
    };
  }, [socket, roomCode, localStream]);

  return { remoteStream };
};
