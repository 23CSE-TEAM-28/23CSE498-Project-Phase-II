# FPDAF: Clinical Feature Dictionary and Outcome Definitions

**Dataset:** PhysioNet Computing in Cardiology Challenge 2019 (MIMIC-III & Emory University Hospital)  
**Total Patient Cohort:** 40,327 ICU Admissions  
**Total Hourly Records:** 1,551,697 Hours  
**Input Sequence Length:** 24 Hours ($T=24$)  
**Target Label:** `SepsisLabel` (Binary Early Warning Indicator)

---

## 1. Feature Categories Overview

The 40 clinical predictors are partitioned into four physiological domains:
1. **Vital Signs (8 features):** Continuously or frequently sampled bedside hemodynamic indicators.
2. **Laboratory Measurements (26 features):** Infrequently sampled biochemistry, hematology, blood gas, and coagulation tests.
3. **Demographics (2 features):** Static baseline patient identifiers.
4. **Administrative & ICU Timing (4 features):** Admission timing, ICU length of stay, and hospital care unit indicators.

---

## 2. Comprehensive Clinical Feature Dictionary

| # | Feature Name | Clinical Description | Measurement Units | Physiological Normal Range | Missingness in Cohort | Imputation Method |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **Vital Signs** |
| 1 | `HR` | Heart Rate | beats/min (bpm) | 60 – 100 | 9.88% | Forward fill + Train median |
| 2 | `O2Sat` | Pulse Oximetry Oxygen Saturation | % | 95 – 100 | 13.06% | Forward fill + Train median |
| 3 | `Temp` | Core Body Temperature | °C | 36.5 – 37.5 | 66.16% | Forward fill + Train median |
| 4 | `SBP` | Systolic Blood Pressure | mmHg | 90 – 120 | 14.58% | Forward fill + Train median |
| 5 | `MAP` | Mean Arterial Pressure | mmHg | 70 – 105 | 12.45% | Forward fill + Train median |
| 6 | `DBP` | Diastolic Blood Pressure | mmHg | 60 – 80 | 31.35% | Forward fill + Train median |
| 7 | `Resp` | Respiration Rate | breaths/min | 12 – 20 | 15.36% | Forward fill + Train median |
| 8 | `EtCO2` | End-Tidal Carbon Dioxide | mmHg | 35 – 45 | 96.29% | Forward fill + Zero padding |
| **Blood Gases & Acid-Base** |
| 9 | `BaseExcess` | Base Excess in Arterial Blood | mmol/L | -2 to +2 | 94.58% | Forward fill + Zero padding |
| 10 | `HCO3` | Serum Bicarbonate | mmol/L | 22 – 28 | 95.81% | Forward fill + Train median |
| 11 | `FiO2` | Fraction of Inspired Oxygen | Ratio (0.21–1.0) | 0.21 (Ambient air) | 91.66% | Forward fill + Default 0.21 |
| 12 | `pH` | Arterial Blood pH | pH scale | 7.35 – 7.45 | 93.07% | Forward fill + Train median (7.40) |
| 13 | `PaCO2` | Partial Pressure of Arterial CO2 | mmHg | 35 – 45 | 94.44% | Forward fill + Train median |
| 14 | `SaO2` | Arterial Oxygen Saturation | % | 95 – 100 | 96.55% | Forward fill + Train median |
| **Chemistry & Organ Function** |
| 15 | `AST` | Aspartate Aminotransferase | IU/L | 10 – 40 | 98.38% | Forward fill + Train median |
| 16 | `BUN` | Blood Urea Nitrogen | mg/dL | 7 – 20 | 93.13% | Forward fill + Train median |
| 17 | `Alkalinephos`| Alkaline Phosphatase | IU/L | 44 – 147 | 98.39% | Forward fill + Train median |
| 18 | `Calcium` | Serum Total Calcium | mg/dL | 8.5 – 10.2 | 94.12% | Forward fill + Train median |
| 19 | `Chloride` | Serum Chloride | mmol/L | 96 – 106 | 95.46% | Forward fill + Train median |
| 20 | `Creatinine` | Serum Creatinine | mg/dL | 0.6 – 1.2 | 93.90% | Forward fill + Train median |
| 21 | `Bilirubin_direct`| Direct (Conjugated) Bilirubin | mg/dL | 0.0 – 0.3 | 99.81% | Forward fill + Zero padding |
| 22 | `Bilirubin_total` | Total Serum Bilirubin | mg/dL | 0.2 – 1.2 | 98.51% | Forward fill + Train median |
| 23 | `Glucose` | Serum Glucose | mg/dL | 70 – 140 | 82.90% | Forward fill + Train median |
| 24 | `Lactate` | Blood Lactate | mmol/L | 0.5 – 2.0 | 97.33% | Forward fill + Train median |
| 25 | `Magnesium` | Serum Magnesium | mg/dL | 1.7 – 2.2 | 93.69% | Forward fill + Train median |
| 26 | `Phosphate` | Serum Phosphate | mg/dL | 2.5 – 4.5 | 95.99% | Forward fill + Train median |
| 27 | `Potassium` | Serum Potassium | mmol/L | 3.5 – 5.0 | 90.69% | Forward fill + Train median |
| 28 | `TroponinI` | Cardiac Troponin I | ng/mL | 0.0 – 0.04 | 99.05% | Forward fill + Zero padding |
| **Hematology & Coagulation** |
| 29 | `Hct` | Hematocrit | % | 36 – 50 | 91.14% | Forward fill + Train median |
| 30 | `Hgb` | Hemoglobin | g/dL | 12.0 – 17.5 | 92.62% | Forward fill + Train median |
| 31 | `PTT` | Partial Thromboplastin Time | seconds | 25 – 35 | 97.05% | Forward fill + Train median |
| 32 | `WBC` | White Blood Cell Count | $10^3$/$\mu$L | 4.0 – 11.0 | 93.59% | Forward fill + Train median |
| 33 | `Fibrinogen` | Serum Fibrinogen | mg/dL | 200 – 400 | 99.34% | Forward fill + Train median |
| 34 | `Platelets` | Platelet Count | $10^3$/$\mu$L | 150 – 450 | 94.06% | Forward fill + Train median |
| **Demographics & Administrative** |
| 35 | `Age` | Patient Age at Admission | years | $\ge 18$ | 0.00% | Preserved verbatim |
| 36 | `Gender` | Biological Sex | 0 (Female), 1 (Male) | Binary | 0.00% | Preserved verbatim |
| 37 | `Unit1` | Medical Intensive Care Unit (MICU) indicator | 0 or 1 | Binary | 39.41% | Zero filled |
| 38 | `Unit2` | Surgical Intensive Care Unit (SICU) indicator | 0 or 1 | Binary | 39.41% | Zero filled |
| 39 | `HospAdmTime` | Hours between Hospital and ICU Admission | hours (negative if admitted before ICU) | Negative real | <0.01% (8 records) | Median fill |
| 40 | `ICULOS` | ICU Length of Stay | hours | Integer $\ge 1$ | 0.00% | Preserved verbatim |

---

## 3. Target Label Definition & Warning Horizon

### 3.1 Sepsis-3 Operational Definition
In the PhysioNet CinC 2019 dataset, clinical sepsis onset ($t_{sepsis}$) is annotated using the international **Sepsis-3 consensus criteria**:
1. **Suspected Infection:** Identified by the temporal co-occurrence of blood culture sampling and antimicrobial administration within a defined window.
2. **Acute Organ Dysfunction:** Defined by an acute increase in the Sequential Organ Failure Assessment (SOFA) score of $\ge 2$ points attributed to the infection.

### 3.2 Label Annotation Scheme (`SepsisLabel`)
* For a patient who never develops sepsis:
  $$\text{SepsisLabel}(t) = 0, \quad \forall t \in [1, T]$$
* For a patient with clinical sepsis onset at hour $t_{sepsis}$:
  $$\text{SepsisLabel}(t) = \begin{cases} 
  0, & t < t_{sepsis} - 6 \\
  1, & t_{sepsis} - 6 \le t \le T 
  \end{cases}$$
* **Clinical Prediction Horizon:**
  * By defining $\text{SepsisLabel}(t) = 1$ starting at $t_{sepsis} - 6$, the model is explicitly trained to generate an alarm in the **6-hour prodromal window** prior to overt septic shock.
  * Windows with target label 1 in $[t_{sepsis} - 6, t_{sepsis})$ represent **true early warning predictions**.
  * Measurements strictly at or after $t_{sepsis}$ represent diagnosed active sepsis.

---

## 4. Normalization and Preprocessing Pipeline Standards

1. **Standardization Formula:**
   $$x'_{i, t, v} = \frac{x_{i, t, v} - \mu^{\text{train}}_v}{\sigma^{\text{train}}_v}$$
   where $\mu^{\text{train}}_v$ and $\sigma^{\text{train}}_v$ are computed exclusively across the 28,228 training patients.
2. **Imputation Integrity Rule:**
   * **Rule 1 (Temporal Causality):** Only previous observations ($t' \le t$) may be forward filled. Backward filling (`bfill`) is strictly prohibited.
   * **Rule 2 (Baseline Filling):** For variables missing prior to the first measurement, unscaled values are imputed with the pre-computed population median of the training cohort ($\text{median}^{\text{train}}_v$), ensuring no forward-looking information is injected.
