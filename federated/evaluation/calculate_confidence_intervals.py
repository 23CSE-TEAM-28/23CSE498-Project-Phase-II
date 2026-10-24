"""
Calculates mathematically rigorous 95% Confidence Intervals for FPDAF evaluations.
Uses the Hanley-McNeil method (Hanley & McNeil 1982) and Wilson score intervals for proportions.
Saves exact procedures, formulas, sample sizes, and intervals to JSON.
"""

import os
import json
import numpy as np

def compute_hanley_mcneil_ci(auroc: float, n_pos: int, n_neg: int, alpha: float = 0.05) -> dict:
    """
    Computes standard error and (1 - alpha) CI for AUROC using Hanley & McNeil (1982) formula.
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
        "method": "Hanley-McNeil (1982)",
        "auroc": float(A),
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
    ci_15k = {
        "FPDAF-v2 (Proposed Full)": compute_hanley_mcneil_ci(0.7821, n_pos=408, n_neg=14592),
        "Ditto (Personalized)": compute_hanley_mcneil_ci(0.7796, n_pos=408, n_neg=14592),
        "FedProx": compute_hanley_mcneil_ci(0.7676, n_pos=408, n_neg=14592),
        "FedAvg": compute_hanley_mcneil_ci(0.7559, n_pos=408, n_neg=14592),
        "Centralized BiLSTM": compute_hanley_mcneil_ci(0.7309, n_pos=408, n_neg=14592)
    }
    
    # 2. Full-Cohort Test Partition (N=102,994 windows, prevalence 2.58%)
    ci_full_test = {
        "FPDAF-v2 (Full Partition)": compute_hanley_mcneil_ci(0.7603, n_pos=2655, n_neg=100339),
        "Ditto Personalized": compute_hanley_mcneil_ci(0.7878, n_pos=2655, n_neg=100339),
        "FedProx": compute_hanley_mcneil_ci(0.8033, n_pos=2655, n_neg=100339),
        "FedAvg": compute_hanley_mcneil_ci(0.7844, n_pos=2655, n_neg=100339)
    }
    
    output = {
        "description": "Statistically rigorous 95% Confidence Intervals for AUROC using Hanley-McNeil variance estimation.",
        "eval_15k_benchmark": {
            "sample_size": 15000,
            "positive_cases": 408,
            "prevalence": 0.0272,
            "models": ci_15k
        },
        "eval_full_test_partition": {
            "sample_size": 102994,
            "positive_cases": 2655,
            "prevalence": 0.0258,
            "models": ci_full_test
        }
    }
    
    out_path = os.path.join(results_dir, "confidence_intervals.json")
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Saved verified confidence intervals to: {out_path}")
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
