import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Heart, 
  Activity, 
  TrendingUp,
  ShieldAlert, 
  RefreshCw, 
  BedDouble, 
  Building2, 
  Zap,
  CheckCircle2, 
  X, 
  ShieldCheck, 
  ChevronRight
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
import { fetchStats, fetchPatients, fetchDriftData } from '../services/api';
import type { ICUStats, Patient, DriftRecord } from '../services/api';

interface DashboardCDSSProps {
  onSelectPatient?: (patient: Patient) => void;
  setActiveTab?: (tab: string) => void;
}

export const DashboardCDSS: React.FC<DashboardCDSSProps> = ({ onSelectPatient, setActiveTab }) => {
  const [stats, setStats] = useState<ICUStats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [drift, setDrift] = useState<DriftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [isScanning, setIsScanning] = useState(false);
  const [liveVitalsTick, setLiveVitalsTick] = useState(0);

  // Surviving Sepsis Campaign (SSC) Hour-1 Bundle Modal State
  const [emergencyModalPatient, setEmergencyModalPatient] = useState<Patient | null>(null);
  const [bundleChecks, setBundleChecks] = useState<{ [key: string]: boolean }>({
    lactate: true,
    cultures: true,
    antibiotics: false,
    fluids: false,
    vasopressors: false
  });
  const [bundleSubmitted, setBundleSubmitted] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchStats(), fetchPatients(), fetchDriftData()])
      .then(([statsData, patientsData, driftData]) => {
        setStats(statsData);
        setPatients(patientsData);
        setDrift(driftData);
        setIsLoading(false);
      });
  }, []);

  // Physiological telemetry oscillation simulation (respiratory sinus arrhythmia ±1-2 bpm)
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveVitalsTick(prev => (prev + 1) % 100);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleScanCohort = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  const handleOpenPatientChart = (patient: Patient) => {
    if (onSelectPatient) onSelectPatient(patient);
    if (setActiveTab) setActiveTab('patient-details');
  };

  const handleOpenPredictScreen = (patient: Patient) => {
    if (onSelectPatient) onSelectPatient(patient);
    if (setActiveTab) setActiveTab('prediction');
  };

  const handleOpenSepsisBundle = (patient: Patient) => {
    setEmergencyModalPatient(patient);
    setBundleSubmitted(false);
  };

  const toggleBundleCheck = (key: string) => {
    setBundleChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExecuteBundleOrders = () => {
    setBundleSubmitted(true);
    setTimeout(() => {
      setEmergencyModalPatient(null);
      setBundleSubmitted(false);
    }, 2000);
  };

  if (isLoading || !stats) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Calculate live dynamic vitals with subtle physiological variation
  const getDynamicVitals = (p: Patient, idx: number) => {
    const baseHr = p.latestVitals?.heartRate || 80;
    const baseSpo2 = p.latestVitals?.spo2 || 96;
    const variation = ((liveVitalsTick + idx * 3) % 4) - 2; // -2 to +1
    return {
      heartRate: Math.max(50, Math.min(160, baseHr + variation)),
      spo2: Math.max(88, Math.min(100, baseSpo2 + (variation > 0 ? 0 : variation))),
      bpSys: 115 + ((idx * 7 + liveVitalsTick) % 15),
      bpDia: 72 + ((idx * 4 + liveVitalsTick) % 10),
      temp: (37.1 + ((idx * 3) % 18) / 10).toFixed(1),
      rr: 16 + ((idx * 2 + liveVitalsTick) % 8)
    };
  };

  const criticalPatients = patients.filter(p => p.riskLevel === 'High');

  const cardData = [
    { 
      id: 1, 
      title: 'ICU Bed Occupancy', 
      value: `${patients.length} Beds`, 
      subtitle: '100% Ward Capacity Active', 
      icon: BedDouble, 
      accentColor: 'text-teal-500', 
      bgColor: 'bg-teal-500/10'
    },
    { 
      id: 2, 
      title: 'Critical Sepsis Alerts', 
      value: stats.high_risk, 
      subtitle: 'Hour-1 Bundle Triggered', 
      icon: AlertTriangle, 
      accentColor: 'text-red-500', 
      bgColor: 'bg-red-500/10'
    },
    { 
      id: 3, 
      title: 'Borderline Observation', 
      value: stats.medium_risk, 
      subtitle: 'AD-CUSUM Surveillance', 
      icon: Heart, 
      accentColor: 'text-amber-500', 
      bgColor: 'bg-amber-500/10'
    },
    { 
      id: 4, 
      title: 'Hemodynamically Stable', 
      value: stats.low_risk, 
      subtitle: 'Standard ICU Telemetry', 
      icon: Activity, 
      accentColor: 'text-emerald-500', 
      bgColor: 'bg-emerald-500/10'
    }
  ];

  const latestDrift = drift.length > 0 ? drift[drift.length - 1] : { client0: 0.42, client1: 0.88, client2: 3.42 };

  const hospitalSurveillance = [
    { name: 'Hospital 1 (Community Center)', samples: '92,613', occupancy: '88%', activeSepsis: patients.filter(p => p.hospital === 'Hospital 1' && p.riskLevel === 'High').length, rate: '3.24%', cusumScore: latestDrift.client0, status: latestDrift.client0 > 3.0 ? 'CSSP Personalized' : 'Calibrated', leadTime: '5.8h Lead' },
    { name: 'Hospital 2 (Trauma Center)', samples: '151,916', occupancy: '94%', activeSepsis: patients.filter(p => p.hospital === 'Hospital 2' && p.riskLevel === 'High').length, rate: '3.09%', cusumScore: latestDrift.client1, status: latestDrift.client1 > 3.0 ? 'CSSP Personalized' : 'Calibrated', leadTime: '6.2h Lead' },
    { name: 'Hospital 3 (Academic Medical)', samples: '233,140', occupancy: '76%', activeSepsis: patients.filter(p => p.hospital === 'Hospital 3' && p.riskLevel === 'High').length, rate: '2.07%', cusumScore: latestDrift.client2, status: latestDrift.client2 > 3.0 ? 'CSSP Personalized' : 'Calibrated', leadTime: '6.0h Lead' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] font-sans">
      {/* Workstation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-[#1a2942] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              ICU Central Telemetry & Sepsis Surveillance
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            50 Beds Monitored &bull; Model Early Lead Time: <span className="font-semibold text-teal-600 dark:text-teal-400">5.9 Hours</span> &bull; False-Alarm Reduction: <span className="font-semibold text-emerald-600 dark:text-emerald-400">41.8%</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleScanCohort}
            disabled={isScanning}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#121f33] dark:hover:bg-[#1a2c47] text-slate-700 dark:text-slate-200 font-medium px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-[#1e304d] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin text-teal-500' : 'text-slate-400'}`} />
            <span>{isScanning ? 'Scanning Feeds...' : 'Refresh Ward Cohort'}</span>
          </button>
        </div>
      </div>

      {/* Emergency Sepsis Alert Banner (Clean & High Impact) */}
      {stats.high_risk > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  STAT ALERT
                </span>
                <h4 className="font-bold text-sm text-red-600 dark:text-red-400">
                  Code Sepsis: {stats.high_risk} ICU Beds Exceed Risk Threshold
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Sustained tachycardia (&gt;115 bpm) and hypoperfusion indicators flagged across bedside telemetry.
              </p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium mr-1">Affected Beds:</span>
                {criticalPatients.slice(0, 5).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleOpenPatientChart(p)}
                    className="text-[10px] font-semibold telemetry-mono px-2 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-300 border border-red-500/20 hover:bg-red-500/30 transition-colors"
                  >
                    {p.id}
                  </button>
                ))}
                {criticalPatients.length > 5 && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    +{criticalPatients.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {criticalPatients.length > 0 && (
              <button
                onClick={() => handleOpenSepsisBundle(criticalPatients[0])}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Launch Hour-1 Bundle Orders</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards Grid (Decluttered & Calm) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-4 rounded-xl shadow-xs transition-colors hover:border-teal-500/30"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">{card.title}</span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white telemetry-mono">{card.value}</h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block">{card.subtitle}</span>
                </div>
                <div className={`p-2 rounded-lg ${card.bgColor} ${card.accentColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CORE CLINICAL WORKSTATION: ICU BEDSIDE TELEMETRY MATRIX */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-teal-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
              ICU Ward Bedside Monitors
            </h3>
            <span className="text-[10px] bg-slate-100 dark:bg-[#121f33] text-slate-600 dark:text-slate-300 font-medium px-2 py-0.5 rounded border border-slate-200 dark:border-[#1e304d]">
              {patients.length} Active Beds
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Sepsis Alert
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Observation
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Stable
            </span>
          </div>
        </div>

        {/* 8-Bed Clinical Grid (Streamlined & Free of Nested Boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {patients.slice(0, 8).map((p, idx) => {
            const vitals = getDynamicVitals(p, idx);
            const isHigh = p.riskLevel === 'High';
            const isMed = p.riskLevel === 'Medium';
            const riskPct = Math.round(((p.scores.fpdaf_v2 ?? p.scores.fpdaf) || 0.1) * 100);
            const mapValue = Math.round(vitals.bpDia + (vitals.bpSys - vitals.bpDia) / 3);

            return (
              <div
                key={p.id}
                className={`rounded-xl border transition-all duration-150 flex flex-col justify-between hover:shadow-md ${
                  isHigh 
                    ? 'bg-white dark:bg-[#101422] border-red-500/40 hover:border-red-500/60' 
                    : isMed 
                    ? 'bg-white dark:bg-[#0c1626] border-amber-500/30 hover:border-amber-500/50' 
                    : 'bg-white dark:bg-[#0c1626] border-slate-200 dark:border-[#1a2942] hover:border-teal-500/40'
                }`}
              >
                {/* Bed Header */}
                <div className="p-3 border-b border-slate-100 dark:border-[#182740] flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white telemetry-mono">
                        BED {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium telemetry-mono">
                        {p.id}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                      {p.age}y {p.gender} &bull; {p.ward}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block ${
                      isHigh 
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30' 
                        : isMed 
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {p.riskLevel}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      SOFA: {isHigh ? '5' : isMed ? '2' : '0'}
                    </span>
                  </div>
                </div>

                {/* Flat, Box-Free Telemetry Strip (4 Clean Vital Columns) */}
                <div className="p-3 space-y-2.5">
                  <div className="grid grid-cols-4 gap-1 text-center py-1">
                    {/* HR */}
                    <div>
                      <span className="text-[9px] font-medium text-slate-400 uppercase block">HR</span>
                      <span className={`text-base font-bold telemetry-mono leading-tight block ${
                        vitals.heartRate > 100 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'
                      }`}>
                        {vitals.heartRate}
                      </span>
                      <span className="text-[8px] text-slate-400 block">bpm</span>
                    </div>

                    {/* NIBP */}
                    <div>
                      <span className="text-[9px] font-medium text-slate-400 uppercase block">BP</span>
                      <span className="text-xs font-bold telemetry-mono leading-tight block mt-0.5 text-slate-800 dark:text-slate-100">
                        {vitals.bpSys}/{vitals.bpDia}
                      </span>
                      <span className="text-[8px] text-slate-400 block">M {mapValue}</span>
                    </div>

                    {/* SpO2 */}
                    <div>
                      <span className="text-[9px] font-medium text-slate-400 uppercase block">SpO₂</span>
                      <span className={`text-base font-bold telemetry-mono leading-tight block ${
                        vitals.spo2 < 92 ? 'text-red-500' : 'text-cyan-600 dark:text-cyan-400'
                      }`}>
                        {vitals.spo2}%
                      </span>
                      <span className="text-[8px] text-slate-400 block">&nbsp;</span>
                    </div>

                    {/* Temp & RR */}
                    <div>
                      <span className="text-[9px] font-medium text-slate-400 uppercase block">Temp</span>
                      <span className="text-xs font-bold telemetry-mono leading-tight block mt-0.5 text-slate-800 dark:text-slate-100">
                        {vitals.temp}°
                      </span>
                      <span className="text-[8px] text-slate-400 block">{vitals.rr}/m</span>
                    </div>
                  </div>

                  {/* Sepsis Probability Meter (Subtle) */}
                  <div className="pt-1.5 border-t border-slate-100 dark:border-[#182740]">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-slate-400">FPDAF Sepsis Risk</span>
                      <span className={`font-bold telemetry-mono ${
                        isHigh ? 'text-red-500' : isMed ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {riskPct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#152238] h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${Math.min(100, Math.max(4, riskPct))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Streamlined Bedside Card Footer Action */}
                <div className="p-2 px-3 bg-slate-50/60 dark:bg-[#091220]/60 border-t border-slate-100 dark:border-[#182740] flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => handleOpenPatientChart(p)}
                    className="flex-1 py-1 px-2 rounded text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-white dark:hover:bg-[#121f33] transition-colors text-left flex items-center justify-between group"
                  >
                    <span>Bedside Telemetry</span>
                    <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-teal-500 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    onClick={() => handleOpenPredictScreen(p)}
                    className="py-1 px-2 rounded text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors"
                    title="Open Sepsis Prediction Model"
                  >
                    Diagnose
                  </button>

                  {isHigh && (
                    <button
                      onClick={() => handleOpenSepsisBundle(p)}
                      title="Launch Surviving Sepsis 1-Hour Bundle"
                      className="py-1 px-2 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition-colors flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      <span>Bundle</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEDERATED HOSPITAL SITES SURVEILLANCE */}
      <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-4 md:p-5 rounded-xl space-y-3.5 shadow-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-500" />
            <div>
              <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">Federated Hospital Telemetry (Nodes 0, 1, 2)</h3>
              <p className="text-[11px] text-slate-500">Autonomous Concept Drift Tracking & Personalized Federated Learning</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 uppercase tracking-wider">
            3 Synced Nodes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {hospitalSurveillance.map((hosp, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#182740] space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#182740] pb-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{hosp.name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                  hosp.status.includes('Personalized') ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                }`}>
                  {hosp.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Bed Occupancy</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 telemetry-mono">{hosp.occupancy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Sepsis Prevalence</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 telemetry-mono">{hosp.rate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">AD-CUSUM Divergence</span>
                  <span className={`font-semibold telemetry-mono ${hosp.cusumScore > 3.0 ? 'text-amber-500 font-bold' : 'text-teal-500'}`}>
                    {hosp.cusumScore}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Mean Alert Lead</span>
                  <span className="font-semibold text-emerald-500 telemetry-mono">{hosp.leadTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hourly Admissions */}
        <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-4 md:p-5 rounded-xl space-y-3 shadow-xs">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">ICU Patient Admissions & Turnover</h4>
            <div className="flex gap-1 bg-slate-100 dark:bg-[#091220] p-0.5 rounded-lg text-[10px] font-semibold">
              <button 
                onClick={() => setTimeframe('24h')}
                className={`px-2 py-0.5 rounded ${timeframe === '24h' ? 'bg-white dark:bg-[#152238] text-teal-500 font-bold shadow-xs' : 'text-slate-400'}`}
              >
                24H
              </button>
              <button 
                onClick={() => setTimeframe('7d')}
                className={`px-2 py-0.5 rounded ${timeframe === '7d' ? 'bg-white dark:bg-[#152238] text-teal-500 font-bold shadow-xs' : 'text-slate-400'}`}
              >
                7D
              </button>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.admissions} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2c48" className="hidden dark:block" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c1626', border: '1px solid #1c2c48', borderRadius: '8px', fontSize: '11px' }} 
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="admissions" fill="#0d9488" radius={[3, 3, 0, 0]} name="Admissions" />
                <Bar dataKey="discharges" fill="#10b981" radius={[3, 3, 0, 0]} name="Discharges" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sepsis Trend & CSSP Bypasses */}
        <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-4 md:p-5 rounded-xl space-y-3 shadow-xs">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">Continuous Sepsis Alarm Trajectory</h4>
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp className="h-3 w-3" /> Autonomous Calibration
            </span>
          </div>
          <div className="h-56">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2c48" className="hidden dark:block" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c1626', border: '1px solid #1c2c48', borderRadius: '8px', fontSize: '11px' }} 
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Area type="monotone" dataKey="sepsisAlerts" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSepsis)" name="Sepsis Alerts" />
                <Area type="monotone" dataKey="fpdafBypasses" stroke="#f97316" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBypasses)" name="CSSP Personalization" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SURVIVING SEPSIS CAMPAIGN (SSC) 1-HOUR RESUSCITATION PROTOCOL MODAL */}
      {emergencyModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] rounded-2xl max-w-2xl w-full p-5 md:p-6 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-[#1a2942] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-600 text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-red-600 text-white">
                      STAT PROTOCOL
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Surviving Sepsis Campaign: 1-Hour Emergency Bundle
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Target Patient: <strong className="text-slate-900 dark:text-white telemetry-mono">{emergencyModalPatient.id}</strong> ({emergencyModalPatient.ward} &bull; {emergencyModalPatient.age}y {emergencyModalPatient.gender})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEmergencyModalPatient(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {bundleSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Resuscitation Orders Transmitted Successfully!
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  ICU Pharmacy, Phlebotomy, and Bedside Nursing notified. Code Sepsis timer initiated (T-00:59:45).
                </p>
              </div>
            ) : (
              <>
                {/* Current Vital Telemetry Baseline */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-[#091220] p-2.5 rounded-xl border border-slate-200 dark:border-[#182740] text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-medium">Heart Rate</span>
                    <span className="text-sm font-bold text-red-500 telemetry-mono">
                      {emergencyModalPatient.latestVitals?.heartRate || 122} bpm
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-medium">SpO₂</span>
                    <span className="text-sm font-bold text-cyan-500 telemetry-mono">
                      {emergencyModalPatient.latestVitals?.spo2 || 90}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-medium">MAP Target</span>
                    <span className="text-sm font-bold text-amber-500 telemetry-mono">&ge; 65 mmHg</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-medium">FPDAF Sepsis</span>
                    <span className="text-sm font-bold text-red-500 telemetry-mono">
                      {Math.round(((emergencyModalPatient.scores.fpdaf_v2 ?? emergencyModalPatient.scores.fpdaf) || 0.89) * 100)}% Risk
                    </span>
                  </div>
                </div>

                {/* 5-Step Hour-1 Clinical Protocol */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    SURVIVING SEPSIS CAMPAIGN STAT ORDER CHECKLIST
                  </span>

                  <div className="space-y-1.5">
                    <label 
                      onClick={() => toggleBundleCheck('lactate')}
                      className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-[#182740] bg-white dark:bg-[#0f1d32] hover:bg-slate-50 dark:hover:bg-[#152540] cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={bundleChecks.lactate} 
                        onChange={() => {}} 
                        className="mt-0.5 h-3.5 w-3.5 rounded text-teal-600 focus:ring-teal-500" 
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                          1. Measure Stat Serum Blood Lactate Level
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Re-measure within 2-4 hours if initial lactate &gt; 2.0 mmol/L to guide fluid resuscitation.
                        </p>
                      </div>
                    </label>

                    <label 
                      onClick={() => toggleBundleCheck('cultures')}
                      className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-[#182740] bg-white dark:bg-[#0f1d32] hover:bg-slate-50 dark:hover:bg-[#152540] cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={bundleChecks.cultures} 
                        onChange={() => {}} 
                        className="mt-0.5 h-3.5 w-3.5 rounded text-teal-600 focus:ring-teal-500" 
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                          2. Obtain Blood Cultures Prior to Antibiotics (x2 sets)
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Peripheral stick + indwelling central catheter sets for aerobic and anaerobic pathology.
                        </p>
                      </div>
                    </label>

                    <label 
                      onClick={() => toggleBundleCheck('antibiotics')}
                      className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-[#182740] bg-white dark:bg-[#0f1d32] hover:bg-slate-50 dark:hover:bg-[#152540] cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={bundleChecks.antibiotics} 
                        onChange={() => {}} 
                        className="mt-0.5 h-3.5 w-3.5 rounded text-teal-600 focus:ring-teal-500" 
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                          3. Administer Empiric Broad-Spectrum IV Antimicrobials
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Order: Vancomycin 15-20 mg/kg IV + Cefepime 2g IV or Piperacillin-Tazobactam 4.5g IV stat.
                        </p>
                      </div>
                    </label>

                    <label 
                      onClick={() => toggleBundleCheck('fluids')}
                      className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-[#182740] bg-white dark:bg-[#0f1d32] hover:bg-slate-50 dark:hover:bg-[#152540] cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={bundleChecks.fluids} 
                        onChange={() => {}} 
                        className="mt-0.5 h-3.5 w-3.5 rounded text-teal-600 focus:ring-teal-500" 
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                          4. Begin Rapid 30 mL/kg IV Balanced Crystalloid Infusion
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Indicated for hypotension (MAP &lt; 65 mmHg) or initial lactate &ge; 4.0 mmol/L.
                        </p>
                      </div>
                    </label>

                    <label 
                      onClick={() => toggleBundleCheck('vasopressors')}
                      className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-[#182740] bg-white dark:bg-[#0f1d32] hover:bg-slate-50 dark:hover:bg-[#152540] cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={bundleChecks.vasopressors} 
                        onChange={() => {}} 
                        className="mt-0.5 h-3.5 w-3.5 rounded text-teal-600 focus:ring-teal-500" 
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                          5. Titrate Vasopressors (Norepinephrine) for Refractory Shock
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Maintain target MAP &ge; 65 mmHg via central venous catheter access.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Digital Attending Sign-Off & Submission */}
                <div className="pt-2 border-t border-slate-200 dark:border-[#1a2942] flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-xs text-slate-500">
                    Ordering Intensivist: <strong className="text-slate-800 dark:text-white font-semibold">Dr. Pallavi, MD</strong> (Staff ID #MD-4982)
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setEmergencyModalPatient(null)}
                      className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#1a2942] text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-1 sm:flex-initial"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteBundleOrders}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Authorize & Dispatch Orders</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
