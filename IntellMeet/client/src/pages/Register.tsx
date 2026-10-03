import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Video, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://intellmeet-ai-collaboration-platform-1.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      alert('Account created successfully! Redirecting to login...');
      navigate('/login'); 
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#0b0f19] to-[#05070c] flex items-center justify-center p-4 antialiased text-slate-200 relative overflow-hidden">
      {/* Decorative Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphic Form Container */}
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-8 relative z-10 transition-all duration-300 hover:border-white/[0.12]">
        
        {/* Branding header */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-[0_0_20px_rgba(79,70,229,0.4)] animate-pulse">
            <Video className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Create Account</h2>
          <p className="text-slate-400 text-xs mt-2 font-medium">Join secure, next-generation video conferences instantly</p>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Credentials Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arsath Arif"
                className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/30 text-xs transition-all duration-200 text-white placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/30 text-xs transition-all duration-200 text-white placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 px-1">Secure Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/30 text-xs transition-all duration-200 text-white placeholder-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer shadow-[0_4px_20px_rgba(79,70,229,0.25)] flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account Room...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          Already verified your account?{' '}
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline cursor-pointer ml-1 transition-colors"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
