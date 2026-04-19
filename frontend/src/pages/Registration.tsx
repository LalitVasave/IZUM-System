import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../lib/apiError';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  college_id: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await api.post('/auth/register', {
        ...data,
        role: 'student',
      });
      
      if (res.data.mock_verification_link) {
        toast.success('Registration successful. Verifying your demo account...');
        const verificationUrl = new URL(res.data.mock_verification_link);
        navigate(`${verificationUrl.pathname}${verificationUrl.search}`);
        return;
      }

      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Registration failed'));
    }
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="fixed top-0 w-full z-50 flex items-center px-6 h-16 bg-[#0e0e13]/60 backdrop-blur-lg border-b border-[#39FF14]/10 shadow-[0_0_12px_rgba(57,255,20,0.05)]">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#39FF14] cursor-pointer scale-95 active:duration-100" onClick={() => navigate(-1)}>arrow_back</span>
            <h1 className="text-[#39FF14] font-black tracking-tighter text-xl uppercase font-headline">IZUM MOBILITY</h1>
          </div>
          <div className="hidden md:flex gap-8">
            <span className="font-['Inter'] uppercase tracking-widest text-sm text-[#39FF14]">Registration Portal</span>
          </div>
        </div>
      </header>

      <main className="relative min-h-screen pt-24 pb-12 flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 obsidian-grid pointer-events-none"></div>
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative w-full max-w-md px-6 z-10">
          {/* Welcome Hero */}
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">System Status: Ready</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter mb-2 text-on-surface">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Observatory</span>
            </h2>
            <p className="text-on-surface-variant font-light max-w-sm">Secure your access to the next generation of campus mobility analytics.</p>
          </div>

          {/* Registration Form Glass Panel */}
          <div className="glass-panel p-8 rounded-3xl shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Field: Full Name */}
              <div className="space-y-1.5 group">
                <label className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant ml-1">Full Name</label>
                <div className="relative">
                  <input
                    {...register('name')}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary transition-all font-body"
                    placeholder="ALEX RIVERA"
                    type="text"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-focus-within:w-full transition-all duration-300 shadow-[0_2px_8px_rgba(142,255,113,0.4)]"></div>
                </div>
                {errors.name && <p className="text-error text-[10px] px-1">{errors.name.message}</p>}
              </div>

              {/* Field: Campus Email */}
              <div className="space-y-1.5 group">
                <label className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant ml-1">Campus Email</label>
                <div className="relative">
                  <input
                    {...register('email')}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary transition-all font-body"
                    placeholder="A.RIVERA@CAMPUS.EDU"
                    type="email"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-focus-within:w-full transition-all duration-300 shadow-[0_2px_8px_rgba(142,255,113,0.4)]"></div>
                </div>
                {errors.email && <p className="text-error text-[10px] px-1">{errors.email.message}</p>}
              </div>

              {/* Field: College ID (optional) */}
              <div className="space-y-1.5 group">
                <label className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant ml-1">College ID <span className="opacity-50">(optional)</span></label>
                <div className="relative">
                  <input
                    {...register('college_id')}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary transition-all font-body"
                    placeholder="SCH-20XX-XXXX"
                    type="text"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-focus-within:w-full transition-all duration-300 shadow-[0_2px_8px_rgba(142,255,113,0.4)]"></div>
                </div>
              </div>

              {/* Field: Password */}
              <div className="space-y-1.5 group">
                <label className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant ml-1">Password</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary transition-all font-body"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    type="password"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-focus-within:w-full transition-all duration-300 shadow-[0_2px_8px_rgba(142,255,113,0.4)]"></div>
                </div>
                {errors.password && <p className="text-error text-[10px] px-1">{errors.password.message}</p>}
                <p className="text-on-surface-variant text-[9px] px-1 uppercase tracking-wide">Requires 1 uppercase letter + 1 number</p>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 py-4 rounded-full bg-gradient-to-tr from-primary to-primary-container text-black font-extrabold font-headline uppercase tracking-widest text-sm transition-all glow-button active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Securing Identity...' : 'Register Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/login" className="font-label text-[11px] uppercase tracking-tighter text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2">
                Already have an identity? <span className="text-primary font-bold">Sign in instead</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Editorial Accents */}
          <div className="mt-12 flex justify-between items-end opacity-40">
            <div className="flex flex-col">
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Encryption Level</span>
              <span className="font-label text-sm text-secondary uppercase font-bold">AES-256-GCM</span>
            </div>
            <div className="text-right">
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Location Node</span>
              <span className="font-label text-sm text-primary uppercase font-bold block">IZUM-GLOBAL-01</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Decorative Bar */}
      <div className="fixed bottom-0 left-0 w-full px-12 py-4 flex justify-between items-center pointer-events-none opacity-20">
        <span className="font-label text-[8px] uppercase tracking-[0.4em] text-on-surface">IZUM Kinetic Mobility Protocol v4.2.0</span>
        <div className="flex gap-4">
          <span className="w-1 h-1 bg-primary rounded-full"></span>
          <span className="w-1 h-1 bg-primary rounded-full"></span>
          <span className="w-1 h-1 bg-primary rounded-full"></span>
        </div>
      </div>
    </div>
  );
};

export default Registration;
