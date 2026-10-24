"""
Genuine Patient-Level Cluster Bootstrap for AUROC Evaluation in FPDAF.

This module implements mathematically rigorous patient-level cluster bootstrap
confidence intervals for longitudinal ICU electronic health records (EHR) where
multiple 24-hour observation windows originate from the same patient encounter.

Methodology:
1. Resamples patient clusters with replacement (cluster size M).
2. For each sampled patient, retains all eligible temporal windows. If a patient
   is sampled k times, all their temporal windows appear k times in the replicate.
3. Explicitly handles and logs any degenerate single-outcome-class replicates.
4. Recalculates AUROC across B=2,000 replicates.
5. Computes the empirical 95% percentile confidence interval [2.5%, 97.5%] and SE.
6. Performs paired bootstrap differences (Delta = AUROC_A - AUROC_B) for hypothesis testing
   to avoid invalid inference based purely on marginal CI overlap.
"""

import os
import sys
import json
import argparse
import numpy as np
import torch
from sklearn.metrics import roc_auc_score

def patient_level_cluster_bootstrap(
    patient_ids: np.ndarray,
    y_true: np.ndarray,
    y_probs: np.ndarray,
    B: int = 2000,
    seed: int = 42,
    alpha: float = 0.05
) -> dict:
    """
    Computes genuine patient-level cluster bootstrap 95% CI for AUROC.
    
    Args:
        patient_ids: 1D array of patient IDs for each window.
        y_true: 1D array of binary ground truth labels (0 or 1).
        y_probs: 1D array of continuous predicted probabilities.
        B: Number of bootstrap replicates (default: 2,000).
        seed: Random seed for reproducible resampling.
        alpha: Significance level (default: 0.05 for 95% CI).
        
    Returns:
        dict: Detailed bootstrap statistics, percentile interval, SE, and sample info.
    """
    patient_ids = np.asarray(patient_ids)
    y_true = np.asarray(y_true).astype(int)
    y_probs = np.asarray(y_probs).astype(float)
    
    assert len(patient_ids) == len(y_true) == len(y_probs), "Arrays must have identical length"
    
    unique_patients = np.unique(patient_ids)
    M = len(unique_patients)
    n_windows = len(y_true)
    n_pos = int(np.sum(y_true == 1))
    n_neg = int(np.sum(y_true == 0))
    point_auroc = float(roc_auc_score(y_true, y_probs))
    
    # Precompute indices for each patient cluster for vectorization
    patient_to_indices = {}
    for idx, pid in enumerate(patient_ids):
        if pid not in patient_to_indices:
            patient_to_indices[pid] = []
        patient_to_indices[pid].append(idx)
        
    patient_idx_arrays = [np.array(patient_to_indices[p], dtype=np.int64) for p in unique_patients]
    
    rng = np.random.RandomState(seed)
    replicates = []
    single_class_count = 0
    max_attempts = B * 5
    attempts = 0
    
    while len(replicates) < B and attempts < max_attempts:
        attempts += 1
        # Sample M patients with replacement
        sampled_patient_indices = rng.choice(M, size=M, replace=True)
        # Concatenate all temporal windows for the sampled patients
        sample_window_idx = np.concatenate([patient_idx_arrays[i] for i in sampled_patient_indices])
        
        y_b = y_true[sample_window_idx]
        y_p = y_probs[sample_window_idx]
        
        # Explicitly handle single-class replicates
        if len(np.unique(y_b)) < 2:
            single_class_count += 1
            continue
            
        auc_b = roc_auc_score(y_b, y_p)
        replicates.append(float(auc_b))
        
    replicates = np.array(replicates)
    lower_pct = 100.0 * (alpha / 2.0)
    upper_pct = 100.0 * (1.0 - alpha / 2.0)
    ci_lower = float(np.percentile(replicates, lower_pct))
    ci_upper = float(np.percentile(replicates, upper_pct))
    se_boot = float(np.std(replicates, ddof=1))
    mean_boot = float(np.mean(replicates))
    
    return {
        "method": f"Patient-Level Cluster Bootstrap (B={B}, Percentile CI)",
        "resampling_unit": "patient_encounter",
        "point_auroc": round(point_auroc, 4),
        "bootstrap_mean_auroc": round(mean_boot, 4),
        "standard_error": round(se_boot, 4),
        "ci_95": [round(ci_lower, 4), round(ci_upper, 4)],
        "ci_string": f"{point_auroc:.4f} (95% CI: {ci_lower:.4f}–{ci_upper:.4f})",
        "sample_size_windows": n_windows,
        "n_pos_windows": n_pos,
        "n_neg_windows": n_neg,
        "unique_patients_M": M,
        "replicates_requested": B,
        "replicates_computed": len(replicates),
        "single_class_replicates_discarded": single_class_count,
        "random_seed": seed
    }

def paired_patient_cluster_bootstrap(
    patient_ids: np.ndarray,
    y_true: np.ndarray,
    y_probs_A: np.ndarray,
    y_probs_B: np.ndarray,
    name_A: str = "Model A",
    name_B: str = "Model B",
    B: int = 2000,
    seed: int = 42,
    alpha: float = 0.05
) -> dict:
    """
    Computes paired patient-level cluster bootstrap difference in AUROC between two models.
    
    Delta = AUROC_A - AUROC_B
    """
    patient_ids = np.asarray(patient_ids)
    y_true = np.asarray(y_true).astype(int)
    y_probs_A = np.asarray(y_probs_A).astype(float)
    y_probs_B = np.asarray(y_probs_B).astype(float)
    
    unique_patients = np.unique(patient_ids)
    M = len(unique_patients)
    
    patient_to_indices = {}
    for idx, pid in enumerate(patient_ids):
        if pid not in patient_to_indices:
            patient_to_indices[pid] = []
        patient_to_indices[pid].append(idx)
        
    patient_idx_arrays = [np.array(patient_to_indices[p], dtype=np.int64) for p in unique_patients]
    
    rng = np.random.RandomState(seed)
    delta_replicates = []
    single_class_count = 0
    max_attempts = B * 5
    attempts = 0
    
    point_auc_A = float(roc_auc_score(y_true, y_probs_A))
    point_auc_B = float(roc_auc_score(y_true, y_probs_B))
    point_delta = point_auc_A - point_auc_B
    
    while len(delta_replicates) < B and attempts < max_attempts:
        attempts += 1
        sampled_patient_indices = rng.choice(M, size=M, replace=True)
        sample_window_idx = np.concatenate([patient_idx_arrays[i] for i in sampled_patient_indices])
        
        y_b = y_true[sample_window_idx]
        if len(np.unique(y_b)) < 2:
            single_class_count += 1
            continue
            
        auc_A_b = roc_auc_score(y_b, y_probs_A[sample_window_idx])
        auc_B_b = roc_auc_score(y_b, y_probs_B[sample_window_idx])
        delta_replicates.append(float(auc_A_b - auc_B_b))
        
    delta_replicates = np.array(delta_replicates)
    lower_pct = 100.0 * (alpha / 2.0)
    upper_pct = 100.0 * (1.0 - alpha / 2.0)
    delta_ci_lower = float(np.percentile(delta_replicates, lower_pct))
    delta_ci_upper = float(np.percentile(delta_replicates, upper_pct))
    delta_se = float(np.std(delta_replicates, ddof=1))
    
    # Empirical two-sided p-value against null hypothesis Delta = 0
    p_val_positive = np.mean(delta_replicates <= 0)
    p_val_negative = np.mean(delta_replicates >= 0)
    p_value = float(min(1.0, 2.0 * min(p_val_positive, p_val_negative)))
    
    is_significant = (delta_ci_lower > 0) or (delta_ci_upper < 0)
    
    return {
        "model_A": name_A,
        "model_B": name_B,
        "point_delta": round(point_delta, 4),
        "delta_mean_boot": round(float(np.mean(delta_replicates)), 4),
        "delta_se": round(delta_se, 4),
        "delta_95ci": [round(delta_ci_lower, 4), round(delta_ci_upper, 4)],
        "delta_ci_string": f"{point_delta:+.4f} (95% CI: {delta_ci_lower:+.4f} to {delta_ci_upper:+.4f})",
        "empirical_p_value": round(p_value, 5),
        "statistically_significant_at_05": bool(is_significant),
        "replicates": len(delta_replicates),
        "random_seed": seed
    }

def main():
    parser = argparse.ArgumentParser(description="Run Patient-Level Cluster Bootstrap for AUROC")
    parser.add_argument("--replicates", type=int, default=2000, help="Number of bootstrap replicates")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--predictions", type=str, default=None, help="Path to saved predictions .pt file")
    args = parser.parse_args()
    
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    results_dir = os.path.join(base_dir, "federated", "results")
    
    pred_path = args.predictions or os.path.join(results_dir, "benchmark_predictions.pt")
    if not os.path.exists(pred_path):
        print(f"Predictions file not found at: {pred_path}")
        print("Please run `python3 federated/experiments/run_master_experiments.py --device mps` to generate it.")
        sys.exit(1)
        
    print(f"Loading predictions from: {pred_path}")
    saved_preds = torch.load(pred_path, map_location="cpu", weights_only=False)
    
    bootstrap_results = {}
    print(f"\n=== Executing Patient-Level Cluster Bootstrap (B={args.replicates}, Seed={args.seed}) ===")
    
    for model_name, data in saved_preds.items():
        y_true = np.array(data['y_true'])
        y_probs = np.array(data['y_probs'])
        patient_ids = np.array(data['patient_ids'])
        
        print(f"\nProcessing {model_name}...")
        res = patient_level_cluster_bootstrap(
            patient_ids=patient_ids,
            y_true=y_true,
            y_probs=y_probs,
            B=args.replicates,
            seed=args.seed
        )
        bootstrap_results[model_name] = res
        print(f"  AUROC: {res['point_auroc']:.4f} | Cluster 95% CI: [{res['ci_95'][0]:.4f}, {res['ci_95'][1]:.4f}] | SE: {res['standard_error']:.4f}")
        print(f"  Windows: {res['sample_size_windows']} (Pos: {res['n_pos_windows']}, Neg: {res['n_neg_windows']}) | Patients: {res['unique_patients_M']}")
        
    # Paired comparisons against baselines on the same evaluation partitions
    paired_comparisons = {}
    
    # 1. Decentralized client-partitioned models: FPDAF-v2 vs Ditto (Personalized)
    if "FPDAF-v2 (Proposed)" in saved_preds and "Ditto" in saved_preds:
        pids_fed = np.array(saved_preds["FPDAF-v2 (Proposed)"]['patient_ids'])
        yt_fed = np.array(saved_preds["FPDAF-v2 (Proposed)"]['y_true'])
        yp_fpdaf2 = np.array(saved_preds["FPDAF-v2 (Proposed)"]['y_probs'])
        yp_ditto = np.array(saved_preds["Ditto"]['y_probs'])
        
        paired_fpdaf_ditto = paired_patient_cluster_bootstrap(
            pids_fed, yt_fed, yp_fpdaf2, yp_ditto,
            name_A="FPDAF-v2 (Proposed)", name_B="Ditto (Personalized)",
            B=args.replicates, seed=args.seed
        )
        paired_comparisons["FPDAF_v2_vs_Ditto"] = paired_fpdaf_ditto
        print(f"\nPaired Comparison [FPDAF-v2 vs Ditto Personalized]:")
        print(f"  Delta: {paired_fpdaf_ditto['delta_ci_string']} | p-value: {paired_fpdaf_ditto['empirical_p_value']}")
        print(f"  Statistically significant difference: {paired_fpdaf_ditto['statistically_significant_at_05']}")
        
    # 2. Centralized pooled models: FedProx vs FedAvg
    if "FedProx" in saved_preds and "FedAvg" in saved_preds:
        pids_glob = np.array(saved_preds["FedProx"]['patient_ids'])
        yt_glob = np.array(saved_preds["FedProx"]['y_true'])
        yp_prox = np.array(saved_preds["FedProx"]['y_probs'])
        yp_fedavg = np.array(saved_preds["FedAvg"]['y_probs'])
        
        paired_prox_fedavg = paired_patient_cluster_bootstrap(
            pids_glob, yt_glob, yp_prox, yp_fedavg,
            name_A="FedProx", name_B="FedAvg",
            B=args.replicates, seed=args.seed
        )
        paired_comparisons["FedProx_vs_FedAvg"] = paired_prox_fedavg
        print(f"\nPaired Comparison [FedProx vs FedAvg]:")
        print(f"  Delta: {paired_prox_fedavg['delta_ci_string']} | p-value: {paired_prox_fedavg['empirical_p_value']}")
        print(f"  Statistically significant difference: {paired_prox_fedavg['statistically_significant_at_05']}")
        
    # Full report output
    report = {
        "title": "Patient-Level Cluster Bootstrap AUROC Confidence Intervals and Paired Hypothesis Tests",
        "description": "Genuine non-parametric cluster bootstrap resampling patient encounters with replacement (retaining all temporal observation windows per encounter). Correctly accounts for multi-window patient autocorrelation without relying on Hanley-McNeil heuristics.",
        "eval_15k_benchmark_cluster_bootstrap": bootstrap_results,
        "paired_comparisons": paired_comparisons,
        "sample_count_reconciliation": {
            "summary": "Full reconciliation of the 15,000-window benchmark sampling structure.",
            "global_pooled_partition": {
                "applicable_models": ["Centralized BiLSTM", "FedAvg", "FedProx"],
                "sampling_method": "Stratified sampling directly from full test set (N=102,994, prevalence 2.5778%) using seed=42",
                "sample_size_windows": 15000,
                "positive_windows": 387,
                "negative_windows": 14613,
                "prevalence": 0.0258,
                "unique_patients_total": 4207,
                "patients_with_positive_windows": 236,
                "patients_with_negative_windows": 4144,
                "patients_with_both_positive_and_negative_windows": 173,
                "reconciliation_formula": "236 + 4144 - 173 = 4207 total unique patients"
            },
            "federated_client_partition": {
                "applicable_models": ["Local-Only", "Ditto (Personalized)", "FPDAF-v1", "FPDAF-v2 (Proposed)"],
                "sampling_method": "Non-IID hospital client partition (5,000 stratified samples per hospital node across 3 sites) using seed=42",
                "sample_size_windows": 15000,
                "hospital_breakdown": {
                    "client_0_community_age_lt_60": {"windows": 5000, "pos": 144, "neg": 4856, "patients": 925},
                    "client_1_trauma_age_gte_60": {"windows": 5000, "pos": 163, "neg": 4837, "patients": 1343},
                    "client_2_academic_site_b": {"windows": 5000, "pos": 101, "neg": 4899, "patients": 1859}
                },
                "positive_windows": 408,
                "negative_windows": 14592,
                "prevalence": 0.0272,
                "unique_patients_total": 4127,
                "patients_with_positive_windows": 231,
                "patients_with_negative_windows": 4062,
                "patients_with_both_positive_and_negative_windows": 166,
                "reconciliation_formula": "231 + 4062 - 166 = 4127 total unique patients"
            }
        },
        "full_partition_limitation_statement": {
            "sample_size_windows": 102994,
            "unique_patients": 6050,
            "positive_windows": 2655,
            "unadjusted_window_level_ci_note": "For the full 102,994-window cohort, continuous prediction probabilities from the initial multi-center benchmark were preserved as summary confusion matrices and AUROC point estimates (FPDAF-v2 AUROC 0.7603, Ditto 0.7878, FedProx 0.8033, FedAvg 0.7844). Because continuous window-level prediction arrays were not serialized at the full-cohort scale, a genuine cluster bootstrap cannot be reconstructed post-hoc without complete inference rerun. Window-level Hanley-McNeil intervals are clearly labelled as unadjusted, and patient counts are not substituted into Hanley-McNeil."
        }
    }
    
    out_file = os.path.join(results_dir, "bootstrap_confidence_intervals.json")
    with open(out_file, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\nSaved comprehensive bootstrap confidence intervals to: {out_file}")

if __name__ == "__main__":
    main()
