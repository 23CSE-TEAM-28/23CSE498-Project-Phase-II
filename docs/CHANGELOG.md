# Changelog

All notable changes and milestones for the **FPDAF** project will be documented in this file.

---

## [0.2.0] - 2026-07-05
### Added
* **Parallel Imputation & Loading Engine**: Implemented `ThreadPoolExecutor` parallel loading of raw `.psv` files, reducing loading time to ~2.5 minutes.
* **Standard Preprocessing Pipeline**: Completed modules for forward-filling, backward-filling, standard scaling (fit strictly on train set), and sliding sequence generation (window length = 24h).
* **Short Stay Zero-Padding**: Integrated pre-padding for short stays ($T < 24$h) using zero matrices.
* **Hospital-Stratified Splits**: Partitioned dataset into 70/15/15 disjoint patient groups stratified by hospital.
* **Verification & Validation Audit**: Added `evaluation/preprocessing_audit.py` to inspect tensors.
* **Audit Documentation**: Saved Markdown and PDF validation reports under `results/preprocessing_verification/`.

### Fixed
* macOS AppleDouble metadata (`._*` files) and temporary hidden system files are now automatically filtered out and deleted from Git tracking.
* Console encoding warnings on Windows were resolved by replacing Unicode drawing glyphs with clean ASCII characters.

### Verification Score
* **Score**: 95 / 100
* **Classification**: `PASS WITH WARNINGS` (Slight expected standard deviation shifts due to sliding window overlapping row replication).

---

## [0.1.0] - 2026-07-04
### Added
* Professional repository folder structure.
* Copied raw PhysioNet dataset files (40,327 patient profiles).
* Exploratory Data Analysis (EDA) scripts and notebook producing distribution and sparsity visual plots under `results/eda/`.
* Baseline configure files (`config.py`, `requirements.txt`, `.gitignore`).
