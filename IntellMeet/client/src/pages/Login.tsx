import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Native router path navigator
import { Mail, Lock, Video, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Dynamic production api routing fallback selector channel map
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Connects dynamically to your live production cloud server URL or your local fallback path
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // If credentials check out, update global store parameters instantly
      setAuth({ _id: data._id, name: data.name, email: data.email, role: data.role }, data.accessToken, data.refreshToken);
      alert(`Welcome back, ${data.name}!`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased text-slate-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        
        {/* Branding header */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-3 shadow-md shadow-indigo-200">
            <Video className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to IntellMeet</h2>
          <p className="text-slate-500 text-sm mt-1">Connect instantly with real-time video streaming</p>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Credentials Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl font-medium text-sm transition-all cursor-pointer shadow-md shadow-indigo-100"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* ✅ Dynamic switch navigation option to open the register account panel */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => navigate('/register')}
            className="text-indigo-600 font-semibold hover:underline cursor-pointer ml-1"
          >
            Create an Account
          </button>
        </div>

      </div>
    </div>
  );
};
