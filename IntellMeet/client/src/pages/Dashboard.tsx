import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  PlusCircle,
  LogOut,
  Keyboard,
  ArrowRight,
  Loader2,
  Sparkles,
  Radio,
  ShieldCheck,
  Zap,
  Users,
  Clock3,
  Activity,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://intellmeet-ai-collaboration-platform-1.onrender.com';

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
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: meetingTitle.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create meeting');
      }

      navigate(`/room/${data.meeting.meetingCode}`);
    } catch (err: any) {
      alert(err.message || 'Server error while creating meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinCode.trim()) return;

    navigate(`/room/${joinCode.trim().toLowerCase()}`);
  };

  const displayName = user?.name || 'User';

  return (
    <div className="min-h-screen bg-[#060812] text-slate-200 relative overflow-hidden">
      {/* =========================================================
          BACKGROUND EFFECTS
      ========================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-64 -left-64 w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[150px]" />

        <div className="absolute top-[30%] -right-64 w-[650px] h-[650px] rounded-full bg-purple-600/10 blur-[160px]" />

        <div className="absolute bottom-[-300px] left-[25%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* =========================================================
          NAVIGATION
      ========================================================== */}

      <nav className="relative z-30 border-b border-white/[0.07] bg-black/20 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/40 blur-xl rounded-2xl" />

                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 border border-white/10">
                  <Video className="w-5 h-5 text-white" />
                </div>
              </div>

              <div>
                <div className="text-white font-black tracking-tight text-lg">
                  IntellMeet
                  <span className="text-indigo-400 ml-1">HQ</span>
                </div>

                <div className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-bold">
                  AI Collaboration
                </div>
              </div>
            </div>

            {/* Right navigation */}
            <div className="flex items-center gap-3 sm:gap-5">

              {/* Connection indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>

                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  System Online
                </span>
              </div>

              {/* User */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/[0.035] border border-white/[0.07]">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white uppercase shadow-lg shadow-indigo-500/20">
                  {displayName.slice(0, 2)}
                </div>

                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-white">
                    {displayName}
                  </p>

                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                    Authorized User
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="group flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/[0.07] border border-transparent hover:border-rose-500/10 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />

                <span className="hidden sm:inline text-xs font-semibold">
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}

      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">

        {/* Hero */}
        <section className="mb-10">

          <div className="flex items-center gap-2 mb-5">
            <div className="h-px w-8 bg-indigo-500/60" />

            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
              Command Center
            </span>

            <div className="h-px w-8 bg-indigo-500/60" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.04em] leading-tight">
                <span className="text-white">Welcome back,</span>
                <br />

                <span className="bg-gradient-to-r from-indigo-300 via-white to-purple-300 bg-clip-text text-transparent">
                  {displayName}
                </span>

                <Sparkles className="inline-block w-7 h-7 sm:w-9 sm:h-9 ml-3 text-indigo-400 align-middle" />
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Create a secure meeting room, join an existing session,
                and collaborate with your team in real time.
              </p>
            </div>

            {/* Status card */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.025] border border-white/[0.07] backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>

              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                  Workspace
                </p>

                <p className="text-xs text-white font-bold">
                  Ready for collaboration
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            FEATURE CARDS
        ========================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* =====================================================
              CREATE MEETING
          ====================================================== */}

          <div className="group relative">

            {/* Glow */}
            <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 blur-sm transition duration-500" />

            <div className="relative h-full rounded-[28px] bg-[#0c101d]/90 backdrop-blur-2xl border border-white/[0.07] overflow-hidden transition-all duration-300 group-hover:border-indigo-500/20">

              {/* Decorative glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-600/10 blur-[70px] pointer-events-none" />

              <div className="relative p-7 sm:p-8">

                {/* Icon */}
                <div className="flex items-start justify-between mb-7">

                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center shadow-lg shadow-indigo-500/5">
                    <PlusCircle className="w-7 h-7 text-indigo-400" />
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/10 text-[9px] text-indigo-400 font-black uppercase tracking-widest">
                    Create
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight">
                  Create a Meeting
                </h2>

                <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-md">
                  Start a new collaborative session and generate a unique
                  meeting code for your team.
                </p>

                {/* Form */}
                <form
                  onSubmit={handleCreateMeeting}
                  className="mt-8 space-y-4"
                >
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">
                      Meeting Topic
                    </label>

                    <input
                      type="text"
                      required
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      placeholder="e.g. Product Strategy Meeting"
                      className="w-full px-4 py-4 bg-black/30 border border-white/[0.07] rounded-2xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full overflow-hidden py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm shadow-xl shadow-indigo-600/15 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Meeting...
                      </>
                    ) : (
                      <>
                        Launch Meeting
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Features */}
                <div className="grid grid-cols-3 gap-2 mt-6">

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Video className="w-4 h-4 text-indigo-400 mb-2" />
                    <p className="text-[9px] text-slate-500 font-bold">
                      Video
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Users className="w-4 h-4 text-indigo-400 mb-2" />
                    <p className="text-[9px] text-slate-500 font-bold">
                      Team
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 mb-2" />
                    <p className="text-[9px] text-slate-500 font-bold">
                      Secure
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              JOIN MEETING
          ====================================================== */}

          <div className="group relative">

            <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-purple-500/20 via-transparent to-fuchsia-500/10 opacity-0 group-hover:opacity-100 blur-sm transition duration-500" />

            <div className="relative h-full rounded-[28px] bg-[#0c101d]/90 backdrop-blur-2xl border border-white/[0.07] overflow-hidden transition-all duration-300 group-hover:border-purple-500/20">

              {/* Decorative glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-600/10 blur-[70px] pointer-events-none" />

              <div className="relative p-7 sm:p-8">

                {/* Icon */}
                <div className="flex items-start justify-between mb-7">

                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center shadow-lg shadow-purple-500/5">
                    <Keyboard className="w-7 h-7 text-purple-400" />
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/10 text-[9px] text-purple-400 font-black uppercase tracking-widest">
                    Join
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight">
                  Join a Meeting
                </h2>

                <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-md">
                  Have a meeting code? Enter it below to instantly connect
                  to an existing collaboration session.
                </p>

                {/* Form */}
                <form
                  onSubmit={handleJoinMeeting}
                  className="mt-8 space-y-4"
                >
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2">
                      Meeting Code
                    </label>

                    <input
                      type="text"
                      required
                      value={joinCode}
                      onChange={(e) =>
                        setJoinCode(e.target.value.toLowerCase())
                      }
                      placeholder="e.g. abc123xyz"
                      maxLength={20}
                      className="w-full px-4 py-4 bg-black/30 border border-white/[0.07] rounded-2xl outline-none text-sm text-white placeholder:text-slate-700 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all font-mono tracking-[0.15em]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-purple-500/30 text-slate-200 hover:text-white font-black text-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Join Meeting
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                  </button>
                </form>

                {/* Features */}
                <div className="grid grid-cols-3 gap-2 mt-6">

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Zap className="w-4 h-4 text-purple-400 mb-2" />
                    <p className="text-[9px] text-slate-500 font-bold">
                      Instant
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Radio className="w-4 h-4 text-purple-400 mb-2" />
                    <p className="text-[9px] text-slate-500 font-bold">
                      Real-time
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Clock3 className="w-4 h-4 text-purple-400 mb-2" />
                    <p className="text-[9px] text-slate-500 font-bold">
                      No Setup
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            BOTTOM INFORMATION BAR
        ========================================================== */}

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">

          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />

            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black">
                Security
              </p>

              <p className="text-xs text-slate-300 font-semibold">
                Protected Session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <Activity className="w-5 h-5 text-indigo-400" />

            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black">
                Network
              </p>

              <p className="text-xs text-slate-300 font-semibold">
                Real-time Connection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <Sparkles className="w-5 h-5 text-purple-400" />

            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black">
                Intelligence
              </p>

              <p className="text-xs text-slate-300 font-semibold">
                AI Ready Workspace
              </p>
            </div>
          </div>

        </section>

        {/* Footer */}
        <footer className="mt-10 text-center">
          <p className="text-[9px] text-slate-700 uppercase tracking-[0.3em] font-bold">
            IntellMeet • AI-Powered Enterprise Collaboration
          </p>
        </footer>

      </main>
    </div>
  );
};

export default Dashboard;
