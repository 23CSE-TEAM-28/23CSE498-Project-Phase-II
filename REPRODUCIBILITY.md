# FPDAF Reproducibility Guide & Experimental Protocol

This document provides exhaustive, end-to-end instructions for reproducing all data preprocessing pipelines, federated training runs, clinical validations, explainability attributions, and comparative ablations in the **FPDAF (Federated Personalized Drift-Aware Attention Framework)** research system.

---

## 1. System Requirements & Hardware Specifications

### 1.1 Compute Environment
- **Operating System:** macOS (Darwin arm64) / Linux x86_64
- **Processor:** Apple Silicon (M1/M2/M3) or Intel Xeon / AMD EPYC
- **RAM:** Minimum 16 GB (32 GB recommended for full dataset extraction)
- **Acceleration:** Apple Metal (`mps`), NVIDIA CUDA (`cuda`), or Multi-threaded CPU (`cpu`)
- **Python Version:** Python 3.10 to 3.14

### 1.2 Python Dependencies
The core dependencies are listed in `requirements.txt`:
```bash
pip install torch torchvision torchaudio
pip install numpy pandas scikit-learn scipy matplotlib seaborn pyyaml joblib
```

---

## 2. Directory Structure and Entry Points

```
23CSE498-Project-Phase-II/
├── baseline/                      # Centralized and single-node baselines
│   ├── configs/config.yaml        # Baseline model and optimizer configurations
│   ├── models/lstm.py             # Centralized BiLSTM architecture
│   ├── results/test_metrics.json  # Recorded centralized benchmark metrics
│   ├── test.py                    # Centralized evaluation script
│   └── train.py                   # Centralized training script
├── datasets/
│   ├── raw/                       # Raw PhysioNet CinC 2019 .psv files
│   │   ├── training/              # Hospital Site A (BIDMC/MIMIC-III cohort, 20,336 patients)
│   │   └── training_setB/         # Hospital Site B (Emory Healthcare cohort, 20,000 patients)
│   └── processed/                 # Leakage-free preprocessed tensors
│       ├── train.pt               # 477,669 sliding 24h windows (1.8 GB)
│       ├── validation.pt          # 104,038 sliding 24h windows (383 MB)
│       ├── test.pt                # 102,994 sliding 24h windows (379 MB)
│       ├── scaler.pkl             # Fitted StandardScaler on training partition
│       └── preprocessing_metadata.json
├── federated/
│   ├── configs/config.yaml        # Federated hyperparameter configurations
│   ├── models/attention_lstm.py   # BiLSTM with Temporal Attention mechanism
│   ├── clients/client.py          # Decentralized client node, AD-CUSUM drift detector, CSSP logic
│   ├── server/server.py           # Federated consensus server, FedAvg, wire payload profiler
│   ├── trainer/local_trainer.py   # Local SGD, Proximal, DDP-ERP, and DP-SGD trainers
│   ├── evaluation/
│   │   ├── evaluator.py           # Standard federated evaluation and ROC curve overlays
│   │   ├── clinical_utility.py    # ECE, Brier score, AUPRC, lead time, and Decision Curve Analysis
│   │   └── explainability.py      # PyTorch Integrated Gradients and attribution stability
│   ├── experiments/
│   │   └── run_master_experiments.py # Unified master experiment runner
│   ├── train_fedavg.py            # Standalone FedAvg training runner
│   ├── train_fedprox.py           # Standalone FedProx training runner
│   ├── train_ditto.py             # Standalone Ditto personalized runner
│   ├── train_fpdaf.py             # Standalone FPDAF training runner
│   ├── evaluate.py                # Standalone multi-model evaluation
│   └── results/                   # Machine-generated outputs, JSON reports, and publication figures
├── preprocessing/
│   ├── clean.py                   # Hourly outlier clamping and validity verification
│   ├── imputer.py                 # Strictly causal forward-fill + train median baseline imputer
│   ├── normalize.py               # Patient-level leakage-free feature standardizer
│   └── window.py                  # 24-hour temporal sliding window tensor extractor
└── tests/
    └── test_components.py         # Automated unit test suite
```

---

## 3. Data Integrity & Leakage Prevention Protocol

The data pipeline enforces strict scientific guarantees against data leakage:
1. **Patient-Level Split Integrity:** All train (70%), validation (15%), and test (15%) partitions are split at the patient identifier level. Zero patient records cross partition boundaries.
2. **Causal Imputation:** Missing physiological values are imputed via **forward fill (`ffill`)** only. Initial unobserved intervals are filled with the **training cohort population median**. Backward filling (`bfill`) has been strictly eliminated to prevent future-to-past temporal leakage.
3. **No Statistics Leakage:** Feature scalers (`StandardScaler`) and imputer medians are computed **exclusively on the training split** and applied deterministically to validation and test splits.
4. **Early Warning Horizon:** Under the PhysioNet CinC 2019 protocol, positive labels ($SepsisLabel = 1$) begin 6 hours prior to clinical onset ($t_{sepsis} - 6$). The sliding 24-hour window label reflects the impending sepsis status, providing a true clinical warning horizon of up to 6 hours.

---

## 4. Execution Commands

### 4.1 Automated Component Validation (Unit Tests)
To run the automated test suite verifying model shapes, attention softmax conservation, AD-CUSUM drift triggers, causal imputation, and metric arithmetic:
```bash
python3 -m unittest tests/test_components.py
```
*Expected Runtime: < 1 second. All 6 tests must pass.*

### 4.2 Full Master Experiment Execution
To execute the complete benchmark comparison (Centralized, Local-Only, FedAvg, FedProx, Ditto, FPDAF-v1, FPDAF-v2, and 5 systematic ablations), compute clinical utility metrics, calculate Integrated Gradients, and plot all publication figures:
```bash
python3 federated/experiments/run_master_experiments.py \
    --budget 12000 \
    --test-budget 15000 \
    --rounds 6 \
    --local-epochs 2 \
    --device mps \
    --seed 42
```
*Options:*
- `--budget <N>`: Maximum training samples per client (e.g. `12000` for rapid evaluation, `0` or `None` for full 477k windows). Stratified sampling is used to preserve the exact positive prevalence (~2.6%).
- `--test-budget <N>`: Maximum test samples for evaluation (e.g. `15000` or full `102994`).
- `--device <dev>`: Target acceleration device (`mps` on Mac, `cuda` on Linux/NVIDIA, `cpu` for fallback).

### 4.3 Running Individual Standalone Baselines
To train individual models independently:

```bash
# 1. Centralized LSTM Baseline
python3 baseline/train.py

# 2. FedAvg Global Model
python3 federated/train_fedavg.py

# 3. FedProx Global Model (mu=0.01)
python3 federated/train_fedprox.py

# 4. Ditto Personalized Federated Model (lambda=0.1)
python3 federated/train_ditto.py

# 5. Proposed FPDAF-v2 Model
python3 federated/train_fpdaf.py

# 6. Evaluate all trained checkpoints
python3 federated/evaluate.py
```

---

## 5. Seed Management & Determinism

All training scripts utilize centralized seed initialization (`federated/utils/helpers.py:set_seed`):
```python
random.seed(seed)
os.environ['PYTHONHASHSEED'] = str(seed)
np.random.seed(seed)
torch.manual_seed(seed)
torch.cuda.manual_seed_all(seed)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False
```
The primary seed for all reported benchmarks is **42**. Multi-seed replication across seeds `42`, `123`, and `999` is supported by passing `--seed <int>`.

---

## 6. Output Artifacts & Verification

Execution outputs are automatically written to `federated/results/` and `federated/results/figures/`:
1. **Master Results JSON:** `federated/results/master_experiment_results.json`
2. **Comparative ROC Curve Overlay:** `federated/results/figures/comparative_roc_overlay.png`
3. **Precision-Recall Curve Overlay:** `federated/results/figures/comparative_pr_overlay.png`
4. **Clinical Decision Curve (Net Benefit):** `federated/results/figures/decision_curve_analysis.png`
5. **Integrated Gradients Top Features:** `federated/results/figures/integrated_gradients_top_features.png`
6. **24-Hour Temporal Attention Profile:** `federated/results/figures/temporal_attention_24h.png`
7. **AD-CUSUM Drift Control Chart:** `federated/results/figures/ad_cusum_drift_control_chart.png`
8. **Communication Wire Payload (MB):** `federated/results/figures/communication_wire_payload.png`
9. **Benchmark Predictions & Patient IDs:** `federated/results/benchmark_predictions.pt`
10. **Bootstrap Confidence Intervals:** `federated/results/bootstrap_confidence_intervals.json`

---

## 7. Statistical Confidence Intervals & Genuine Patient-Level Cluster Bootstrap

### 7.1 Methodological Rationale
In longitudinal ICU telemetry, individual patients have multiple 24-hour observation windows (an average of $\sim 3.5$ windows per patient in the 15k benchmark sample and $\sim 17.0$ in the full partition). Windows originating from the same patient encounter exhibit intra-patient temporal autocorrelation and are not statistically independent.

To avoid artificial deflation of standard errors, we implement a **genuine patient-level cluster bootstrap**:
- **Resampling Unit:** Patient encounter cluster $p \in \{1, \dots, M\}$.
- **Cluster Replacement:** Samples $M$ patient IDs uniformly at random with replacement across $B = 2,000$ replicates using a fixed seed (`seed = 42`).
- **Preservation of Windows:** For each sampled patient, all eligible temporal windows are retained. If a patient is selected $k$ times ($k \ge 1$), all their observation windows appear exactly $k$ times in the bootstrap replicate.
- **Degenerate Sample Handling:** Replicates containing only one outcome class are explicitly audited and resampled.
- **Paired Comparisons:** To test for statistically significant differences between models without relying on marginal CI overlap, paired differences $\Delta^{(b)} = \text{AUROC}_A^{(b)} - \text{AUROC}_B^{(b)}$ are computed on identical patient resamples for each replicate $b$.

### 7.2 Running Confidence Interval Generation
```bash
# 1. Regenerate patient-level cluster bootstrap (B=2,000) from saved predictions
python3 federated/evaluation/patient_cluster_bootstrap.py --replicates 2000 --seed 42

# 2. Compute combined confidence intervals (Bootstrap + Hanley-McNeil + Wilson score)
python3 federated/evaluation/calculate_confidence_intervals.py
```

---

## 8. Resolution of 15,000-Window Benchmark Sample Counts

### 8.1 Empirical Root Cause of Count Differences
Two distinct, valid evaluation samples exist for the 15,000-window benchmark, reflecting centralized vs. decentralized testing architectures:

1. **Global Pooled Test Sample ($N = 15,000$ windows, prevalence $2.58\%$):**
   - **Applicable Models:** Centralized BiLSTM, FedAvg, FedProx.
   - **Procedure:** Stratified sub-sampling directly from the full test partition (`test.pt`, $N=102,994$, 2,655 positive windows) using `seed = 42`.
   - **Formula:** $n_{\text{pos}} = \text{round}(15000 \times \frac{2655}{102994}) = 387$ positive windows; $n_{\text{neg}} = 15000 - 387 = 14,613$ negative windows.
   - **Patient Count Reconciliation:** Total unique patients $M = 4,207$.
     - Patients with $\ge 1$ positive window: $236$
     - Patients with $\ge 1$ negative window: $4,144$
     - Patients with both positive and negative windows: $173$
     - Total Unique Patients: $236 + 4,144 - 173 = 4,207$.

2. **Federated Client-Partitioned Test Sample ($N = 15,000$ windows, prevalence $2.72\%$):**
   - **Applicable Models:** Local-Only, Ditto (Personalized), FPDAF-v1, FPDAF-v2 (Proposed).
   - **Procedure:** Evaluated independently across 3 non-IID hospital client test partitions, with $15,000 // 3 = 5,000$ stratified samples per hospital node using `seed = 42`:
     - **Client 0 (Community Hospital, Age < 60):** 5,000 windows (144 positive, 4,856 negative), 925 unique patients.
     - **Client 1 (Trauma Center, Age $\ge$ 60):** 5,000 windows (163 positive, 4,837 negative), 1,343 unique patients.
     - **Client 2 (Academic Medical Center, Site B):** 5,000 windows (101 positive, 4,899 negative), 1,859 unique patients.
   - **Summed Totals:** $144 + 163 + 101 = 408$ positive windows; $4,856 + 4,837 + 4,899 = 14,592$ negative windows ($N = 15,000$).
   - **Patient Count Reconciliation:** Total unique patients $M = 4,127$.
     - Patients with $\ge 1$ positive window: $231$
     - Patients with $\ge 1$ negative window: $4,062$
     - Patients with both positive and negative windows: $166$
     - Total Unique Patients: $231 + 4,062 - 166 = 4,127$.


### 8.3 Fair Model Comparisons & Panel Structure
To avoid presenting results from different sampling distributions as direct head-to-head comparisons:
- **Panel A (Client-Stratified Benchmark, N=15,000, 408 pos, M=4,127 patients):** Strictly benchmarks personalized and localized edge models (`Local-Only`, `Ditto PFL`, `FPDAF-v1`, `FPDAF-v2`) on identical patient clusters. Paired cluster bootstrap tests resample identical patient clusters simultaneously across models.
- **Panel B (Global Pooled Benchmark, N=15,000, 387 pos, M=4,207 patients):** Strictly benchmarks global consensus models (`Centralized BiLSTM`, `FedAvg`, `FedProx`) on identical patient clusters.
- **Cross-Panel Boundary:** Comparing metrics directly between Panel A and Panel B is scientifically invalid because the institutional weighting and baseline sepsis prevalence differ (2.72% vs 2.58%).

### 8.4 Calibration Audit (ECE & Brier Score)
Evaluated on continuous prediction arrays (`federated/results/benchmark_predictions.pt`):
- **Local-Only:** ECE = 0.0771, Brier = 0.0702 (non-federated baseline)
- **Centralized BiLSTM:** ECE = 0.0788, Brier = 0.0647 (non-federated baseline)
- **FPDAF-v2 (Proposed):** ECE = 0.0961, Brier = 0.0585
- **Ditto PFL:** ECE = 0.0982, Brier = 0.0613
- **FedAvg Baseline:** ECE = 0.1018, Brier = 0.0650
- **FedProx Baseline:** ECE = 0.1110, Brier = 0.0676
- **FPDAF-v1 (Ablation):** ECE = 0.1111, Brier = 0.0595

*Audit Disclosure:* While FPDAF-v2 yields the lowest Brier probability error (0.0585) and an ECE of 0.0961 among personalized federated architectures, the difference in ECE relative to Ditto (0.0961 vs 0.0982) is a modest numerical gain ($\Delta = -0.0021$) that is not statistically significant. Non-federated baselines (Centralized BiLSTM and Local-Only) exhibit lower ECE (0.0788 and 0.0771) under their non-distributed empirical distributions. Manuscripts must not claim FPDAF-v2 achieves "lower calibration error than Centralized BiLSTM".

### 8.5 FPDAF-v1 vs. FPDAF-v2 Calibration-Discrimination Trade-off
- **FPDAF-v1 (Single-Phase Attention):** AUROC = 0.7921 (cluster bootstrap 95% CI: 0.7563–0.8242), but poor calibration (ECE = 0.1111).
- **FPDAF-v2 (Dual-Phase Attention + Anchoring + Entropy Regularization):** AUROC = 0.7821 (cluster bootstrap 95% CI: 0.7447–0.8163), with substantially improved probability calibration (ECE = 0.0961, Brier = 0.0585) and improved sensitivity at $\tau=0.50$ (47.79% vs 44.36%).
This represents an intentional clinical design choice prioritizing trustworthy, calibrated risk probabilities over uncalibrated rank-ordering.

### 8.6 Full 102,994-Window Cohort Disclosure
On the unstratified full cohort ($N=102,994$, 2,655 positive windows, $M=6,050$ disjoint patients):
- **FedProx Baseline:** AUROC = 0.8033 (unadjusted window 95% CI: 0.7932–0.8134)
- **Ditto Personalized:** AUROC = 0.7878 (unadjusted window 95% CI: 0.7774–0.7982)
- **FedAvg Baseline:** AUROC = 0.7844 (unadjusted window 95% CI: 0.7740–0.7948)
- **FPDAF-v2 (Proposed):** AUROC = 0.7603 (unadjusted window 95% CI: 0.7496–0.7710)
*Limitation:* Clustered bootstrap intervals are not reported for this full partition because continuous prediction arrays were not serialized at the full-cohort scale during the original run (only confusion matrices and AUROC point estimates were preserved). Patient counts are not substituted into Hanley-McNeil to fabricate clustered intervals. On this unselected cohort, global regularized baselines (FedProx and Ditto) achieve higher discrimination, highlighting real-world trade-offs in local personalization heads under severe unstratified class imbalance.
