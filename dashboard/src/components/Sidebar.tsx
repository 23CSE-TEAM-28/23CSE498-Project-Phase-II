import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Eye, 
  LineChart, 
  Network, 
  BarChart3, 
  FileText, 
  LogOut,
  HeartPulse
} from 'lucide-react';

interface SidebarProps {
  userRole: 'Doctor' | 'Admin';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Doctor', 'Admin'] },
    { id: 'patients', label: 'ICU Patient List', icon: Users, roles: ['Doctor'] },
    { id: 'prediction', label: 'Sepsis Risk Predict', icon: Activity, roles: ['Doctor'] },
    { id: 'xai', label: 'Explainable AI', icon: Eye, roles: ['Doctor'] },
    { id: 'drift', label: 'CUSUM Drift Monitor', icon: LineChart, roles: ['Admin'] },
    { id: 'federated', label: 'Federated FL Monitor', icon: Network, roles: ['Admin'] },
    { id: 'comparison', label: 'Model Comparison', icon: BarChart3, roles: ['Admin'] },
    { id: 'research', label: 'Research Insights', icon: FileText, roles: ['Doctor', 'Admin'] },
  ].filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-56 bg-[#0a1628] text-slate-300 flex flex-col min-h-screen border-r border-[#152238] shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#152238] flex items-center gap-2.5">
        <HeartPulse className="h-6 w-6 text-teal-400" />
        <div>
          <h1 className="font-semibold text-sm leading-tight text-white tracking-wide">FPDAF CDSS</h1>
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">ICU Monitor</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                isActive 
                  ? 'bg-teal-600/15 text-teal-400 border-l-2 border-teal-400' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[#152238]">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-slate-500 hover:bg-red-950/30 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {userRole === 'Doctor' ? 'Sign Out' : 'Admin Logout'}
        </button>
      </div>
    </aside>
  );
};
