import React, { useState } from 'react';
import { Bell, User, ShieldAlert, Sun, Moon, Plus } from 'lucide-react';

interface HeaderProps {
  userRole: 'Doctor' | 'Admin';
  userName: string;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Header: React.FC<HeaderProps> = ({ userRole, userName, theme, setTheme }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, message: "Sepsis Warning: PAT-2091 crossed 85% risk threshold", type: 'critical' as const },
    { id: 2, message: "Drift Alarm: Client 2 triggered selective adaptation", type: 'warning' as const },
    { id: 3, message: "Aggregation completed for Round 8", type: 'success' as const }
  ];

  return (
    <header className="h-14 border-b bg-white dark:bg-[#0d1829] border-slate-200 dark:border-[#1a2744] px-6 flex items-center justify-between shrink-0 z-40">
      {/* Left: Page context */}
      <div className="flex items-center gap-3">
        <Plus className="h-4 w-4 text-teal-500 rotate-45" />
        <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">ICU Clinical Dashboard</span>
        <span className="text-[10px] bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
          FPDAF
        </span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#111d33] border border-slate-200 dark:border-[#1a2744] rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-[#1a2744] flex justify-between items-center">
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-200">Alerts</span>
                <span className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-medium">{notifications.length}</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-[#1a2744] max-h-60 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-[#152238] flex gap-2 transition-colors">
                    <ShieldAlert className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${notif.type === 'critical' ? 'text-red-500' : notif.type === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-[#1a2744] pl-3 ml-1">
          <div className="h-7 w-7 rounded-md bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <User className="h-3.5 w-3.5" />
          </div>
          <div className="text-left hidden md:block">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">{userName}</h4>
            <span className="text-[10px] text-slate-400">{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
