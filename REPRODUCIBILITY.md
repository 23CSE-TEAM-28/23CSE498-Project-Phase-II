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
