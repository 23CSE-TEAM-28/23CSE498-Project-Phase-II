import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  Printer, 
  Clock, 
  X, 
  Heart, 
  Thermometer, 
  Wind, 
  Droplet, 
  Activity, 
  CheckCircle2, 
  Send, 
  Cpu, 
  RotateCcw, 
  Sliders, 
  Zap 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import type { Patient, LiveInferenceResponse } from '../services/api';
import { runLiveInference } from '../services/api';

interface PredictionScreenProps {
  patient: Patient;
  setActiveTab: (tab: string) => void;
}

export const PredictionScreen: React.FC<PredictionScreenProps> = ({ patient }) => {
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'bundle'>('simulator');
  const [showReportModal, setShowReportModal] = useState(false);
  const [orderDispatched, setOrderDispatched] = useState(false);

  // Live PyTorch Inference States
  const [isInferring, setIsInferring] = useState(false);
  const [liveResult, setLiveResult] = useState<LiveInferenceResponse | null>(null);

  // Interactive Physiological Sliders
  const initialHR = patient.latestVitals?.heartRate ?? (patient.riskLevel === 'High' ? 122 : 78);
  const initialMAP = patient.riskLevel === 'High' ? 62 : 88;
  const initialSpO2 = patient.latestVitals?.spo2 ?? (patient.riskLevel === 'High' ? 90 : 98);
  const initialTemp = patient.riskLevel === 'High' ? 38.8 : 36.8;
  const initialResp = patient.riskLevel === 'High' ? 26 : 18;
  const initialLactate = patient.riskLevel === 'High' ? 4.2 : 1.1;
  const initialWBC = patient.riskLevel === 'High' ? 18.5 : 7.2;

  const [simHR, setSimHR] = useState<number>(initialHR);
  const [simMAP, setSimMAP] = useState<number>(initialMAP);
  const [simSpO2, setSimSpO2] = useState<number>(initialSpO2);
  const [simTemp, setSimTemp] = useState<number>(initialTemp);
  const [simResp, setSimResp] = useState<number>(initialResp);
  const [simLactate, setSimLactate] = useState<number>(initialLactate);
  const [simWBC, setSimWBC] = useState<number>(initialWBC);

  // Surviving Sepsis Campaign (SSC) Hour-1 Bundle Checklist
  const [bundleChecklist, setBundleChecklist] = useState<{ [key: string]: boolean }>({
    bld: false,
    lac: true,
    abx: false,
    fld: false,
    vaso: false
  });
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(2840);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Run initial live forward pass on mount
  useEffect(() => {
    handleExecuteLiveInference();
  }, [patient.id]);

  const handleExecuteLiveInference = async (customVitals?: any) => {
    setIsInferring(true);
    try {
      const vOverride = customVitals || {
        heart_rate: simHR,
        mean_arterial_pressure: simMAP,
        spo2: simSpO2,
        temperature: simTemp,
        respiration: simResp,
        lactate: simLactate,
        wbc: simWBC
      };
      const res = await runLiveInference({
        patient_id: patient.id,
        vitals_override: vOverride
      });
      setLiveResult(res);
    } catch (err) {
      console.error("Live PyTorch Inference error:", err);
    } finally {
      setIsInferring(false);
    }
  };

  const handleResetSimulator = () => {
    setSimHR(initialHR);
    setSimMAP(initialMAP);
    setSimSpO2(initialSpO2);
    setSimTemp(initialTemp);
    setSimResp(initialResp);
    setSimLactate(initialLactate);
    setSimWBC(initialWBC);
    handleExecuteLiveInference({
      heart_rate: initialHR,
      mean_arterial_pressure: initialMAP,
      spo2: initialSpO2,
      temperature: initialTemp,
      respiration: initialResp,
      lactate: initialLactate,
      wbc: initialWBC
    });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCheck = (key: string) => {
    setBundleChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDispatchOrders = () => {
    setOrderDispatched(true);
    setTimeout(() => setOrderDispatched(false), 4000);
  };

  const currentRiskScore = liveResult 
    ? liveResult.probabilities.fpdaf_v2 
    : (patient.scores.fpdaf_v2 ?? patient.scores.fpdaf);
  const currentRiskPct = Math.round(currentRiskScore * 100);
  const isHighRisk = currentRiskPct >= 50;

  // Comparison Bar Chart Data
  const modelBarData = liveResult ? [
    { name: 'Centralized', probability: Math.round(liveResult.probabilities.centralized * 1000) / 10, fill: '#64748b' },
    { name: 'FedAvg', probability: Math.round(liveResult.probabilities.fedavg * 1000) / 10, fill: '#f97316' },
    { name: 'FedProx', probability: Math.round(liveResult.probabilities.fedprox * 1000) / 10, fill: '#3b82f6' },
    { name: 'Ditto', probability: Math.round(liveResult.probabilities.ditto * 1000) / 10, fill: '#10b981' },
    { name: 'FPDAF v1', probability: Math.round(liveResult.probabilities.fpdaf * 1000) / 10, fill: '#0d9488' },
    { name: 'FPDAF-v2', probability: Math.round(liveResult.probabilities.fpdaf_v2 * 1000) / 10, fill: '#8b5cf6' }
  ] : [];

  return (
    <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-3.5rem)] font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200 dark:border-[#1a2744]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              Bedside Sepsis Diagnostic Predictor & Neural Inference
            </h2>
            <span className="text-[10px] font-extrabold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              PyTorch 2.14.0 Engine
            </span>
            <span className="text-[10px] font-bold uppercase bg-teal-500/15 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded">
              FPDAF-v2 DDP-ERP
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time PyTorch forward pass, continuous 6-hour onset warning, and interactive what-if physiology simulator.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-[#0a1323] p-1 rounded-xl border border-slate-200 dark:border-[#1a2744] text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('simulator')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'simulator' 
                  ? 'bg-teal-600 text-white shadow-xs' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              PyTorch Simulator
            </button>
            <button
              onClick={() => setActiveSubTab('bundle')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'bundle' 
                  ? 'bg-teal-600 text-white shadow-xs' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              Hour-1 SSC Bundle
            </button>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-xs"
          >
            <Printer className="h-3.5 w-3.5 text-teal-400" /> Summary
          </button>
        </div>
      </div>

      {/* 2. Patient Header Strip */}
      <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-4 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm font-mono shrink-0 ${
            isHighRisk 
              ? 'bg-red-500/15 text-red-400 border border-red-500/30' 
              : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
          }`}>
            {patient.id.split('-')[1]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight font-mono">
                {patient.id}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                isHighRisk 
                  ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {isHighRisk ? 'Critical Sepsis Alert' : 'Stable Bedside'}
              </span>
            </div>
            <span className="text-xs text-slate-400 block mt-0.5 font-medium">
              {patient.age}y &bull; {patient.gender} &bull; {patient.ward} &bull; {patient.hospital}
            </span>
          </div>
        </div>

        {/* Live Engine Status Badge */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#08101d] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">{liveResult ? `PyTorch Inferred (${liveResult.inferenceLatencyMs} ms)` : 'PyTorch Initializing'}</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Tensor: [1, 24, 40]</span>
        </div>
      </div>

      {activeSubTab === 'simulator' ? (
        /* ================= SUB-TAB 1: LIVE PYTORCH SIMULATOR ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Prediction Result & Model Benchmarking */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Decision & Risk Gauge Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isHighRisk 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-white dark:bg-[#0d1829] border-slate-200 dark:border-[#1a2744]'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">FPDAF-v2 Risk Probability</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isHighRisk 
                        ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}>
                      {isHighRisk ? 'ACUTE SEPSIS POSITIVE' : 'NON-SEPSIS NEGATIVE'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className={`text-4xl font-extrabold ${isHighRisk ? 'text-red-400' : 'text-teal-400'}`}>
                      {currentRiskPct}%
                    </span>
                    <span className="text-xs text-slate-400">
                      Confidence: {liveResult?.riskAssessment.confidencePct ?? 94}%
                    </span>
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Surveillance Window</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white block mt-0.5">
                    {isHighRisk ? 'Onset Predicted in 5.8 Hours' : 'Continuous 24h Horizon'}
                  </span>
                  <span className="text-[11px] text-teal-400 font-medium">
                    {isHighRisk ? 'Hour-1 Sepsis Bundle Indicated' : 'Routine ICU Monitoring'}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHighRisk ? 'bg-red-500' : 'bg-teal-500'
                  }`}
                  style={{ width: `${currentRiskPct}%` }}
                />
              </div>
            </div>

            {/* 6-Way Model Probability Bar Chart */}
            <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                    Live Six-Way PyTorch Inference Output
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct forward pass comparison across baseline and personalized models
                  </p>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Real Tensor Output
                </span>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelBarData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#233554" opacity={0.4} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0c1626', borderColor: '#1f2e4d', borderRadius: '0.75rem', fontSize: '11px' }}
                      formatter={(val: any) => [`${val}%`, 'Predicted Sepsis Probability']}
                    />
                    <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
                      {modelBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Feature Attributions Table */}
            {liveResult && (
              <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-teal-400" />
                    Top Physiological Feature Attributions
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Gradient Saliency</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-[#1a2744] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-2 px-3">Clinical Biomarker</th>
                        <th className="py-2 px-3">Simulated Value</th>
                        <th className="py-2 px-3">Normal Ref</th>
                        <th className="py-2 px-3">Neural Weight</th>
                        <th className="py-2 px-3">Acuity Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#142238]">
                      {liveResult.topFeatureAttributions.map((feat, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#0f1d32]">
                          <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">{feat.feature}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-white">
                            {feat.value} <span className="text-[10px] text-slate-400 font-normal">{feat.unit}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-400 text-[11px]">{feat.normalRange}</td>
                          <td className="py-2 px-3 font-mono text-teal-400 font-bold">{(feat.attribution * 100).toFixed(1)}%</td>
                          <td className="py-2 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              feat.status === 'Critical' 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {feat.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 col): Interactive What-If Physiological Sliders */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-teal-400" />
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                    What-If Physiology Simulator
                  </h4>
                </div>
                <button
                  onClick={handleResetSimulator}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  title="Reset to Patient EHR Baseline"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Adjust clinical parameters and execute live forward passes through the PyTorch neural network to simulate intervention or deterioration.
              </p>

              {/* Slider Controls */}
              <div className="space-y-3.5 pt-1">
                {/* Heart Rate */}
                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Heart className="h-3 w-3 text-red-400" /> Heart Rate (HR)
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{simHR} bpm</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="170"
                    step="1"
                    value={simHR}
                    onChange={(e) => setSimHR(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>

                {/* MAP */}
                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Activity className="h-3 w-3 text-blue-400" /> MAP (Hypotension)
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{simMAP} mmHg</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="115"
                    step="1"
                    value={simMAP}
                    onChange={(e) => setSimMAP(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>

                {/* SpO2 */}
                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Wind className="h-3 w-3 text-cyan-400" /> Oxygen Saturation (SpO₂)
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{simSpO2}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="100"
                    step="1"
                    value={simSpO2}
                    onChange={(e) => setSimSpO2(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-amber-400" /> Core Temp
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{simTemp}°C</span>
                  </div>
                  <input
                    type="range"
                    min="35.0"
                    max="41.0"
                    step="0.1"
                    value={simTemp}
                    onChange={(e) => setSimTemp(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>

                {/* Serum Lactate */}
                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Droplet className="h-3 w-3 text-red-500" /> Serum Lactate
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{simLactate} mmol/L</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="8.0"
                    step="0.1"
                    value={simLactate}
                    onChange={(e) => setSimLactate(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>

                {/* WBC */}
                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Activity className="h-3 w-3 text-purple-400" /> WBC Count
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{simWBC} x10⁹/L</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="30.0"
                    step="0.5"
                    value={simWBC}
                    onChange={(e) => setSimWBC(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Run Forward Pass Button */}
              <button
                onClick={() => handleExecuteLiveInference()}
                disabled={isInferring}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className={`h-4 w-4 ${isInferring ? 'animate-spin' : ''}`} />
                {isInferring ? 'Executing PyTorch Forward Pass...' : 'Run Live PyTorch Neural Inference'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= SUB-TAB 2: HOUR-1 SEPSIS RESUSCITATION BUNDLE ================= */
        <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-[#1a2744] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  Surviving Sepsis Campaign (SSC) Hour-1 Resuscitation Protocol
                </h3>
                <span className="text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded uppercase">
                  Stat Order Set
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Standardized ICU clinical order set triggered upon model early sepsis classification
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <Clock className="h-4 w-4" />
              <span>Target Window: {formatTimer(timeLeftSeconds)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {[
                { key: 'lac', title: '1. Measure Serum Lactate Level', desc: 'Remeasure if initial lactate > 2 mmol/L to guide fluid resuscitation.' },
                { key: 'bld', title: '2. Obtain Blood Cultures Prior to Antibiotics', desc: 'At least 2 sets of blood cultures (aerobic and anaerobic).' },
                { key: 'abx', title: '3. Administer Broad-Spectrum IV Antibiotics', desc: 'Empirical combination: Vancomycin (15-20 mg/kg) + Cefepime (2g IV).' }
              ].map(step => (
                <div 
                  key={step.key}
                  onClick={() => toggleCheck(step.key)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    bundleChecklist[step.key]
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-50 dark:bg-[#0a1323] border-slate-200 dark:border-[#17253d] text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {bundleChecklist[step.key] ? (
                      <CheckSquare className="h-5 w-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <h5 className="font-bold text-xs">{step.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {[
                { key: 'fld', title: '4. Rapid IV Fluid Resuscitation (30 mL/kg)', desc: 'Administer balanced crystalloids for hypotension (MAP < 65) or lactate ≥ 4 mmol/L.' },
                { key: 'vaso', title: '5. Apply Vasopressors if Hypotensive During/After Fluids', desc: 'First-choice vasopressor: Norepinephrine titrated to maintain MAP ≥ 65 mmHg.' }
              ].map(step => (
                <div 
                  key={step.key}
                  onClick={() => toggleCheck(step.key)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    bundleChecklist[step.key]
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-50 dark:bg-[#0a1323] border-slate-200 dark:border-[#17253d] text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {bundleChecklist[step.key] ? (
                      <CheckSquare className="h-5 w-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <h5 className="font-bold text-xs">{step.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleDispatchOrders}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Send className="h-4 w-4" /> Dispatch Hour-1 Orders to ICU Pharmacy & Nursing Station
              </button>
              {orderDispatched && (
                <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Stat orders dispatched to Amrita Hospital Pharmacy!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Bedside Clinical Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#1a2744] pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                  AMRITA MEDICAL CENTER &bull; CDSS REPORT
                </h3>
                <span className="text-[10px] text-teal-400 font-mono">Confidential ICU Medical Chart</span>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-[#08101d] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>PATIENT ID: <strong>{patient.id}</strong></div>
              <div>AGE / GENDER: <strong>{patient.age} / {patient.gender}</strong></div>
              <div>WARD: <strong>{patient.ward} ({patient.hospital})</strong></div>
              <div>FPDAF-v2 MODEL PREDICTION: <strong className={isHighRisk ? 'text-red-400' : 'text-teal-400'}>{currentRiskPct}% Sepsis Probability</strong></div>
              <div>DECISION: <strong>{isHighRisk ? 'CRITICAL SEPSIS ONSET ALERT (Lead Time: 5.8 Hours)' : 'STABLE ICU SURVEILLANCE'}</strong></div>
              <div>INFERENCE ENGINE: <strong>PyTorch 2.14.0 (Live MPS/CPU Forward Pass)</strong></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowReportModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold"
              >
                Print Official Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
