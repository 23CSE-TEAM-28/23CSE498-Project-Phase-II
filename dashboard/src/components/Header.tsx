import React, { useState } from 'react';
import { Bell, User, ShieldAlert, Heart, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  userRole: 'Doctor' | 'Admin';
  userName: string;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Header: React.FC<HeaderProps> = ({ userRole, userName, theme, setTheme }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const mockNotifications = [
    { id: 1, message: "⚠️ Sepsis Warning: Patient PAT-2091 has crossed risk threshold of 85%", type: 'critical' },
    { id: 2, message: "🚨 Drift Alarm: Client 2 validation residual drift triggered selective adaptation CSSP", type: 'warning' },
    { id: 3, message: "✅ Federated Aggregation completed for Communication Round 8", type: 'success' }
  ];

  return (
    <header className="h-16 border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-4">
        <Heart className="h-6 w-6 text-red-500 fill-red-500 animate-pulse" />
        <span className="font-bold text-slate-800 dark:text-white text-lg">ICU Clinical Dashboard</span>
        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
          FPDAF Framework
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark Mode"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-500" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-ping"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                <span className="font-bold text-sm text-slate-800 dark:text-white">ICU Workspace Notifications</span>
                <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">Active Alerts</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex gap-3 transition-colors">
                    <ShieldAlert className={`h-5 w-5 shrink-0 ${notif.type === 'critical' ? 'text-red-500' : notif.type === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <p className="text-xs leading-normal text-slate-600 dark:text-slate-300 font-medium">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Doctor Identity */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-6">
          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <User className="h-5 w-5" />
          </div>
          <div className="text-left hidden md:block">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{userName}</h4>
            <span className="text-xs text-slate-400 font-medium">{userRole} Credentials</span>
          </div>
        </div>
      </div>
    </header>
  );
};
