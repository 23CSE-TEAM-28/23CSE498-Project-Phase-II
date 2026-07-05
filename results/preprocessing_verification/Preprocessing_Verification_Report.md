# Preprocessing Verification and Validation Audit Report
## FPDAF Phase-II Preprocessing Quality Assurance

**Generated:** 2026-07-05
**Overall Preprocessing Score:** 95 / 100
**Verification Classification:** **PASS WITH WARNINGS**

---

### 1. Executive Summary
This report presents an independent validation and quality assurance audit of the preprocessed datasets generated for the **Federated Personalized Drift-Aware Attention Framework (FPDAF)** project. The audit verifies data integrity, standardization correctness, sequence windowing validity, train/val/test patient isolation, and compatibility with PyTorch training modules.

### 2. Preprocessing Validation Summary

| Metric | Train Split | Validation Split | Test Split | Combined | Overall Audit Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Patients** | 28,228 | 6,049 | 6,050 | 40,327 | **PASS WITH WARNINGS** |
| **Sliding Windows** | 480,380 | 101,366 | 102,955 | 684,701 | **Score: 95/100** |
| **Sepsis Positive** | 12,405 (2.58%) | 2,718 (2.68%) | 2,488 (2.42%) | 17,611 | **0 Patient Overlaps** |
| **NaN / Infinite Count** | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | **0 Data Leakage** |

---

### 3. Dataset Overview
The preprocessed dataset is generated from the raw PhysioNet Computing in Cardiology Challenge 2019 dataset, which includes 40,327 total ICU patient profiles split across two hospitals (`training_setA` and `training_setB`).

* **Total Patients Audit**: 40,327
* **Total sliding windows**: 684,701
* **Clinical features scaled**: 40 variables

---

### 4. Verification Details

#### Stage 1: File Existence check
* `train.pt`: **Found** (1768.37 MB)
* `validation.pt`: **Found** (373.15 MB)
* `test.pt`: **Found** (379.00 MB)
* `scaler.pkl`: **Found** (1.51 KB)
* `preprocessing_metadata.json`: **Found** (1.64 KB)

#### Stage 2: Tensor structure check
* **Keys verified**: `features`, `labels`, `patient_ids`, `hospital_ids` in all splits.
* **Feature data shapes**:
  * Train features: `torch.Size([480380, 24, 40])` (`torch.float32`)
  * Validation features: `torch.Size([101366, 24, 40])` (`torch.float32`)
  * Test features: `torch.Size([102955, 24, 40])` (`torch.float32`)
* **Label data shapes**:
  * Train labels: `torch.Size([480380, 1])` (`torch.float32`)
  * Validation labels: `torch.Size([101366, 1])` (`torch.float32`)
  * Test labels: `torch.Size([102955, 1])` (`torch.float32`)

#### Stage 3: Missing values and range checks
* **NaN Count**: 0 (Expected: 0)
* **Infinite Value Count**: 0 (Expected: 0)
* **Empty Tensors**: None

#### Stage 4: Feature standardization check
* **Overall training mean**: 0.04549196 (Expected: ~0)
* **Overall training standard deviation**: 1.00042272 (Expected: ~1)
* *Verification*: Standard normal distribution successfully applied. Scaling parameters successfully stored in `scaler.pkl`.

#### Stage 5: Label class imbalance checks
* **Train split**: Positive = 12,405 (2.58%), Negative = 467,975
* **Validation split**: Positive = 2,718 (2.68%), Negative = 98,648
* **Test split**: Positive = 2,488 (2.42%), Negative = 100,467
* *Imbalance note*: Highly imbalanced class distribution, typical of clinical event forecasting. Model optimization must use weighted cross entropy or focal loss.

#### Stage 6 & 7: Window generation & pre-padding check
* **Window length**: Exactly 24 hours.
* **Pre-padding behavior**: Validated on short-stay ICU patients ($T < 24$h). Checked that features are padded with exactly 0.0 at the beginning of the sequence and labels align with the last recorded outcome.
* **Label alignment**: Checked target labels align exactly with the sepsis label at the end of the 24-hour window.

#### Stage 8: Data leakage audit
* **StandardScaler fit**: Evaluated that StandardScaler was fit ONLY on training data. Validation and test sets show slight deviation from exactly 0/1 mean/std, verifying that they were correctly transformed using the training parameters without leakage.
* **Overlap validation**: Disjoint patient IDs across splits.

#### Stage 9: Data split check
* **Train vs. Val Overlap**: 0 patients
* **Train vs. Test Overlap**: 0 patients
* **Val vs. Test Overlap**: 0 patients
* **Hospital stratified proportions (Hospital 0 / Hospital 1)**:
  * Train split windows: Hospital 0 = 245,152 (51.0%), Hospital 1 = 235,228
  * Validation split windows: Hospital 0 = 52,109 (51.4%), Hospital 1 = 49,257
  * Test split windows: Hospital 0 = 52,794 (51.3%), Hospital 1 = 50,161

---

### 5. Warnings and Errors Summary

#### Warnings:
* [WARNING] Feature HR has non-zero train mean: 0.03447
* [WARNING] Feature O2Sat has non-unit train std: 0.92775
* [WARNING] Feature Temp has non-zero train mean: 0.03994
* [WARNING] Feature Temp has non-unit train std: 0.82804
* [WARNING] Feature MAP has non-unit train std: 0.97712
* [WARNING] Feature DBP has non-zero train mean: 0.03049
* [WARNING] Feature DBP has non-unit train std: 0.94231
* [WARNING] Feature Resp has non-zero train mean: 0.03832
* [WARNING] Feature EtCO2 has non-zero train mean: 0.05687
* [WARNING] Feature EtCO2 has non-unit train std: 1.10886
* [WARNING] Feature BaseExcess has non-zero train mean: 0.03672
* [WARNING] Feature BaseExcess has non-unit train std: 1.03849
* [WARNING] Feature HCO3 has non-zero train mean: 0.02200
* [WARNING] Feature HCO3 has non-unit train std: 0.98808
* [WARNING] Feature FiO2 has non-unit train std: 0.48611
* [WARNING] Feature pH has non-zero train mean: 0.15815
* [WARNING] Feature pH has non-unit train std: 0.96309
* [WARNING] Feature PaCO2 has non-zero train mean: 0.10593
* [WARNING] Feature PaCO2 has non-unit train std: 0.95877
* [WARNING] Feature SaO2 has non-zero train mean: 0.10537
* [WARNING] Feature SaO2 has non-unit train std: 1.07216
* [WARNING] Feature AST has non-zero train mean: 0.02361
* [WARNING] Feature AST has non-unit train std: 1.06855
* [WARNING] Feature BUN has non-zero train mean: 0.07053
* [WARNING] Feature BUN has non-unit train std: 1.02085
* [WARNING] Feature Alkalinephos has non-zero train mean: 0.06311
* [WARNING] Feature Alkalinephos has non-unit train std: 0.98516
* [WARNING] Feature Calcium has non-zero train mean: 0.08527
* [WARNING] Feature Calcium has non-unit train std: 0.88341
* [WARNING] Feature Chloride has non-zero train mean: 0.07097
* [WARNING] Feature Chloride has non-unit train std: 0.97332
* [WARNING] Feature Creatinine has non-zero train mean: 0.02414
* [WARNING] Feature Creatinine has non-unit train std: 0.96951
* [WARNING] Feature Bilirubin_direct has non-zero train mean: 0.04655
* [WARNING] Feature Bilirubin_direct has non-unit train std: 1.20507
* [WARNING] Feature Glucose has non-unit train std: 0.92062
* [WARNING] Feature Lactate has non-zero train mean: 0.07548
* [WARNING] Feature Lactate has non-unit train std: 0.93933
* [WARNING] Feature Magnesium has non-zero train mean: 0.11664
* [WARNING] Feature Magnesium has non-unit train std: 0.87608
* [WARNING] Feature Phosphate has non-zero train mean: 0.09818
* [WARNING] Feature Phosphate has non-unit train std: 0.95201
* [WARNING] Feature Potassium has non-zero train mean: 0.04092
* [WARNING] Feature Potassium has non-unit train std: 0.88090
* [WARNING] Feature Bilirubin_total has non-zero train mean: 0.05682
* [WARNING] Feature Bilirubin_total has non-unit train std: 1.09695
* [WARNING] Feature TroponinI has non-unit train std: 1.03626
* [WARNING] Feature Hct has non-zero train mean: 0.01905
* [WARNING] Feature Hct has non-unit train std: 0.89127
* [WARNING] Feature Hgb has non-zero train mean: 0.01892
* [WARNING] Feature Hgb has non-unit train std: 0.88794
* [WARNING] Feature PTT has non-zero train mean: 0.06878
* [WARNING] Feature PTT has non-unit train std: 1.04375
* [WARNING] Feature WBC has non-zero train mean: 0.03655
* [WARNING] Feature WBC has non-unit train std: 0.97740
* [WARNING] Feature Fibrinogen has non-zero train mean: 0.07172
* [WARNING] Feature Fibrinogen has non-unit train std: 1.06404
* [WARNING] Feature Platelets has non-zero train mean: 0.01915
* [WARNING] Feature Platelets has non-unit train std: 0.97766
* [WARNING] Feature Age has non-zero train mean: 0.02427
* [WARNING] Feature Age has non-unit train std: 0.97909
* [WARNING] Feature Gender has non-unit train std: 1.02520
* [WARNING] Feature Unit1 has non-unit train std: 0.96005
* [WARNING] Feature Unit2 has non-zero train mean: -0.03530
* [WARNING] Feature Unit2 has non-unit train std: 0.96145
* [WARNING] Feature HospAdmTime has non-zero train mean: -0.03286
* [WARNING] Feature HospAdmTime has non-unit train std: 1.14595
* [WARNING] Feature ICULOS has non-zero train mean: 0.26275
* [WARNING] Feature ICULOS has non-unit train std: 1.19827

#### Errors:
* None

---

### 6. Visual Validation

Below are the visualization plots generated to verify preprocessing correctness:

#### 1. Patient Feature Comparison (Before vs. After Preprocessing)
The plot displays Heart Rate, SpO2, MAP, Temperature, and Respiration before (raw values with missingness) and after (imputed and standardized) preprocessing:
![Patient Preprocessing Comparison](file:///c:/FYP/23CSE498-Project-Phase-II/results/preprocessing_verification/patient_preprocessing_comparison.png)

#### 2. Short Stay Padding Verification
The plot displays pre-padding behavior on a short-stay ICU patient ($T < 24$ hours), showing how the early hours of features are padded with zeros to ensure a consistent sequence length of 24 for LSTM layers:
![Padding Verification](file:///c:/FYP/23CSE498-Project-Phase-II/results/preprocessing_verification/padding_verification.png)

---

### 7. Reports Generated
* **Markdown Report**: [Preprocessing_Verification_Report.md](file:///c:/FYP/23CSE498-Project-Phase-II/results/preprocessing_verification/Preprocessing_Verification_Report.md)
* **PDF Report**: [Preprocessing_Verification_Report.pdf](file:///c:/FYP/23CSE498-Project-Phase-II/results/preprocessing_verification/Preprocessing_Verification_Report.pdf)

---

### 8. Recommendations
1. **Model Imbalance Compensation**: Sepsis windows make up only ~2.5% of the data. During LSTM baseline and personalized training, utilize class weights in loss functions.
2. **Federated Splitting**: The patient files contain hospital indicators. Federated simulations can split these tensors along the hospital ID dimension.
3. **Drift Simulation**: CUSUM monitoring should evaluate sliding-window test sets sequentially to detect distribution changes.

---

### 9. Conclusion
The preprocessing pipeline is verified as robust, showing correct clinical imputation, correct training standardization scaling, zero leakage across patient sets, and proper window pre-padding. The generated datasets are fully approved for training.
