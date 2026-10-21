import React, { useState } from 'react';
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
  HeartPulse,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  userRole: 'Doctor' | 'Admin' | 'Full Access';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, activeTab, setActiveTab, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'ICU Overview', icon: LayoutDashboard, roles: ['Doctor', 'Admin', 'Full Access'] },
    { id: 'patients', label: 'ICU Patient List', icon: Users, roles: ['Doctor', 'Full Access'] },
    { id: 'prediction', label: 'Sepsis Risk Predict', icon: Activity, roles: ['Doctor', 'Full Access'] },
    { id: 'xai', label: 'Explainable AI (XAI)', icon: Eye, roles: ['Doctor', 'Full Access'] },
    { id: 'drift', label: 'CUSUM Drift Monitor', icon: LineChart, roles: ['Admin', 'Full Access'] },
    { id: 'federated', label: 'Federated FL Monitor', icon: Network, roles: ['Admin', 'Full Access'] },
    { id: 'comparison', label: 'Model Benchmark', icon: BarChart3, roles: ['Admin', 'Full Access'] },
    { id: 'research', label: 'Research & Paper', icon: FileText, roles: ['Doctor', 'Admin', 'Full Access'] },
  ].filter(item => userRole === 'Full Access' || item.roles.includes(userRole));

  return (
    <aside className={`bg-[#0a1628] text-slate-300 flex flex-col min-h-screen border-r border-[#152238] shrink-0 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-60'
    }`}>
      {/* Brand */}
      <div className="px-4 py-3.5 border-b border-[#152238] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <HeartPulse className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-xs text-white tracking-tight leading-tight">FPDAF CDSS</h1>
              <span className="text-[10px] text-teal-400 font-medium tracking-wide block">Clinical AI Suite</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors hidden sm:block"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive 
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 font-semibold' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer / Station Status */}
      <div className="p-3 border-t border-[#152238] space-y-2">
        {!isCollapsed && (
          <div className="bg-[#0c1626] p-2.5 rounded-xl border border-[#172640] text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Station Node</span>
              <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <div className="text-[10px] text-slate-300 font-medium">
              Amrita Central ICU &bull; Node 01
            </div>
          </div>
        )}
        
        <button 
          onClick={onLogout}
          title={isCollapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
