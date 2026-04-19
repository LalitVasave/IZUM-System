import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../lib/apiError';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(
        <div>
          <p>{res.data.message}</p>
          {res.data.mock_reset_link && (
            <>
              <p className="text-xs text-zinc-400 mt-1">Hackathon Demo Link:</p>
              <a href={res.data.mock_reset_link} className="text-primary hover:underline text-xs" target="_blank" rel="noreferrer">
                Click here to reset
              </a>
            </>
          )}
        </div>,
        { duration: 10000 }
      );
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to request reset. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-on-surface font-body h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 obsidian-grid opacity-20 pointer-events-none"></div>
      
      <div className="bg-surface-container-high/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 max-w-sm w-full mx-6 z-10">
        <button onClick={() => navigate('/login')} className="text-zinc-500 hover:text-white mb-6">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        <h2 className="text-2xl font-black font-headline tracking-tighter mb-2">Reset Password</h2>
        <p className="text-zinc-400 text-sm mb-8">Enter your campus email to receive a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-label text-[10px] uppercase tracking-widest text-zinc-500 ml-2 mb-1 block">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="student@campus.edu"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !email}
            className="w-full bg-primary text-black font-bold py-3 rounded-full hover:shadow-[0_0_20px_rgba(142,255,113,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
