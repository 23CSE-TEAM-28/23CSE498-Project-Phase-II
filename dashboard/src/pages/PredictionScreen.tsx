import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  Printer, 
  Sparkles, 
  Clock, 
  X, 
  FileText
} from 'lucide-react';
import type { Patient } from '../services/mockDataService';

interface PredictionScreenProps {
  patient: Patient;
  setActiveTab: (tab: string) => void;
}

export const PredictionScreen: React.FC<PredictionScreenProps> = ({ patient, setActiveTab }) => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [bundleChecklist, setBundleChecklist] = useState<{ [key: string]: boolean }>({
    bld: false,
    lac: true,
    abx: false,
    fld: false,
    vaso: false
  });

  // SSC Hour-1 Bundle Live Countdown Timer (simulated 48 minutes 30 seconds remaining)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(2910);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCheck = (key: string) => {
    setBundleChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const triggerPredict = () => {
    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
    }, 1200);
  };

  const riskScore = patient.scores.fpdaf;
  const isHighRisk = patient.riskLevel === 'High';
  const riskPercentage = Math.round(riskScore * 100);

  const completedStepsCount = Object.values(bundleChecklist).filter(Boolean).length;
  const bundleCompletionPercent = Math.round((completedStepsCount / 5) * 100);

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Bedside Diagnostic Predictor Engine</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Continuous 24-Hour Multivariate Inference — FPDAF Personalized Local Head</p>
        </div>
        
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/20 transition-all"
        >
          <Printer className="h-4 w-4" /> Print Bedside Clinical Summary
        </button>
      </div>

      {/* Patient Identification Card */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-lg">
            {patient.id.split('-')[1]}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active ICU Bedside Target</span>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-white leading-tight">{patient.id}</h3>
            <span className="text-xs text-slate-400 block mt-0.5">{patient.age}y / {patient.gender} &bull; {patient.ward} &bull; {patient.hospital}</span>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button 
            onClick={() => setActiveTab('patients')}
            className="px-4 py-2 border border-slate-200 dark:border-[#1a2744] bg-white dark:bg-[#0d1829] hover:bg-slate-50 dark:hover:bg-[#152238] text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 transition-all"
          >
            Switch Patient
          </button>
          <button 
            onClick={triggerPredict}
            disabled={isPredicting}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl transition-all text-xs shadow-lg shadow-teal-600/20 disabled:opacity-50"
          >
            <Activity className={`h-4 w-4 ${isPredicting ? 'animate-spin' : ''}`} />
            {isPredicting ? 'Running Inference...' : 'Run FPDAF Inference'}
          </button>
        </div>
      </div>

      {/* Main Diagnostic Dashboard Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Diagnostic Risk Dial & Classification */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-6 rounded-2xl space-y-6 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-full flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">FPDAF Forecast Ring</span>
              <span className="text-[10px] bg-teal-500/10 text-teal-400 font-bold px-2 py-0.5 rounded-full border border-teal-500/20">CSSP Local Head</span>
            </div>

            {/* Glowing Ring Gauge */}
            <div className="relative h-44 w-44 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" fill="transparent" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - riskPercentage / 100)}`}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ${isHighRisk ? 'text-red-500' : riskPercentage > 40 ? 'text-amber-500' : 'text-emerald-500'}`} 
                  fill="transparent" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-extrabold tracking-tight ${isHighRisk ? 'text-red-500' : 'text-emerald-400'}`}>
                  {riskPercentage}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Sepsis Probability</span>
              </div>
            </div>

            {/* Classification Status */}
            <div className={`w-full p-4 rounded-xl border flex items-center gap-3 text-left ${
              isHighRisk 
                ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <div className={`p-2.5 rounded-xl shrink-0 ${isHighRisk ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {isHighRisk ? <ShieldAlert className="h-5 w-5 animate-pulse" /> : <ShieldCheck className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">
                  {isHighRisk ? 'High Risk Sepsis Alert' : 'Normal / Low Risk'}
                </h4>
                <span className="text-[10px] opacity-80 font-medium block mt-0.5">
                  Confidence: {patient.confidence}% &bull; Sensor Quality: 99.4%
                </span>
              </div>
            </div>

            {/* 5-Way Model Score Comparison Bar Breakdown */}
            <div className="w-full text-left space-y-2 border-t border-slate-200 dark:border-[#1a2744] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Baseline vs Federated Ensemble Forecasts</span>
              
              <div className="space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">FedAvg:</span>
                  <span className="text-slate-300">{(patient.scores.fedavg * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">FedProx:</span>
                  <span className="text-slate-300">{(patient.scores.fedprox * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Ditto (Personalized):</span>
                  <span className="text-slate-300">{(patient.scores.ditto * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center text-teal-400 font-bold">
                  <span>FPDAF (Proposed):</span>
                  <span>{(patient.scores.fpdaf * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Hour-1 Sepsis Resuscitation Bundle & Directives */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Hour-1 Sepsis Bundle Checklist */}
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-6 rounded-2xl space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1a2744] pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-400" /> Hour-1 Sepsis Resuscitation Bundle (SSC Guidelines)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Surviving Sepsis Campaign International Resuscitation Protocol</p>
              </div>

              {/* Countdown Clock Widget */}
              {isHighRisk && (
                <div className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl shrink-0">
                  <Clock className="h-4 w-4 animate-spin text-red-500" />
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-red-400 block leading-tight">Protocol Window</span>
                    <span className="font-mono font-extrabold text-sm">{formatTimer(timeLeftSeconds)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar for Completion */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Bundle Protocol Progress:</span>
                <span className="text-teal-400">{completedStepsCount} of 5 Completed ({bundleCompletionPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#0a1323] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${bundleCompletionPercent}%` }}
                />
              </div>
            </div>

            {/* Interactive Protocol Items */}
            <div className="space-y-3">
              {[
                { key: 'bld', label: 'Draw Blood Cultures prior to initiating antimicrobial therapy', time: 'Within 30 mins' },
                { key: 'lac', label: 'Measure initial Blood Lactate levels & re-measure if elevated (> 2 mmol/L)', time: 'Immediate' },
                { key: 'abx', label: 'Administer Empirical Broad-Spectrum IV Antibiotics', time: 'Within 60 mins' },
                { key: 'fld', label: 'Begin rapid administration of 30 mL/kg crystalloid fluid for hypotension', time: 'Within 60 mins' },
                { key: 'vaso', label: 'Apply Vasopressors (Norepinephrine) if hypotensive during/after fluid resuscitation', time: 'As needed' }
              ].map(item => (
                <div 
                  key={item.key}
                  onClick={() => toggleCheck(item.key)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    bundleChecklist[item.key]
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 shadow-sm'
                      : 'bg-slate-50 dark:bg-[#0a1323] border-slate-200 dark:border-[#1a2744] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {bundleChecklist[item.key] ? (
                      <CheckSquare className="h-5 w-5 text-teal-400 shrink-0" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-xs font-semibold ${bundleChecklist[item.key] ? 'line-through opacity-70' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">{item.time}</span>
                </div>
              ))}
            </div>

            {/* Action button to navigate to Explainability */}
            <button
              onClick={() => setActiveTab('xai')}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-600/20 transition-all text-xs"
            >
              Inspect Temporal Explainability Heatmap (XAI) <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* PRINTABLE CLINICAL SUMMARY REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-[#1a2744] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">ICU Bedside Sepsis Diagnostic Report</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">FPDAF Clinical Decision Support Workstation</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Patient Header Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#0a1323] p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Patient ID</span>
                <span className="font-extrabold text-slate-800 dark:text-white">{patient.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Demographics</span>
                <span className="font-bold text-slate-800 dark:text-white">{patient.age}y / {patient.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Hospital Site</span>
                <span className="font-bold text-slate-800 dark:text-white">{patient.hospital}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Ward Location</span>
                <span className="font-bold text-slate-800 dark:text-white">{patient.ward}</span>
              </div>
            </div>

            {/* Forecast & Risk Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Predictive Model Evaluation Summary</h4>
              <div className="border border-slate-200 dark:border-[#1a2744] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-[#152238] border-b border-slate-200 dark:border-[#1a2744]">
                      <th className="p-2.5 font-bold">Model Configuration</th>
                      <th className="p-2.5 font-bold">Sepsis Forecast Risk</th>
                      <th className="p-2.5 font-bold">Clinical Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                    <tr>
                      <td className="p-2.5">Centralized BiLSTM</td>
                      <td className="p-2.5 font-bold">{(patient.scores.centralized * 100).toFixed(0)}%</td>
                      <td className="p-2.5">Baseline Reference</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">FedAvg (McMahan et al.)</td>
                      <td className="p-2.5 font-bold">{(patient.scores.fedavg * 100).toFixed(0)}%</td>
                      <td className="p-2.5">Global Consensus</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Ditto (Personalized)</td>
                      <td className="p-2.5 font-bold">{(patient.scores.ditto * 100).toFixed(0)}%</td>
                      <td className="p-2.5">Local Head Adapt</td>
                    </tr>
                    <tr className="bg-teal-500/10 font-bold text-teal-400">
                      <td className="p-2.5">FPDAF-v2 (Proposed Model)</td>
                      <td className="p-2.5 font-extrabold text-sm">{(patient.scores.fpdaf * 100).toFixed(0)}%</td>
                      <td className="p-2.5 uppercase text-[10px] bg-teal-500/20 px-2 py-0.5 rounded w-fit">Active Diagnostic</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SSC Bundle Status */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Surviving Sepsis Hour-1 Bundle Execution</h4>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Protocol Completion Rate:</span>
                  <span className="text-teal-400">{bundleCompletionPercent}% ({completedStepsCount}/5 Completed)</span>
                </div>
                <span className="text-[10px] text-slate-400 block">Report Timestamp: {new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#1a2744] flex justify-between items-end text-xs text-slate-400">
              <div>
                <span className="block font-bold text-slate-300">Attending Physician:</span>
                <span className="block font-mono text-[10px] mt-1">___________________________</span>
                <span className="block text-[10px] mt-0.5">MD, Critical Care Unit</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#1a2744] bg-slate-100 dark:bg-[#152238] font-bold text-xs hover:bg-slate-200 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-xs text-white shadow-lg shadow-teal-600/20 transition-all flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Print Document
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
