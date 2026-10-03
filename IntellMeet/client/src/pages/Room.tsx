import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
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

  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

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

  /*
   * Create WebRTC peer connection
   */
  const createPeerConnection = (socket: Socket) => {
    console.log('[WebRTC] Creating peer connection');

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        console.log('[WebRTC] Sending ICE candidate');

        socket.emit('ice-candidate', {
          roomCode: roomId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Remote track received');

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];

        remoteVideoRef.current
          .play()
          .catch((error) => {
            console.log(
              '[WebRTC] Remote video play waiting:',
              error
            );
          });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(
        '[WebRTC] Connection state:',
        peerConnection.connectionState
      );

      if (
        peerConnection.connectionState === 'connected'
      ) {
        console.log(
          '========================================'
        );
        console.log(
          '[WebRTC] TWO-WAY VIDEO CONNECTION SUCCESSFUL'
        );
        console.log(
          '========================================'
        );
      }

      if (
        peerConnection.connectionState === 'failed' ||
        peerConnection.connectionState === 'disconnected'
      ) {
        console.log(
          '[WebRTC] Peer connection problem:',
          peerConnection.connectionState
        );
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(
        '[WebRTC] ICE state:',
        peerConnection.iceConnectionState
      );
    };

    return peerConnection;
  };

  useEffect(() => {
    if (!roomId) return;

    let mounted = true;

    const startRoom = async () => {
      try {
        console.log('========================================');
        console.log('[Room] Starting room');
        console.log('[Room] Room ID:', roomId);
        console.log('[Room] User ID:', userId);
        console.log('[Room] User Name:', userName);
        console.log('[Room] Socket URL:', SOCKET_URL);
        console.log('========================================');

        /*
         * 1. CAMERA + MICROPHONE
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

        console.log('[Media] Camera and microphone ready');

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        /*
         * 2. SOCKET.IO CONNECTION
         */
        console.log('[Socket] Connecting to:', SOCKET_URL);

        const socket = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          reconnection: true,
        });

        socketRef.current = socket;

        /*
         * IMPORTANT:
         * This tells us exactly why Socket.io fails.
         */
        socket.on('connect', () => {
          console.log(
            '========================================'
          );
          console.log(
            '[Socket] CONNECTED SUCCESSFULLY'
          );
          console.log('[Socket] Socket ID:', socket.id);
          console.log('========================================');

          setConnected(true);

          socket.emit('join-room', {
            roomCode: roomId,
            userId,
            userName,
          });

          console.log('[Socket] join-room emitted');
        });

        socket.on('connect_error', (error) => {
          console.error(
            '========================================'
          );
          console.error('[Socket] CONNECTION ERROR');
          console.error(error);
          console.error('Message:', error.message);
          console.error(
            '========================================'
          );

          setConnected(false);
        });

        socket.on('disconnect', (reason) => {
          console.log(
            '[Socket] Disconnected:',
            reason
          );

          setConnected(false);
        });

        /*
         * 3. ANOTHER USER JOINED
         */
        socket.on(
          'user-connected',
          async ({ userId: remoteUserId, userName: remoteUserName }) => {
            console.log(
              '========================================'
            );
            console.log(
              '[Room] ANOTHER USER JOINED'
            );
            console.log(
              'Remote user:',
              remoteUserName
            );
            console.log(
              'Remote ID:',
              remoteUserId
            );
            console.log(
              '========================================'
            );

            setParticipantsCount(2);

            const peerConnection =
              createPeerConnection(socket);

            peerConnectionRef.current =
              peerConnection;

            stream.getTracks().forEach((track) => {
              console.log(
                '[WebRTC] Adding local track:',
                track.kind
              );

              peerConnection.addTrack(
                track,
                stream
              );
            });

            console.log('[WebRTC] Creating offer');

            const offer =
              await peerConnection.createOffer();

            await peerConnection.setLocalDescription(
              offer
            );

            console.log(
              '[WebRTC] Sending offer'
            );

            socket.emit('video-offer', {
              roomCode: roomId,
              offer,
            });
          }
        );

        /*
         * 4. RECEIVE OFFER
         */
        socket.on(
          'video-offer-received',
          async ({ offer }) => {
            console.log(
              '========================================'
            );
            console.log(
              '[WebRTC] VIDEO OFFER RECEIVED'
            );
            console.log(
              '========================================'
            );

            setParticipantsCount(2);

            const peerConnection =
              createPeerConnection(socket);

            peerConnectionRef.current =
              peerConnection;

            stream.getTracks().forEach((track) => {
              console.log(
                '[WebRTC] Adding local track:',
                track.kind
              );

              peerConnection.addTrack(
                track,
                stream
              );
            });

            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(offer)
            );

            console.log(
              '[WebRTC] Remote offer set'
            );

            /*
             * Add queued ICE candidates
             */
            for (
              const candidate of pendingIceCandidatesRef.current
            ) {
              try {
                await peerConnection.addIceCandidate(
                  new RTCIceCandidate(candidate)
                );
              } catch (error) {
                console.error(
                  '[WebRTC] Queued ICE error:',
                  error
                );
              }
            }

            pendingIceCandidatesRef.current = [];

            const answer =
              await peerConnection.createAnswer();

            await peerConnection.setLocalDescription(
              answer
            );

            console.log(
              '[WebRTC] Sending answer'
            );

            socket.emit('video-answer', {
              roomCode: roomId,
              answer,
            });
          }
        );

        /*
         * 5. RECEIVE ANSWER
         */
        socket.on(
          'video-answer-received',
          async ({ answer }) => {
            console.log(
              '[WebRTC] VIDEO ANSWER RECEIVED'
            );

            if (!peerConnectionRef.current) {
              console.error(
                '[WebRTC] No peer connection for answer'
              );
              return;
            }

            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(answer)
            );

            console.log(
              '[WebRTC] Remote answer set'
            );

            /*
             * Add queued ICE candidates
             */
            for (
              const candidate of pendingIceCandidatesRef.current
            ) {
              try {
                await peerConnectionRef.current.addIceCandidate(
                  new RTCIceCandidate(candidate)
                );
              } catch (error) {
                console.error(
                  '[WebRTC] Queued ICE error:',
                  error
                );
              }
            }

            pendingIceCandidatesRef.current = [];
          }
        );

        /*
         * 6. ICE CANDIDATES
         */
        socket.on(
          'ice-candidate-received',
          async ({ candidate }) => {
            console.log(
              '[WebRTC] ICE candidate received'
            );

            if (!candidate) return;

            const peerConnection =
              peerConnectionRef.current;

            if (
              !peerConnection ||
              !peerConnection.remoteDescription
            ) {
              console.log(
                '[WebRTC] Queueing ICE candidate'
              );

              pendingIceCandidatesRef.current.push(
                candidate
              );

              return;
            }

            try {
              await peerConnection.addIceCandidate(
                new RTCIceCandidate(candidate)
              );

              console.log(
                '[WebRTC] ICE candidate added'
              );
            } catch (error) {
              console.error(
                '[WebRTC] ICE candidate error:',
                error
              );
            }
          }
        );

        /*
         * 7. CHAT
         */
        socket.on(
          'receive-message',
          (message: ChatMessage) => {
            console.log(
              '[Chat] Message received:',
              message
            );

            setMessages((previous) => [
              ...previous,
              message,
            ]);
          }
        );
      } catch (error) {
        console.error(
          '[Room] Room initialization failed:',
          error
        );
      }
    };

    startRoom();

    return () => {
      mounted = false;

      console.log('[Room] Cleaning up');

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
  }, [roomId, userId, userName]);

  /*
   * MICROPHONE
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
   * CAMERA
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
   * SCREEN SHARE
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

        if (localVideoRef.current) {
          localVideoRef.current.srcObject =
            screenStream;
        }

        screenTrack.onended = async () => {
          const cameraTrack =
            localStreamRef.current?.getVideoTracks()[0];

          if (cameraTrack && sender) {
            await sender.replaceTrack(cameraTrack);
          }

          if (localVideoRef.current) {
            localVideoRef.current.srcObject =
              localStreamRef.current;
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

        if (localVideoRef.current) {
          localVideoRef.current.srcObject =
            localStreamRef.current;
        }

        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error(
        '[ScreenShare] Failed:',
        error
      );
    }
  };

  /*
   * SEND CHAT
   */
  const sendMessage = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!messageText.trim()) return;

    if (!socketRef.current || !roomId) {
      console.error(
        '[Chat] Socket is not connected'
      );
      return;
    }

    const text = messageText.trim();

    const message: ChatMessage = {
      senderId: userId,
      senderName: userName,
      messageText: text,
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
      messageText: text,
    });

    setMessageText('');
  };

  /*
   * AI SUMMARY
   */
  const generateSummary = async () => {
    if (messages.length === 0) {
      alert(
        'There are no chat messages to summarize yet.'
      );
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
    } catch (error) {
      console.error(
        '[AI Summary] Error:',
        error
      );

      setSummary(
        'AI summary is currently unavailable. The AI summary API still needs to be configured on the backend.'
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  /*
   * LEAVE
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

      <main className="flex-1 p-5">

        <div
          className={`grid gap-5 h-full ${
            showChat
              ? 'lg:grid-cols-[1fr_350px]'
              : 'grid-cols-1'
          }`}
        >

          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">

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
            onClick={() =>
              setShowChat((previous) => !previous)
            }
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
