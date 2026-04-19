import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../lib/apiError';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid reset link.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password updated! You can now log in.');
      navigate('/login');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-black text-on-surface h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-surface-container rounded-3xl border border-white/10">
          <span className="material-symbols-outlined text-error text-6xl mb-4">link_off</span>
          <h2 className="text-2xl font-black mb-4">Invalid Link</h2>
          <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-on-surface font-body h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 obsidian-grid opacity-20 pointer-events-none"></div>
      
      <div className="bg-surface-container-high/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 max-w-sm w-full mx-6 z-10">
        <h2 className="text-2xl font-black font-headline tracking-tighter mb-2">New Password</h2>
        <p className="text-zinc-400 text-sm mb-8">Set a strong password to secure your account.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-label text-[10px] uppercase tracking-widest text-zinc-500 ml-2 mb-1 block">New Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="font-label text-[10px] uppercase tracking-widest text-zinc-500 ml-2 mb-1 block">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-black font-bold py-3 rounded-full hover:shadow-[0_0_20px_rgba(142,255,113,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
