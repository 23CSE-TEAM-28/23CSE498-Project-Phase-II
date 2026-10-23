import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Database, 
  ArrowDownUp, 
  Play, 
  Pause, 
  ShieldCheck, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Lock, 
  RefreshCw, 
  TrendingUp, 
  Layers, 
  Radio, 
  Sliders, 
  HardDrive 
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

interface HospitalNode {
  id: string;
  name: string;
  institution: string;
  samples: number;
  sampleFormatted: string;
  weight: number;
  localAuroc: number;
  localLoss: number;
  driftSr: number;
  status: 'Active (Consensus)' | 'CSSP Selective Head Adapt';
  isDrifted: boolean;
  backboneState: 'Synchronized' | 'Frozen (CSSP)';
  headState: 'Synchronized' | 'Personalized Adaptation';
  uplinkSize: string;
  bandwidthSaved: string;
  lag: string;
  icuType: string;
  demographics: {
    avgAge: number;
    sepsisPrevalence: string;
    beds: number;
  };
}

interface AggregationLog {
  id: string;
  timestamp: string;
  round: number;
  category: 'consensus' | 'drift' | 'privacy' | 'network';
  message: string;
  badge?: string;
  badgeColor?: string;
}

// 10-Round Convergence Data for Recharts
const convergenceData = [
  { round: 'R1', fpdafAuroc: 0.742, fedavgAuroc: 0.730, localLoss: 0.582, bandwidthVanilla: 42.6, bandwidthFPDAF: 42.6 },
  { round: 'R2', fpdafAuroc: 0.810, fedavgAuroc: 0.795, localLoss: 0.441, bandwidthVanilla: 42.6, bandwidthFPDAF: 42.6 },
  { round: 'R3', fpdafAuroc: 0.852, fedavgAuroc: 0.831, localLoss: 0.365, bandwidthVanilla: 42.6, bandwidthFPDAF: 42.6 },
  { round: 'R4', fpdafAuroc: 0.884, fedavgAuroc: 0.854, localLoss: 0.298, bandwidthVanilla: 42.6, bandwidthFPDAF: 42.6 },
  { round: 'R5', fpdafAuroc: 0.906, fedavgAuroc: 0.869, localLoss: 0.245, bandwidthVanilla: 42.6, bandwidthFPDAF: 42.6 },
  { round: 'R6', fpdafAuroc: 0.921, fedavgAuroc: 0.875, localLoss: 0.210, bandwidthVanilla: 42.6, bandwidthFPDAF: 42.6 },
  { round: 'R7', fpdafAuroc: 0.932, fedavgAuroc: 0.879, localLoss: 0.178, bandwidthVanilla: 42.6, bandwidthFPDAF: 31.8 }, // CSSP Triggers at R7!
  { round: 'R8', fpdafAuroc: 0.938, fedavgAuroc: 0.881, localLoss: 0.162, bandwidthVanilla: 42.6, bandwidthFPDAF: 31.8 },
  { round: 'R9', fpdafAuroc: 0.940, fedavgAuroc: 0.883, localLoss: 0.149, bandwidthVanilla: 42.6, bandwidthFPDAF: 31.8 },
  { round: 'R10', fpdafAuroc: 0.9418, fedavgAuroc: 0.8842, localLoss: 0.142, bandwidthVanilla: 42.6, bandwidthFPDAF: 31.8 }
];

const initialLogs: AggregationLog[] = [
  {
    id: 'log-10',
    timestamp: '07:46:50',
    round: 10,
    category: 'consensus',
    message: 'Global aggregation complete: Model FPDAF-v2 weights broadcast to 3 clients with AUROC 0.9418.',
    badge: 'CONVERGED',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'log-9',
    timestamp: '07:46:48',
    round: 10,
    category: 'privacy',
    message: 'Differential Privacy DP-SGD noise injected (ε = 4.8, δ = 1e-5, clipping norm C = 1.0).',
    badge: 'DP-SGD',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  },
  {
    id: 'log-8',
    timestamp: '07:46:44',
    round: 10,
    category: 'drift',
    message: 'Node 2 (Hospital 3) AD-CUSUM evaluated at Sr = 3.42 > 3.0 threshold. CSSP backbone frozen, head updated (38.2% payload saved).',
    badge: 'CSSP ACTIVE',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  },
  {
    id: 'log-7',
    timestamp: '07:46:41',
    round: 10,
    category: 'network',
    message: 'gRPC TLS 1.3 parameter tensors received from Hospital 1 (14.2MB), Hospital 2 (14.2MB), Hospital 3 (8.8MB).',
    badge: 'UPLINK 37.2MB',
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30'
  },
  {
    id: 'log-6',
    timestamp: '07:46:35',
    round: 10,
    category: 'consensus',
    message: 'Round 10 initialization: 3 hospital client nodes synchronized local batch training (5 epochs / batch 64).',
    badge: 'ROUND 10/10',
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
  }
];

export const FLMonitor: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedRound, setSelectedRound] = useState(10);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-2');
  const [activeChartTab, setActiveChartTab] = useState<'convergence' | 'bandwidth'>('convergence');
  const [logFilter, setLogFilter] = useState<'all' | 'consensus' | 'drift' | 'privacy'>('all');
  const [logs, setLogs] = useState<AggregationLog[]>(initialLogs);
  const [isSimulatingCycle, setIsSimulatingCycle] = useState(false);

  // Hospital Nodes Data with real metrics
  const nodes: HospitalNode[] = [
    {
      id: 'node-0',
      name: 'Hospital 1 (Client Node 0)',
      institution: 'PhysioNet Medical Center A',
      samples: 92613,
      sampleFormatted: '92,613 samples',
      weight: 19.4,
      localAuroc: 0.9382,
      localLoss: 0.154,
      driftSr: 1.18,
      status: 'Active (Consensus)',
      isDrifted: false,
      backboneState: 'Synchronized',
      headState: 'Synchronized',
      uplinkSize: '14.2 MB',
      bandwidthSaved: '0% (Standard)',
      lag: '42ms',
      icuType: 'Surgical ICU (SICU)',
      demographics: { avgAge: 62.4, sepsisPrevalence: '3.8%', beds: 36 }
    },
    {
      id: 'node-1',
      name: 'Hospital 2 (Client Node 1)',
      institution: 'Central Medical Center',
      samples: 151916,
      sampleFormatted: '151,916 samples',
      weight: 31.8,
      localAuroc: 0.9447,
      localLoss: 0.141,
      driftSr: 2.04,
      status: 'Active (Consensus)',
      isDrifted: false,
      backboneState: 'Synchronized',
      headState: 'Synchronized',
      uplinkSize: '14.2 MB',
      bandwidthSaved: '0% (Standard)',
      lag: '38ms',
      icuType: 'Medical ICU (MICU)',
      demographics: { avgAge: 65.1, sepsisPrevalence: '4.1%', beds: 48 }
    },
    {
      id: 'node-2',
      name: 'Hospital 3 (Client Node 2)',
      institution: 'Memorial Healthcare Regional ICU',
      samples: 233140,
      sampleFormatted: '233,140 samples',
      weight: 48.8,
      localAuroc: 0.9512,
      localLoss: 0.129,
      driftSr: 3.42,
      status: 'CSSP Selective Head Adapt',
      isDrifted: true,
      backboneState: 'Frozen (CSSP)',
      headState: 'Personalized Adaptation',
      uplinkSize: '8.8 MB',
      bandwidthSaved: '38.2% Saved',
      lag: 'N/A (Bypassed)',
      icuType: 'Cardiac & Trauma ICU',
      demographics: { avgAge: 68.7, sepsisPrevalence: '5.2%', beds: 56 }
    }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[2];

  // Trigger an interactive simulated aggregation cycle
  const handleTriggerAggregation = () => {
    setIsSimulatingCycle(true);
    const newLogId = `log-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    setTimeout(() => {
      setLogs(prev => [
        {
          id: newLogId,
          timestamp: timeStr,
          round: selectedRound,
          category: 'consensus',
          message: `Manual parameter aggregation triggered for Round ${selectedRound}. FedAvg fusion weights computed across 477,669 samples.`,
          badge: 'MANUAL SYNC',
          badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30'
        },
        ...prev
      ]);
      setIsSimulatingCycle(false);
    }, 1200);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    return log.category === logFilter;
  });

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] font-sans">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-1 border-b border-slate-200 dark:border-[#1a2744]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              Federated Learning Consensus & Aggregation Monitor
            </h2>
            <span className="text-[10px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
              FPDAF-v2 Core
            </span>
            <span className="text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              DP-SGD (ε=4.8)
            </span>
            <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Converged (Round 10/10)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time decentralized parameter synchronization, AD-CUSUM drift thresholds, and Client-Side Selective Personalization (CSSP) telemetry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Round Stepper */}
          <div className="flex items-center bg-slate-100 dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] rounded px-2.5 py-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mr-2 font-medium">Round:</span>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-white outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                <option key={r} value={r} className="bg-slate-900 text-white">
                  Round {r} of 10 {r === 10 ? '(Final)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Trigger Cycle Button */}
          <button
            onClick={handleTriggerAggregation}
            disabled={isSimulatingCycle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            title="Trigger real-time parameter aggregation step"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-teal-400 ${isSimulatingCycle ? 'animate-spin' : ''}`} />
            <span>{isSimulatingCycle ? 'Aggregating...' : 'Trigger Sync'}</span>
          </button>

          {/* Loop Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 font-medium px-3.5 py-1.5 rounded text-xs transition-colors shadow-xs ${
              isPlaying 
                ? 'bg-amber-600/90 hover:bg-amber-600 text-white' 
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'Pause Loop' : 'Resume Loop'}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Telemetry Strip (6 High-Density Medical Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-3.5 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Comm Rounds</span>
            <Layers className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-slate-800 dark:text-white font-mono">10 / 10</div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span>100% Convergence</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-3.5 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Participation</span>
            <Database className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-slate-800 dark:text-white font-mono">100% (3/3)</div>
          <div className="text-[10px] text-slate-400 truncate">
            477,669 ICU samples
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-3.5 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">CSSP Bandwidth</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">38.2% Saved</div>
          <div className="text-[10px] text-slate-400">
            Head-only selective adapt
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-3.5 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Mean Latency</span>
            <Activity className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-slate-800 dark:text-white font-mono">1.84s</div>
          <div className="text-[10px] text-slate-400">
            ±38ms jitter • gRPC TLS
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-3.5 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Global AUROC</span>
            <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-teal-400 font-mono">0.9418</div>
          <div className="text-[10px] text-emerald-400">
            +5.76% vs FedAvg (0.884)
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] p-3.5 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Privacy Budget</span>
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 font-mono">ε = 4.8</div>
          <div className="text-[10px] text-slate-400">
            δ = 10⁻⁵ • DP-SGD Active
          </div>
        </div>
      </div>

      {/* 3. Centerpiece: Interactive Federated Architecture & Live Network Canvas */}
      <div className="bg-[#0a1220] border border-slate-200 dark:border-[#182845] rounded-xl p-5 relative overflow-hidden shadow-sm">
        {/* Subtle Cyber Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#152238_1px,transparent_1px),linear-gradient(to_bottom,#152238_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_75%,transparent_100%)] opacity-35 pointer-events-none"></div>

        {/* Top Canvas Bar */}
        <div className="flex items-center justify-between mb-4 relative z-10 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-teal-400 opacity-75' : 'bg-slate-400 opacity-30'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-teal-500' : 'bg-slate-500'}`}></span>
            </span>
            <span className="font-semibold text-white tracking-wide">
              Live Topology: 3 Client Hospital Nodes &rarr; Central FedAvg Global Aggregator
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              (Click any node to inspect telemetry)
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
            Consensus Protocol: <span className="text-teal-400 font-semibold">FPDAF Adaptive Sync</span>
          </div>
        </div>

        {/* Main Canvas Grid: Left Clients | Middle Synapse Hub | Right Central Aggregator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">
          
          {/* LEFT: Hospital Nodes (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                    isSelected 
                      ? 'bg-[#0f1d33] border-teal-500 shadow-md shadow-teal-500/10 ring-1 ring-teal-500/40' 
                      : 'bg-[#0d1829]/90 hover:bg-[#0e1b30] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${
                        node.isDrifted 
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                          : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                      }`}>
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white leading-tight">{node.name}</h4>
                          <span className="text-[9px] text-slate-400 font-mono">({node.institution})</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-300 font-mono font-medium">{node.sampleFormatted}</span>
                          <span className="text-slate-600 text-[10px]">•</span>
                          <span className="text-[10px] text-slate-400">Weight: <strong className="text-slate-200">{node.weight}%</strong></span>
                          <span className="text-slate-600 text-[10px]">•</span>
                          <span className="text-[10px] text-teal-300 font-mono font-semibold">AUROC: {node.localAuroc}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                      node.isDrifted 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {node.isDrifted ? 'CSSP Adapt' : 'Consensus'}
                    </span>
                  </div>

                  {/* Telemetry sub-strip */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">AD-CUSUM Sr</span>
                      <span className={`font-mono font-bold ${node.isDrifted ? 'text-amber-400' : 'text-slate-200'}`}>
                        {node.driftSr} {node.isDrifted ? '(> 3.0 Alert)' : '(<= 3.0)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Backbone Status</span>
                      <span className={`font-mono font-medium ${node.isDrifted ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {node.backboneState}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Payload Size</span>
                      <span className={`font-mono font-bold ${node.isDrifted ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {node.uplinkSize} {node.isDrifted && '(-38%)'}
                      </span>
                    </div>
                  </div>

                  {/* Animated sliding packet towards server */}
                  {isPlaying && (
                    <motion.div
                      initial={{ x: 0, opacity: 0 }}
                      animate={{ 
                        x: [0, 80, 80, 0], 
                        opacity: [0, 1, 1, 0] 
                      }}
                      transition={{ 
                        duration: 3.5, 
                        repeat: Infinity, 
                        delay: nodes.indexOf(node) * 1.1,
                        ease: 'easeInOut'
                      }}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full shadow-md hidden lg:block ${
                        node.isDrifted ? 'bg-amber-400 shadow-amber-400/70' : 'bg-teal-400 shadow-teal-400/70'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* MIDDLE: Bi-directional Exchange Synapse Hub (2 cols) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-3 text-center py-4">
            <div className="relative">
              <div className="h-14 w-14 bg-teal-950/40 border-2 border-teal-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/10">
                <ArrowDownUp className={`h-6 w-6 text-teal-400 ${isPlaying ? 'animate-pulse' : ''}`} />
              </div>
              {isPlaying && (
                <div className="absolute -inset-1 bg-teal-500/20 rounded-2xl blur-xs -z-10 animate-pulse"></div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">
                Bi-Directional
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">
                gRPC / TLS 1.3
              </span>
              <div className="text-[8px] text-slate-500 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 inline-block font-mono">
                Port 50051
              </div>
            </div>

            <div className="flex flex-col gap-1 text-[9px] text-slate-400 font-mono w-full">
              <div className="flex items-center justify-between bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                <span className="text-teal-400">&larr; Upload:</span>
                <span className="text-slate-300">Gradients</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                <span className="text-emerald-400">&rarr; Broadcast:</span>
                <span className="text-slate-300">W_global</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Central Federated Server (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#0f1b2e] border-2 border-teal-500/40 p-5 rounded-xl flex flex-col items-center text-center space-y-3.5 relative shadow-xl shadow-teal-500/5">
              
              {/* Server Icon & Active Indicator */}
              <div className="relative">
                <div className="p-3.5 bg-gradient-to-br from-teal-500/20 to-cyan-500/10 text-teal-400 rounded-xl border border-teal-500/40">
                  <Server className="h-9 w-9" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white leading-tight">Central Aggregation Server</h3>
                <span className="text-[10px] text-teal-300 mt-0.5 block font-mono">
                  FPDAF Global Aggregator v2.0
                </span>
              </div>

              {/* Status Pill */}
              <div className="bg-[#09111c] border border-emerald-500/30 px-3.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                FedAvg Active &bull; Round {selectedRound}/10
              </div>

              {/* Aggregation Specs Table */}
              <div className="w-full bg-[#0a1322] border border-slate-800 rounded-lg p-3 text-left space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Backbone Architecture:</span>
                  <span className="text-slate-200 font-mono font-semibold">Temporal Multi-Head Attention</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Total Trainable Params:</span>
                  <span className="text-teal-400 font-mono font-bold">12,485,314 (12.4M)</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Fusion Weighting:</span>
                  <span className="text-slate-200 font-mono">Sample-Proportional + AD-CUSUM</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Global Validation Loss:</span>
                  <span className="text-emerald-400 font-mono font-bold">0.1420</span>
                </div>
              </div>

              {/* Client Weight Distribution Visual Bars */}
              <div className="w-full space-y-1.5 text-left">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                  <span>Aggregation Weight Shares:</span>
                  <span className="font-mono text-slate-300">477,669 Total Samples</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div style={{ width: '19.4%' }} className="bg-teal-500 h-full" title="Hospital 1 (19.4%)" />
                  <div style={{ width: '31.8%' }} className="bg-cyan-500 h-full" title="Hospital 2 (31.8%)" />
                  <div style={{ width: '48.8%' }} className="bg-amber-500 h-full" title="Hospital 3 (48.8% - CSSP)" />
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                  <span className="text-teal-400">Hosp 1: 19.4%</span>
                  <span className="text-cyan-400">Hosp 2: 31.8%</span>
                  <span className="text-amber-400">Hosp 3: 48.8% (CSSP)</span>
                </div>
              </div>

              {/* Animated sliding packet from server back to clients */}
              {isPlaying && (
                <motion.div
                  initial={{ x: 0, opacity: 0 }}
                  animate={{ 
                    x: [0, -90, -90, 0], 
                    opacity: [0, 1, 1, 0] 
                  }}
                  transition={{ 
                    duration: 3.5, 
                    repeat: Infinity, 
                    delay: 1.8,
                    ease: 'easeInOut'
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-emerald-400 rounded-full shadow-md shadow-emerald-400/70 hidden lg:block"
                />
              )}
            </div>
          </div>

        </div>

        {/* 4. Consensus Pipeline Steps Bar (Clean workflow instead of raw LaTeX!) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sliders className="h-3 w-3 text-teal-400" />
              Consensus Pipeline Execution Flow (Round {selectedRound})
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Status: Iteration Complete &bull; Zero Drift Loss
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <div className="bg-[#0e192c] border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
              <div>
                <span className="font-semibold text-white block text-[11px]">Local Training</span>
                <span className="text-[9px] text-slate-400 block">5 Epochs / Batch 64</span>
              </div>
            </div>

            <div className="bg-[#0e192c] border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
              <div>
                <span className="font-semibold text-white block text-[11px]">AD-CUSUM Drift Test</span>
                <span className="text-[9px] text-slate-400 block">Evaluate Sr &gt; 3.0 threshold</span>
              </div>
            </div>

            <div className="bg-[#0e192c] border border-amber-500/30 p-2.5 rounded-lg flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
              <div>
                <span className="font-semibold text-amber-300 block text-[11px]">CSSP Head Adapt</span>
                <span className="text-[9px] text-slate-400 block">Freeze backbone if drifted</span>
              </div>
            </div>

            <div className="bg-[#0e192c] border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
              <div>
                <span className="font-semibold text-white block text-[11px]">DP-SGD Parameter Uplink</span>
                <span className="text-[9px] text-slate-400 block">TLS 1.3 + Noise (ε=4.8)</span>
              </div>
            </div>

            <div className="bg-[#0e192c] border border-emerald-500/30 p-2.5 rounded-lg flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">5</span>
              <div>
                <span className="font-semibold text-emerald-300 block text-[11px]">FedAvg Fusion & Broadcast</span>
                <span className="text-[9px] text-slate-400 block">W_t+1 parameter update</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Deep Analytical Verification Panels (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Convergence Chart & Bandwidth Comparison (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-400" />
                Federated Convergence & Communication Efficiency
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-round validation trajectory comparing FPDAF-v2 against standard FedAvg
              </p>
            </div>

            {/* Chart Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-[#0a1220] p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setActiveChartTab('convergence')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeChartTab === 'convergence'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AUROC Trajectory
              </button>
              <button
                onClick={() => setActiveChartTab('bandwidth')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeChartTab === 'bandwidth'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bandwidth Savings (MB)
              </button>
            </div>
          </div>

          {/* Recharts Display */}
          <div className="h-64 w-full">
            {activeChartTab === 'convergence' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={convergenceData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" vertical={false} />
                  <XAxis dataKey="round" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0.7, 1.0]} stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => v.toFixed(2)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d1829',
                      borderColor: '#1a2744',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine x="R7" stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'CSSP Trigger (R7)', fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                  <Line 
                    type="monotone" 
                    dataKey="fpdafAuroc" 
                    name="FPDAF-v2 AUROC (Proposed)" 
                    stroke="#14b8a6" 
                    strokeWidth={2.5} 
                    dot={{ r: 3, fill: '#14b8a6' }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fedavgAuroc" 
                    name="Vanilla FedAvg Baseline" 
                    stroke="#64748b" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    dot={{ r: 2.5, fill: '#64748b' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="localLoss" 
                    name="Global Sepsis Loss" 
                    stroke="#ef4444" 
                    strokeWidth={1.5} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={convergenceData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" vertical={false} />
                  <XAxis dataKey="round" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" MB" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d1829',
                      borderColor: '#1a2744',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="bandwidthVanilla" name="Standard FedAvg Payload (MB)" fill="#334155" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bandwidthFPDAF" name="FPDAF CSSP Payload (MB)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-50 dark:bg-[#0a1220] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Zap className="h-3.5 w-3.5" />
              Cumulative Bandwidth Saved: <strong>43.2 MB</strong> across Rounds 7-10
            </span>
            <span className="text-slate-400 font-mono">
              Final AUROC: <strong className="text-teal-400">0.9418</strong>
            </span>
          </div>
        </div>

        {/* Right Column: Selected Node Deep Telemetry & Live Event Log (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Node Inspector Card */}
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-teal-400" />
                <h3 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wide">
                  Node Inspector: {selectedNode.name.split(' ')[0]} {selectedNode.name.split(' ')[1]}
                </h3>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                selectedNode.isDrifted 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
              }`}>
                {selectedNode.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-[#0a1220] p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Hospital Demographic</span>
                <span className="font-semibold text-slate-800 dark:text-white text-[11px] truncate block">
                  {selectedNode.icuType}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedNode.demographics.beds} Beds &bull; {selectedNode.demographics.sepsisPrevalence} Sepsis Rate
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-[#0a1220] p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Personalized AUROC</span>
                <span className="font-mono font-bold text-teal-400 text-sm">
                  {selectedNode.localAuroc}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Loss: {selectedNode.localLoss}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0a1220] p-2.5 rounded border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Backbone Status:</span>
                <span className={`font-mono font-semibold ${selectedNode.isDrifted ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedNode.backboneState}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Head Classification:</span>
                <span className="font-mono font-semibold text-teal-400">
                  {selectedNode.headState}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uplink Compression:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedNode.uplinkSize} ({selectedNode.bandwidthSaved})
                </span>
              </div>
            </div>
          </div>

          {/* Live Consensus Event Log Stream */}
          <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1a2942] rounded-xl p-4 flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                <h3 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wide">
                  Live Consensus Audit Log
                </h3>
              </div>

              {/* Log Filters */}
              <div className="flex gap-1 text-[10px]">
                {(['all', 'consensus', 'drift', 'privacy'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLogFilter(filter)}
                    className={`px-2 py-0.5 rounded capitalize font-medium transition-colors ${
                      logFilter === filter
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Log List */}
            <div className="space-y-2 overflow-y-auto max-h-52 pr-1 text-xs">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="bg-slate-50 dark:bg-[#0a1220] p-2 rounded border border-slate-200 dark:border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-400">{log.timestamp}</span>
                    {log.badge && (
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] border font-bold ${log.badgeColor || 'text-slate-400'}`}>
                        {log.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
