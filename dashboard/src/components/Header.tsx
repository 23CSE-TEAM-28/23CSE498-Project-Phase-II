import React, { useState, useEffect } from 'react';
import { Bell, User, ShieldAlert, Sun, Moon, ShieldCheck, Cpu, Volume2, VolumeX, Clock, Hospital } from 'lucide-react';

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

  return (
    <header className="h-14 border-b bg-white dark:bg-[#0c1626] border-slate-200 dark:border-[#1a2942] px-4 md:px-6 flex items-center justify-between shrink-0 z-40 transition-colors">
      {/* Left: Hospital Brand & Live Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Hospital className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-xs md:text-sm tracking-tight">
                AMRITA MEDICAL CENTER
              </span>
              <span className="hidden sm:inline text-[10px] text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#142236]">
                ICU Central
              </span>
            </div>
          </div>
        </div>

        {/* Live Feed Pill & Hospital Clock */}
        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-[#1a2942]">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isLiveStreaming 
                ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500' 
                : 'text-slate-400 hover:text-slate-500'
            }`}
            title="Toggle real-time physiological telemetry feed"
          >
            <span className={`h-2 w-2 rounded-full ${isLiveStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-[11px]">{isLiveStreaming ? 'Live Bedside Feed' : 'Feed Paused'}</span>
          </button>

          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 telemetry-mono">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{currentTime || '21:40:00'}</span>
            <span className="text-[10px] text-slate-400 font-sans">IST</span>
          </div>
        </div>
      </div>

      {/* Right: Controls & Clinician Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Role Switcher */}
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-[#0a1323] p-0.5 rounded-lg border border-slate-200 dark:border-[#1a2744] text-[11px] font-medium">
          <button
            onClick={() => setUserRole('Doctor')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              userRole === 'Doctor' ? 'bg-white dark:bg-[#15243b] text-teal-600 dark:text-teal-400 font-semibold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Clinician
          </button>
          <button
            onClick={() => setUserRole('Admin')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              userRole === 'Admin' ? 'bg-white dark:bg-[#15243b] text-amber-600 dark:text-amber-400 font-semibold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setUserRole('Full Access')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              userRole === 'Full Access' ? 'bg-teal-600 text-white font-semibold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            All Modules
          </button>
        </div>

        {/* ICU Alarm Status Toggle */}
        <button
          onClick={() => setIsAlarmSilenced(!isAlarmSilenced)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
            isAlarmSilenced 
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' 
              : 'bg-slate-100 dark:bg-[#121f33] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1e304d] hover:bg-slate-200'
          }`}
          title={isAlarmSilenced ? "Alarms Muted for 120s - Click to Unmute" : "Audible Alarms Active - Click to Mute"}
        >
          {isAlarmSilenced ? <VolumeX className="h-3 w-3 text-amber-500" /> : <Volume2 className="h-3 w-3 text-emerald-500" />}
          <span className="hidden sm:inline">{isAlarmSilenced ? 'Muted (120s)' : 'Audio Active'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Light/Dark Mode"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Clinical Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-red-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#1a2744] flex justify-between items-center bg-slate-50/50 dark:bg-[#0a1323]/50">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-3.5 w-3.5 text-teal-500" />
                  <span className="font-semibold text-xs text-slate-800 dark:text-white">Clinical Alerts</span>
                </div>
                <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-1.5 py-0.2 rounded-full">{notifications.length}</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-[#1a2744] max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <button
                    key={notif.id} 
                    onClick={() => {
                      setActiveTab(notif.tab);
                      setShowNotifications(false);
                    }}
                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-[#152238] flex gap-2.5 transition-colors group"
                  >
                    <div className={`p-1 rounded-md shrink-0 mt-0.5 ${
                      notif.type === 'critical' ? 'bg-red-500/10 text-red-500' : notif.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {notif.type === 'critical' ? <ShieldAlert className="h-3.5 w-3.5" /> : notif.type === 'warning' ? <Cpu className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium block">View in {notif.tab} &rarr;</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-[#1a2744]">
          <div className="h-7 w-7 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-xs">
            <User className="h-3.5 w-3.5" />
          </div>
          <div className="text-left hidden md:block">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">{userName}</h4>
            <span className="text-[10px] text-slate-400 font-normal block">{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
