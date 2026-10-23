import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Eye, 
  LineChart, 
  Network, 
  BarChart3, 
  FileText, 
  LogOut,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  Building,
  User,
  Sliders,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  userRole: 'Doctor' | 'Admin' | 'Full Access';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

interface NavGroup {
  title: string;
  roleLimit?: string;
  items: Array<{
    id: string;
    label: string;
    icon: any;
    badge?: string;
    roles: string[];
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, activeTab, setActiveTab, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navGroups: NavGroup[] = [
    {
      title: "HOSPITAL ADMIN & NETWORK",
      items: [
        { id: 'hospital-network', label: 'Hospital Network (3 Nodes)', icon: Network, badge: 'Silos', roles: ['Admin', 'Full Access'] },
        { id: 'hospital-admin', label: 'Hospital Operations & Audit', icon: Building, badge: '50 Beds', roles: ['Admin', 'Full Access'] },
        { id: 'federated', label: 'Federated Learning Hub', icon: Sliders, roles: ['Admin', 'Full Access'] },
        { id: 'drift', label: 'AD-CUSUM Drift Monitor', icon: LineChart, badge: 'Novel', roles: ['Admin', 'Full Access'] },
      ]
    },
    {
      title: "CLINICIAN & DOCTOR CDSS",
      items: [
        { id: 'dashboard', label: 'Doctor ICU CDSS', icon: LayoutDashboard, roles: ['Doctor', 'Admin', 'Full Access'] },
        { id: 'prediction', label: 'Sepsis Predict & PyTorch', icon: Cpu, badge: 'Live', roles: ['Doctor', 'Full Access'] },
        { id: 'xai', label: 'Explainable AI (XAI)', icon: Eye, roles: ['Doctor', 'Full Access'] },
        { id: 'patients', label: 'ICU Patient Registry', icon: Users, badge: 'Cohort', roles: ['Doctor', 'Full Access'] },
      ]
    },
    {
      title: "PATIENT BEDSIDE PORTAL",
      items: [
        { id: 'patient-details', label: 'Patient Bedside Monitor', icon: User, badge: 'SOFA', roles: ['Doctor', 'Admin', 'Full Access'] },
      ]
    },
    {
      title: "BENCHMARKS & METHODOLOGY",
      items: [
        { id: 'comparison', label: '6-Way Model Benchmark', icon: BarChart3, roles: ['Admin', 'Full Access'] },
        { id: 'research', label: 'Research & Methodology', icon: FileText, roles: ['Doctor', 'Admin', 'Full Access'] },
      ]
    }
  ];

  return (
    <aside className={`bg-[#0a1628] text-slate-300 flex flex-col min-h-screen border-r border-[#152238] shrink-0 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Brand Header */}
      <div className="px-4 py-3.5 border-b border-[#152238] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <HeartPulse className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-xs text-white tracking-tight leading-tight">FPDAF CDSS</h1>
              <span className="text-[10px] text-teal-400 font-medium tracking-wide block">Clinical Decision Suite</span>
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

      {/* Nav List with Sections */}
      <nav className="flex-1 px-2.5 py-2 space-y-4 overflow-y-auto">
        {navGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter(
            item => userRole === 'Full Access' || item.roles.includes(userRole)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
                  {group.title}
                </div>
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold shadow-xs' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        isActive ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer: Station & Logout */}
      <div className="p-3 border-t border-[#152238] space-y-2">
        {!isCollapsed && (
          <div className="bg-[#0c1626] p-2.5 rounded-xl border border-[#172640] text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Station Node</span>
              <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PyTorch 2.14 Online
              </span>
            </div>
            <div className="text-[10px] text-slate-300 font-medium truncate">
              Medical Center ICU &bull; Node 01
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
