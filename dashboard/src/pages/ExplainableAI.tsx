import React from 'react';
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
import { useState, useEffect } from 'react';
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
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">Clinical Sepsis Explainability (XAI)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Saliency attributions and temporal self-attention maps for Bedside: {patient.id}</p>
      </div>

      {/* Primary Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: XAI Summary & Explanation panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" /> Sepsis Interpretability Report
            </h3>
            
            <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
              isHighRisk 
                ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800' 
                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
            }`}>
              <div className={`p-3 rounded-lg ${isHighRisk ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-tight">FPDAF Personalized Model</h4>
                <span className="text-xs text-slate-400 font-medium">Predicted: {isHighRisk ? 'Sepsis (Positive)' : 'Normal (Negative)'}</span>
              </div>
            </div>

            {/* Structured Explanation Panel */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Bedside Attribution Synopsis</span>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
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
            <div className="flex gap-2.5 items-start text-xs text-slate-500 font-medium leading-relaxed bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <span>
                These attention values represent temporal weights computed across the 24-hour sliding sequence, aiding clinical diagnosis support.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Charts Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Temporal Attention Timeline */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 dark:text-white text-base">Temporal Self-Attention Weight Timeline</h4>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">Sequence Hour Logs (1-24)</span>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attentionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 0.2]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="attentionScore" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Self-Attention weight">
                    {attentionData.map((entry, index) => {
                      const isTriggerZone = isHighRisk && entry.hour >= 17 && entry.hour <= 22;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isTriggerZone ? '#ef4444' : '#3b82f6'} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {isHighRisk && (
              <div className="text-center text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                🚨 High Attention Trigger Zone detected during ICU hours 17–22!
              </div>
            )}
          </div>

          {/* Feature Importance Attributions */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-white text-base">Multivariate Feature Importance Contribution</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={featureImportance}
                  margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 50]} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={180} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                  <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
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
