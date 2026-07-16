import React from 'react';
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
import { ShieldAlert, Award, LineChart as ChartIcon, Zap, ShieldCheck } from 'lucide-react';
import { mockCusumData } from '../services/mockDataService';

export const DriftMonitor: React.FC = () => {
  // Current values at Round 10
  const latestCusum = mockCusumData[mockCusumData.length - 1];
  const threshold = 3.0;

  const nodeStatus = [
    { name: 'Hospital A (Client 0)', value: latestCusum.client0, status: latestCusum.client0 > threshold ? 'Drift Alert' : 'Stable', color: latestCusum.client0 > threshold ? 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' },
    { name: 'Hospital B (Client 1)', value: latestCusum.client1, status: latestCusum.client1 > threshold ? 'Drift Alert' : 'Stable', color: latestCusum.client1 > threshold ? 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' },
    { name: 'Hospital C (Client 2)', value: latestCusum.client2, status: latestCusum.client2 > threshold ? 'Drift Alert' : 'Stable', color: latestCusum.client2 > threshold ? 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' }
  ];

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">Online Concept Drift Monitoring</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Cumulative Sum (CUSUM) residuals tracking and Client-Side Selective Personalization (CSSP) controls</p>
      </div>

      {/* Grid of Hospital Node CUSUM Statuses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nodeStatus.map((node, i) => (
          <div 
            key={i} 
            className={`border p-5 rounded-2xl shadow-sm bg-white dark:bg-slate-800 flex flex-col justify-between min-h-[140px]`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">{node.name}</h4>
                <span className="text-xs text-slate-400 block mt-0.5">CUSUM Residual Monitor</span>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                node.status === 'Drift Alert'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              }`}>
                {node.status === 'Drift Alert' ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                {node.status}
              </span>
            </div>
            
            <div className="mt-4 flex justify-between items-end">
              <div>
                <span className="text-xs text-slate-450 block font-semibold uppercase tracking-wider">CUSUM Score</span>
                <span className={`text-2xl font-black ${node.value > threshold ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                  {node.value.toFixed(2)}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Limit: {threshold.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CUSUM Drift Timeline Chart */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
            <ChartIcon className="h-5 w-5 text-blue-500" /> Sequential CUSUM Log Curves (Rounds 1–10)
          </h3>
          <span className="text-xs font-semibold text-slate-400">Drift triggers reset scores to 0</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockCusumData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
              <XAxis dataKey="round" stroke="#94a3b8" fontSize={11} name="Communication Round" />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 5]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
              <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Drift Threshold (h=3.0)', position: 'insideBottomRight', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
              <Line type="monotone" dataKey="client0" stroke="#3b82f6" strokeWidth={2.5} name="Hospital A (Client 0)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="client1" stroke="#f97316" strokeWidth={2.5} name="Hospital B (Client 1)" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="client2" stroke="#2ecc71" strokeWidth={2.5} name="Hospital C (Client 2)" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selective Personalization explanation */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500 fill-amber-500/20" /> Client-Side Selective Personalization (CSSP)
        </h4>
        <div className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium space-y-2">
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
