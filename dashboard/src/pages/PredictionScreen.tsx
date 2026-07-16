import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Activity, Heart, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Patient } from '../services/mockDataService';

interface PredictionScreenProps {
  patient: Patient;
  setActiveTab: (tab: string) => void;
}

export const PredictionScreen: React.FC<PredictionScreenProps> = ({ patient, setActiveTab }) => {
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionRun, setPredictionRun] = useState(false);

  const triggerPredict = () => {
    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
      setPredictionRun(true);
    }, 1500);
  };

  const riskScore = patient.scores.fpdaf;
  const isHighRisk = patient.riskLevel === 'High';

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white leading-tight">Bedside Diagnostic Predictor</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Execute proposed FPDAF Sepsis prediction pipeline for Active Bed: {patient.id}</p>
      </div>

      {/* Patient Identification Card */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-4 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Currently Diagnosing</span>
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white leading-tight">{patient.id}</h3>
          <span className="text-xs text-slate-450 block">{patient.age}y / {patient.gender} — {patient.hospital}</span>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => setActiveTab('patients')}
            className="px-3 py-1.5 border border-slate-200 dark:border-[#1a2744] bg-white dark:bg-[#0d1829] hover:bg-slate-50 dark:hover:bg-[#152238] text-xs font-semibold rounded text-slate-655 dark:text-slate-300 transition-colors"
          >
            Change Patient
          </button>
          <button 
            onClick={triggerPredict}
            disabled={isPredicting}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium px-3.5 py-1.5 rounded transition-colors text-xs disabled:opacity-50"
          >
            <Activity className="h-4 w-4" /> Run Prediction
          </button>
        </div>
      </div>

      {/* Animation Area */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-6 rounded-md min-h-[350px] flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {/* 1. Initial State */}
          {!isPredicting && !predictionRun && (
            <motion.div 
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-3 max-w-xs"
            >
              <div className="h-12 w-12 bg-teal-50 dark:bg-teal-900/15 rounded-full flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400">
                <Activity className="h-6 w-6 text-teal-500" />
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Proposed FPDAF Prediction Engine</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Click "Run Prediction" above to analyze the 24-hour multivariate vital signs log using local personalized weights.
              </p>
            </motion.div>
          )}

          {/* 2. Loading State */}
          {isPredicting && (
            <motion.div 
              key="predicting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <div className="relative h-16 w-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800/40"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 border-r-teal-500 animate-spin"></div>
                <Heart className="absolute left-5 top-5 h-6 w-6 text-red-500" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-800 dark:text-white text-xs">Evaluating Local Weights...</h4>
                <p className="text-[11px] text-slate-400 max-w-[250px] leading-normal mx-auto">
                  Calculating temporal self-attentions and local prediction logits.
                </p>
              </div>
            </motion.div>
          )}

          {/* 3. Result State */}
          {!isPredicting && predictionRun && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm mx-auto space-y-5"
            >
              {/* Dial Score Header */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800 dark:text-white text-xs">Diagnostic Alert Forecast</h4>
                <span className="text-[10px] text-slate-400 font-medium">FPDAF Model Local node</span>
              </div>

              {/* Central Risk Indicator */}
              <div className={`p-4 rounded border flex items-center gap-4 ${
                isHighRisk 
                  ? 'bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/60' 
                  : 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-[#1a2744]'
              }`}>
                <div className={`p-3 rounded shrink-0 ${isHighRisk ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'}`}>
                  {isHighRisk ? <ShieldAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className={`font-bold text-sm leading-tight ${isHighRisk ? 'text-red-750 dark:text-red-400' : 'text-emerald-705 dark:text-emerald-400'}`}>
                    {isHighRisk ? 'High Sepsis Risk Alert' : 'Low Sepsis Risk Detected'}
                  </h3>
                  <span className="text-[10px] text-slate-450 font-medium block mt-0.5">Confidence Score: {patient.confidence}%</span>
                </div>
              </div>

              {/* Metrics cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] p-3 rounded space-y-0.5">
                  <span className="text-[10px] text-slate-450 block font-medium">Probability Score</span>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">{(riskScore * 100).toFixed(0)}%</h3>
                </div>
                <div className="bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] p-3 rounded space-y-0.5">
                  <span className="text-[10px] text-slate-450 block font-medium">Classification</span>
                  <h3 className={`font-bold text-sm ${isHighRisk ? 'text-red-500' : 'text-emerald-500'}`}>
                    {isHighRisk ? 'Positive' : 'Negative'}
                  </h3>
                </div>
              </div>

              {/* Action recommendations */}
              <div className="bg-slate-50 dark:bg-[#0a1323] p-4 rounded border border-slate-200 dark:border-[#1a2744] space-y-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clinician Directives</h5>
                <ul className="text-xs text-slate-600 dark:text-slate-350 font-medium space-y-1.5 list-disc pl-4">
                  {isHighRisk ? (
                    <>
                      <li>Initiate fluid resuscitation protocol (30 mL/kg crystalloid).</li>
                      <li>Draw blood cultures and administer IV antibiotics within 1 hour.</li>
                      <li>Update ICU Bedside monitor thresholds.</li>
                    </>
                  ) : (
                    <>
                      <li>Maintain routine ICU hourly vitals telemetry checking.</li>
                      <li>No sepsis interventions indicated.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Explain button */}
              <button
                onClick={() => setActiveTab('xai')}
                className="w-full flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded transition-colors text-xs"
              >
                Inspect Clinical Explainability (XAI) <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
