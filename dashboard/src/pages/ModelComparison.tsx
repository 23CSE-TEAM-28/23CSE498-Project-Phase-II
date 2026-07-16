import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Award, Zap } from 'lucide-react';
import { fetchModelComparison } from '../services/mockDataService';
import type { ModelMetrics } from '../services/mockDataService';

// ROC data mapping
const rocCurveData = [
  { fpr: 0.0, centralized: 0.0, fedavg: 0.0, fedprox: 0.0, ditto: 0.0, fpdaf: 0.0 },
  { fpr: 0.1, centralized: 0.45, fedavg: 0.35, fedprox: 0.42, ditto: 0.40, fpdaf: 0.38 },
  { fpr: 0.2, centralized: 0.65, fedavg: 0.55, fedprox: 0.62, ditto: 0.61, fpdaf: 0.58 },
  { fpr: 0.3, centralized: 0.75, fedavg: 0.68, fedprox: 0.72, ditto: 0.71, fpdaf: 0.67 },
  { fpr: 0.4, centralized: 0.82, fedavg: 0.74, fedprox: 0.79, ditto: 0.78, fpdaf: 0.74 },
  { fpr: 0.5, centralized: 0.87, fedavg: 0.79, fedprox: 0.84, ditto: 0.83, fpdaf: 0.79 },
  { fpr: 0.6, centralized: 0.91, fedavg: 0.84, fedprox: 0.88, ditto: 0.87, fpdaf: 0.83 },
  { fpr: 0.7, centralized: 0.94, fedavg: 0.89, fedprox: 0.92, ditto: 0.91, fpdaf: 0.88 },
  { fpr: 0.8, centralized: 0.97, fedavg: 0.94, fedprox: 0.96, ditto: 0.95, fpdaf: 0.93 },
  { fpr: 0.9, centralized: 0.99, fedavg: 0.98, fedprox: 0.99, ditto: 0.99, fpdaf: 0.97 },
  { fpr: 1.0, centralized: 1.0, fedavg: 1.0, fedprox: 1.0, ditto: 1.0, fpdaf: 1.0 }
];

export const ModelComparison: React.FC = () => {
  const [comparisonMetrics, setComparisonMetrics] = useState<ModelMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchModelComparison().then((data) => {
      setComparisonMetrics(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || comparisonMetrics.length === 0) {
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
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white leading-tight">Decentralized Model Benchmark</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Five-way metrics verification overlay comparing centralized baselines and personalized federated algorithms</p>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {comparisonMetrics.map((model, i) => {
          const isProposed = model.name.includes('Proposed') || model.name.includes('FPDAF');
          return (
            <div 
              key={i}
              className={`p-4 rounded-md border bg-white dark:bg-[#0d1829] flex flex-col justify-between transition-colors ${
                isProposed 
                  ? 'border-teal-500 dark:border-teal-500/60 ring-2 ring-teal-500/10' 
                  : 'border-slate-200 dark:border-[#1a2744]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-white leading-tight pr-1.5">{model.name}</h4>
                  {isProposed && <Award className="h-4.5 w-4.5 text-teal-500 shrink-0" />}
                </div>
                <span className="text-[10px] text-slate-450 block">Test set AUROC</span>
                <span className={`text-xl font-bold block mt-0.5 ${isProposed ? 'text-teal-500' : 'text-slate-700 dark:text-slate-305'}`}>
                  {model.auroc.toFixed(4)}
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1a2744] text-[10px] space-y-1 font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-bold text-slate-750 dark:text-slate-300">{model.accuracy.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>F1-Score:</span>
                  <span className="font-bold text-slate-750 dark:text-slate-300">{model.f1.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comm Cost:</span>
                  <span className="font-bold text-slate-750 dark:text-slate-300">{model.commCost}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* ROC Overlay curve */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">ROC Curve Comparison</h4>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Test Set</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocCurveData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                <XAxis dataKey="fpr" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 1.0]} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '6px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="centralized" stroke="#64748b" strokeWidth={1.5} name="Centralized" dot={false} />
                <Line type="monotone" dataKey="fedavg" stroke="#f97316" strokeWidth={1.5} name="FedAvg" dot={false} />
                <Line type="monotone" dataKey="fedprox" stroke="#3b82f6" strokeWidth={1.5} name="FedProx" dot={false} />
                <Line type="monotone" dataKey="ditto" stroke="#10b981" strokeWidth={1.5} name="Ditto P." dot={false} />
                <Line type="monotone" dataKey="fpdaf" stroke="#0d9488" strokeWidth={2} name="FPDAF Proposed" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* F1 & Accuracy Bar Chart */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">Accuracy & Recall Performance</h4>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Metrics</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonMetrics} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickFormatter={(name) => name.split(' ')[0]} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '6px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="accuracy" fill="#0d9488" name="Accuracy (%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="recall" fill="#ef4444" name="Recall / Sensitivity (%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Communication & Time Efficiency Table */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] rounded-md overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#1a2744]">
          <h4 className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500/10" /> Efficiency and Communication Savings Telemetry
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0a1323] border-b border-slate-200 dark:border-[#1a2744]">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Model Configuration</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Comm Bandwidth</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Aggregate Training Time</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Drift Adaptation Latency</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Privacy Safeguards</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744] text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {comparisonMetrics.map((model, i) => {
                const isProposed = model.name.includes('Proposed') || model.name.includes('FPDAF');
                return (
                  <tr key={i} className={isProposed ? 'bg-teal-500/5 dark:bg-teal-950/10' : ''}>
                    <td className="px-5 py-3 text-slate-800 dark:text-slate-200 font-semibold">{model.name}</td>
                    <td className="px-5 py-3">{model.commCost}</td>
                    <td className="px-5 py-3">{model.trainTime}</td>
                    <td className="px-5 py-3">{model.driftAdaptTime}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                        model.name.includes('Centralized')
                          ? 'bg-red-50 dark:bg-red-955/20 text-red-700 dark:text-red-400'
                          : 'bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-450'
                      }`}>
                        {model.name.includes('Centralized') ? 'No (Data Shared)' : 'Yes (Decentralized)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
