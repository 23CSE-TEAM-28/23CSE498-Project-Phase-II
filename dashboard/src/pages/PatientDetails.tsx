import { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  ArrowLeft, 
  ArrowRight,
  Stethoscope
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { fetchPatientVitals } from '../services/mockDataService';
import type { Patient, VitalSignRecord } from '../services/mockDataService';

interface PatientDetailsProps {
  patient: Patient;
  setActiveTab: (tab: string) => void;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({ patient, setActiveTab }) => {
  const [vitals, setVitals] = useState<VitalSignRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<'all' | 'hr' | 'bp' | 'spo2'>('all');

  useEffect(() => {
    setIsLoading(true);
    fetchPatientVitals(patient.id).then((data) => {
      setVitals(data);
      setIsLoading(false);
    });
  }, [patient.id]);

  if (isLoading || vitals.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      {/* Navigation header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('patients')}
          className="p-1.5 rounded border border-slate-200 dark:border-[#1a2744] bg-white dark:bg-[#0d1829] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152238] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white leading-tight">Patient Clinical Records</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Timeline monitoring data — ID: {patient.id}</p>
        </div>
      </div>

      {/* Bedside Info Card */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Admission ID</span>
          <h4 className="font-semibold text-sm text-slate-800 dark:text-white leading-tight">{patient.id}</h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">{patient.age}y / {patient.gender}</span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">ICU Ward Location</span>
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-350 leading-tight">{patient.ward}</h4>
          <span className="text-xs text-slate-400 block">{patient.hospital}</span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sepsis Alert Risk</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
            patient.riskLevel === 'High'
              ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
              : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
          }`}>
            {patient.riskLevel} Risk Profile
          </span>
        </div>

        <div className="flex items-center md:justify-end">
          <button
            onClick={() => setActiveTab('prediction')}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-medium px-3.5 py-2 rounded transition-colors text-xs"
          >
            Sepsis Diagnostic <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Vital Metric Selection */}
      <div className="flex gap-1.5 bg-slate-100 dark:bg-[#0a1323] p-1 rounded-md w-fit">
        <button
          onClick={() => setActiveMetric('all')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeMetric === 'all' ? 'bg-white dark:bg-[#152238] text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500'
          }`}
        >
          All Vitals
        </button>
        <button
          onClick={() => setActiveMetric('hr')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeMetric === 'hr' ? 'bg-white dark:bg-[#152238] text-red-500 dark:text-red-400 shadow-sm' : 'text-slate-500'
          }`}
        >
          Heart Rate
        </button>
        <button
          onClick={() => setActiveMetric('bp')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeMetric === 'bp' ? 'bg-white dark:bg-[#152238] text-amber-500 dark:text-amber-450 shadow-sm' : 'text-slate-500'
          }`}
        >
          Blood Pressure
        </button>
        <button
          onClick={() => setActiveMetric('spo2')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeMetric === 'spo2' ? 'bg-white dark:bg-[#152238] text-teal-500 dark:text-teal-450 shadow-sm' : 'text-slate-500'
          }`}
        >
          Oxygen (SpO₂)
        </button>
      </div>

      {/* Recharts Vital Graphs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeMetric === 'all' || activeMetric === 'hr') && (
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-3">
            <div className="flex justify-between items-center text-red-500">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Heart className="h-4 w-4" /> Heart Rate (HR)
              </span>
              <span className="text-sm font-bold">{vitals[vitals.length - 1].heartRate} bpm</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[50, 150]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '6px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {(activeMetric === 'all' || activeMetric === 'bp') && (
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-3">
            <div className="flex justify-between items-center text-amber-500">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity className="h-4 w-4" /> Systolic Blood Pressure (SBP)
              </span>
              <span className="text-sm font-bold">{vitals[vitals.length - 1].bloodPressure} mmHg</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[70, 160]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '6px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="bloodPressure" stroke="#f97316" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {(activeMetric === 'all' || activeMetric === 'spo2') && (
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-3">
            <div className="flex justify-between items-center text-teal-500">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Stethoscope className="h-4 w-4" /> Oxygen Saturation (SpO₂)
              </span>
              <span className="text-sm font-bold">{vitals[vitals.length - 1].spo2} %</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[85, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '6px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="spo2" stroke="#0d9488" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeMetric === 'all' && (
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-3">
            <div className="flex justify-between items-center text-emerald-500">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Thermometer className="h-4 w-4" /> Body Temperature
              </span>
              <span className="text-sm font-bold">{vitals[vitals.length - 1].temperature} °C</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[35.0, 41.0]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '6px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="temperature" stroke="#10b981" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
