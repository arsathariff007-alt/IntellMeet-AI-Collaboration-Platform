import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Imported the client-side router navigation utility
import { Video, PlusCircle, LogOut, Keyboard } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Dynamic production api routing fallback selector channel map
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, accessToken, logout } = useAuthStore();
  const [meetingTitle, setMeetingTitle] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Generates a meeting record and pushes page context directly inside the call room
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;
    setLoading(true);

    try {
      // Replaced hardcoded address string with your active environment configuration variable path
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

      // ✅ AUTOMATED ROUTING: Push user straight into the new call room workspace
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
    
    // ✅ AUTOMATED ROUTING: Push user directly into the pasted call code room parameter
    navigate(`/room/${joinCode.trim().toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Video className="w-4 h-4" />
          </div>
          IntellMeet Dashboard
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold uppercase">
              {user?.name.slice(0, 2)}
            </div>
            <span className="text-xs font-semibold text-slate-700">{user?.name}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-rose-600 font-medium hover:bg-rose-50 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create a New Video Call</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Generate a unique 9-character communication path linked to your account database instantly.
            </p>
            
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <input
                type="text"
                required
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Enter meeting topic (e.g., Code Review)"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white text-xs transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl font-medium text-xs transition-all cursor-pointer shadow-md shadow-indigo-100"
              >
                {loading ? 'Creating room...' : 'Generate Call Link'}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <Keyboard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Join an Existing Call</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Enter a 9-character room identifier link key shared by another organizer to join the WebSockets bridge.
            </p>
            
            <form onSubmit={handleJoinMeeting} className="space-y-4">
              <input
                type="text"
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="abc-def-ghi"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white text-xs transition-all tracking-widest text-center uppercase"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs transition-all cursor-pointer shadow-md"
              >
                Connect to Call
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
