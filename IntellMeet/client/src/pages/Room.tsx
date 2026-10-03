import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, ScreenShare, PhoneOff, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoStopped, setIsVideoStopped] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantsCount] = useState(1); // Cleared the unused setParticipantsCount method statement

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize hardware input devices and capture local webcam stream tracks
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Hardware access error:", err);
      }
    };

    initializeMedia();

    // Clean up tracks when exiting the room channel loop
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 🎙️ Handler to loop through audio tracks and switch the track status boolean flag dynamically
  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // 📷 Handler to loop through video tracks and toggle camera streams live on screen
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoStopped(!isVideoStopped);
    }
  };

  const handleDisconnect = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 antialiased flex flex-col justify-between relative overflow-hidden">
      {/* Upper Information Floating Strip Bar */}
      <header className="bg-white/[0.01] backdrop-blur-md border-b border-white/[0.06] px-6 py-4 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest text-white shadow-md">
            Live Room
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">Channel ID: <span className="font-mono text-indigo-400 select-all">{roomId}</span></span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{participantsCount} Active</span>
          </div>
        </div>
      </header>

      {/* Primary Multi-User Video Grid Mesh Presentation Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center relative z-10">
        
        {/* Local Participant Frame */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden aspect-video relative group shadow-2xl transition-all hover:border-white/10">
          {isVideoStopped ? (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-xl rounded-full flex items-center justify-center uppercase shadow-lg shadow-indigo-500/20">
                {user?.name ? user.name.slice(0, 2) : 'ME'}
              </div>
              <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Camera Feeds Inactive</span>
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          )}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-white tracking-wide flex items-center gap-2">
            {user?.name} (You)
            {isAudioMuted && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
          </div>
        </div>

        {/* Remote Mock Participant Placeholder Frame */}
        <div className="bg-white/[0.01] border border-white/[0.04] border-dashed rounded-3xl overflow-hidden aspect-video relative flex flex-col items-center justify-center text-center p-8 text-slate-600 shadow-inner">
          <Users className="w-10 h-10 mb-3 text-slate-700 animate-pulse" />
          <p className="text-xs font-semibold tracking-wide text-slate-500">Awaiting peer track parameters...</p>
          <p className="text-[10px] text-slate-600 mt-1 max-w-xs leading-relaxed">Share your cryptic room channel ID token link with another participant node to link WebRTC pipes live.</p>
        </div>

      </main>

      {/* Cyber Media Action Dock Control Strip Array */}
      <footer className="w-full pb-8 pt-4 flex justify-center relative z-20">
        <div className="flex items-center gap-4 bg-slate-950/70 backdrop-blur-xl border border-white/10 px-6 py-3.5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          {/* Audio Microphone Mute Action Toggle Control */}
          <button
            onClick={toggleAudio}
            className={`p-3.5 rounded-xl border font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isAudioMuted 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30' 
                : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:text-white'
            }`}
            title={isAudioMuted ? "Unmute Audio Microphone" : "Mute Audio Microphone"}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Camera Lens Frame Feeds Action Toggle Control */}
          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-xl border font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isVideoStopped 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30' 
                : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:text-white'
            }`}
            title={isVideoStopped ? "Turn Camera Video ON" : "Turn Camera Video OFF"}
          >
            {isVideoStopped ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Sharing Action Control Toggle */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3.5 rounded-xl border font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isScreenSharing 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30' 
                : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:text-white'
            }`}
            title="Share Desktop Monitor Display Screen"
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          {/* Visual Divider Strip */}
          <div className="w-[1px] h-6 bg-white/10 mx-1" />

          {/* Absolute Disconnect Call Room Phone Eject Button Handler */}
          <button
            onClick={handleDisconnect}
            className="p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl border border-rose-600 hover:border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all duration-200 cursor-pointer flex items-center justify-center"
            title="Leave Video Call Room Workspace Container"
          >
            <PhoneOff className="w-5 h-5 rotate-[135deg]" />
          </button>
        </div>
      </footer>
    </div>
  );
};
