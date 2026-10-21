# PhysioNet 2019 Dataset Download and Setup Guide

This document provides step-by-step instructions for downloading, organizing, and preprocessing the raw patient datasets used in the **Federated Personalized Drift-Aware Attention Framework (FPDAF)**.

---

## 📂 Expected Folder Structure
For our preprocessing pipeline to run successfully, your local `datasets/` folder structure must look like this:

```text
23CSE498-Project-Phase-II/
└── datasets/
    ├── raw/
    │   ├── training_setA/          # Contains patient files (p000001.psv to p020336.psv)
    │   ├── training_setB/          # Contains patient files (p020337.psv to p040327.psv)
    │   └── .gitkeep
    └── processed/
        ├── train.pt                # Generated training tensor
        ├── validation.pt            # Generated validation tensor
        ├── test.pt                  # Generated test tensor
        ├── scaler.pkl               # Fitted standard scaler
        ├── preprocessing_metadata.json
        └── .gitkeep
```

---

## 📥 1. Download the Dataset
The dataset is retrieved from the **PhysioNet Computing in Cardiology Challenge 2019**:
1. Go to the official PhysioNet source: [https://physionet.org/content/challenge-2019/1.0.0/](https://physionet.org/content/challenge-2019/1.0.0/)
2. Scroll to the **Files** section and download:
   * `training_setA.tar.gz` (Hospital System A)
   * `training_setB.tar.gz` (Hospital System B)
3. Extract both directories inside `datasets/raw/`.

---

## ⚙️ 2. Run the Preprocessing Pipeline
Once the raw `.psv` files are placed inside `datasets/raw/training_setA/` and `datasets/raw/training_setB/`, execute the preprocessing runner to clean, impute, scale, and window the dataset:

```bash
# Make sure virtual environment is active
python preprocessing/save_processed.py
```

### What Happens Behind the Scenes:
1. **Parallel Loading**: Patient files are loaded concurrently using python threads. Non-PSV or OS-metadata files (like `.DS_Store` or `._*` files) are filtered out automatically.
2. **Forward & Backward Imputation**: Time-series clinical records are imputed sequentially per patient (Forward fill $\rightarrow$ Backward fill $\rightarrow$ Zero-padding).
3. **Fitted Scaling**: A standard scaler is fit strictly on the training set features (to prevent data leakage) and saved to `scaler.pkl`.
4. **Sliding Windows**: Sliding sequences of `24` hours are generated. Short ICU stays ($T < 24$h) are pre-padded with zero features.
5. **Stratification & Patient Isolation**: Splits are partitioned at the patient level (70% train, 15% val, 15% test) and stratified to preserve hospital proportions.
6. **PyTorch Tensor Generation**: Processed inputs are converted into PyTorch tensors and saved as `.pt` files.

---

## 🔍 3. Preprocessing Verification Audit
To run the quality assurance and data auditing scripts to verify tensor shapes, disjoint patient splits, and padding boundaries:

```bash
python evaluation/preprocessing_audit.py
```
This script generates a visual validation report (`Preprocessing_Verification_Report.md` and a printable `.pdf`) under `results/preprocessing_verification/`.
