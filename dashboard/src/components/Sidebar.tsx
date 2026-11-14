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
  ChevronLeft,
  ChevronRight,
  Building,
  User,
  Sliders,
  Cpu,
  Code2
} from 'lucide-react';
import { FPDAFLogo } from './FPDAFLogo';

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
      title: "Hospital Network & Hub",
      items: [
        { id: 'hospital-network', label: 'Hospital Network (3 Nodes)', icon: Network, badge: 'Silos', roles: ['Admin', 'Full Access'] },
        { id: 'hospital-admin', label: 'Hospital Operations & Audit', icon: Building, badge: '50 Beds', roles: ['Admin', 'Full Access'] },
        { id: 'federated', label: 'Federated Learning Hub', icon: Sliders, roles: ['Admin', 'Full Access'] },
        { id: 'drift', label: 'AD-CUSUM Drift Telemetry', icon: LineChart, badge: 'Novel', roles: ['Admin', 'Full Access'] },
      ]
    },
    {
      title: "Clinician Bedside CDSS",
      items: [
        { id: 'dashboard', label: 'ICU Telemetry CDSS', icon: LayoutDashboard, roles: ['Doctor', 'Admin', 'Full Access'] },
        { id: 'prediction', label: 'Sepsis Neural Inference', icon: Cpu, badge: 'Live', roles: ['Doctor', 'Admin', 'Full Access'] },
        { id: 'xai', label: 'Three-Pillar XAI Engine', icon: Eye, roles: ['Doctor', 'Admin', 'Full Access'] },
        { id: 'patients', label: 'ICU Patient Registry', icon: Users, badge: 'Cohort', roles: ['Doctor', 'Admin', 'Full Access'] },
      ]
    },
    {
      title: "Bedside Monitoring",
      items: [
        { id: 'patient-details', label: 'Patient Bedside Monitor', icon: User, badge: 'SOFA', roles: ['Doctor', 'Admin', 'Full Access'] },
      ]
    },
    {
      title: "Engineering & Architecture",
      items: [
        { id: 'architecture', label: 'System Architecture & Data Flow', icon: Code2, badge: 'Flow', roles: ['Doctor', 'Admin', 'Full Access'] },
        { id: 'comparison', label: '6-Way Model Benchmark', icon: BarChart3, roles: ['Admin', 'Full Access'] },
        { id: 'research', label: 'Research & Methodology', icon: FileText, roles: ['Doctor', 'Admin', 'Full Access'] },
      ]
    }
  ];

  return (
    <aside className={`bg-white/80 dark:bg-[#0a1324]/85 backdrop-blur-2xl text-slate-700 dark:text-slate-300 flex flex-col min-h-screen border-r border-black/[0.06] dark:border-white/[0.08] shrink-0 transition-all duration-300 select-none ${isCollapsed ? 'w-16' : 'w-64'
      }`}>
      {/* Brand Header with macOS Window Chrome */}
      <div className="px-3.5 py-3 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center p-1 shrink-0 shadow-xs">
            <FPDAFLogo variant="icon" className="w-full h-full" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1.5">
                <span>FPDAF</span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">CDSS</span>
              </h1>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight block">Clinical AI Suite</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors hidden sm:block"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav List with Apple Section Micro-Headings */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        {navGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter(
            item => userRole === 'Full Access' || item.roles.includes(userRole)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${isActive
                      ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/25 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white border border-transparent'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'text-teal-600 dark:text-teal-400 scale-105' : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono ${isActive
                        ? 'bg-teal-500/20 text-teal-800 dark:text-teal-200 border border-teal-500/30'
                        : 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'
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

      {/* Footer: Apple Squircle Station Status & Sign Out */}
      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
        {!isCollapsed && (
          <div className="bg-black/[0.02] dark:bg-white/[0.03] p-2.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-medium">Station Telemetry</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                PyTorch 2.14 Online
              </span>
            </div>
            <div className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold truncate">
              Medical Center ICU &bull; Station 01
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          title={isCollapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors ${isCollapsed ? 'justify-center px-0' : ''
            }`}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
