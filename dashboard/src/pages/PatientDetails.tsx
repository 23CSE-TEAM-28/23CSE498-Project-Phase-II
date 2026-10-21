import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck,
  User,
  Plus,
  Send,
  FileText,
  Droplet
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { fetchPatientVitals, fetchPatientNotes, addPatientNote } from '../services/api';
import type { Patient, VitalSignRecord, ClinicalNote } from '../services/api';

interface PatientDetailsProps {
  patient: Patient;
  setActiveTab: (tab: string) => void;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({ patient, setActiveTab }) => {
  const [vitals, setVitals] = useState<VitalSignRecord[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<'all' | 'hr' | 'bp' | 'spo2'>('all');

  // New Note Authoring State
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'Observation' | 'Intervention' | 'Alert'>('Observation');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteSuccessMessage, setNoteSuccessMessage] = useState('');

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchPatientVitals(patient.id),
      fetchPatientNotes(patient.id)
    ]).then(([vitalsData, notesData]) => {
      setVitals(vitalsData);
      setNotes(notesData);
      setIsLoading(false);
    });
  }, [patient.id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      const created = await addPatientNote(patient.id, {
        author: "Dr. Pallavi",
        role: "Attending Intensivist",
        content: newNoteContent.trim(),
        category: newNoteCategory
      });
      setNotes(prev => [created, ...prev]);
      setNewNoteContent('');
      setNoteSuccessMessage('Clinical observation recorded in database!');
      setTimeout(() => setNoteSuccessMessage(''), 3000);
    } catch {
      // Fallback local append if backend is temporarily disconnected
      const fallbackNote: ClinicalNote = {
        id: `NOTE-${Date.now().toString().slice(-4)}`,
        patientId: patient.id,
        author: "Dr. Pallavi",
        role: "Attending Intensivist",
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        content: newNoteContent.trim(),
        category: newNoteCategory
      };
      setNotes(prev => [fallbackNote, ...prev]);
      setNewNoteContent('');
      setNoteSuccessMessage('Clinical note logged locally.');
      setTimeout(() => setNoteSuccessMessage(''), 3000);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  if (isLoading || vitals.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const latestVital = vitals[vitals.length - 1];
  const isHighRisk = patient.riskLevel === 'High';

  // Calculate clinical scores
  const sirsCount = (latestVital.heartRate > 90 ? 1 : 0) + 
                    (latestVital.temperature > 38.0 || latestVital.temperature < 36.0 ? 1 : 0) + 
                    (latestVital.respiration > 20 ? 1 : 0) + 1; // +1 for suspected infection
  const qsofaCount = (latestVital.respiration >= 22 ? 1 : 0) + 
                     (latestVital.bloodPressure <= 100 ? 1 : 0) + 
                     (isHighRisk ? 1 : 0);

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] font-sans">
      {/* Navigation and Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('patients')}
            className="p-2 rounded-xl border border-slate-200 dark:border-[#1c2c48] bg-white dark:bg-[#0c1626] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152540] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              ICU Bedside Telemetry Chart & EHR
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target Patient: <strong className="text-teal-600 dark:text-teal-400 telemetry-mono">{patient.id}</strong> &bull; {patient.ward} ({patient.hospital})
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('prediction')}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-extrabold px-4 py-2 rounded-xl transition-colors text-xs shadow-lg shadow-teal-600/20"
        >
          <span>FPDAF Model Diagnostics</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* COMPREHENSIVE CLINICAL EMR PATIENT BANNER */}
      <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1c2c48] p-5 rounded-2xl shadow-sm space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 border-b border-slate-100 dark:border-[#1c2c48] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">MRN / Patient ID</span>
            <h4 className="font-black text-base text-slate-900 dark:text-white telemetry-mono leading-tight">{patient.id}</h4>
            <span className="text-xs text-slate-500 font-medium">{patient.age}y &bull; {patient.gender}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Location</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight">{patient.ward}</h4>
            <span className="text-xs text-slate-500">{patient.hospital}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Admission Date</span>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 telemetry-mono leading-tight">{patient.admittedAt}</h4>
            <span className="text-[11px] text-teal-500 font-semibold">ICU Stay: 24h</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Allergies & Code</span>
            <div className="flex flex-col gap-0.5 mt-0.5">
              <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded w-fit">
                Sulfa / Penicillin
              </span>
              <span className="text-[10px] font-bold text-emerald-500">FULL CODE</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Attending MD</span>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight">Dr. Pallavi, MD</h4>
            <span className="text-[10px] text-slate-400">Intensivist #4982</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sepsis Triage</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black uppercase mt-0.5 ${
              isHighRisk 
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
            }`}>
              {patient.riskLevel} Risk
            </span>
          </div>
        </div>

        {/* Real-Time Clinical Criteria Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2c48] flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">SIRS Criteria</span>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {sirsCount >= 2 ? '⚠️ Sepsis Warning' : 'Negative'}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black telemetry-mono ${sirsCount >= 2 ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
              {sirsCount}/4 SIRS
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2c48] flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Quick SOFA (qSOFA)</span>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {qsofaCount >= 2 ? 'High ICU Mortality Risk' : 'Low Risk'}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black telemetry-mono ${qsofaCount >= 2 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
              {qsofaCount}/3 qSOFA
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2c48] flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">FPDAF Personalized Risk</span>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {isHighRisk ? 'Hour-1 Bundle Stat' : 'Standard Monitoring'}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black telemetry-mono ${isHighRisk ? 'bg-red-600 text-white' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'}`}>
              {Math.round(((patient.scores.fpdaf_v2 ?? patient.scores.fpdaf) || 0.89) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Vital Metric Selection Buttons */}
      <div className="flex gap-1.5 bg-slate-200 dark:bg-[#091220] p-1 rounded-xl w-fit border border-slate-300 dark:border-[#1c2c48]">
        <button
          onClick={() => setActiveMetric('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeMetric === 'all' ? 'bg-white dark:bg-[#152540] text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          All ICU Parameters
        </button>
        <button
          onClick={() => setActiveMetric('hr')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeMetric === 'hr' ? 'bg-white dark:bg-[#152540] text-red-500 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Heart Rate (HR)
        </button>
        <button
          onClick={() => setActiveMetric('bp')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeMetric === 'bp' ? 'bg-white dark:bg-[#152540] text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Blood Pressure (NIBP)
        </button>
        <button
          onClick={() => setActiveMetric('spo2')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeMetric === 'spo2' ? 'bg-white dark:bg-[#152540] text-cyan-500 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Oxygen (SpO₂)
        </button>
      </div>

      {/* Continuous 24-Hour Vital Waveforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Heart Rate */}
        {(activeMetric === 'all' || activeMetric === 'hr') && (
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1c2c48] p-5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-red-500">
              <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="h-4 w-4 animate-pulse" /> Heart Rate (HR) &bull; Threshold: 100 bpm
              </span>
              <span className="text-base font-black telemetry-mono">{latestVital.heartRate} bpm</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2c48" className="hidden dark:block" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickFormatter={(h) => `H${h}`} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[50, 160]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c1626', border: '1px solid #1c2c48', borderRadius: '10px', fontSize: '11px' }} 
                    labelFormatter={(h) => `Hour ${h} of ICU Admission`}
                  />
                  <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Tachycardia Threshold (100)', fill: '#ef4444', fontSize: 9 }} />
                  <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Heart Rate (bpm)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Systolic Blood Pressure */}
        {(activeMetric === 'all' || activeMetric === 'bp') && (
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1c2c48] p-5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-amber-500">
              <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4" /> Systolic Blood Pressure &bull; Hypotension Target: 90 mmHg
              </span>
              <span className="text-base font-black telemetry-mono">{latestVital.bloodPressure} mmHg</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2c48" className="hidden dark:block" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickFormatter={(h) => `H${h}`} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[60, 180]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c1626', border: '1px solid #1c2c48', borderRadius: '10px', fontSize: '11px' }} 
                    labelFormatter={(h) => `Hour ${h} of ICU Admission`}
                  />
                  <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Hypotension Threshold (90)', fill: '#f59e0b', fontSize: 9 }} />
                  <Line type="monotone" dataKey="bloodPressure" stroke="#f59e0b" strokeWidth={2} dot={false} name="Systolic BP (mmHg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Oxygen Saturation */}
        {(activeMetric === 'all' || activeMetric === 'spo2') && (
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1c2c48] p-5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-cyan-500">
              <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="h-4 w-4" /> Oxygen Saturation (SpO₂) &bull; Desaturation: 92%
              </span>
              <span className="text-base font-black telemetry-mono">{latestVital.spo2}%</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2c48" className="hidden dark:block" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickFormatter={(h) => `H${h}`} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[80, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c1626', border: '1px solid #1c2c48', borderRadius: '10px', fontSize: '11px' }} 
                    labelFormatter={(h) => `Hour ${h} of ICU Admission`}
                  />
                  <ReferenceLine y={92} stroke="#06b6d4" strokeDasharray="4 4" label={{ value: 'Hypoxia Limit (92%)', fill: '#06b6d4', fontSize: 9 }} />
                  <Line type="monotone" dataKey="spo2" stroke="#06b6d4" strokeWidth={2} dot={false} name="Oxygen Saturation (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Body Temperature */}
        {activeMetric === 'all' && (
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1c2c48] p-5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-emerald-500">
              <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="h-4 w-4" /> Body Temperature &bull; Pyrexia Limit: 38.0 °C
              </span>
              <span className="text-base font-black telemetry-mono">{latestVital.temperature} °C</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2c48" className="hidden dark:block" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickFormatter={(h) => `H${h}`} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[35.0, 41.0]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c1626', border: '1px solid #1c2c48', borderRadius: '10px', fontSize: '11px' }} 
                    labelFormatter={(h) => `Hour ${h} of ICU Admission`}
                  />
                  <ReferenceLine y={38.0} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Fever Threshold (38.0°C)', fill: '#10b981', fontSize: 9 }} />
                  <Line type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={2} dot={false} name="Temperature (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* CLINICAL OBSERVATIONS & NOTES (EHR TIMELINE WITH WRITE CAPABILITY) */}
      <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1c2c48] p-5 rounded-2xl space-y-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-[#1c2c48] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-500" />
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Clinician Observations, Notes & Order Log
              </h4>
              <p className="text-[11px] text-slate-500">Persistent Medical Record Attached to Patient {patient.id}</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-teal-500 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 uppercase tracking-wider telemetry-mono">
            {notes.length} Records
          </span>
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="p-4 rounded-xl bg-slate-50 dark:bg-[#091220] border border-slate-200 dark:border-[#1c2c48] space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-teal-500" /> Record New Bedside Observation / Order Note
            </span>
            <div className="flex gap-1.5">
              {(['Observation', 'Intervention', 'Alert'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewNoteCategory(cat)}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase transition-all ${
                    newNoteCategory === cat 
                      ? 'bg-teal-600 text-white shadow-sm' 
                      : 'bg-slate-200 dark:bg-[#152540] text-slate-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="e.g. Initiated 2L IV Plasmalyte bolus for hypotension; blood cultures sent to lab..."
              className="flex-1 bg-white dark:bg-[#101c30] border border-slate-200 dark:border-[#1c2c48] rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={isSubmittingNote || !newNoteContent.trim()}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmittingNote ? 'Saving...' : 'Post Note'}</span>
            </button>
          </div>

          {noteSuccessMessage && (
            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> {noteSuccessMessage}
            </span>
          )}
        </form>

        {/* Existing Notes Feed */}
        {notes.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No clinical notes recorded for this patient yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="p-3.5 bg-slate-50 dark:bg-[#091220] rounded-xl border border-slate-200 dark:border-[#1c2c48] space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        {note.author} <span className="font-normal text-slate-400">({note.role})</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block telemetry-mono">{note.timestamp}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    note.category === 'Alert' 
                      ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                      : note.category === 'Intervention' 
                      ? 'bg-teal-500/20 text-teal-500 border border-teal-500/30' 
                      : 'bg-slate-200 dark:bg-[#152540] text-slate-600 dark:text-slate-300'
                  }`}>
                    {note.category}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-9">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
