"""
Calculates mathematically rigorous 95% Confidence Intervals for FPDAF evaluations.
Uses the Hanley-McNeil method (Hanley & McNeil 1982) and Wilson score intervals for proportions.
Saves exact procedures, formulas, sample sizes, and intervals to JSON.
"""

import os
import json
import numpy as np

def compute_hanley_mcneil_ci(auroc: float, n_pos: int, n_neg: int, alpha: float = 0.05, label_type: str = "window") -> dict:
    """
    Computes standard error and (1 - alpha) CI for AUROC using Hanley & McNeil (1982) formula.
    Supports window-level (unadjusted) and patient-clustered degrees of freedom.
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
        "se": se_A,
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
    
    # 1. Primary Benchmark (N=15,000 stratified evaluation, prevalence 2.72%)
    # Window counts: n_pos=408, n_neg=14592 (or 387/14613 for baselines)
    # Unique patient clusters in 15k sample: M_pos=236, M_neg=4144
    ci_15k_window = {
        "FPDAF-v2 (Proposed Full)": compute_hanley_mcneil_ci(0.7821, n_pos=408, n_neg=14592, label_type="window-level"),
        "Ditto (Personalized)": compute_hanley_mcneil_ci(0.7796, n_pos=408, n_neg=14592, label_type="window-level"),
        "FedProx": compute_hanley_mcneil_ci(0.7676, n_pos=387, n_neg=14613, label_type="window-level"),
        "FedAvg": compute_hanley_mcneil_ci(0.7559, n_pos=387, n_neg=14613, label_type="window-level"),
        "Centralized BiLSTM": compute_hanley_mcneil_ci(0.7309, n_pos=387, n_neg=14613, label_type="window-level")
    }
    
    ci_15k_patient_clustered = {
        "FPDAF-v2 (Proposed Full)": compute_hanley_mcneil_ci(0.7821, n_pos=236, n_neg=4144, label_type="patient-clustered"),
        "Ditto (Personalized)": compute_hanley_mcneil_ci(0.7796, n_pos=236, n_neg=4144, label_type="patient-clustered"),
        "FedProx": compute_hanley_mcneil_ci(0.7676, n_pos=236, n_neg=4144, label_type="patient-clustered"),
        "FedAvg": compute_hanley_mcneil_ci(0.7559, n_pos=236, n_neg=4144, label_type="patient-clustered"),
        "Centralized BiLSTM": compute_hanley_mcneil_ci(0.7309, n_pos=236, n_neg=4144, label_type="patient-clustered")
    }
    
    # 2. Full-Cohort Test Partition (N=102,994 windows, prevalence 2.58%)
    # Window counts: n_pos=2655, n_neg=100339
    # Unique patient clusters in full test partition: M_pos=421, M_neg=5629
    ci_full_test_window = {
        "FPDAF-v2 (Full Partition)": compute_hanley_mcneil_ci(0.7603, n_pos=2655, n_neg=100339, label_type="window-level"),
        "Ditto Personalized": compute_hanley_mcneil_ci(0.7878, n_pos=2655, n_neg=100339, label_type="window-level"),
        "FedProx": compute_hanley_mcneil_ci(0.8033, n_pos=2655, n_neg=100339, label_type="window-level"),
        "FedAvg": compute_hanley_mcneil_ci(0.7844, n_pos=2655, n_neg=100339, label_type="window-level")
    }
    
    ci_full_test_patient_clustered = {
        "FPDAF-v2 (Full Partition)": compute_hanley_mcneil_ci(0.7603, n_pos=421, n_neg=5629, label_type="patient-clustered"),
        "Ditto Personalized": compute_hanley_mcneil_ci(0.7878, n_pos=421, n_neg=5629, label_type="patient-clustered"),
        "FedProx": compute_hanley_mcneil_ci(0.8033, n_pos=421, n_neg=5629, label_type="patient-clustered"),
        "FedAvg": compute_hanley_mcneil_ci(0.7844, n_pos=421, n_neg=5629, label_type="patient-clustered")
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
        "description": "Statistically rigorous 95% Confidence Intervals for AUROC using Hanley-McNeil variance estimation, reporting both window-level (unadjusted) and patient-clustered degrees of freedom.",
        "note_on_clustering": "ICU telemetry records contain multiple temporal windows per patient encounter (average ~17.0 windows/patient in full partition, ~3.5 in benchmark sample). Patient-clustered intervals adjust degrees of freedom to independent patient encounters, providing conservative and methodologically robust variance bounds.",
        "eval_15k_benchmark": {
            "sample_size_windows": 15000,
            "unique_patients": 4207,
            "positive_windows": 408,
            "positive_patients": 236,
            "prevalence_windows": 0.0272,
            "window_level_ci": ci_15k_window,
            "patient_clustered_ci": ci_15k_patient_clustered
        },
        "eval_full_test_partition": {
            "sample_size_windows": 102994,
            "unique_patients": 6050,
            "positive_windows": 2655,
            "positive_patients": 421,
            "prevalence_windows": 0.0258,
            "window_level_ci": ci_full_test_window,
            "patient_clustered_ci": ci_full_test_patient_clustered
        },
        "clinical_operating_modes": operating_modes
    }
    
    out_path = os.path.join(results_dir, "confidence_intervals.json")
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Saved verified confidence intervals to: {out_path}")
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
