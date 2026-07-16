import { useState, useEffect } from 'react';
import { 
  FileDown, 
  BookOpen, 
  Brain, 
  HelpCircle,
  Award
} from 'lucide-react';
import { fetchAblationData } from '../services/mockDataService';

export const ResearchInsights: React.FC = () => {
  const [ablationData, setAblationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchAblationData().then((data) => {
      setAblationData(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !ablationData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white leading-tight">Research & Methodology</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Proposed FPDAF framework architecture, bi-level Ditto optimizations, and validation reviews</p>
        </div>
        <a 
          href="/FPDAF_Research_Paper.pdf" 
          download="FPDAF_Research_Paper.pdf"
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium px-3.5 py-1.5 rounded transition-colors text-xs"
        >
          <FileDown className="h-4 w-4" /> Download Manuscript PDF
        </a>
      </div>

      {/* Grid: Abstract & Problem Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-3">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-teal-500" /> Executive Research Summary
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
            Early detection of sepsis in intensive care units (ICUs) is critical to reducing inpatient mortality. 
            However, clinical machine learning models encounter severe performance degradation when deployed across 
            diverse hospital systems due to local demographic splits (e.g., age distributions) and clinical protocol 
            variations—a phenomenon known as data heterogeneity (Non-IID). Sharing raw patient histories directly 
            violates privacy rules (HIPAA).
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
            To address these issues, we present the <strong>Federated Personalized Drift-Aware Attention Framework (FPDAF)</strong>. 
            FPDAF leverages Ditto personalization to fit local classifiers while safeguarding central consensus. 
            It integrates online Cumulative Sum (CUSUM) residual monitors to detect institutional demographic drifts in 
            real-time and trigger selective client-side adaptations (CSSP), lowering communication cost by 38%.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-3">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
            <Brain className="h-4 w-4 text-teal-500" /> Technical Novelty Pillars
          </h3>
          <div className="space-y-3.5">
            <div className="flex gap-2.5">
              <div className="h-6 w-6 rounded bg-teal-50 dark:bg-teal-900/15 text-teal-600 dark:text-teal-450 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
              <div>
                <h5 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">Temporal Self-Attention Heads</h5>
                <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                  Aggregates hourly ICU sequence features into context representations, explaining warnings (e.g., hr 17-22 peak weights).
                </p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="h-6 w-6 rounded bg-orange-50 dark:bg-orange-900/15 text-orange-655 dark:text-orange-400 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
              <div>
                <h5 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">CUSUM Residual Monitor</h5>
                <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                  Calculates validation loss offsets over communication rounds to detect institutional concept drifts ($S_r &gt; 3.0$).
                </p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="h-6 w-6 rounded bg-red-50 dark:bg-red-900/15 text-red-655 dark:text-red-400 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
              <div>
                <h5 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">Client-Side Selective Personalization (CSSP)</h5>
                <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                  Freezes the shared feature extractor to adapt classifier heads locally, lowering client communication costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mathematical Formulations */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-md space-y-4">
        <h3 className="font-semibold text-slate-855 dark:text-slate-200 text-sm flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-teal-500" /> Core Framework Formulations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed font-semibold text-slate-500 dark:text-slate-400">
          <div className="bg-slate-50 dark:bg-[#0a1323] p-4 rounded border border-slate-200 dark:border-[#1a2744] space-y-2">
            <h5 className="font-bold text-slate-850 dark:text-slate-250 text-xs">Bi-Level Optimization (Ditto)</h5>
            <div className="bg-white dark:bg-[#0d1829] p-2.5 rounded border dark:border-[#1a2744] font-mono text-center text-slate-800 dark:text-white my-1 text-xs">
              min h_k(v_k; w*) = L_local(v_k) + (λ/2) ||v_k - w*||^2
            </div>
            <p className="text-[10px] text-slate-450 leading-normal">
              Allows each client node $k$ to minimize private loss on local personalized weights $v_k$, regularized against central consensus $w^*$ to maintain global knowledge.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#0a1323] p-4 rounded border border-slate-200 dark:border-[#1a2744] space-y-2">
            <h5 className="font-bold text-slate-850 dark:text-slate-250 text-xs">CUSUM Residual Drift Scoring</h5>
            <div className="bg-white dark:bg-[#0d1829] p-2.5 rounded border dark:border-[#1a2744] font-mono text-center text-slate-800 dark:text-white my-1 text-xs">
              S_r = max(0, S_(r-1) + e_r - κ)
            </div>
            <p className="text-[10px] text-slate-450 leading-normal">
              Accumulates validation error residuals e_r = L_val,r - μ_0 (slack κ = 0.02). If S_r &gt; 3.0, a local drift trigger freezes the feature backbone and updates classifier parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Ablation Table */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] rounded-md overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#1a2744] flex items-center gap-1.5">
          <Award className="h-4.5 w-4.5 text-teal-500" />
          <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Ablation Study Metrics Table</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0a1323] border-b border-slate-200 dark:border-[#1a2744]">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ablation Configuration</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Accuracy</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Precision</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recall</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">F1 Score</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">AUROC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
              <tr>
                <td className="px-5 py-3 text-slate-800 dark:text-slate-200 font-semibold">FPDAF w/o CUSUM</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_cusum.accuracy.toFixed(2)}%</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_cusum.precision.toFixed(2)}%</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_cusum.recall.toFixed(2)}%</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_cusum.f1_score.toFixed(4)}</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_cusum.auroc.toFixed(4)}</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-slate-800 dark:text-slate-200 font-semibold">FPDAF w/o Attention</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_attention.accuracy.toFixed(2)}%</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_attention.precision.toFixed(2)}%</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_attention.recall.toFixed(2)}%</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_attention.f1_score.toFixed(4)}</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_attention.auroc.toFixed(4)}</td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-slate-800 dark:text-slate-200 font-semibold">FPDAF w/o Personalization</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_personalization.accuracy.toFixed(2)}%</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_personalization.precision.toFixed(2)}%</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_personalization.recall.toFixed(2)}%</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_personalization.f1_score.toFixed(4)}</td>
                <td className="px-5 py-3">{ablationData.fpdaf_no_personalization.auroc.toFixed(4)}</td>
              </tr>
              <tr className="bg-teal-500/5 dark:bg-teal-950/10">
                <td className="px-5 py-3 text-slate-850 dark:text-slate-200 font-bold">Full FPDAF (Proposed)</td>
                <td className="px-5 py-3 font-bold text-slate-850 dark:text-slate-200">{ablationData.full_fpdaf.accuracy.toFixed(2)}%</td>
                <td className="px-5 py-3 font-bold text-slate-850 dark:text-slate-200">{ablationData.full_fpdaf.precision.toFixed(2)}%</td>
                <td className="px-5 py-3 font-bold text-slate-850 dark:text-slate-200">{ablationData.full_fpdaf.recall.toFixed(2)}%</td>
                <td className="px-5 py-3 font-bold text-slate-850 dark:text-slate-200">{ablationData.full_fpdaf.f1_score.toFixed(4)}</td>
                <td className="px-5 py-3 font-bold text-slate-850 dark:text-slate-200">{ablationData.full_fpdaf.auroc.toFixed(4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
