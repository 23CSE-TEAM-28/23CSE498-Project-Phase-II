import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  Heart, 
  Activity, 
  TrendingUp,
  ShieldAlert,
  RefreshCw,
  BedDouble,
  Building2
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
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchStats()
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      });
  }, []);

  const handleScanCohort = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  if (isLoading || !stats) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Simulated ICU Bed Layout
  const icuBeds = [
    { bedId: "Bed 01", patient: "PAT-6218", risk: "High", vital: "HR 124 bpm", spo2: "91%" },
    { bedId: "Bed 02", patient: "PAT-1842", risk: "High", vital: "HR 118 bpm", spo2: "92%" },
    { bedId: "Bed 03", patient: "PAT-9012", risk: "Low", vital: "HR 74 bpm", spo2: "99%" },
    { bedId: "Bed 04", patient: "PAT-2091", risk: "High", vital: "HR 128 bpm", spo2: "89%" },
    { bedId: "Bed 05", patient: "PAT-7721", risk: "Medium", vital: "HR 98 bpm", spo2: "95%" },
    { bedId: "Bed 06", patient: "PAT-3015", risk: "Medium", vital: "HR 92 bpm", spo2: "96%" },
    { bedId: "Bed 07", patient: "PAT-4029", risk: "Low", vital: "HR 68 bpm", spo2: "98%" },
    { bedId: "Bed 08", patient: "PAT-5103", risk: "Low", vital: "HR 72 bpm", spo2: "99%" },
  ];

  const cardData = [
    { id: 1, title: 'Total ICU Cohort', value: stats.total_patients, subtitle: 'Active Bedside Telemetry', icon: Users, borderColor: 'border-l-teal-500', iconColor: 'text-teal-500', glow: 'shadow-teal-500/5' },
    { id: 2, title: 'High Sepsis Risk', value: stats.high_risk, subtitle: 'Hour-1 Bundle Flagged', icon: AlertTriangle, borderColor: 'border-l-red-500', iconColor: 'text-red-500', glow: 'shadow-red-500/5' },
    { id: 3, title: 'Medium Risk Alert', value: stats.medium_risk, subtitle: 'CUSUM Trend Watch', icon: Heart, borderColor: 'border-l-amber-500', iconColor: 'text-amber-500', glow: 'shadow-amber-500/5' },
    { id: 4, title: 'Stable Parameters', value: stats.low_risk, subtitle: 'Routine Hourly Checks', icon: Activity, borderColor: 'border-l-emerald-500', iconColor: 'text-emerald-500', glow: 'shadow-emerald-500/5' }
  ];

  const hospitalSurveillance = [
    { name: 'Hospital 1 (Node 0)', samples: '92,613', occupancy: '88%', activeSepsis: 4, rate: '3.24%', cusumScore: 0.42, status: 'Stable', leadTime: '5.8 Hours' },
    { name: 'Hospital 2 (Node 1)', samples: '151,916', occupancy: '94%', activeSepsis: 6, rate: '3.09%', cusumScore: 0.88, status: 'Stable', leadTime: '6.2 Hours' },
    { name: 'Hospital 3 (Node 2)', samples: '233,140', occupancy: '76%', activeSepsis: 2, rate: '2.07%', cusumScore: 3.42, status: 'CSSP Active', leadTime: '6.0 Hours' },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">ICU Decision Support Command Center</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time Sepsis Risk Telemetry & Federated Node Status</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleScanCohort}
            disabled={isScanning}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning Telemetry...' : 'Run Cohort Diagnostic'}
          </button>
        </div>
      </div>

      {/* Emergency Sepsis Alert Banner */}
      {stats.high_risk > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-500 text-white shrink-0 mt-0.5 shadow-md shadow-red-500/30">
              <ShieldAlert className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-red-600 dark:text-red-400 leading-tight">
                ⚠️ Critical Sepsis Alarm: {stats.high_risk} ICU Beds Exceed Risk Threshold
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Bed 01 (PAT-6218) & Bed 04 (PAT-2091) display simultaneous tachycardia (&gt;115 bpm) and oxygen drop (&lt;91%). Initiate <strong>1-Hour Sepsis Resuscitation Protocol</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
              Hour-1 Bundle Due
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] ${card.borderColor} border-l-4 p-5 rounded-2xl shadow-sm ${card.glow} transition-all hover:scale-[1.01]`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{card.title}</span>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{card.value}</h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">{card.subtitle}</span>
                </div>
                <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-[#152238] ${card.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW FEATURE: INSTITUTIONAL SEPSIS SURVEILLANCE CARDS (HOSPITAL 1, 2, 3) */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-4.5 w-4.5 text-teal-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Federated Hospital Sites Live Surveillance (Hospital 1, 2 & 3)</h3>
          </div>
          <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 uppercase tracking-wider">
            3 Federated Nodes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hospitalSurveillance.map((hosp, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#1a2744] pb-2">
                <span className="font-extrabold text-xs text-slate-800 dark:text-white">{hosp.name}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  hosp.status === 'CSSP Active' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {hosp.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Bed Occupancy</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{hosp.occupancy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Sepsis Prevalence</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{hosp.rate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">AD-CUSUM Score</span>
                  <span className={`font-mono font-bold ${hosp.cusumScore > 3.0 ? 'text-amber-400' : 'text-teal-400'}`}>{hosp.cusumScore}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Mean Alert Lead</span>
                  <span className="font-bold text-emerald-400">{hosp.leadTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bedside Unit Map View */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-teal-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">ICU Ward Bedside Telemetry Map</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Sensor Stream</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {icuBeds.map((bed, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                bed.risk === 'High' 
                  ? 'bg-red-500/10 border-red-500/40 text-red-500' 
                  : bed.risk === 'Medium' 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' 
                  : 'bg-slate-50 dark:bg-[#0a1323] border-slate-200 dark:border-[#1a2744] text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs">{bed.bedId}</span>
                <span className={`h-2 w-2 rounded-full ${bed.risk === 'High' ? 'bg-red-500 animate-ping' : bed.risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold block text-slate-800 dark:text-white">{bed.patient}</span>
                <span className="text-[9px] text-slate-400 block">{bed.vital}</span>
                <span className="text-[9px] text-slate-400 block">SpO₂: {bed.spo2}</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-center block ${
                bed.risk === 'High' ? 'bg-red-500 text-white' : bed.risk === 'Medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {bed.risk} Risk
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Admissions */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Hourly ICU Patient Admissions & Discharges</h4>
            <div className="flex gap-1 bg-slate-100 dark:bg-[#0a1323] p-1 rounded-lg text-[10px] font-bold">
              <button 
                onClick={() => setTimeframe('24h')}
                className={`px-2 py-0.5 rounded-md ${timeframe === '24h' ? 'bg-white dark:bg-[#152238] text-teal-400' : 'text-slate-400'}`}
              >
                24H
              </button>
              <button 
                onClick={() => setTimeframe('7d')}
                className={`px-2 py-0.5 rounded-md ${timeframe === '7d' ? 'bg-white dark:bg-[#152238] text-teal-400' : 'text-slate-400'}`}
              >
                7D
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.admissions} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '12px', fontSize: '11px' }} 
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="admissions" fill="#0d9488" radius={[4, 4, 0, 0]} name="Admitted Patients" />
                <Bar dataKey="discharges" fill="#10b981" radius={[4, 4, 0, 0]} name="Discharged Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sepsis Trend & CSSP Bypasses */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Sepsis Warnings & CSSP Drift Triggers</h4>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <TrendingUp className="h-3 w-3" /> System Calibrated
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSepsis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBypasses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '12px', fontSize: '11px' }} 
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Area type="monotone" dataKey="sepsisAlerts" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSepsis)" name="Sepsis Risk Alerts" />
                <Area type="monotone" dataKey="fpdafBypasses" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorBypasses)" name="CSSP Personalization Triggers" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
