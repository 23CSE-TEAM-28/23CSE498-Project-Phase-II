import React, { useState, useEffect } from 'react';
import { 
  Key, 
  User, 
  Stethoscope, 
  Hospital, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Code2, 
  Sparkles
} from 'lucide-react';
import { FPDAFLogo } from '../components/FPDAFLogo';

interface LoginProps {
  onLoginSuccess: (role: 'Doctor' | 'Admin', name: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<'Doctor' | 'Admin'>('Doctor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickLogin = (presetRole: 'Doctor' | 'Admin', name: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(presetRole, name);
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please provide your workstation credentials.');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'Doctor') {
        // Dr. Pallavi is the only clinician
        onLoginSuccess('Doctor', 'Dr. Pallavi');
      } else {
        // Akshar is the only developer
        onLoginSuccess('Admin', 'Akshar');
      }
    }, 550);
  };

  return (
    <div className="min-h-screen w-screen bg-[#070d18] relative flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden font-sans select-none">
      {/* Apple Ambient Dynamic Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Glassmorphic Container (macOS Pro Window Aesthetic) */}
      <div className="relative z-10 w-full max-w-4xl bg-[#0c1527]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.65)] rounded-3xl overflow-hidden flex flex-col md:flex-row transition-all">
        
        {/* macOS Window Titlebar / Chrome Dots */}
        <div className="absolute top-4 left-5 flex items-center gap-2 z-20">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/10 shadow-xs" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-black/10 shadow-xs" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] border border-black/10 shadow-xs" />
          <span className="ml-3 text-[11px] font-medium text-slate-400/80 tracking-tight hidden sm:inline">
            FPDAF Clinical Decision Support Station &bull; {currentTime || '22:00'} IST
          </span>
        </div>

        {/* Left Side: System Narrative & Architecture Stats */}
        <div className="flex-1 p-8 sm:p-10 pt-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
          <div>
            {/* Redesigned Official Logo matching Apple Dashboard Theme */}
            <div className="mb-6">
              <FPDAFLogo variant="full" className="w-full max-w-[440px] filter drop-shadow-[0_8px_28px_rgba(45,212,191,0.22)]" />
            </div>

            {/* Hospital & Lab Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 mb-5">
              <Hospital className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-teal-300 text-[11px] font-semibold tracking-wide uppercase">Amrita School of Computing &bull; Medical ICU</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-md mb-8">
              Prospective 6-hour early sepsis onset forecasting with BiLSTM temporal attention. Autonomous per-hospital edge personalization with AD-CUSUM drift telemetry.
            </p>

            {/* Apple-style Metric Capsules */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-md">
                <span className="text-xl font-bold text-teal-400 telemetry-mono block">5.9h</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mt-0.5">Early Warning</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-md">
                <span className="text-xl font-bold text-cyan-400 telemetry-mono block">96.2%</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mt-0.5">Accuracy</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-md">
                <span className="text-xl font-bold text-indigo-400 telemetry-mono block">41.8%</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mt-0.5">False-Alarm ↓</span>
              </div>
            </div>
          </div>

          {/* Privacy & Regulatory Compliance Badges */}
          <div className="pt-6 border-t border-white/[0.05] flex items-center flex-wrap gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              <span>DPDPA 2023 Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              <span>Zero-Raw-Data Edge AI</span>
            </div>
          </div>
        </div>

        {/* Right Side: Apple Sign-In Panel */}
        <div className="w-full md:w-[420px] p-8 sm:p-10 pt-16 flex flex-col justify-between bg-black/20">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Workstation Access</h2>
              <p className="text-xs text-slate-400 mt-1">Select your authorized profile to proceed</p>
            </div>

            {/* Quick Access Profile Cards (ONLY Dr. Pallavi and Akshar) */}
            <div className="space-y-3 mb-6">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Authorized Profiles
              </span>

              {/* 1. Dr. Pallavi - Clinician */}
              <button
                type="button"
                onClick={() => handleQuickLogin('Doctor', 'Dr. Pallavi')}
                disabled={isLoading}
                className="w-full group p-3.5 rounded-2xl border border-teal-500/25 bg-teal-500/[0.06] hover:bg-teal-500/[0.12] hover:border-teal-500/40 text-left transition-all duration-200 disabled:opacity-50 relative overflow-hidden shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white block">Dr. Pallavi</span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          Clinician
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                        Lead Intensivist &bull; ICU Specialist
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>

              {/* 2. Akshar - Developer & System Architect */}
              <button
                type="button"
                onClick={() => handleQuickLogin('Admin', 'Akshar')}
                disabled={isLoading}
                className="w-full group p-3.5 rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.12] hover:border-indigo-500/40 text-left transition-all duration-200 disabled:opacity-50 relative overflow-hidden shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white block">Akshar</span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Developer
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                        Lead AI Engineer &bull; System Architect
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-white/[0.08]" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Or Sign In With Credentials
              </span>
              <div className="flex-grow border-t border-white/[0.08]" />
            </div>

            {/* Apple Segmented Role Control */}
            <div className="bg-black/30 p-1 rounded-xl border border-white/[0.08] grid grid-cols-2 gap-1 mb-4">
              <button
                type="button"
                onClick={() => {
                  setRole('Doctor');
                  setUsername('Dr. Pallavi');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                  role === 'Doctor'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>Dr. Pallavi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('Admin');
                  setUsername('Akshar');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                  role === 'Admin'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Akshar</span>
              </button>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs p-2.5 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  {role === 'Doctor' ? 'Clinician Profile' : 'Developer Identity'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={role === 'Doctor' ? "Dr. Pallavi" : "Akshar"}
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 text-white placeholder:text-slate-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 text-white placeholder:text-slate-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all duration-200 text-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
              >
                {isLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-slate-950" />
                    <span>Open Workstation</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-500">
            <span>FPDAF v2.0 &bull; Build 2026.11</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Sparkles className="h-3 w-3 text-teal-400" />
              Apple HIG Engine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
