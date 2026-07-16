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
  Settings, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'ICU Patient List', icon: Users },
    { id: 'prediction', label: 'Sepsis Risk Predict', icon: Activity },
    { id: 'xai', label: 'Explainable AI', icon: Eye },
    { id: 'drift', label: 'CUSUM Drift Monitor', icon: LineChart },
    { id: 'federated', label: 'Federated FL Monitor', icon: Network },
    { id: 'comparison', label: 'Model Comparison', icon: BarChart3 },
    { id: 'research', label: 'Research Insights', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800">
      {/* Clinician Brand */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <Activity className="h-8 w-8 text-blue-500 animate-pulse" />
        <div>
          <h1 className="font-bold text-lg leading-tight text-white">FPDAF CDSS</h1>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">ICU Decision Alert</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* System Footer */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Doctor Sign Out
        </button>
      </div>
    </aside>
  );
};
