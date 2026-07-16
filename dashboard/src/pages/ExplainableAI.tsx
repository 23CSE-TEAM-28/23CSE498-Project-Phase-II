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
import { ShieldAlert, BookOpen, AlertTriangle } from 'lucide-react';
import { fetchPatientAttention, getFeatureImportance } from '../services/mockDataService';
import type { Patient, AttentionData } from '../services/mockDataService';

interface ExplainableAIProps {
  patient: Patient;
}

export const ExplainableAI: React.FC<ExplainableAIProps> = ({ patient }) => {
  const [attentionData, setAttentionData] = useState<AttentionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const featureImportance = getFeatureImportance();
  const isHighRisk = patient.riskLevel === 'High';

  useEffect(() => {
    setIsLoading(true);
    fetchPatientAttention(patient.id).then((data) => {
      setAttentionData(data);
      setIsLoading(false);
    });
  }, [patient.id]);

  if (isLoading || attentionData.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Clinical Sepsis Explainability (XAI)</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Saliency attributions and temporal self-attention maps for Bedside: {patient.id}</p>
      </div>

      {/* Primary Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: XAI Summary & Explanation panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-4">
            <h3 className="font-semibold text-slate-850 dark:text-slate-200 text-sm flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-teal-500" /> Sepsis Interpretability Report
            </h3>
            
            <div className={`p-3.5 rounded border flex items-center gap-3 ${
              isHighRisk 
                ? 'bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/60' 
                : 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-[#1a2744]'
            }`}>
              <div className={`p-2 rounded ${isHighRisk ? 'bg-red-100 dark:bg-red-900/20 text-red-650' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-650'}`}>
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight">FPDAF Personalized Model</h4>
                <span className="text-[10px] text-slate-450 block mt-0.5">Predicted: {isHighRisk ? 'Sepsis (Positive)' : 'Normal (Negative)'}</span>
              </div>
            </div>

            {/* Structured Explanation Panel */}
            <div className="bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] p-4 rounded space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Bedside Attribution Synopsis</span>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350 font-medium">
                {isHighRisk ? (
                  <>
                    The model focused mainly on abnormal <strong>Heart Rate</strong> and <strong>SpO₂</strong> values during <strong>Hours 17–22</strong>. 
                    During this timeline, a simultaneous increase in heart rate (&gt;110 bpm) and drop in oxygen saturation (&lt;92%) 
                    strongly activated the query self-attention keys, indicating early onset of septic shock.
                  </>
                ) : (
                  <>
                    The model analyzed the 24-hour sequence and detected stable parameters across all hours. 
                    No focal temporal self-attentions or extreme physiological boundary crossings were identified.
                  </>
                )}
              </p>
            </div>
            
            {/* Clinical Trust Check */}
            <div className="flex gap-2 items-start text-[11px] text-slate-450 leading-relaxed bg-teal-50/20 dark:bg-teal-900/10 p-3 rounded">
              <AlertTriangle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
              <span>
                These attention values represent temporal weights computed across the 24-hour sliding sequence, aiding clinical diagnosis support.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Charts Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Temporal Attention Timeline */}
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Temporal Self-Attention Weight Timeline</h4>
              <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/15 px-2.5 py-0.5 rounded">Sequence Hour Logs (1-24)</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attentionData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 0.2]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '6px', fontSize: '11px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="attentionScore" fill="#0d9488" radius={[3, 3, 0, 0]} name="Attention weight">
                    {attentionData.map((entry, index) => {
                      const isTriggerZone = isHighRisk && entry.hour >= 17 && entry.hour <= 22;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isTriggerZone ? '#ef4444' : '#0d9488'} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {isHighRisk && (
              <div className="text-center text-[11px] text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-900/60">
                🚨 High Attention Trigger Zone detected during ICU hours 17–22!
              </div>
            )}
          </div>

          {/* Feature Importance Attributions */}
          <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-4">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Multivariate Feature Importance Contribution</h4>
            <div className="h-48">
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
                  <Tooltip contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '6px', fontSize: '11px' }} />
                  <Bar dataKey="importance" fill="#0d9488" radius={[0, 3, 3, 0]} barSize={16}>
                    {featureImportance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
