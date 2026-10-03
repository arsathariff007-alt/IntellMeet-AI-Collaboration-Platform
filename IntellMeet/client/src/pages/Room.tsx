import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Users,
  MessageCircle,
  Send,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = (
  import.meta.env.VITE_API_URL ||
  'https://intellmeet-ai-collaboration-platform-1.onrender.com'
).replace(/\/+$/, '');

interface ChatMessage {
  senderId: string;
  senderName: string;
  messageText: string;
  timestamp: string;
}

export const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const { user } = useAuthStore();

  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoStopped, setIsVideoStopped] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [connected, setConnected] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(1);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [showChat, setShowChat] = useState(false);

  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const userId = user?._id || '';
  const userName = user?.name || 'User';

  useEffect(() => {
    if (!roomId) return;

    let mounted = true;

    const startRoom = async () => {
      try {
        /*
         * 1. Get camera + microphone
         */
        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        /*
         * 2. Connect Socket.io
         */
        const socket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('Socket connected:', socket.id);

          setConnected(true);

          socket.emit('join-room', {
            roomCode: roomId,
            userId,
            userName,
          });
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
          setConnected(false);
        });

        /*
         * 3. Existing user creates the WebRTC offer
         */
        socket.on(
          'user-connected',
          async ({ userId: remoteUserId }) => {
            console.log('New participant joined:', remoteUserId);

            setParticipantsCount(2);

            const peerConnection =
              createPeerConnection(socket);

            peerConnectionRef.current = peerConnection;

            stream.getTracks().forEach((track) => {
              peerConnection.addTrack(track, stream);
            });

            const offer =
              await peerConnection.createOffer();

            await peerConnection.setLocalDescription(
              offer
            );

            socket.emit('video-offer', {
              roomCode: roomId,
              offer,
            });
          }
        );

        /*
         * 4. New user receives offer
         */
        socket.on(
          'video-offer-received',
          async ({ offer }) => {
            console.log('Received WebRTC offer');

            setParticipantsCount(2);

            const peerConnection =
              createPeerConnection(socket);

            peerConnectionRef.current = peerConnection;

            stream.getTracks().forEach((track) => {
              peerConnection.addTrack(track, stream);
            });

            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(offer)
            );

            const answer =
              await peerConnection.createAnswer();

            await peerConnection.setLocalDescription(
              answer
            );

            socket.emit('video-answer', {
              roomCode: roomId,
              answer,
            });
          }
        );

        /*
         * 5. Existing user receives answer
         */
        socket.on(
          'video-answer-received',
          async ({ answer }) => {
            console.log('Received WebRTC answer');

            if (!peerConnectionRef.current) return;

            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
          }
        );

        /*
         * 6. ICE candidates
         */
        socket.on(
          'ice-candidate-received',
          async ({ candidate }) => {
            try {
              if (
                peerConnectionRef.current &&
                candidate
              ) {
                await peerConnectionRef.current.addIceCandidate(
                  new RTCIceCandidate(candidate)
                );
              }
            } catch (error) {
              console.error(
                'ICE candidate error:',
                error
              );
            }
          }
        );

        /*
         * 7. Chat
         */
        socket.on(
          'receive-message',
          (message: ChatMessage) => {
            setMessages((previous) => [
              ...previous,
              message,
            ]);
          }
        );
      } catch (error) {
        console.error('Room initialization failed:', error);
      }
    };

    startRoom();

    return () => {
      mounted = false;

      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [roomId]);

  /*
   * WebRTC connection creator
   */
  const createPeerConnection = (
    socket: Socket
  ): RTCPeerConnection => {
    const peerConnection =
      new RTCPeerConnection({
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302',
          },
        ],
      });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        socket.emit('ice-candidate', {
          roomCode: roomId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('Remote video track received');

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          event.streams[0];
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(
        'WebRTC state:',
        peerConnection.connectionState
      );
    };

    return peerConnection;
  };

  /*
   * Toggle microphone
   */
  const toggleAudio = () => {
    const stream = localStreamRef.current;

    if (!stream) return;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsAudioMuted((previous) => !previous);
  };

  /*
   * Toggle camera
   */
  const toggleVideo = () => {
    const stream = localStreamRef.current;

    if (!stream) return;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsVideoStopped((previous) => !previous);
  };

  /*
   * Screen sharing
   */
  const toggleScreenShare = async () => {
    if (!peerConnectionRef.current) {
      alert('Connect another participant first.');
      return;
    }

    try {
      if (!isScreenSharing) {
        const screenStream =
          await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });

        const screenTrack =
          screenStream.getVideoTracks()[0];

        const sender =
          peerConnectionRef.current
            .getSenders()
            .find(
              (item) =>
                item.track?.kind === 'video'
            );

        if (sender) {
          await sender.replaceTrack(screenTrack);
        }

        screenTrack.onended = async () => {
          const cameraTrack =
            localStreamRef.current?.getVideoTracks()[0];

          if (cameraTrack && sender) {
            await sender.replaceTrack(cameraTrack);
          }

          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      } else {
        const cameraTrack =
          localStreamRef.current?.getVideoTracks()[0];

        const sender =
          peerConnectionRef.current
            .getSenders()
            .find(
              (item) =>
                item.track?.kind === 'video'
            );

        if (sender && cameraTrack) {
          await sender.replaceTrack(cameraTrack);
        }

        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error(
        'Screen sharing failed:',
        error
      );
    }
  };

  /*
   * Send chat
   */
  const sendMessage = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!messageText.trim()) return;

    if (!socketRef.current || !roomId) return;

    const message: ChatMessage = {
      senderId: userId,
      senderName: userName,
      messageText: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((previous) => [
      ...previous,
      message,
    ]);

    socketRef.current.emit('send-message', {
      roomCode: roomId,
      senderId: userId,
      senderName: userName,
      messageText: messageText.trim(),
    });

    setMessageText('');
  };

  /*
   * AI Summary
   */
  const generateSummary = async () => {
    if (messages.length === 0) {
      alert('There are no chat messages to summarize yet.');
      return;
    }

    setSummaryLoading(true);
    setShowSummary(true);

    try {
      const chatText = messages
        .map(
          (message) =>
            `${message.senderName}: ${message.messageText}`
        )
        .join('\n');

      const response = await fetch(
        `${SOCKET_URL}/api/meetings/summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomCode: roomId,
            messages: chatText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Summary failed'
        );
      }

      setSummary(data.summary);
    } catch (error: any) {
      console.error(error);

      setSummary(
        'AI summary is currently unavailable. Please make sure the AI summary API is configured on the server.'
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  /*
   * Leave room
   */
  const handleDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());
    }

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 flex flex-col">

      {/* HEADER */}
      <header className="border-b border-white/[0.06] bg-black/30 backdrop-blur-xl px-5 py-4">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1.5 rounded-xl text-xs font-bold text-white">
              LIVE
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                IntellMeet
              </p>

              <p className="text-[10px] text-slate-500 font-mono">
                ROOM: {roomId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]">
              <span
                className={`w-2 h-2 rounded-full ${
                  connected
                    ? 'bg-emerald-400'
                    : 'bg-rose-400'
                }`}
              />

              <span className="text-xs text-slate-400">
                {connected
                  ? 'Connected'
                  : 'Connecting...'}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]">
              <Users className="w-4 h-4 text-indigo-400" />

              <span className="text-xs text-slate-300">
                {participantsCount}
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 p-5">

        <div
          className={`grid gap-5 h-full ${
            showChat
              ? 'lg:grid-cols-[1fr_350px]'
              : 'grid-cols-1'
          }`}
        >

          {/* VIDEO AREA */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* LOCAL */}
            <div className="relative bg-black rounded-3xl overflow-hidden border border-white/[0.08] min-h-[300px]">

              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />

              <div className="absolute bottom-4 left-4 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md text-xs text-white">
                {userName} (You)
              </div>

              {isVideoStopped && (
                <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                    {userName.slice(0, 2)}
                  </div>
                </div>
              )}

            </div>

            {/* REMOTE */}
            <div className="relative bg-[#0b0e16] rounded-3xl overflow-hidden border border-white/[0.08] min-h-[300px]">

              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {participantsCount === 1 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Users className="w-12 h-12 text-slate-700 mb-4" />

                  <p className="text-sm text-slate-400">
                    Waiting for another participant
                  </p>

                  <p className="text-xs text-slate-600 mt-2">
                    Share the meeting code with your teammate.
                  </p>
                </div>
              )}

              <div className="absolute bottom-4 left-4 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md text-xs text-white">
                Participant
              </div>

            </div>
          </section>

          {/* CHAT */}
          {showChat && (
            <aside className="bg-[#0c1019] border border-white/[0.07] rounded-3xl overflow-hidden flex flex-col min-h-[500px]">

              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-indigo-400" />

                  <span className="font-bold text-white">
                    Meeting Chat
                  </span>
                </div>

                <button
                  onClick={() => setShowChat(false)}
                  className="text-slate-500 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {messages.length === 0 && (
                  <div className="text-center text-xs text-slate-600 mt-10">
                    No messages yet.
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={`${message.timestamp}-${index}`}
                    className={`p-3 rounded-2xl ${
                      message.senderId === userId
                        ? 'bg-indigo-600/20 ml-5'
                        : 'bg-white/[0.04] mr-5'
                    }`}
                  >
                    <div className="flex justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-300">
                        {message.senderName}
                      </span>

                      <span className="text-[9px] text-slate-600">
                        {message.timestamp}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300 mt-1">
                      {message.messageText}
                    </p>
                  </div>
                ))}

              </div>

              <form
                onSubmit={sendMessage}
                className="p-3 border-t border-white/[0.06] flex gap-2"
              >
                <input
                  value={messageText}
                  onChange={(e) =>
                    setMessageText(e.target.value)
                  }
                  placeholder="Type a message..."
                  className="flex-1 bg-black/30 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                />

                <button
                  type="submit"
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </aside>
          )}

        </div>
      </main>

      {/* AI SUMMARY */}
      {showSummary && (
        <div className="fixed right-5 bottom-24 w-[min(420px,calc(100%-40px))] bg-[#0c1019] border border-indigo-500/20 rounded-3xl shadow-2xl z-50">

          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />

              <span className="font-bold text-white">
                AI Meeting Summary
              </span>
            </div>

            <button
              onClick={() => setShowSummary(false)}
              className="text-slate-500 hover:text-white"
            >
              ×
            </button>

          </div>

          <div className="p-5 max-h-80 overflow-y-auto">

            {summaryLoading ? (
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating summary...
              </div>
            ) : (
              <p className="text-sm text-slate-300 leading-7 whitespace-pre-wrap">
                {summary}
              </p>
            )}

          </div>
        </div>
      )}

      {/* CONTROLS */}
      <footer className="border-t border-white/[0.06] bg-black/30 backdrop-blur-xl p-4">

        <div className="flex justify-center items-center gap-3">

          <button
            onClick={toggleAudio}
            className={`p-4 rounded-2xl border ${
              isAudioMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-white/[0.04] border-white/[0.08] text-white'
            }`}
          >
            {isAudioMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-2xl border ${
              isVideoStopped
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-white/[0.04] border-white/[0.08] text-white'
            }`}
          >
            {isVideoStopped ? (
              <VideoOff className="w-5 h-5" />
            ) : (
              <Video className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-2xl border ${
              isScreenSharing
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-white/[0.04] border-white/[0.08] text-white'
            }`}
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowChat((previous) => !previous)}
            className={`p-4 rounded-2xl border ${
              showChat
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-white/[0.04] border-white/[0.08] text-white'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <button
            onClick={generateSummary}
            className="p-4 rounded-2xl border bg-purple-500/10 border-purple-500/20 text-purple-300"
            title="Generate AI Summary"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          <button
            onClick={handleDisconnect}
            className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

        </div>
      </footer>

    </div>
  );
};

export default Room;
