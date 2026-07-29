import React, { useState, useEffect } from 'react';
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
import { ShieldAlert, BookOpen, AlertTriangle, Eye, Sliders, RefreshCw, Zap } from 'lucide-react';
import { fetchPatientAttention, getFeatureImportance } from '../services/mockDataService';
import type { Patient, AttentionData } from '../services/mockDataService';

interface ExplainableAIProps {
  patient: Patient;
}

export const ExplainableAI: React.FC<ExplainableAIProps> = ({ patient }) => {
  const [attentionData, setAttentionData] = useState<AttentionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHour, setSelectedHour] = useState<number>(20);
  const featureImportance = getFeatureImportance();
  const isHighRisk = patient.riskLevel === 'High';

  // Interactive What-If Simulator States
  const defaultHR = isHighRisk ? 124 : 78;
  const defaultMAP = isHighRisk ? 62 : 88;
  const defaultTemp = isHighRisk ? 38.8 : 36.8;
  const defaultSpO2 = isHighRisk ? 90 : 98;
  const defaultWBC = isHighRisk ? 18.5 : 7.2;
  const defaultLactate = isHighRisk ? 4.2 : 1.1;

  const [simHR, setSimHR] = useState<number>(defaultHR);
  const [simMAP, setSimMAP] = useState<number>(defaultMAP);
  const [simTemp, setSimTemp] = useState<number>(defaultTemp);
  const [simSpO2, setSimSpO2] = useState<number>(defaultSpO2);
  const [simWBC, setSimWBC] = useState<number>(defaultWBC);
  const [simLactate, setSimLactate] = useState<number>(defaultLactate);

  useEffect(() => {
    setIsLoading(true);
    fetchPatientAttention(patient.id).then((data) => {
      setAttentionData(data);
      if (data.length > 0) {
        setSelectedHour(isHighRisk ? 20 : 12);
      }
      setIsLoading(false);
    });
  }, [patient.id, isHighRisk]);

  // Calculate live dynamic what-if sepsis risk score
  const calculateSimulatedRisk = () => {
    let z = -2.4;
    z += ((simHR - 80) / 20) * 0.85;
    z += ((65 - simMAP) / 15) * 1.10;
    z += (Math.abs(simTemp - 37.0) / 1.5) * 0.65;
    z += ((95 - simSpO2) / 5) * 0.90;
    z += ((simWBC - 10) / 5) * 0.70;
    z += ((simLactate - 2) / 1.5) * 1.25;
    const probability = 1 / (1 + Math.exp(-z));
    return Math.min(0.99, Math.max(0.01, probability));
  };

  const simRisk = calculateSimulatedRisk();
  const simRiskPercent = Math.round(simRisk * 100);
  const baselineRiskPercent = Math.round(patient.scores.fpdaf * 100);
  const riskDelta = simRiskPercent - baselineRiskPercent;

  const handleResetSimulator = () => {
    setSimHR(defaultHR);
    setSimMAP(defaultMAP);
    setSimTemp(defaultTemp);
    setSimSpO2(defaultSpO2);
    setSimWBC(defaultWBC);
    setSimLactate(defaultLactate);
  };

  if (isLoading || attentionData.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const activeAttention = attentionData.find(a => a.hour === selectedHour) || attentionData[0];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Clinical Sepsis Explainability (XAI)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Saliency Attributions and Temporal Self-Attention Maps for Bedside Target: {patient.id}</p>
        </div>

        <div className="flex items-center gap-2 bg-teal-500/10 text-teal-400 px-3.5 py-1.5 rounded-xl border border-teal-500/20 text-xs font-bold shadow-sm">
          <Eye className="h-4 w-4" /> Multi-Head Attention Head Active
        </div>
      </div>

      {/* Primary Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: XAI Summary & Explanation panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-6 rounded-2xl space-y-5 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-teal-400" /> Sepsis Interpretability Report
            </h3>
            
            <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
              isHighRisk 
                ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <div className={`p-2.5 rounded-xl shrink-0 ${isHighRisk ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs leading-tight">FPDAF Personalized Model</h4>
                <span className="text-[10px] opacity-80 font-semibold block mt-0.5">
                  Diagnosis: {isHighRisk ? 'Sepsis (Positive Onset Flagged)' : 'Normal (Negative)'}
                </span>
              </div>
            </div>

            {/* Interactive Scrubber Detail Card */}
            <div className="bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hour {selectedHour} Detail Snapshot</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  selectedHour >= 17 && selectedHour <= 22 && isHighRisk 
                    ? 'bg-red-500 text-white' 
                    : 'bg-teal-500/20 text-teal-400'
                }`}>
                  Weight: {activeAttention.attentionScore}
                </span>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Heart Rate (HR):</span>
                  <span className={selectedHour >= 17 && isHighRisk ? 'text-red-400 font-bold' : ''}>
                    {selectedHour >= 17 && isHighRisk ? '124 bpm (High)' : '82 bpm (Normal)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Systolic BP (SBP):</span>
                  <span className={selectedHour >= 17 && isHighRisk ? 'text-amber-400 font-bold' : ''}>
                    {selectedHour >= 17 && isHighRisk ? '94 mmHg (Low)' : '120 mmHg (Normal)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Oxygen Saturation (SpO₂):</span>
                  <span className={selectedHour >= 17 && isHighRisk ? 'text-red-400 font-bold' : ''}>
                    {selectedHour >= 17 && isHighRisk ? '91% (Low)' : '98% (Normal)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Structured Explanation Panel */}
            <div className="bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] p-4 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Bedside Attribution Rationale</span>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                {isHighRisk ? (
                  <>
                    The model focused heavily on abnormal <strong>Heart Rate (&gt;120 bpm)</strong> and <strong>SpO₂ (&lt;92%)</strong> during <strong>Hours 17–22</strong>. 
                    Simultaneous cardiac acceleration and tissue hypoxia triggered high query-key inner products in the BiLSTM self-attention layer.
                  </>
                ) : (
                  <>
                    The model analyzed the 24-hour vitals sequence and verified stable parameters across all window frames. 
                    No focal temporal self-attentions or physiological boundary violations were observed.
                  </>
                )}
              </p>
            </div>
            
            {/* Clinical Trust Check */}
            <div className="flex gap-2.5 items-start text-xs text-slate-400 leading-relaxed bg-teal-500/10 p-3.5 rounded-xl border border-teal-500/20">
              <AlertTriangle className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                Attention scores are computed across the 24-hour sliding telemetry window to establish clinician trust and transparency.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Charts Grid & Interactive Scrubber */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Interactive Timeline Scrubber & Bar Chart */}
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-6 rounded-2xl space-y-5 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-teal-400" />
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Temporal Self-Attention Weight Timeline</h4>
              </div>
              <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                Selected Hour: {selectedHour}
              </span>
            </div>

            {/* Slider Control */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Hour 1 (Admission)</span>
                <span>Hour 12</span>
                <span>Hour 24 (Current)</span>
              </div>
              <input
                type="range"
                min={1}
                max={24}
                value={selectedHour}
                onChange={(e) => setSelectedHour(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-[#1a2744] rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            {/* Bar Chart */}
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attentionData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 0.2]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '12px', fontSize: '11px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}
                  />
                  <Bar dataKey="attentionScore" fill="#0d9488" radius={[4, 4, 0, 0]} name="Attention weight">
                    {attentionData.map((entry, index) => {
                      const isSelected = entry.hour === selectedHour;
                      const isTriggerZone = isHighRisk && entry.hour >= 17 && entry.hour <= 22;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isSelected ? '#38bdf8' : isTriggerZone ? '#ef4444' : '#0d9488'} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {isHighRisk && (
              <div className="text-center text-xs text-red-500 font-bold bg-red-500/10 p-2.5 rounded-xl border border-red-500/30">
                🚨 High Attention Trigger Zone detected during ICU hours 17–22!
              </div>
            )}
          </div>

          {/* Feature Importance Attributions */}
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-6 rounded-2xl space-y-4 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Multivariate Feature Importance Contribution</h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={featureImportance}
                  margin={{ top: 5, right: 10, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} domain={[0, 50]} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '12px', fontSize: '11px' }} />
                  <Bar dataKey="importance" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={16}>
                    {featureImportance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NEW FEATURE: INTERACTIVE WHAT-IF VITAL SCENARIO SIMULATOR */}
          <div className="bg-white dark:bg-[#0d1829] border border-teal-500/30 p-6 rounded-2xl space-y-5 shadow-lg shadow-teal-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1a2744] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-teal-400" />
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">Interactive What-If Vital Simulator (Bedside Prognosis)</h4>
                  <span className="text-[9px] font-extrabold bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full uppercase">Live Forward Pass</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Adjust physiological vital sliders to simulate real-time treatment response and recalculate Sepsis forecast.</p>
              </div>

              <button
                onClick={handleResetSimulator}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#152238] border border-slate-200 dark:border-[#1a2744] text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-400 transition-colors shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5 text-teal-400" /> Reset Vitals
              </button>
            </div>

            {/* Live Forecast Gauge Card */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
              simRiskPercent >= 70 
                ? 'bg-red-500/10 border-red-500/40 text-red-500' 
                : simRiskPercent >= 40 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' 
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl text-white font-extrabold text-xl ${
                  simRiskPercent >= 70 ? 'bg-red-500' : simRiskPercent >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}>
                  {simRiskPercent}%
                </div>
                <div>
                  <h5 className="font-extrabold text-sm leading-tight text-slate-800 dark:text-white">
                    Simulated FPDAF Sepsis Probability Score
                  </h5>
                  <span className="text-xs font-semibold block mt-0.5">
                    {simRiskPercent >= 70 ? 'Critical Onset Forecasted' : simRiskPercent >= 40 ? 'Moderate Alert Elevation' : 'Stable Clinical Profile'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 border border-white/20">
                <span>Baseline Delta:</span>
                <span className={riskDelta > 0 ? 'text-red-400 font-extrabold' : 'text-emerald-400 font-extrabold'}>
                  {riskDelta > 0 ? `+${riskDelta}%` : `${riskDelta}%`}
                </span>
              </div>
            </div>

            {/* 6 Vital Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold">
              
              {/* Heart Rate */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] space-y-1.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Heart Rate (HR)</span>
                  <span className={`font-bold ${simHR > 100 ? 'text-red-400' : 'text-teal-400'}`}>{simHR} bpm</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={160}
                  value={simHR}
                  onChange={(e) => setSimHR(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#1a2744] rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              {/* Mean Arterial Pressure (MAP) */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] space-y-1.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Mean Arterial Press. (MAP)</span>
                  <span className={`font-bold ${simMAP < 65 ? 'text-red-400' : 'text-teal-400'}`}>{simMAP} mmHg</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={110}
                  value={simMAP}
                  onChange={(e) => setSimMAP(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#1a2744] rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              {/* Temperature */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] space-y-1.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Body Temperature</span>
                  <span className={`font-bold ${simTemp > 38.0 || simTemp < 36.0 ? 'text-amber-400' : 'text-teal-400'}`}>{simTemp.toFixed(1)} °C</span>
                </div>
                <input
                  type="range"
                  min={35.0}
                  max={41.0}
                  step={0.1}
                  value={simTemp}
                  onChange={(e) => setSimTemp(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#1a2744] rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              {/* SpO2 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] space-y-1.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Oxygen Saturation (SpO₂)</span>
                  <span className={`font-bold ${simSpO2 < 93 ? 'text-red-400' : 'text-teal-400'}`}>{simSpO2}%</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={100}
                  value={simSpO2}
                  onChange={(e) => setSimSpO2(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#1a2744] rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              {/* WBC Count */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] space-y-1.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>White Blood Cell (WBC)</span>
                  <span className={`font-bold ${simWBC > 12.0 ? 'text-amber-400' : 'text-teal-400'}`}>{simWBC.toFixed(1)} 10³/μL</span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={30.0}
                  step={0.5}
                  value={simWBC}
                  onChange={(e) => setSimWBC(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#1a2744] rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              {/* Lactate */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] space-y-1.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Blood Lactate</span>
                  <span className={`font-bold ${simLactate >= 2.0 ? 'text-red-400' : 'text-teal-400'}`}>{simLactate.toFixed(1)} mmol/L</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10.0}
                  step={0.1}
                  value={simLactate}
                  onChange={(e) => setSimLactate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#1a2744] rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
