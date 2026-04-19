import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your identity...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    api.post('/auth/verify', { token })
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || err.response?.data?.error || 'Verification failed. Token may be expired.');
      });
  }, [token]);

  return (
    <div className="bg-black text-on-surface font-body h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 obsidian-grid opacity-20 pointer-events-none"></div>
      
      <div className="bg-surface-container-high/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 max-w-sm w-full mx-6 text-center z-10">
        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold font-headline">{message}</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6">
            <span className="material-symbols-outlined text-6xl text-primary mb-4">check_circle</span>
            <h2 className="text-xl font-bold font-headline mb-2 text-primary">Identity Confirmed</h2>
            <p className="text-zinc-400 text-sm mb-8">{message}</p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-black font-bold py-3 rounded-full hover:shadow-[0_0_20px_rgba(142,255,113,0.3)] transition-all"
            >
              Proceed to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6">
            <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
            <h2 className="text-xl font-bold font-headline mb-2 text-error">Verification Failed</h2>
            <p className="text-zinc-400 text-sm mb-8">{message}</p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-surface-container border border-white/10 text-white font-bold py-3 rounded-full hover:bg-surface-container-highest transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
