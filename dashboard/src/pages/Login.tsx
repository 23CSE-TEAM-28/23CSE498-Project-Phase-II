import React, { useState, useEffect } from 'react';
import { HeartPulse, Key, User, ShieldAlert, Award, Stethoscope, Activity, Hospital, Lock, ArrowRight, Shield } from 'lucide-react';

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
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both credentials.');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'Doctor') {
        onLoginSuccess('Doctor', `Dr. ${username}`);
      } else {
        onLoginSuccess('Admin', `Admin ${username}`);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#060d19] flex font-sans relative overflow-hidden">

      {/* Left Panel: Hero / Branding */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-10 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] bg-blue-500/6 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Hospital Badge */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
              <Hospital className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight block">Amrita Medical Center</span>
              <span className="text-slate-500 text-[11px] font-medium">ICU Central Station &bull; {currentTime} IST</span>
            </div>
          </div>
        </div>

        {/* Center: Main Hero */}
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-1 w-8 bg-teal-500 rounded-full" />
            <span className="text-teal-400 text-[11px] font-semibold uppercase tracking-widest">AI-Powered Clinical Decision Support</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
            Federated Personalized
            <br />
            <span className="text-teal-400">Sepsis Forecasting</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Real-time 24-hour multivariate inference with BiLSTM attention-based early warning. 
            Personalized per-hospital adaptation via federated learning with autonomous concept drift detection.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-[#14223a]">
            <div>
              <span className="text-2xl font-bold text-white telemetry-mono block">5.9h</span>
              <span className="text-[11px] text-slate-500 font-medium">Early Warning Lead Time</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white telemetry-mono block">41.8%</span>
              <span className="text-[11px] text-slate-500 font-medium">False-Alarm Reduction</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white telemetry-mono block">3</span>
              <span className="text-[11px] text-slate-500 font-medium">Federated Hospital Nodes</span>
            </div>
          </div>
        </div>

        {/* Bottom: Compliance Tags */}
        <div className="relative z-10 flex items-center gap-4 mt-10">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <Shield className="h-3 w-3 text-slate-600" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <Lock className="h-3 w-3 text-slate-600" />
            <span>DPDPA Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <Shield className="h-3 w-3 text-slate-600" />
            <span>Local Edge-AI Architecture</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-center px-8 md:px-12 lg:px-14 py-10 bg-[#0a1020] lg:bg-[#0a1020]/80 lg:backdrop-blur-xl lg:border-l border-[#14223a] relative">

        {/* Mobile-only brand header */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="h-9 w-9 rounded-lg bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
            <HeartPulse className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <span className="text-white font-bold text-sm block">FPDAF CDSS</span>
            <span className="text-slate-500 text-[10px] font-medium">Clinical AI Suite</span>
          </div>
        </div>

        {/* Form Top */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight">Welcome back</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to access the ICU Clinical Workstation</p>
        </div>

        {/* Quick Access Buttons */}
        <div className="space-y-2.5 mb-6">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Quick Access</span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('Doctor', 'Dr. Pallavi')}
              disabled={isLoading}
              className="group p-3.5 rounded-xl border border-[#1a2d4a] bg-[#0d1829] hover:bg-[#121f35] hover:border-teal-500/30 text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-teal-500/10">
                  <Stethoscope className="h-4 w-4 text-teal-400" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-teal-400 transition-colors" />
              </div>
              <span className="font-semibold text-xs text-white block">Dr. Pallavi</span>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">ICU Specialist &bull; Clinician</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('Admin', 'Admin Administrator')}
              disabled={isLoading}
              className="group p-3.5 rounded-xl border border-[#1a2d4a] bg-[#0d1829] hover:bg-[#121f35] hover:border-amber-500/30 text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10">
                  <Activity className="h-4 w-4 text-amber-400" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
              </div>
              <span className="font-semibold text-xs text-white block">FL Administrator</span>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">CUSUM &bull; Network Admin</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center my-5">
          <div className="flex-grow border-t border-[#172640]"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase font-semibold text-slate-600 tracking-wider">Or sign in manually</span>
          <div className="flex-grow border-t border-[#172640]"></div>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-1 bg-[#070e1c] p-1 rounded-lg border border-[#14223a] mb-5">
          <button
            type="button"
            onClick={() => setRole('Doctor')}
            className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              role === 'Doctor'
                ? 'bg-[#121f35] text-teal-400 shadow-xs border border-[#1a2d4a]'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <Award className="h-3.5 w-3.5" /> Clinician
          </button>
          <button
            type="button"
            onClick={() => setRole('Admin')}
            className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              role === 'Admin'
                ? 'bg-[#121f35] text-teal-400 shadow-xs border border-[#1a2d4a]'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" /> Administrator
          </button>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs p-2.5 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              {role === 'Doctor' ? 'Clinician Username' : 'Node Security ID'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === 'Doctor' ? "e.g. Dr. Pallavi" : "e.g. Hospital-A-Node"}
                className="w-full bg-[#070e1c] border border-[#1a2d4a] rounded-lg py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 text-slate-200 placeholder:text-slate-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Security Token
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#070e1c] border border-[#1a2d4a] rounded-lg py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 text-slate-200 placeholder:text-slate-600 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-teal-600/10"
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span>Sign In to Workstation</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#14223a] flex items-center justify-between text-[10px] text-slate-600">
          <span className="font-medium">FPDAF Clinical AI Suite v2.0</span>
          <div className="flex items-center gap-1">
            <Lock className="h-2.5 w-2.5" />
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#060d19]/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
              <HeartPulse className="h-6 w-6 text-teal-400 animate-pulse" />
            </div>
            <span className="text-xs text-slate-300 font-medium">Initializing Clinical Workspace...</span>
          </div>
        </div>
      )}
    </div>
  );
};
