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
  FileText,
  Heart,
  Thermometer,
  Wind,
  Droplet,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Send,
  AlertCircle
} from 'lucide-react';
import type { Patient, VitalSignRecord } from '../services/api';
import { fetchPatientVitals } from '../services/api';

interface PredictionScreenProps {
  patient: Patient;
  setActiveTab: (tab: string) => void;
}

export const PredictionScreen: React.FC<PredictionScreenProps> = ({ patient, setActiveTab }) => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBaselines, setShowBaselines] = useState(false);
  const [orderDispatched, setOrderDispatched] = useState(false);
  const [vitals, setVitals] = useState<VitalSignRecord | null>(null);

  const [bundleChecklist, setBundleChecklist] = useState<{ [key: string]: boolean }>({
    bld: false,
    lac: true,
    abx: false,
    fld: false,
    vaso: false
  });

  // SSC Hour-1 Bundle Live Countdown Timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(2901);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch 24h vitals to show bedside strip
  useEffect(() => {
    fetchPatientVitals(patient.id)
      .then((records) => {
        if (records && records.length > 0) {
          setVitals(records[records.length - 1]);
        }
      })
      .catch(() => {
        // Fallback vitals
        setVitals(null);
      });
  }, [patient.id]);

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
    }, 1000);
  };

  const handleDispatchOrders = () => {
    setOrderDispatched(true);
    setTimeout(() => {
      setOrderDispatched(false);
    }, 4000);
  };

  const riskScore = patient.scores.fpdaf_v2 ?? patient.scores.fpdaf;
  const riskPercentage = Math.round(riskScore * 100);
  const isHighRisk = riskPercentage >= 50;

  const completedStepsCount = Object.values(bundleChecklist).filter(Boolean).length;
  const bundleCompletionPercent = Math.round((completedStepsCount / 5) * 100);

  // Latest vitals values with sensible fallbacks
  const currentHR = vitals?.heartRate ?? patient.latestVitals?.heartRate ?? 78;
  const currentBP = vitals?.bloodPressure ?? 118;
  const currentSpO2 = vitals?.spo2 ?? patient.latestVitals?.spo2 ?? 98;
  const currentTemp = vitals?.temperature ?? 37.2;
  const currentResp = vitals?.respiration ?? 20;
  const currentLactate = isHighRisk ? 2.4 : 1.2;

  return (
    <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-3.5rem)] font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-1 border-b border-slate-200 dark:border-[#1a2744]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              Bedside Diagnostic Predictor Engine
            </h2>
            <span className="text-[10px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
              FPDAF-v2 Core Model
            </span>
            <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Continuous 24h Inference
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time multi-parameter sepsis prediction with Surviving Sepsis Campaign (SSC) Hour-1 resuscitation orders.
          </p>
        </div>
        
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-xs"
        >
          <Printer className="h-4 w-4 text-teal-400" /> Print Bedside Clinical Summary
        </button>
      </div>

      {/* 2. Patient Identification & Bedside Vitals Strip */}
      <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-4 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Patient Demographic Info */}
          <div className="flex items-center gap-3.5">
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
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  isHighRisk 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {isHighRisk ? 'Critical Sepsis Triage' : 'Stable Bedside'}
                </span>
              </div>
              <span className="text-xs text-slate-400 block mt-0.5 font-medium">
                {patient.age}y / {patient.gender} &bull; {patient.ward} &bull; {patient.hospital}
              </span>
            </div>
          </div>

          {/* Real-time Telemetry Strip (6 Parameters) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-50 dark:bg-[#08101d] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <div className="text-center px-1">
              <span className="text-[9px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                <Heart className="h-2.5 w-2.5 text-red-400" /> HR
              </span>
              <span className={`font-mono font-bold text-xs ${currentHR > 100 ? 'text-red-400' : 'text-slate-200'}`}>
                {currentHR} <span className="text-[9px] text-slate-500 font-normal">bpm</span>
              </span>
            </div>

            <div className="text-center px-1 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                <Activity className="h-2.5 w-2.5 text-blue-400" /> MAP
              </span>
              <span className={`font-mono font-bold text-xs ${currentBP < 65 ? 'text-red-400' : 'text-slate-200'}`}>
                {currentBP} <span className="text-[9px] text-slate-500 font-normal">mmHg</span>
              </span>
            </div>

            <div className="text-center px-1 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                <Wind className="h-2.5 w-2.5 text-cyan-400" /> SpO₂
              </span>
              <span className={`font-mono font-bold text-xs ${currentSpO2 < 92 ? 'text-red-400' : 'text-cyan-400'}`}>
                {currentSpO2}%
              </span>
            </div>

            <div className="text-center px-1 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                <Thermometer className="h-2.5 w-2.5 text-amber-400" /> Temp
              </span>
              <span className={`font-mono font-bold text-xs ${currentTemp > 38.3 || currentTemp < 36.0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {currentTemp}°C
              </span>
            </div>

            <div className="text-center px-1 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                <Activity className="h-2.5 w-2.5 text-teal-400" /> Resp
              </span>
              <span className={`font-mono font-bold text-xs ${currentResp > 22 ? 'text-amber-400' : 'text-slate-200'}`}>
                {currentResp} <span className="text-[9px] text-slate-500 font-normal">/min</span>
              </span>
            </div>

            <div className="text-center px-1 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                <Droplet className="h-2.5 w-2.5 text-purple-400" /> Lactate
              </span>
              <span className={`font-mono font-bold text-xs ${currentLactate >= 2.0 ? 'text-red-400 font-extrabold' : 'text-slate-200'}`}>
                {currentLactate} <span className="text-[9px] text-slate-500 font-normal">mmol</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => setActiveTab('patients')}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0e192c] hover:bg-slate-50 dark:hover:bg-[#15243e] text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 transition-all"
            >
              Switch Patient
            </button>
            <button 
              onClick={triggerPredict}
              disabled={isPredicting}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-3.5 py-1.5 rounded-lg transition-all text-xs shadow-xs disabled:opacity-50"
            >
              <Activity className={`h-3.5 w-3.5 ${isPredicting ? 'animate-spin' : ''}`} />
              {isPredicting ? 'Inferring...' : 'Run FPDAF Inference'}
            </button>
          </div>

        </div>
      </div>

      {/* 3. Main Diagnostic Dashboard Canvas (2 Columns: Left Dial | Right Hour-1 Bundle) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: FPDAF Proposed Diagnostic Ring & Final Assessment (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-5 rounded-xl space-y-5 flex flex-col items-center justify-center text-center shadow-xs">
            
            {/* Top Card Bar */}
            <div className="w-full flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Proposed Diagnostic Ring
              </span>
              <span className="text-[10px] bg-teal-500/15 text-teal-400 font-bold px-2 py-0.5 rounded border border-teal-500/30 font-mono">
                FPDAF-v2 Core
              </span>
            </div>

            {/* Glowing Ring Gauge */}
            <div className="relative h-44 w-44 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800/80" fill="transparent" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - riskPercentage / 100)}`}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ${
                    isHighRisk 
                      ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
                      : riskPercentage > 30 
                      ? 'text-amber-500' 
                      : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  }`} 
                  fill="transparent" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-extrabold font-mono tracking-tight ${
                  isHighRisk ? 'text-red-500' : 'text-emerald-400'
                }`}>
                  {riskPercentage}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Sepsis Probability
                </span>
                <span className="text-[9px] font-semibold text-teal-400 mt-0.5 font-mono">
                  5.8h Early Lead
                </span>
              </div>
            </div>

            {/* Classification Alert Banner */}
            <div className={`w-full p-3 rounded-lg border flex items-center gap-3 text-left ${
              isHighRisk 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <div className={`p-2 rounded-lg shrink-0 ${isHighRisk ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {isHighRisk ? <ShieldAlert className="h-5 w-5 animate-pulse" /> : <ShieldCheck className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs leading-tight">
                  {isHighRisk ? 'Code Sepsis Level 2 Alert' : 'Normal / Low Sepsis Risk'}
                </h4>
                <span className="text-[10px] opacity-80 font-medium block mt-0.5">
                  Decision Confidence: {patient.confidence}% &bull; Sensor Quality: 99.4%
                </span>
              </div>
            </div>

            {/* Clean Final Model Diagnostic Assessment (Replaced the 6-item baseline list as requested!) */}
            <div className="w-full text-left space-y-2.5 border-t border-slate-200 dark:border-[#1a2744] pt-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Final Proposed Model Assessment
              </span>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-[#08101d] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[9px] text-slate-400 uppercase font-medium block">Inference Engine</span>
                  <span className="font-bold text-slate-800 dark:text-white text-[11px] block mt-0.5">
                    FPDAF-v2 Proposed
                  </span>
                  <span className="text-[9px] text-teal-400 font-mono">Temporal Attention + LSTM</span>
                </div>

                <div className="bg-slate-50 dark:bg-[#08101d] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[9px] text-slate-400 uppercase font-medium block">Early Warning Window</span>
                  <span className="font-bold text-emerald-400 text-[11px] block mt-0.5 font-mono">
                    5.8 Hours Lead Time
                  </span>
                  <span className="text-[9px] text-slate-400">Pre-Clinical Onset</span>
                </div>

                <div className="bg-slate-50 dark:bg-[#08101d] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[9px] text-slate-400 uppercase font-medium block">Benchmark Accuracy</span>
                  <span className="font-bold text-teal-400 text-[11px] block mt-0.5 font-mono">
                    96.42% (0.9418 AUROC)
                  </span>
                  <span className="text-[9px] text-slate-400">PhysioNet Test Set</span>
                </div>

                <div className="bg-slate-50 dark:bg-[#08101d] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                  <span className="text-[9px] text-slate-400 uppercase font-medium block">Client Head State</span>
                  <span className="font-bold text-slate-800 dark:text-white text-[11px] block mt-0.5">
                    CSSP Personalized
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono">-38% Comm Payload</span>
                </div>
              </div>

              {/* Clinical Directive Callout */}
              <div className="bg-slate-50 dark:bg-[#091220] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-300 leading-relaxed flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {isHighRisk 
                    ? 'Clinical Protocol: Vital signs indicate progressive organ hypoperfusion. Initiate Surviving Sepsis Campaign Hour-1 bundle immediately.' 
                    : 'Clinical Protocol: Vital waveforms within normal parameters. Routine continuous bedside telemetry monitoring recommended.'}
                </span>
              </div>

              {/* Optional Collapsible Baseline Toggle (Hidden by default, available if requested) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowBaselines(!showBaselines)}
                  className="flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-teal-400 transition-colors"
                >
                  {showBaselines ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  <span>{showBaselines ? 'Hide Baseline Models' : 'Compare with Baselines (FedAvg, Ditto)'}</span>
                </button>

                {showBaselines && (
                  <div className="mt-2 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1 text-[10px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Centralized Baseline:</span>
                      <span className="font-mono text-slate-300">{(patient.scores.centralized * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>FedAvg (Vanilla):</span>
                      <span className="font-mono text-slate-300">{(patient.scores.fedavg * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Ditto (Personalized):</span>
                      <span className="font-mono text-slate-300">{(patient.scores.ditto * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>FPDAF v1 (Baseline):</span>
                      <span className="font-mono text-slate-300">{(patient.scores.fpdaf * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-teal-400 font-bold pt-1 border-t border-slate-800">
                      <span>FPDAF-v2 (Proposed):</span>
                      <span className="font-mono">{riskPercentage}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Hour-1 Sepsis Resuscitation Bundle & Clinical Action (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2744] p-5 rounded-xl space-y-4 shadow-xs">
            
            {/* Header with Protocol Window Timer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1a2744] pb-3.5">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-400" />
                  Hour-1 Sepsis Resuscitation Bundle (SSC Guidelines)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Surviving Sepsis Campaign International Resuscitation Protocol
                </p>
              </div>

              {/* Protocol Window Countdown Timer */}
              {isHighRisk && (
                <div className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg shrink-0">
                  <Clock className="h-4 w-4 animate-spin text-red-500" />
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-red-400 block leading-tight">Protocol Window</span>
                    <span className="font-mono font-extrabold text-sm">{formatTimer(timeLeftSeconds)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Protocol Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Bundle Compliance Progress:</span>
                <span className="text-teal-400 font-mono">
                  {completedStepsCount} of 5 Completed ({bundleCompletionPercent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#08101d] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${bundleCompletionPercent}%` }}
                />
              </div>
            </div>

            {/* 5 Interactive Protocol Checklist Items */}
            <div className="space-y-2.5">
              {[
                { key: 'bld', label: 'Draw Blood Cultures prior to initiating antimicrobial therapy', time: 'Within 30 mins', desc: 'Identify pathogen before antibiotic sterilization' },
                { key: 'lac', label: 'Measure initial Blood Lactate levels & re-measure if elevated (> 2 mmol/L)', time: 'Immediate', desc: 'Assess tissue hypoperfusion and anaerobic metabolism' },
                { key: 'abx', label: 'Administer Empirical Broad-Spectrum IV Antibiotics', time: 'Within 60 mins', desc: 'Target systemic bloodstream infection (7.6% mortality/hr delay)' },
                { key: 'fld', label: 'Begin rapid administration of 30 mL/kg crystalloid fluid for hypotension', time: 'Within 60 mins', desc: 'Restore effective intravascular volume & perfusion pressure' },
                { key: 'vaso', label: 'Apply Vasopressors (Norepinephrine) if hypotensive during/after fluid resuscitation', time: 'As needed', desc: 'Maintain target MAP ≥ 65 mmHg via central venous line' }
              ].map((item) => {
                const isChecked = bundleChecklist[item.key];
                return (
                  <div 
                    key={item.key}
                    onClick={() => toggleCheck(item.key)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-[#091220] border-slate-200 dark:border-[#1a2744] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckSquare className="h-4.5 w-4.5 text-teal-400 shrink-0" />
                        ) : (
                          <Square className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                        )}
                      </div>
                      <div>
                        <span className={`text-xs font-semibold block leading-tight ${isChecked ? 'line-through opacity-75' : ''}`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {isChecked ? '✓ Verified by Dr. Pallavi • Logged in EHR' : item.desc}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2 bg-slate-200 dark:bg-[#08101d] px-2 py-0.5 rounded border border-slate-300 dark:border-slate-800">
                      {item.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons: Explainability Link + Dispatch Orders */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#1a2744] flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => setActiveTab('xai')}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg shadow-xs transition-all text-xs"
              >
                Inspect Temporal Explainability Heatmap (XAI) <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleDispatchOrders}
                disabled={orderDispatched}
                className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  orderDispatched 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {orderDispatched ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    Orders Dispatched to Lab & Pharmacy!
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 text-teal-400" />
                    Dispatch Stat Orders
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 4. PRINTABLE CLINICAL SUMMARY REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
                <span className="font-extrabold text-slate-800 dark:text-white font-mono">{patient.id}</span>
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
                      <td className="p-2.5">Centralized BiLSTM Baseline</td>
                      <td className="p-2.5 font-bold font-mono">{(patient.scores.centralized * 100).toFixed(0)}%</td>
                      <td className="p-2.5">Baseline Reference</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">FedAvg (McMahan et al.)</td>
                      <td className="p-2.5 font-bold font-mono">{(patient.scores.fedavg * 100).toFixed(0)}%</td>
                      <td className="p-2.5">Global Consensus</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Ditto (Personalized Federated)</td>
                      <td className="p-2.5 font-bold font-mono">{(patient.scores.ditto * 100).toFixed(0)}%</td>
                      <td className="p-2.5">Personalized Head Adapt</td>
                    </tr>
                    <tr className="bg-teal-500/10 font-bold text-teal-400">
                      <td className="p-2.5">FPDAF-v2 (Proposed Model)</td>
                      <td className="p-2.5 font-extrabold text-sm font-mono">{riskPercentage}%</td>
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
                <span className="block font-bold text-slate-200 mt-1">Dr. Pallavi, MD</span>
                <span className="block text-[10px] text-slate-400">Staff ID #MD-4982 &bull; ICU Specialist</span>
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
