import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  Heart, 
  Activity, 
  TrendingUp 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { fetchStats } from '../services/mockDataService';
import type { ICUStats } from '../services/mockDataService';

export const DashboardCDSS: React.FC = () => {
  const [stats, setStats] = useState<ICUStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchStats()
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to reach clinical warehouse server");
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Clinical Node Offline</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Unable to connect to the SQLite clinical warehouse (port 8000).
        </p>
        <code className="bg-slate-100 dark:bg-[#0a1323] px-2.5 py-1 rounded font-mono text-[11px] text-slate-600 dark:text-slate-400 select-all">
          python3 backend/main.py
        </code>
      </div>
    );
  }

  const cardData = [
    { id: 1, title: 'Total Patients', value: stats.total_patients, subtitle: 'Active ICU cohort', icon: Users, borderColor: 'border-l-teal-500', iconColor: 'text-teal-500' },
    { id: 2, title: 'High Risk', value: stats.high_risk, subtitle: 'Immediate intervention', icon: AlertTriangle, borderColor: 'border-l-red-500', iconColor: 'text-red-500' },
    { id: 3, title: 'Medium Risk', value: stats.medium_risk, subtitle: 'Monitor hourly', icon: Heart, borderColor: 'border-l-amber-500', iconColor: 'text-amber-500' },
    { id: 4, title: 'Low Risk', value: stats.low_risk, subtitle: 'Stable parameters', icon: Activity, borderColor: 'border-l-emerald-500', iconColor: 'text-emerald-500' }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">ICU Decision Support Overview</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time sepsis risk telemetry — FPDAF personalized federated pipeline</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/15 px-2.5 py-1 rounded">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Node Online
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] ${card.borderColor} border-l-3 p-4 rounded-md`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{card.title}</span>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{card.value}</h3>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{card.subtitle}</span>
                </div>
                <Icon className={`h-5 w-5 ${card.iconColor} mt-1 opacity-60`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Admissions */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">Admissions & Discharges</h4>
            <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/15 px-2 py-0.5 rounded">Hourly</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.admissions} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '6px', fontSize: '11px' }} 
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="admissions" fill="#0d9488" radius={[3, 3, 0, 0]} name="Admitted" />
                <Bar dataKey="discharges" fill="#10b981" radius={[3, 3, 0, 0]} name="Discharged" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sepsis Trend */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">Sepsis Alerts & Drift Triggers</h4>
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/15 px-2 py-0.5 rounded">
              <TrendingUp className="h-3 w-3" /> Stable
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSepsis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBypasses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '6px', fontSize: '11px' }} 
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Area type="monotone" dataKey="sepsisAlerts" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSepsis)" name="Sepsis Alerts" />
                <Area type="monotone" dataKey="fpdafBypasses" stroke="#f97316" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBypasses)" name="CSSP Bypasses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
