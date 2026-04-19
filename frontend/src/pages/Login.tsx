import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { getApiErrorMessage } from '../lib/apiError';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post('/auth/login', data);
      // FIXED: setAuth expects (token, user) — not (user, token)
      setAuth(response.data.access_token, response.data.user);
      toast.success('Welcome back to the Observatory');
      navigate('/dashboard');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Authentication failed'));
    }
  };

  const fillDemo = () => {
    setValue('email', 'demo@campus.edu');
    setValue('password', 'Demo@1234');
    toast('Demo credentials filled!', { icon: '🔑' });
  };

  return (
    <div className="min-h-screen flex flex-col font-body selection:bg-primary selection:text-on-primary bg-background">
      {/* TopAppBar Shell */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 bg-[#0e0e13]/60 backdrop-blur-2xl border-b border-[#39FF14]/10">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#39FF14]/10 transition-colors active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-primary">arrow_back_ios_new</span>
        </button>
        <div className="font-['Space_Grotesk'] font-bold text-primary tracking-tighter text-xl">IZUM</div>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
        {/* Asymmetric Decorative Element */}
        <div className="absolute top-20 right-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-[-5%] w-80 h-80 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Login Container */}
        <div className="w-full max-w-[440px] relative">
          <div className="mb-10 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label text-[10px] uppercase tracking-widest text-primary font-medium">Node: 0x44FB - Restricted Access</span>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface leading-tight">
              Welcome Back to the <span className="text-primary italic">Observatory</span>
            </h1>
          </div>

          {/* Login Form Card */}
          <div className="glass-panel p-8 rounded-xl shadow-[0px_24px_48px_rgba(0,0,0,0.4)]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* University ID */}
              <div className="space-y-2">
                <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold block px-1">University ID / Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">badge</span>
                  <input
                    {...register('email')}
                    className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:ring-0 focus:border-primary transition-all rounded-lg pl-12 pr-4 py-4 text-on-surface placeholder:text-outline/40"
                    placeholder="Enter ID or Email"
                    type="text"
                  />
                </div>
                {errors.email && <p className="text-error text-[10px] px-1 uppercase tracking-wider">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold block">Access Key</label>
                  <button type="button" onClick={fillDemo} className="font-label text-[10px] uppercase text-primary hover:underline transition-all">
                    Use Demo Creds
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">lock</span>
                  <input
                    {...register('password')}
                    className="w-full bg-surface-container-low border-0 border-b-2 border-transparent focus:ring-0 focus:border-primary transition-all rounded-lg pl-12 pr-4 py-4 text-on-surface placeholder:text-outline/40"
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
                <div className="flex justify-end px-1">
                  <Link to="/forgot-password" className="font-label text-[10px] uppercase text-on-surface-variant hover:text-primary transition-all">
                    Forgot Access Key?
                  </Link>
                </div>
                {errors.password && <p className="text-error text-[10px] px-1 uppercase tracking-wider">{errors.password.message}</p>}
              </div>

              {/* Sign In Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-5 rounded-full neon-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="font-headline text-sm uppercase tracking-widest">{isSubmitting ? 'Verifying...' : 'Sign In'}</span>
                  {!isSubmitting && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-outline-variant/15 text-center">
              <p className="text-on-surface-variant text-sm font-medium">
                New here? <Link to="/register" className="text-primary hover:text-primary-fixed transition-colors font-semibold">Join the Observatory</Link>
              </p>
            </div>
          </div>

          {/* Demo hint */}
          <div className="mt-4 glass-panel px-4 py-3 rounded-lg border-l-4 border-secondary/50">
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wide leading-relaxed">
              Demo: <span className="text-secondary">demo@campus.edu</span> / <span className="text-secondary">Demo@1234</span>
            </p>
          </div>

          {/* Asymmetric Metadata Badge */}
          <div className="absolute -right-4 -bottom-4 hidden lg:block">
            <div className="glass-panel px-4 py-3 rounded-lg border-l-4 border-primary">
              <p className="font-label text-[9px] leading-tight text-on-surface-variant uppercase">
                Protocol: v4.2.0-SEC<br/>
                Encryption: AES-256-GCM<br/>
                Status: <span className="text-primary">Ready</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Telemetry */}
      <footer className="w-full px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="font-label text-[9px] uppercase tracking-tighter text-on-surface-variant">Auth System</span>
            <span className="font-label text-[11px] text-primary">JWT_Bearer_Active</span>
          </div>
        </div>
        <div className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant text-center md:text-right">
          © 2024 IZUM KINETIC OBSERVATORY // DEPLOYMENT_ALPHA
        </div>
      </footer>

      {/* Grid Layout Background Helper */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]" style={{ backgroundImage: "linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)", backgroundSize: "100px 100px" }}></div>
    </div>
  );
};

export default Login;
