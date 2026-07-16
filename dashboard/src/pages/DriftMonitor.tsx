import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ReferenceLine
} from 'recharts';
import { ShieldAlert, LineChart as ChartIcon, Zap, ShieldCheck } from 'lucide-react';
import { fetchDriftData } from '../services/mockDataService';
import type { DriftRecord } from '../services/mockDataService';

export const DriftMonitor: React.FC = () => {
  const [cusumData, setCusumData] = useState<DriftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const threshold = 3.0;

  useEffect(() => {
    setIsLoading(true);
    fetchDriftData().then((data) => {
      setCusumData(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || cusumData.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const latestCusum = cusumData[cusumData.length - 1];

  const nodeStatus = [
    { name: 'Hospital A (Client 0)', value: latestCusum.client0, status: latestCusum.client0 > threshold ? 'Drift Alert' : 'Stable' },
    { name: 'Hospital B (Client 1)', value: latestCusum.client1, status: latestCusum.client1 > threshold ? 'Drift Alert' : 'Stable' },
    { name: 'Hospital C (Client 2)', value: latestCusum.client2, status: latestCusum.client2 > threshold ? 'Drift Alert' : 'Stable' }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white leading-tight">Online Concept Drift Monitoring</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cumulative Sum (CUSUM) residuals tracking and Client-Side Selective Personalization (CSSP) controls</p>
      </div>

      {/* Grid of Hospital Node CUSUM Statuses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodeStatus.map((node, i) => (
          <div 
            key={i} 
            className="border p-4 rounded-md bg-white dark:bg-[#0d1829] border-slate-200 dark:border-[#1a2744] flex flex-col justify-between min-h-[120px]"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-xs text-slate-800 dark:text-white leading-tight">{node.name}</h4>
                <span className="text-[10px] text-slate-450 block mt-0.5">CUSUM Residual Monitor</span>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                node.status === 'Drift Alert'
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
              }`}>
                {node.status === 'Drift Alert' ? <ShieldAlert className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                {node.status}
              </span>
            </div>
            
            <div className="mt-3 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wide">CUSUM Score</span>
                <span className={`text-xl font-bold ${node.value > threshold ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                  {node.value.toFixed(2)}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Limit: {threshold.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CUSUM Drift Timeline Chart */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-1.5">
            <ChartIcon className="h-4 w-4 text-teal-500" /> CUSUM Log Curves (Rounds 1–10)
          </h3>
          <span className="text-[10px] text-slate-450">Drift triggers reset scores to 0</span>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cusumData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" className="hidden dark:block" />
              <XAxis dataKey="round" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 5]} />
              <Tooltip contentStyle={{ backgroundColor: '#0d1829', border: '1px solid #1a2744', borderRadius: '6px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Limit: 3.0', position: 'insideBottomRight', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }} />
              <Line type="monotone" dataKey="client0" stroke="#0d9488" strokeWidth={1.5} name="Hospital A (Client 0)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="client1" stroke="#f97316" strokeWidth={1.5} name="Hospital B (Client 1)" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="client2" stroke="#10b981" strokeWidth={1.5} name="Hospital C (Client 2)" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selective Personalization explanation */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-3">
        <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-amber-500 fill-amber-500/10" /> Client-Side Selective Personalization (CSSP)
        </h4>
        <div className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium space-y-2">
          <p>
            When a hospital node's running CUSUM score exceeds the threshold ($h = 3.0$), it indicates that the hospital's local ICU patient population has drifted significantly from the global consensus demographics (concept drift).
          </p>
          <p>
            To prevent model degradation, the node automatically initiates the <strong>CSSP Protocol</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The shared LSTM feature extractor layers are <strong>frozen</strong> (requires_grad = False).</li>
            <li>Local training epochs are dedicated exclusively to adapting the <strong>personalized classification head</strong>.</li>
            <li>The node <strong>bypasses consensus communication</strong>, uploading zero weights to the central server to preserve absolute local privacy and conserve bandwidth.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
