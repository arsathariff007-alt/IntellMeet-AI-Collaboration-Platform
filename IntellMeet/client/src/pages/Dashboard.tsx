import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Video, PlusCircle, LogOut, Keyboard, ArrowRight, Loader2, Sparkles, Radio } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'https://intellmeet-ai-collaboration-platform-1.onrender.com';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, accessToken, logout } = useAuthStore();
  const [meetingTitle, setMeetingTitle] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/meetings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ title: meetingTitle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to allocate room');
      }

      navigate(`/room/${data.meeting.meetingCode}`);
    } catch (err: any) {
      alert(err.message || 'Server error generating room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    navigate(`/room/${joinCode.trim().toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#0b0f19] to-[#05070c] text-slate-200 antialiased relative overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Cyber Top Navigation Tray */}
      <nav className="bg-white/[0.01] backdrop-blur-xl border-b border-white/[0.06] px-8 py-4 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3 font-extrabold text-white text-xl tracking-tight">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <Video className="w-5 h-5" />
          </div>
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">IntellMeet <span className="text-indigo-400 text-sm font-semibold tracking-widest uppercase ml-1">HQ</span></span>
        </div>
        
        <div className="flex items-center gap-5">
          {/* User Profile Glass Badge */}
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] px-4 py-2 rounded-2xl backdrop-blur-md">
            <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full flex items-center justify-center text-xs font-black uppercase shadow-[0_0_10px_rgba(99,102,241,0.4)]">
              {user?.name ? user.name.slice(0, 2) : 'US'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white tracking-wide">{user?.name}</span>
              <span className="text-[9px] text-indigo-400 font-extrabold tracking-widest uppercase flex items-center gap-1">
                <Radio className="w-2 h-2 animate-pulse text-emerald-400 fill-emerald-400" /> Secure Node
              </span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-rose-400 font-semibold hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Dashboard Control Matrix Grid */}
      <main className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        
        {/* Welcome Text Section */}
        <div className="text-center md:text-left mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center justify-center md:justify-start gap-2">
            Welcome back, Comms Commander <Sparkles className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
          </h1>
          <p className="text-slate-400 text-sm mt-2">Initialize encryption nodes or bridge instantly into existing signal tracks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Allocate Channel Box */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03] group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
            <div>
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Initialize Channel Node</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-8 font-medium">
                Generate a multi-peer 9-character communication layer bound to your database cluster instantly.
              </p>
              
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <input
                  type="text"
                  required
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Enter meeting channel topic (e.g., Core Sync)"
                  className="w-full px-4 py-3.5 bg-black/20 border border-white/[0.06] rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/[0.04] focus:ring-1 focus:ring-indigo-500/30 text-xs transition-all duration-200 text-white placeholder-slate-600 font-medium"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shadow-[0_4px_20px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Allocating Cryptic Room...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Call Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Intercept Existing Code Box */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03] group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
            <div>
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <Keyboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Intercept Signal Route</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-8 font-medium">
                Input the 9-character matrix tracking link token generated by an external node manager to connect.
              </p>
              
              <form onSubmit={handleJoinMeeting} className="space-y-4">
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Xxx-xxx-xxx"
                  className="w-full px-4 py-3.5 bg-black/20 border border-white/[0.06] rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white/[0.04] focus:ring-1 focus:ring-purple-500/30 text-xs transition-all duration-200 text-white placeholder-slate-600 tracking-widest text-center uppercase font-black font-mono text-purple-300"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-slate-200 hover:text-white rounded-xl font-bold text-xs transition-all duration-200 border border-white/[0.05] hover:border-white/[0.1] shadow-xl cursor-pointer flex items-center justify-center gap-2"
                >
