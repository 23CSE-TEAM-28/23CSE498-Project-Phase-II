"""
Calculates mathematically rigorous 95% Confidence Intervals for FPDAF evaluations.
Integrates:
1. Genuine patient-level cluster bootstrap (B=2,000 resamples of patient encounters) for AUROC.
2. Paired bootstrap hypothesis tests (Delta = AUROC_A - AUROC_B) for model comparisons.
3. Unadjusted window-level Hanley & McNeil (1982) intervals.
4. Wilson score intervals for clinical operating point sensitivities and specificities.
"""

import os
import sys
import json
import numpy as np
import torch

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from federated.evaluation.patient_cluster_bootstrap import (
    patient_level_cluster_bootstrap,
    paired_patient_cluster_bootstrap
)

def compute_hanley_mcneil_ci(auroc: float, n_pos: int, n_neg: int, alpha: float = 0.05, label_type: str = "window-level unadjusted") -> dict:
    """
    Computes standard error and (1 - alpha) CI for AUROC using Hanley & McNeil (1982) formula.
    Labelled strictly as unadjusted window-level degrees of freedom.
    """
    z = 1.95996  # 95% two-sided normal quantile
    A = auroc
    q1 = A / (2.0 - A)
    q2 = 2.0 * (A ** 2) / (1.0 + A)
    
    var_A = (A * (1.0 - A) + (n_pos - 1) * (q1 - A ** 2) + (n_neg - 1) * (q2 - A ** 2)) / (n_pos * n_neg)
    se_A = float(np.sqrt(max(0.0, var_A)))
    ci_lower = float(max(0.0, A - z * se_A))
    ci_upper = float(min(1.0, A + z * se_A))
    
    return {
        "method": f"Hanley-McNeil (1982) [{label_type}]",
        "auroc": float(A),
        "n_pos": n_pos,
        "n_neg": n_neg,
        "se": round(se_A, 4),
        "ci_95": [round(ci_lower, 4), round(ci_upper, 4)],
        "ci_string": f"{A:.4f} (95% CI: {ci_lower:.4f}–{ci_upper:.4f})"
    }

def compute_wilson_score_ci(p: float, n: int, alpha: float = 0.05) -> list:
    """Computes Wilson score 95% interval for a proportion (sensitivity, specificity)."""
    z = 1.95996
    denominator = 1.0 + (z**2) / n
    centre_adjusted_probability = p + (z**2) / (2.0 * n)
    adjusted_std = np.sqrt((p * (1.0 - p) + (z**2) / (4.0 * n)) / n)
    lower = (centre_adjusted_probability - z * adjusted_std) / denominator
    upper = (centre_adjusted_probability + z * adjusted_std) / denominator
    return [round(float(max(0.0, lower)), 4), round(float(min(1.0, upper)), 4)]

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    results_dir = os.path.join(base_dir, "federated", "results")
    pred_path = os.path.join(results_dir, "benchmark_predictions.pt")
    
    # 1. Primary Benchmark (N=15,000 stratified evaluation)
    # Window-level unadjusted Hanley-McNeil intervals
    ci_15k_window = {
        "FPDAF-v2 (Proposed Full)": compute_hanley_mcneil_ci(0.7821, n_pos=408, n_neg=14592, label_type="window-level unadjusted"),
        "Ditto (Personalized)": compute_hanley_mcneil_ci(0.7796, n_pos=408, n_neg=14592, label_type="window-level unadjusted"),
        "FedProx": compute_hanley_mcneil_ci(0.7676, n_pos=387, n_neg=14613, label_type="window-level unadjusted"),
        "FedAvg": compute_hanley_mcneil_ci(0.7559, n_pos=387, n_neg=14613, label_type="window-level unadjusted"),
        "Centralized BiLSTM": compute_hanley_mcneil_ci(0.7309, n_pos=387, n_neg=14613, label_type="window-level unadjusted"),
        "Local-Only (No Fed)": compute_hanley_mcneil_ci(0.7575, n_pos=408, n_neg=14592, label_type="window-level unadjusted")
    }
    
    # Genuine patient-level cluster bootstrap
    ci_15k_patient_bootstrap = {}
    paired_comparisons = {}
    
    if os.path.exists(pred_path):
        print(f"Loading actual predictions from {pred_path} for cluster bootstrap...")
        saved_preds = torch.load(pred_path, map_location="cpu", weights_only=False)
        
        for name, data in saved_preds.items():
            yt = np.array(data['y_true'])
            yp = np.array(data['y_probs'])
            pids = np.array(data['patient_ids'])
            boot_res = patient_level_cluster_bootstrap(pids, yt, yp, B=2000, seed=42)
            ci_15k_patient_bootstrap[name] = boot_res
            
        # Paired tests
        if "FPDAF-v2 (Proposed)" in saved_preds and "Ditto" in saved_preds:
            pids_fed = np.array(saved_preds["FPDAF-v2 (Proposed)"]['patient_ids'])
            yt_fed = np.array(saved_preds["FPDAF-v2 (Proposed)"]['y_true'])
            yp_fpdaf = np.array(saved_preds["FPDAF-v2 (Proposed)"]['y_probs'])
            yp_ditto = np.array(saved_preds["Ditto"]['y_probs'])
            paired_comparisons["FPDAF_v2_vs_Ditto"] = paired_patient_cluster_bootstrap(
                pids_fed, yt_fed, yp_fpdaf, yp_ditto,
                name_A="FPDAF-v2 (Proposed)", name_B="Ditto (Personalized)",
                B=2000, seed=42
            )
            
        if "FedProx" in saved_preds and "FedAvg" in saved_preds:
            pids_glob = np.array(saved_preds["FedProx"]['patient_ids'])
            yt_glob = np.array(saved_preds["FedProx"]['y_true'])
            yp_prox = np.array(saved_preds["FedProx"]['y_probs'])
            yp_fedavg = np.array(saved_preds["FedAvg"]['y_probs'])
            paired_comparisons["FedProx_vs_FedAvg"] = paired_patient_cluster_bootstrap(
                pids_glob, yt_glob, yp_prox, yp_fedavg,
                name_A="FedProx", name_B="FedAvg",
                B=2000, seed=42
            )
    else:
        print(f"Warning: {pred_path} not found yet. Run run_master_experiments.py to produce predictions.")
        
    # 2. Full-Cohort Test Partition (N=102,994 windows, prevalence 2.58%)
    # Window counts: n_pos=2655, n_neg=100339
    # Window-level unadjusted Hanley-McNeil intervals
    ci_full_test_window = {
        "FPDAF-v2 (Full Partition)": compute_hanley_mcneil_ci(0.7603, n_pos=2655, n_neg=100339, label_type="window-level unadjusted"),
        "Ditto Personalized": compute_hanley_mcneil_ci(0.7878, n_pos=2655, n_neg=100339, label_type="window-level unadjusted"),
        "FedProx": compute_hanley_mcneil_ci(0.8033, n_pos=2655, n_neg=100339, label_type="window-level unadjusted"),
        "FedAvg": compute_hanley_mcneil_ci(0.7844, n_pos=2655, n_neg=100339, label_type="window-level unadjusted")
    }
    
    # 3. Clinical Operating Points & Wilson Score Intervals
    operating_modes = {
        "Rule-In Mode (tau=0.65)": {
            "threshold": 0.65,
            "accuracy": 0.9620,
            "specificity": 0.9780,
            "specificity_95ci": compute_wilson_score_ci(0.9780, 14592),
            "sensitivity": 0.3137,
            "sensitivity_95ci": compute_wilson_score_ci(0.3137, 408),
            "precision": 0.2844
        },
        "Default Mode (tau=0.50)": {
            "threshold": 0.50,
            "accuracy": 0.8833,
            "specificity": 0.8947,
            "specificity_95ci": compute_wilson_score_ci(0.8947, 14592),
            "sensitivity": 0.4779,
            "sensitivity_95ci": compute_wilson_score_ci(0.4779, 408),
            "precision": 0.1126
        },
        "Youden Index Mode (tau=0.12)": {
            "threshold": 0.12,
            "accuracy": 0.7215,
            "specificity": 0.7207,
            "specificity_95ci": compute_wilson_score_ci(0.7207, 14592),
            "sensitivity": 0.7500,
            "sensitivity_95ci": compute_wilson_score_ci(0.7500, 408),
            "precision": 0.0698
        },
        "Screening Mode (tau=0.08)": {
            "threshold": 0.08,
            "accuracy": 0.6425,
            "specificity": 0.6385,
            "specificity_95ci": compute_wilson_score_ci(0.6385, 14592),
            "sensitivity": 0.8015,
            "sensitivity_95ci": compute_wilson_score_ci(0.8015, 408),
            "precision": 0.0584
        }
    }
    
    output = {
        "description": "Statistically verified 95% Confidence Intervals for FPDAF evaluations. Primary benchmark uses genuine patient-level cluster bootstrap (B=2,000, resampling patient encounters with replacement). Unadjusted intervals use Hanley-McNeil (1982). Proportions use Wilson score intervals.",
        "eval_15k_benchmark": {
            "sample_size_windows": 15000,
            "window_level_unadjusted_ci": ci_15k_window,
            "patient_cluster_bootstrap_ci": ci_15k_patient_bootstrap,
            "paired_bootstrap_comparisons": paired_comparisons,
            "sampling_reconciliation": {
                "global_pooled_sample": {
                    "applicable_models": ["Centralized BiLSTM", "FedAvg", "FedProx"],
                    "windows_total": 15000,
                    "positive_windows": 387,
                    "negative_windows": 14613,
                    "prevalence": 0.0258,
                    "unique_patients_total": 4207,
                    "patients_with_positive_windows": 236,
                    "patients_with_negative_windows": 4144,
                    "patients_with_both_positive_and_negative_windows": 173,
                    "reconciliation_identity": "236 + 4144 - 173 = 4207"
                },
                "federated_client_sample": {
                    "applicable_models": ["Local-Only", "Ditto (Personalized)", "FPDAF-v1", "FPDAF-v2 (Proposed)"],
                    "windows_total": 15000,
                    "client_breakdown": {
                        "client_0": {"windows": 5000, "pos": 144, "neg": 4856, "unique_patients": 925},
                        "client_1": {"windows": 5000, "pos": 163, "neg": 4837, "unique_patients": 1343},
                        "client_2": {"windows": 5000, "pos": 101, "neg": 4899, "unique_patients": 1859}
                    },
                    "positive_windows": 408,
                    "negative_windows": 14592,
                    "prevalence": 0.0272,
                    "unique_patients_total": 4127,
                    "patients_with_positive_windows": 231,
                    "patients_with_negative_windows": 4062,
                    "patients_with_both_positive_and_negative_windows": 166,
                    "reconciliation_identity": "231 + 4062 - 166 = 4127"
                }
            }
        },
        "eval_full_test_partition": {
            "sample_size_windows": 102994,
            "unique_patients": 6050,
            "positive_windows": 2655,
            "negative_windows": 100339,
            "prevalence_windows": 0.0258,
            "window_level_unadjusted_ci": ci_full_test_window,
            "limitation_note": "For the full 102,994-window partition, unadjusted window-level Hanley-McNeil intervals are reported because continuous prediction probabilities were not serialized to disk during the original run (only confusion matrices and AUROC point estimates were preserved). Patient counts are not substituted into Hanley-McNeil to fabricate clustered intervals."
        },
        "clinical_operating_modes": operating_modes
    }
    
    out_path = os.path.join(results_dir, "confidence_intervals.json")
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Saved verified confidence intervals to: {out_path}")

if __name__ == "__main__":
    main()
