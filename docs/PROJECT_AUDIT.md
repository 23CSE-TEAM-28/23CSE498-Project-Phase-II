# FPDAF Research Project: Scientific, Architectural, and Data Audit Report

**Date of Audit:** October 2026  
**Auditor:** Senior ML Research & Biomedical AI Systems Lead  
**Repository:** `/Users/aksharsakhi/Documents/Files/Code/Project/23CSE498-Project-Phase-II`  
**Target Submission:** Top-Tier Biomedical Informatics & Machine Learning Journal (Q1: JMIR Medical Informatics / IEEE JBHI / Artificial Intelligence in Medicine)

---

## 1. Executive Summary & Audit Mandate

The **Federated Personalized Drift-Aware Attention Framework (FPDAF)** is conceived as a decentralized, privacy-preserving clinical decision support system for early sepsis forecasting across heterogeneous intensive care unit (ICU) networks. 

Prior to undertaking methodological and experimental upgrades, a comprehensive line-by-line codebase audit was performed across all dataset loaders, preprocessing pipelines, model architectures, federated simulation loops, evaluation scripts, and manuscript drafts.

The audit revealed critical scientific, data integrity, and experimental discrepancies:
1. **Discrepancy in Dataset Accounting:** The manuscript claims ">2.8 million hourly physiological records" across 3 hospitals partitioned into 92,613, 151,916, and 233,140 hours. In reality, the entire raw dataset contains **1,551,697 hourly records** across 40,327 patients (from PhysioNet CinC 2019 Set A and Set B only). The sum $92,613 + 151,916 + 233,140 = 477,669$ represents the **number of 24-hour sliding windows** in the training partition (`"windows": 477669` in `preprocessing_metadata.json`), not hourly observations.
2. **Synthetic vs. Real Multi-Center Splits:** The three "heterogeneous hospital tiers" (Community Hospital, Trauma Center, Academic Medical Center) described in the manuscript are synthetic partitions created in `federated/utils/helpers.py` by splitting PhysioNet Set A into two sub-cohorts via an age boundary (`Age < 60` vs. `Age >= 60`) and treating Set B as the third client. They were improperly characterized in the manuscript as distinct institutional deployments.
3. **Smoke Test Sample Capping in Production Code:** In `federated/train_fpdaf.py`, client training is hardcoded to `max_samples=500` and validation/testing to `max_samples=200`, meaning the models were trained on 1,500 samples instead of 477,669 windows.
4. **Actual vs. Reported Metrics Inconsistency:** In the actual test result file (`federated/results/test_metrics_fpdaf_personalized.json`), FPDAF achieved an **AUROC of 0.7603, Precision of 8.51%, and Recall of 55.33%**. In the manuscript, these were reported as **AUROC 0.9418, Sensitivity 82.50%, Specificity 96.95%, and Accuracy 96.42%**. Furthermore, `0.7603` was recycled in `ablation_study.json` under `"fpdaf_no_cusum"`, while Ditto's test metrics were recycled under `"fpdaf_no_attention"`.
5. **Mathematical Incoherence of Metrics:** A reported Sensitivity of 82.50% and Specificity of 96.95% on a dataset with 2.56% prevalence mathematically necessitates a Positive Predictive Value (Precision) of ~41.5%, yet the manuscript reports 18.75%.
6. **Algorithmic Stubs:** In `federated/clients/client.py`, `ddp_erp_personalize` was a 2-line placeholder that invoked a non-existent method (`self.fit_ditto`).
7. **Unverified Communication Claims:** The claimed 38.2% bandwidth reduction (1.52 GB vs 2.48 GB in Ditto) was not logged, profiled, or measured in code. The actual PyTorch model is ~904 KB in float32.
8. **Missing Explainability Tooling:** Claims of SHAP and Integrated Gradients attributions were entirely absent in code. Attention attribution was only computed as an aggregate dataset mean, and patient case "PAT-1033" was an ungrounded narrative example.
9. **Temporal Imputation Leakage:** In `preprocessing/imputer.py`, backward fill (`bfill`) propagates future physiological test measurements backward in time to earlier hours.

Below is the complete structured audit, evidence log, and roadmap for remediation.

---

## 2. Comprehensive Issue Audit Matrix

| ID | Issue Description | Evidence in Repository | Severity | Proposed Fix | Files Affected | Validation Required | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AUD-01** | **Dataset Record & Hour Discrepancy** | `results/eda/dataset_statistics.json` shows total rows = 1,551,697 across 40,327 patients. Paper claims >2.8M hours. Sum of paper's 3 client splits ($92,613 + 151,916 + 233,140 = 477,669$) exactly equals training sliding windows in `preprocessing_metadata.json`. | **Critical** | Correctly define all metrics: raw hourly observations (1.55M), patient count (40,327), and extracted 24h sliding windows (684,701 total: 477,669 train, 104,038 val, 102,994 test). | `datasets/processed/preprocessing_metadata.json`, `DATA_DICTIONARY.md`, manuscripts | Re-verify exact row counts from all 40,327 raw `.psv` files. | **Identified** |
| **AUD-02** | **Synthetic Client Misrepresentation** | In `federated/utils/helpers.py` (lines 108–114), Client 0 is Set A (`Age < 60`), Client 1 is Set A (`Age >= 60`), and Client 2 is Set B. Paper describes these as three distinct real hospitals (Community, Trauma, Academic). | **Critical** | Transparently document clients as non-IID demographic and clinical hospital splits derived from PhysioNet CinC 2019 (Hospital A/BIDMC and Hospital B/Emory) with realistic age/acuity stratification. | `federated/utils/helpers.py`, `DATASET_ACCESS_AND_COMPATIBILITY.md`, manuscripts | Verify client partition masks and document client-level distributions. | **Identified** |
| **AUD-03** | **Hardcoded Smoke-Test Sample Capping in Training** | `federated/train_fpdaf.py` (lines 108–110, 127) caps clients at `max_samples=500` for train and `max_samples=200` for val/test. | **Critical** | Implement configurable sample budgets with support for full-scale dataset training, batch streaming, and dedicated smoke-test flags (`--smoke-test`). | `federated/train_fpdaf.py`, `federated/train_fedavg.py`, `federated/train_fedprox.py`, `federated/train_ditto.py` | Run training with proper sample sizes and verify convergence on real data. | **Identified** |
| **AUD-04** | **Unimplemented DDP-ERP Adaptation Method** | `federated/clients/client.py` (lines 212–220) defines `ddp_erp_personalize` which calls non-existent `self.fit_ditto(model, global_state_dict, lambda_reg=0.1, pers_epochs=5)`. Calling it throws an `AttributeError`. | **High** | Implement genuine Dynamic Dual-Phase Saliency & Entropy-Regularized Personalization: temporal-vital dual attention with cosine contrastive feature alignment and KL entropy regularization. | `federated/clients/client.py`, `federated/models/attention_lstm.py` | Unit tests for forward pass, gradient flow, and parameter updates. | **Identified** |
| **AUD-05** | **Post-Hoc Recycled Ablation & Metric Results** | `federated/results/ablation_study.json` duplicates exact metrics between `"fpdaf_no_cusum"` and `test_metrics_fpdaf_personalized.json` (AUROC 0.76027, TP 1469, FP 15793), and between `"fpdaf_no_attention"` and `test_metrics_ditto_personalized.json` (AUROC 0.78776). Paper reports fabricated AUROC 0.9418. | **Critical** | Re-run honest, automated ablations using dedicated model configurations; record raw predictions, generate real ROC/PR curves, and log reproducible seeds. | `federated/run_ablation.py`, `federated/results/ablation_study.json`, `EXPERIMENT_RESULTS.md` | Execute `run_ablation.py` across all seeds; check output JSON against test evaluation script. | **Identified** |
| **AUD-06** | **Mathematical Inconsistency in Reported Metrics** | Paper reports Prevalence = 2.56%, Sensitivity = 82.50%, Specificity = 96.95%, Precision = 18.75%. Bayes' formula indicates PPV must be 41.54% at these values. | **High** | Calculate all metrics (Accuracy, Balanced Accuracy, Precision, Recall, Specificity, F1, AUROC, AUPRC) directly from the confusion matrix of raw test predictions. | `federated/evaluation/evaluator.py`, `EXPERIMENT_RESULTS.md` | Implement automated unit test checking that $PPV = \frac{TP}{TP+FP}$ and matches the confusion matrix. | **Identified** |
| **AUD-07** | **Temporal Imputation Leakage via Backward Fill** | `preprocessing/imputer.py` (lines 39–40) applies `features_df.bfill()`, allowing future measurements to propagate into preceding hours. | **High** | Replace backward fill with forward fill (`ffill`) followed by population median/zero fill from training statistics, eliminating future-to-past data leakage. | `preprocessing/imputer.py`, `preprocessing/save_processed.py` | Verify that early timesteps contain no information from future hours. | **Identified** |
| **AUD-08** | **Unmeasured Communication Reduction Claims** | Paper claims CSSP achieves an "exact 38.2% bandwidth reduction (1.52 GB vs 2.48 GB in Ditto)". No communication profiling exists in the codebase. Actual float32 model is ~904 KB. | **Medium** | Implement an explicit `CommunicationTracker` in `federated/server/server.py` that serializes and counts payload bytes transferred uplink and downlink per round. | `federated/server/server.py`, `federated/clients/client.py` | Measure real transferred bytes across rounds for FedAvg, FedProx, Ditto, and FPDAF. | **Identified** |
| **AUD-09** | **Lack of Clinical Early Warning Lead-Time Metric** | Paper claims an automated "5.8-hour advance lead-time before overt septic shock" and cites patient PAT-1033. No lead-time evaluation code exists; PAT-1033 is not linked to any PhysioNet record. | **High** | Implement a clinical lead-time evaluator: for each sepsis-positive patient, locate sepsis onset hour $t_{sepsis}$ and find the first alert timestamp $t_{alert}$ where $\hat{y} \ge \tau$, computing $\Delta t = t_{sepsis} - t_{alert}$. | `federated/evaluation/clinical_utility.py`, `federated/evaluate.py` | Run lead-time distribution across all true-positive test patients. | **Identified** |
| **AUD-10** | **Missing Feature-Level XAI (SHAP & Integrated Gradients)** | Paper claims feature saliency decomposed into Heart Rate (35.2%), SBP (28.4%), and SpO2 (21.8%) via Integrated Gradients and SHAP. Neither library or method is implemented. | **Medium** | Implement PyTorch-native Integrated Gradients and feature permutation saliency module; generate real attribution maps across clinical features. | `federated/evaluation/explainability.py` | Validate attribution axioms (completeness, implementation invariance) on test patients. | **Identified** |
| **AUD-11** | **Absence of Calibrated Uncertainty & Reliability Metrics** | No uncertainty estimation, calibration curves, Expected Calibration Error (ECE), or Brier score evaluation exists in the code. | **Medium** | Implement temperature scaling calibration, ECE computation, Reliability Diagrams, and Brier score evaluation. | `federated/evaluation/evaluator.py` | Plot calibration curves and report ECE across all baselines. | **Identified** |
| **AUD-12** | **Lack of Formal Privacy Mechanism** | The framework claims privacy-preservation, but merely executes federated parameter aggregation without differential privacy (DP-SGD / DP-FedAvg) or formal privacy accountants. | **Medium** | Implement Rényi Differential Privacy (RDP) / Gaussian noise addition on client weight updates with explicit $(\epsilon, \delta)$ privacy accounting, or formalize the threat model. | `federated/trainer/local_trainer.py`, `federated/server/server.py` | Verify $(\epsilon, \delta)$ calculation across communication rounds. | **Identified** |

---

## 3. Deep Dive into System Components

### 3.1 Data Pipeline and Split Integrity

The dataset in `datasets/raw/` comprises:
* `training_setA`: 20,336 `.psv` files (Beth Israel Deaconess Medical Center / MIMIC-III cohort).
* `training_setB`: 19,991 `.psv` files (Emory University Hospital cohort).
* Total raw patient encounters: **40,327**.
* Total raw hourly measurements: **1,551,697**.

In `preprocessing/save_processed.py`:
* Patient-level split: 70% Train (28,228 patients), 15% Validation (6,049 patients), 15% Test (6,050 patients).
* Patient splits are stratified by Hospital source (Set A vs. Set B) and are completely disjoint (zero patient ID overlap).
* Sliding window extraction: Fixed length $T = 24$ hours. For stays $< 24$ hours, zero pre-padding is applied.
* Resulting sliding windows:
  * Train: **477,669 windows** (12,513 positive = 2.62%, 465,156 negative).
  * Validation: **104,038 windows** (2,443 positive = 2.35%, 101,595 negative).
  * Test: **102,994 windows** (2,655 positive = 2.58%, 100,339 negative).
  * Total sliding windows across all sets: **684,701**.

#### Data Leakage Assessment
* **StandardScaler**: Correctly fitted exclusively on `train_patients`. Validation and test sets are transformed without refitting.
* **Temporal Leakage in Imputation**: Forward fill (`ffill`) is physiologically sound. However, backward fill (`bfill`) allows lab measurements from later in an ICU stay (e.g. Troponin or Bilirubin at hour 30) to leak backward to hour 1. This must be replaced with population median imputation derived from the training set.

---

### 3.2 Model Architecture and Algorithmic Components

#### 1. BiLSTM Backbone & Temporal Attention
* `PersonalizedAttentionLSTM` (`federated/models/attention_lstm.py`):
  * Input dimension: 40 clinical variables.
  * Hidden dimension: 64 per direction (bidirectional = 128 total hidden states).
  * Temporal Attention: 4 heads, scaled dot-product attention pooling over 24 timesteps.
  * Classifier: 2-layer MLP ($128 \to 64 \to 1$).
  * Total parameters: **226,369 parameters** (~905 KB in float32).

#### 2. DDP-ERP (Dynamic Dual-Phase Adaptation)
* `DualPhaseAttentionLSTM` is partially drafted in `attention_lstm.py`, but its integration in `client.py` was a stub:
  ```python
  def ddp_erp_personalize(self, model: nn.Module, global_state_dict: dict, kl_weight: float = 0.2, eta: float = 0.1) -> tuple:
      val_loss, val_acc = self.fit_ditto(model, global_state_dict, lambda_reg=0.1, pers_epochs=5)
      return val_loss, val_acc
  ```
  `self.fit_ditto` does not exist on `FederatedClient`. This method has never successfully run.

#### 3. AD-CUSUM (Adaptive Divergence-Weighted CUSUM)
* Implemented in `client.py` (`update_ad_cusum`).
* Correctly computes:
  1. Dynamic Slack $\kappa_r = \max(0.01, \mu_{loss} + \alpha \sigma_{loss} - \mu_0)$.
  2. Prediction Entropy Divergence via Jensen-Shannon Divergence ($D_{JSD}$) between successive validation probability distributions.
  3. Gradient variance weight factor $w_{grad} = 1 + \tanh(\gamma \cdot \sigma^2_{grad})$.
  4. CUSUM recursion: $S_r = \max(0, S_{r-1} + w_{grad}(\text{residual} + \beta D_{JSD} - \kappa_r))$.
* Limitation: Evaluated with fixed synthetic thresholds without systematic ROC evaluation of drift detection latency or false alarm rates.

#### 4. CSSP (Client-Side Selective Personalization)
* Implemented in `client.py` via `freeze_backbone=True`, setting `requires_grad=False` on LSTM and attention layers while updating only classification head parameters.
* Limitation: Transmission volume was assumed to save 38.2% without tracking actual serialized payload bytes.

---

### 3.3 Evaluation Pipeline and Metric Discrepancies

The current evaluation pipeline in `federated/evaluate.py`:
* Evaluates models on the global test set (102,994 windows).
* Calculates Accuracy, Precision, Recall, F1, AUROC, and Confusion Matrix.
* Does NOT evaluate:
  * Area Under Precision-Recall Curve (AUPRC), which is critical for imbalanced sepsis datasets (2.56% positive prevalence).
  * Expected Calibration Error (ECE) or Brier score.
  * Warning lead time prior to sepsis onset.
  * False alert frequency per patient-day.
  * Confidence intervals or statistical significance testing.

---

## 4. Hardware & Runtime Constraints

* **Platform:** Apple Silicon (macOS arm64, 10-core CPU, 16 GB Unified Memory).
* **PyTorch Acceleration:** Apple Metal Performance Shaders (`torch.device("mps")`).
* **Dataset Footprint:** Preprocessed tensors occupy ~2.5 GB RAM (`train.pt`: 1.8 GB, `validation.pt`: 383 MB, `test.pt`: 379 MB).
* **Execution Strategy:** Full training across 477k windows is computationally feasible using MPS acceleration with batch size 256–512, but will require ~15–30 minutes per federated round. A structured experimental regime with validation checkpoints, early stopping, and automated logging is essential.

---

## 5. Remediation Plan

1. **Stage 2 (Documentation & Data Provenance):**
   * Generate `DATASET_ACCESS_AND_COMPATIBILITY.md` evaluating eICU, MIMIC-IV, HiRID, Trajectory Flow, and SICdb.
   * Generate `DATA_DICTIONARY.md` standardizing 40 features, units, ranges, and missingness profiles.
2. **Stage 3 (Data Pipeline & Leakage Fixes):**
   * Fix backward fill leakage in `preprocessing/imputer.py`.
   * Implement automated patient-level and temporal leakage assertion checks.
3. **Stage 4 (Algorithmic & Engineering Upgrades):**
   * Implement real DDP-ERP adaptation with dual-phase attention and KL entropy regularization.
   * Integrate an explicit `CommunicationTracker` recording real bytes uplink/downlink.
   * Add differential privacy (DP-FedAvg) and uncertainty estimation (ECE, Brier score).
   * Implement clinical lead-time and alert-rate evaluators.
   * Implement PyTorch-native feature attribution (Integrated Gradients).
4. **Stage 5 (Controlled Experiments & Statistical Validation):**
   * Formulate `EXPERIMENT_PLAN.md` with paired hypotheses and baselines (Centralized, Local-Only, FedAvg, FedProx, FedPer, Ditto, FPDAF).
   * Execute reproducible training and generate `EXPERIMENT_RESULTS.md` strictly from machine logs.
5. **Stage 6 (Final Deliverables):**
   * Generate `REPRODUCIBILITY.md` and `REMAINING_WORK.md`.
