import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff } from 'lucide-react';

// Use this interface configuration definition directly within your Room component layout
export const MediaControlsDock: React.FC<{ localStream: MediaStream | null; onDisconnect: () => void }> = ({ localStream, onDisconnect }) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoStopped, setIsVideoStopped] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // 🎙️ Handler to loop through audio tracks and switch the track status boolean flag dynamically
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // 📷 Handler to loop through video tracks and toggle camera streams live on screen
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoStopped(!isVideoStopped);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-slate-950/70 backdrop-blur-xl border border-white/10 px-6 py-3.5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
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
        {isAudioMuted ? <MicOff className="w-5 h-5 animate-shake" /> : <Mic className="w-5 h-5" />}
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

      {/* Interactive Display Monitor Screen Sharing Action Control */}
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
        onClick={onDisconnect}
        className="p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl border border-rose-600 hover:border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all duration-200 cursor-pointer flex items-center justify-center"
        title="Leave Video Call Room Workspace Container"
      >
        <PhoneOff className="w-5 h-5 rotate-[135deg]" />
      </button>
    </div>
  );
};
