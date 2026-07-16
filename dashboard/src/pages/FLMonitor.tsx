import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Database, 
  ArrowDownUp, 
  Play, 
  Pause 
} from 'lucide-react';

export const FLMonitor: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  // Simulated node stats
  const nodes = [
    { name: 'Hospital A (Client 0)', data: '92,613 samples', status: 'Active (Consensus)', lag: '42ms' },
    { name: 'Hospital B (Client 1)', data: '151,916 samples', status: 'Active (Consensus)', lag: '38ms' },
    { name: 'Hospital C (Client 2)', data: '233,140 samples', status: 'CSSP Selective Head Adapt', lag: 'N/A (Bypassed)' }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white leading-tight">Federated Learning Monitor</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live parameter aggregation pipeline showing consensus loops and communication status</p>
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-1.5 font-medium px-3.5 py-1.5 rounded text-xs transition-colors shadow-sm ${
            isPlaying ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? 'Pause Loop' : 'Start Loop'}
        </button>
      </div>

      {/* Animation Canvas */}
      <div className="bg-[#0b1320] border border-slate-200 dark:border-[#1a2744] p-6 rounded-md min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Floating background grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

        <div className="w-full max-w-2xl flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
          
          {/* Hospital Nodes (Left Side) */}
          <div className="flex flex-col gap-6 w-full md:w-56">
            {nodes.map((node, i) => (
              <div
                key={i}
                className="bg-[#0d1829]/90 backdrop-blur-sm border border-slate-700 p-3 rounded flex items-center gap-3 relative"
              >
                <div className="p-2 bg-teal-950/40 text-teal-400 rounded">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-white leading-tight">{node.name}</h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{node.data}</span>
                  <span className={`text-[9px] font-semibold mt-0.5 inline-block ${
                    node.status.includes('CSSP') ? 'text-amber-400' : 'text-emerald-400'
                  }`}>{node.status}</span>
                </div>

                {/* Animated sliding packet towards server */}
                {isPlaying && (
                  <motion.div
                    initial={{ x: 0, opacity: 0 }}
                    animate={{ 
                      x: [0, 180, 180, 0], 
                      opacity: [0, 1, 1, 0] 
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      delay: i * 1.2,
                      ease: 'easeInOut'
                    }}
                    className="absolute right-0 h-2 w-2 bg-teal-400 rounded-full shadow-lg shadow-teal-400/50 hidden md:block"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Central Connecting Hub */}
          <div className="flex items-center justify-center shrink-0">
            <div className="h-12 w-12 bg-teal-950/30 border border-teal-500/20 rounded-full flex items-center justify-center">
              <ArrowDownUp className="h-6 w-6 text-teal-400" />
            </div>
          </div>

          {/* Central Federated Server (Right Side) */}
          <div className="w-full md:w-56">
            <div className="bg-[#0d1829]/90 backdrop-blur-sm border border-slate-700 p-5 rounded flex flex-col items-center text-center space-y-3 relative">
              <div className="p-3 bg-teal-650/10 text-teal-400 rounded border border-teal-550/20">
                <Server className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white leading-tight">Central Aggregation Server</h3>
                <span className="text-[9px] text-slate-400 mt-0.5 block">FPDAF Global Aggregator v1.0</span>
              </div>
              <div className="bg-[#0a1323] border border-slate-700 px-3 py-1 rounded text-[9px] font-bold text-emerald-450 uppercase tracking-wide">
                FedAvg Active
              </div>

              {/* Animated sliding packet from server back to clients */}
              {isPlaying && (
                <motion.div
                  initial={{ x: 0, opacity: 0 }}
                  animate={{ 
                    x: [0, -180, -180, 0], 
                    opacity: [0, 1, 1, 0] 
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    delay: 2,
                    ease: 'easeInOut'
                  }}
                  className="absolute left-0 h-2 w-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50 hidden md:block"
                />
              )}
            </div>
          </div>

        </div>

        {/* Dynamic loop label */}
        <div className="mt-6 text-center text-[11px] text-slate-400 font-medium">
          Consensus loop: local training iterations $\rightarrow$ parameter transfer $\rightarrow$ FedAvg aggregation $\rightarrow$ parameter update.
        </div>
      </div>

      {/* Network telemetry stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-4 rounded-md space-y-0.5">
          <span className="text-[10px] text-slate-450 block font-medium uppercase tracking-wide">Comm Rounds</span>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">10 / 10</h3>
        </div>
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-4 rounded-md space-y-0.5">
          <span className="text-[10px] text-slate-450 block font-medium uppercase tracking-wide">Participation</span>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">100% (3/3)</h3>
        </div>
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-4 rounded-md space-y-0.5">
          <span className="text-[10px] text-slate-450 block font-medium uppercase tracking-wide">CSSP Bandwidth</span>
          <h3 className="font-bold text-lg text-emerald-500">38% Saved</h3>
        </div>
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-4 rounded-md space-y-0.5">
          <span className="text-[10px] text-slate-450 block font-medium uppercase tracking-wide">Latency avg</span>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">1.8s</h3>
        </div>
      </div>
    </div>
  );
};
