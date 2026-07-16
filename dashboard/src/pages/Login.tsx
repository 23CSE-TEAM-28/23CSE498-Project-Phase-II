import React, { useState } from 'react';
import { HeartPulse, Key, User, ShieldAlert, Award } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (role: 'Doctor' | 'Admin', name: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<'Doctor' | 'Admin'>('Doctor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and security key.');
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
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080e1a] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6 text-center">
          <HeartPulse className="h-8 w-8 text-teal-500 mb-3" />
          <h1 className="font-bold text-xl text-slate-800 dark:text-white">FPDAF CDSS</h1>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">ICU Sepsis Forecasting Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] rounded-lg shadow-sm p-6">
          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-[#0a1323] p-1 rounded-md mb-5">
            <button
              type="button"
              onClick={() => setRole('Doctor')}
              className={`py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                role === 'Doctor'
                  ? 'bg-white dark:bg-[#152238] text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              Doctor
            </button>
            <button
              type="button"
              onClick={() => setRole('Admin')}
              className={`py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                role === 'Admin'
                  ? 'bg-white dark:bg-[#152238] text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs p-2.5 rounded font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {role === 'Doctor' ? 'Username' : 'Node ID'}
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === 'Doctor' ? "e.g., AksharSakhi" : "e.g., Hospital-A"}
                  className="w-full bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] rounded-md py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Security Key
              </label>
              <div className="relative">
                <Key className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] rounded-md py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-md transition-colors text-sm disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
        <div className="mt-4 text-center text-[10px] text-slate-400 leading-relaxed">
          🔒 HIPAA-compliant workspace. Sessions are encrypted and logged.
        </div>
      </div>
    </div>
  );
};
