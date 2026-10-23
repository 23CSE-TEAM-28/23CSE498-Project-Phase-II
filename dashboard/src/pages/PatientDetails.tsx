import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  ArrowLeft, 
  Send, 
  FileText, 
  Droplet, 
  Wind, 
  Zap 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { fetchPatientFullProfile, addPatientNote } from '../services/api';
import type { Patient, PatientFullProfile, ClinicalNote } from '../services/api';

interface PatientDetailsProps {
  patient: Patient;
  setActiveTab: (tab: string) => void;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({ patient, setActiveTab }) => {
  const [profile, setProfile] = useState<PatientFullProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeMetric, setActiveMetric] = useState<'all' | 'hr' | 'bp' | 'spo2' | 'resp'>('all');

  // Clinical Note Authoring
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'Observation' | 'Intervention' | 'Alert'>('Observation');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteSuccessMessage, setNoteSuccessMessage] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetchPatientFullProfile(patient.id)
      .then((data) => {
        setProfile(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading patient full profile:", err);
        setIsLoading(false);
      });
  }, [patient.id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !profile) return;

    setIsSubmittingNote(true);
    try {
      const created = await addPatientNote(profile.id, {
        author: "Dr. Pallavi",
        role: "Attending Intensivist",
        content: newNoteContent.trim(),
        category: newNoteCategory
      });
      setProfile(prev => prev ? { ...prev, notes: [created, ...prev.notes] } : null);
      setNewNoteContent('');
      setNoteSuccessMessage('Clinical observation recorded in warehouse!');
      setTimeout(() => setNoteSuccessMessage(''), 3500);
    } catch {
      const fallbackNote: ClinicalNote = {
        id: `NOTE-${Date.now().toString().slice(-4)}`,
        patientId: profile.id,
        author: "Dr. Pallavi",
        role: "Attending Intensivist",
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        content: newNoteContent.trim(),
        category: newNoteCategory
      };
      setProfile(prev => prev ? { ...prev, notes: [fallbackNote, ...prev.notes] } : null);
      setNewNoteContent('');
      setNoteSuccessMessage('Clinical note logged locally.');
      setTimeout(() => setNoteSuccessMessage(''), 3500);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const isHighRisk = profile.riskLevel === 'High';
  const riskPercent = Math.round((profile.scores.fpdaf_v2 ?? profile.scores.fpdaf) * 100);

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] font-sans">
      {/* 1. Top Navigation & Action Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200 dark:border-[#1a2744]">
        <button
          onClick={() => setActiveTab('patients')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to ICU Ward Cohort
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('prediction')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Zap className="h-3.5 w-3.5" /> Run PyTorch Inference
          </button>
          <button
            onClick={() => setActiveTab('xai')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#152238] hover:bg-slate-200 dark:hover:bg-[#1d2d48] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-[#1a2744]"
          >
            Explainable AI (XAI)
          </button>
        </div>
      </div>

      {/* 2. Patient Master Identity & Organ Dysfunction Banner */}
      <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-lg font-mono shrink-0 ${
              isHighRisk 
                ? 'bg-red-500/15 text-red-400 border border-red-500/30' 
                : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
            }`}>
              {profile.id.split('-')[1]}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white font-mono">
                  {profile.id}
                </h2>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                  isHighRisk 
                    ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}>
                  {isHighRisk ? 'Critical Sepsis Triage' : 'Stable Bedside'}
                </span>
                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  FPDAF-v2 Risk: {riskPercent}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {profile.age} years old &bull; {profile.gender} &bull; {profile.ward} &bull; {profile.hospital} &bull; Admitted: {profile.admittedAt}
              </p>
            </div>
          </div>

          {/* Clinical Scores: SOFA & qSOFA */}
          <div className="flex items-center gap-3">
            {/* SOFA Score */}
            <div className="bg-slate-50 dark:bg-[#08101d] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center min-w-[120px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">SOFA Score</span>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className={`text-2xl font-extrabold font-mono ${profile.sofaScore.total >= 8 ? 'text-red-400' : 'text-teal-400'}`}>
                  {profile.sofaScore.total}
                </span>
                <span className="text-xs text-slate-500">/ 24</span>
              </div>
              <span className="text-[9px] text-slate-400 block truncate">{profile.sofaScore.interpretation.split(' ')[0]} Risk</span>
            </div>

            {/* qSOFA Score */}
            <div className="bg-slate-50 dark:bg-[#08101d] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">qSOFA Bedside</span>
              <div className="flex items-baseline justify-center gap-1 mt-0.5">
                <span className={`text-2xl font-extrabold font-mono ${profile.qsofaScore.score >= 2 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {profile.qsofaScore.score}
                </span>
                <span className="text-xs text-slate-500">/ 3</span>
              </div>
              <span className="text-[9px] text-slate-400 block">{profile.qsofaScore.score >= 2 ? '≥2 Criteria Met' : 'Low Immediate'}</span>
            </div>
          </div>
        </div>

        {/* 6-Parameter Latest Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
              <Heart className="h-3 w-3 text-red-400" /> Heart Rate
            </span>
            <span className={`text-base font-bold font-mono ${profile.latestVitals.heartRate > 100 ? 'text-red-400' : 'text-slate-200'}`}>
              {profile.latestVitals.heartRate} <span className="text-[10px] text-slate-500 font-normal">bpm</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
              <Activity className="h-3 w-3 text-blue-400" /> Blood Pressure
            </span>
            <span className="text-base font-bold font-mono text-slate-200">
              {profile.latestVitals.bloodPressure} <span className="text-[10px] text-slate-500 font-normal">mmHg</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
              <Activity className="h-3 w-3 text-indigo-400" /> Derived MAP
            </span>
            <span className={`text-base font-bold font-mono ${profile.latestVitals.meanArterialPressure < 65 ? 'text-red-400' : 'text-slate-200'}`}>
              {profile.latestVitals.meanArterialPressure} <span className="text-[10px] text-slate-500 font-normal">mmHg</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
              <Wind className="h-3 w-3 text-cyan-400" /> SpO₂
            </span>
            <span className={`text-base font-bold font-mono ${profile.latestVitals.spo2 < 92 ? 'text-red-400' : 'text-cyan-400'}`}>
              {profile.latestVitals.spo2}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
              <Thermometer className="h-3 w-3 text-amber-400" /> Temp
            </span>
            <span className="text-base font-bold font-mono text-slate-200">
              {profile.latestVitals.temperature}°C
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101d] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
              <Activity className="h-3 w-3 text-teal-400" /> Resp Rate
            </span>
            <span className={`text-base font-bold font-mono ${profile.latestVitals.respiration > 22 ? 'text-amber-400' : 'text-slate-200'}`}>
              {profile.latestVitals.respiration} <span className="text-[10px] text-slate-500 font-normal">/min</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Longitudinal 24-Hour Waveforms & Biomarkers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 24h Vitals History Line Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  24-Hour Longitudinal Physiological Trajectory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sliding hourly window from PhysioNet EHR time-series
                </p>
              </div>

              {/* Metric filter buttons */}
              <div className="flex flex-wrap gap-1 text-[11px] font-semibold bg-slate-100 dark:bg-[#0a1323] p-1 rounded-xl border border-slate-200 dark:border-[#17253d]">
                <button
                  onClick={() => setActiveMetric('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${activeMetric === 'all' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All Trends
                </button>
                <button
                  onClick={() => setActiveMetric('hr')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${activeMetric === 'hr' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  HR
                </button>
                <button
                  onClick={() => setActiveMetric('bp')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${activeMetric === 'bp' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  BP
                </button>
                <button
                  onClick={() => setActiveMetric('spo2')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${activeMetric === 'spo2' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  SpO₂
                </button>
              </div>
            </div>

            {/* Line chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profile.vitalsHistory} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#233554" opacity={0.4} />
                  <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c1626', borderColor: '#1f2e4d', borderRadius: '0.75rem', fontSize: '11px' }}
                  />
                  {(activeMetric === 'all' || activeMetric === 'hr') && (
                    <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate (bpm)" strokeWidth={2} dot={false} />
                  )}
                  {(activeMetric === 'all' || activeMetric === 'bp') && (
                    <Line type="monotone" dataKey="bloodPressure" stroke="#3b82f6" name="Blood Pressure (mmHg)" strokeWidth={2} dot={false} />
                  )}
                  {(activeMetric === 'all' || activeMetric === 'spo2') && (
                    <Line type="monotone" dataKey="spo2" stroke="#06b6d4" name="SpO₂ (%)" strokeWidth={2} dot={false} />
                  )}
                  {activeMetric === 'all' && (
                    <Line type="monotone" dataKey="respiration" stroke="#10b981" name="Respiration (/min)" strokeWidth={2} dot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temporal Attention Saliency Timeline */}
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                  Temporal Attention Distribution (Hours 1 - 24)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Computed by FPDAF Multi-Head Attention to detect prodromal deterioration
                </p>
              </div>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                Hours 17-22 Saliency Peak
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profile.attentionWeights} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="patAttnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#233554" opacity={0.4} />
                  <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c1626', borderColor: '#1f2e4d', borderRadius: '0.75rem', fontSize: '11px' }}
                    formatter={(val: any) => [(Number(val) * 100).toFixed(1) + '%', 'Attention Saliency']}
                  />
                  <Area type="monotone" dataKey="attentionScore" stroke="#0d9488" fillOpacity={1} fill="url(#patAttnGrad)" strokeWidth={2} name="Attention Weight" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Laboratory Biomarkers & Clinical Notes */}
        <div className="space-y-6">
          {/* Laboratory Panel */}
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Droplet className="h-4 w-4 text-red-400" />
              Diagnostic Laboratory Biomarkers
            </h4>

            <div className="space-y-2.5 pt-1">
              {[
                { name: 'Serum Lactate', val: profile.laboratories.lactate, unit: profile.laboratories.lactateUnit, ref: profile.laboratories.lactateRef, isAlert: profile.laboratories.lactate > 2.0 },
                { name: 'WBC Count', val: profile.laboratories.wbc, unit: profile.laboratories.wbcUnit, ref: profile.laboratories.wbcRef, isAlert: profile.laboratories.wbc > 12.0 },
                { name: 'Serum Creatinine', val: profile.laboratories.creatinine, unit: profile.laboratories.creatinineUnit, ref: profile.laboratories.creatinineRef, isAlert: profile.laboratories.creatinine > 1.3 },
                { name: 'Platelets', val: profile.laboratories.platelets, unit: profile.laboratories.plateletsUnit, ref: profile.laboratories.plateletsRef, isAlert: profile.laboratories.platelets < 150 },
                { name: 'Total Bilirubin', val: profile.laboratories.bilirubin, unit: profile.laboratories.bilirubinUnit, ref: profile.laboratories.bilirubinRef, isAlert: profile.laboratories.bilirubin > 1.2 },
                { name: 'Arterial pH', val: profile.laboratories.ph, unit: '', ref: profile.laboratories.phRef, isAlert: profile.laboratories.ph < 7.35 }
              ].map((lab, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#17253d] text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">{lab.name}</span>
                    <span className="text-[10px] text-slate-400">Ref: {lab.ref}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className={`font-bold ${lab.isAlert ? 'text-red-400' : 'text-slate-200'}`}>
                      {lab.val} {lab.unit}
                    </span>
                    {lab.isAlert && (
                      <span className="text-[9px] text-red-400 font-sans block uppercase font-bold">ABNORMAL</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Notes & Intervention Authoring */}
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-400" />
              Clinical Notes & Orders Log
            </h4>

            {/* Authoring form */}
            <form onSubmit={handleAddNote} className="space-y-2.5">
              <div className="flex gap-2">
                <select
                  value={newNoteCategory}
                  onChange={(e: any) => setNewNoteCategory(e.target.value)}
                  className="bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#17253d] text-slate-700 dark:text-slate-200 text-xs font-semibold px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Observation">Observation</option>
                  <option value="Intervention">Intervention</option>
                  <option value="Alert">Alert</option>
                </select>
              </div>

              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Log bedside clinical observation or medication order..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#17253d] rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />

              <button
                type="submit"
                disabled={isSubmittingNote || !newNoteContent.trim()}
                className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" /> Log to Medical Chart
              </button>

              {noteSuccessMessage && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] text-center font-medium">
                  {noteSuccessMessage}
                </div>
              )}
            </form>

            {/* Notes List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {profile.notes.map((note) => (
                <div key={note.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#17253d] text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{note.author} ({note.role})</span>
                    <span className="text-slate-400 font-mono">{note.timestamp}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-normal">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
