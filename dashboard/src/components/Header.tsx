import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Clock, 
  Stethoscope,
  Code2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { FPDAFLogo } from './FPDAFLogo';

interface HeaderProps {
  userRole: 'Doctor' | 'Admin' | 'Full Access';
  setUserRole: (role: 'Doctor' | 'Admin' | 'Full Access') => void;
  userName: string;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isLiveStreaming: boolean;
  setIsLiveStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  userRole, 
  setUserRole, 
  userName, 
  theme, 
  setTheme,
  isLiveStreaming,
  setIsLiveStreaming,
  setActiveTab
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAlarmSilenced, setIsAlarmSilenced] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const notifications = [
    { id: 1, message: "CRITICAL SEPSIS: 9 ICU beds exceed threshold (HR > 115, MAP < 65)", type: 'critical' as const, tab: 'dashboard' },
    { id: 2, message: "Drift Telemetry: Hospital Node 2 AD-CUSUM Sr = 3.42 > Threshold (3.0)", type: 'warning' as const, tab: 'drift' },
    { id: 3, message: "Personalized CSSP Head adapted successfully for Client Node 2", type: 'success' as const, tab: 'federated' }
  ];

  // Dynamic profile info strictly honoring single doctor & developer
  const profileDetails = userRole === 'Doctor' 
    ? {
        name: userName || 'Dr. Pallavi',
        roleLabel: 'Lead Intensivist & ICU Specialist',
        initials: 'DP',
        badgeBg: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30'
      }
    : userRole === 'Admin'
    ? {
        name: userName || 'Akshar',
        roleLabel: 'Lead AI Engineer & System Architect',
        initials: 'AS',
        badgeBg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
      }
    : {
        name: userName || 'Akshar & Dr. Pallavi',
        roleLabel: 'Full System Clinical & Engineering Access',
        initials: 'AP',
        badgeBg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
      };

  return (
    <header className="h-14 border-b bg-white/75 dark:bg-[#0c1527]/75 backdrop-blur-xl border-black/[0.06] dark:border-white/[0.08] px-4 md:px-6 flex items-center justify-between shrink-0 z-40 transition-colors select-none">
      
      {/* Left: Hospital Brand & Real-time Live Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 p-1 rounded-xl bg-teal-500/10 border border-teal-500/20 shadow-xs flex items-center justify-center">
            <FPDAFLogo variant="icon" className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white text-xs md:text-sm tracking-tight">
                FPDAF CDSS
              </span>
              <span className="hidden sm:inline text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase px-1.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20">
                Station 01
              </span>
            </div>
          </div>
        </div>

        {/* Live Feed Pill & Hospital Clock */}
        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              isLiveStreaming 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 border border-transparent'
            }`}
            title="Toggle real-time physiological telemetry stream"
          >
            <span className={`h-2 w-2 rounded-full ${isLiveStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-[11px] font-semibold">{isLiveStreaming ? 'Bedside Stream Live' : 'Stream Paused'}</span>
          </button>

          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 telemetry-mono">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="font-semibold">{currentTime || '22:00:00'}</span>
            <span className="text-[10px] text-slate-400 font-sans">IST</span>
          </div>
        </div>
      </div>

      {/* Right: Apple Segmented Role Switcher & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* Apple Segmented Control for Role Switching */}
        <div className="hidden lg:flex items-center bg-black/[0.04] dark:bg-white/[0.05] p-1 rounded-xl border border-black/[0.05] dark:border-white/[0.08] text-xs">
          <button
            onClick={() => setUserRole('Doctor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              userRole === 'Doctor' 
                ? 'bg-white dark:bg-white/15 text-teal-700 dark:text-teal-300 shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Dr. Pallavi</span>
          </button>

          <button
            onClick={() => setUserRole('Admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              userRole === 'Admin' 
                ? 'bg-white dark:bg-white/15 text-indigo-700 dark:text-indigo-300 shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Akshar</span>
          </button>

          <button
            onClick={() => setUserRole('Full Access')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              userRole === 'Full Access' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>All Modules</span>
          </button>
        </div>

        {/* ICU Alarm Audio Button (Apple Squircle) */}
        <button
          onClick={() => setIsAlarmSilenced(!isAlarmSilenced)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
            isAlarmSilenced 
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25' 
              : 'bg-black/[0.03] dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border-black/[0.05] dark:border-white/[0.08] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
          }`}
          title={isAlarmSilenced ? "Alarms Muted for 120s - Click to Unmute" : "Audible Alarms Active - Click to Mute"}
        >
          {isAlarmSilenced ? <VolumeX className="h-3.5 w-3.5 text-amber-500" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-500" />}
          <span className="hidden sm:inline">{isAlarmSilenced ? 'Muted' : 'Audio On'}</span>
        </button>

        {/* Theme Toggle (Apple Squircle) */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all"
          title="Toggle Light/Dark Mode"
        >
          {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
        </button>

        {/* Clinical Notifications (Apple Glass Dropdown) */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all relative"
            title="Clinical Alerts"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0c1527]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white/90 dark:bg-[#0d1829]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.08] flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-teal-500" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">Clinical Telemetry Alerts</span>
                </div>
                <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-full border border-red-500/20">
                  {notifications.length} Active
                </span>
              </div>
              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06] max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <button
                    key={notif.id} 
                    onClick={() => {
                      setActiveTab(notif.tab);
                      setShowNotifications(false);
                    }}
                    className="w-full text-left p-3.5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] flex gap-3 transition-colors group"
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      notif.type === 'critical' ? 'bg-red-500/15 text-red-500' : notif.type === 'warning' ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'
                    }`}>
                      {notif.type === 'critical' ? <ShieldAlert className="h-4 w-4" /> : notif.type === 'warning' ? <Cpu className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                        Inspect in {notif.tab} &rarr;
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Card: Strictly Dr. Pallavi or Akshar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-black/[0.06] dark:border-white/[0.08]">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs border shadow-xs ${profileDetails.badgeBg}`}>
            {profileDetails.initials}
          </div>
          <div className="text-left hidden md:block">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {profileDetails.name}
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
              {profileDetails.roleLabel}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
