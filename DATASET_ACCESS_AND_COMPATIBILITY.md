# FPDAF: Dataset Access, Provenance, and Multi-Center Compatibility Report

**Target Research System:** Federated Personalized Drift-Aware Attention Framework (FPDAF)  
**Document Status:** Complete Dataset Audit & Integration Analysis  
**Date:** October 2026  

---

## 1. Primary Benchmark Dataset Provenance

### 1.1 Dataset Identification & Licensing
* **Dataset Name:** PhysioNet / Computing in Cardiology (CinC) Challenge 2019: *Early Prediction of Sepsis from Clinical Data*.
* **URL:** [https://physionet.org/content/challenge-2019/1.0.0/](https://physionet.org/content/challenge-2019/1.0.0/)
* **License:** Open Data Commons Public Domain Dedication and License (PDDL v1.0) / Open Access.
* **Ethics & IRB:** Secondary computational analysis of de-identified open-access data, exempt from institutional review board oversight under US 45 CFR 46.104(d)(4) and Indian Council of Medical Research (ICMR) Ethical Guidelines.
* **Storage Location in Project:** `datasets/raw/training_setA` and `datasets/raw/training_setB`.

### 1.2 Institutional Provenance
The raw challenge data originates from two distinct healthcare systems in the United States:
1. **Hospital System A (`training_setA`):**
   * **Source Institution:** Beth Israel Deaconess Medical Center (Boston, MA, USA), extracted from the MIMIC-III critical care database.
   * **Patient Encounters:** 20,336 unique adult ICU admissions.
   * **Files:** `p000001.psv` through `p020336.psv`.
2. **Hospital System B (`training_setB`):**
   * **Source Institution:** Emory University Healthcare System (Atlanta, GA, USA), comprising two separate hospital facilities (Emory University Hospital and Emory University Hospital Midtown).
   * **Patient Encounters:** 19,991 unique adult ICU admissions.
   * **Files:** `p100001.psv` through `p119991.psv`.
3. **Withheld Hospital System C:**
   * A third tertiary academic hospital system was withheld by the PhysioNet CinC 2019 organizers for secret test-set scoring and is not publicly released.

### 1.3 Verified Dataset Counts (Code-Derived Ground Truth)
* **Total Raw Patients:** 40,327 (Set A: 20,336; Set B: 19,991).
* **Total Raw Hourly Records:** 1,551,697 hours.
* **Average ICU Stay:** 38.48 hours (Median: 38.0h, Min: 8h, Max: 336h).
* **Total Features per Hour:** 40 physiological variables + 1 target (`SepsisLabel`).
* **Sepsis-Positive Patients:** 2,931 patients (7.27% patient-level prevalence).
* **Sepsis-Negative Patients:** 37,396 patients (92.73%).
* **Extracted 24-Hour Sliding Windows:** 684,701 total windows.
  * **Train Split (70%):** 28,228 patients $\to$ 477,669 windows (12,513 positive = 2.62%).
  * **Validation Split (15%):** 6,049 patients $\to$ 104,038 windows (2,443 positive = 2.35%).
  * **Test Split (15%):** 6,050 patients $\to$ 102,994 windows (2,655 positive = 2.58%).

---

## 2. Audit of Candidate External Datasets

To evaluate expanding FPDAF beyond the primary PhysioNet 2019 cohort, five candidate biomedical intensive care datasets were systematically audited:

| Dataset | URL / Repository | Access Type | Credentialing Required | Primary Institutional Source | Sepsis Label Availability | Overlap with Current Data | Compatibility & Feasibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **eICU-CRD v2.0** | [PhysioNet eICU](https://physionet.org/content/eicu-crd/2.0/) | Restricted (PhysioNet Credentialed) | CITI training, DUA, ID verification | 335 ICUs across 208 US hospitals (Philips Healthcare) | Derived via ICD-9/10 or SOFA scoring | Zero overlap with PhysioNet 2019 Set B; potential minimal overlap with Set A | **Strongest candidate** for true multi-center cross-hospital federated generalization. Requires external credentialed download. |
| **MIMIC-IV v2.2** | [PhysioNet MIMIC-IV](https://physionet.org/content/mimiciv/2.2/) | Restricted (PhysioNet Credentialed) | CITI training, DUA, ID verification | Beth Israel Deaconess Medical Center (Boston, MA) | Derived via `mimic-code` Sepsis-3 concept queries | **High Overlap**: Set A of PhysioNet 2019 is a subset of MIMIC-III/IV | **Not Recommended for Independent Validation** due to shared patient lineage with Set A. |
| **HiRID v1.1.1** | [PhysioNet HiRID](https://physionet.org/content/hirid/1.1.1/) | Restricted (PhysioNet Credentialed) | CITI training, DUA, ID verification | Bern University Hospital (Inselspital), Bern, Switzerland | High-resolution physiological telemetry (2-min) | Zero overlap (European population) | **High Scientific Value** for international cross-border federated drift. Requires temporal downsampling (2-min to 1-h). |
| **Trajectory Flow ICU v1.0.0** | [PhysioNet Trajectory](https://physionet.org/content/clinical-trajectory-flow-icu/1.0.0/) | Restricted (PhysioNet Credentialed) | CITI training, DUA, ID verification | Subsets of MIMIC-IV and eICU | Designed for generative flow matching; no standardized hourly Sepsis-3 onset labels | Substantial overlap with MIMIC-IV/eICU | **Low Compatibility**: Lacks hourly sepsis event timing. |
| **SICdb v1.0.8** | [PhysioNet SICdb](https://physionet.org/content/sicdb/1.0.8/) | Open / Click-through DUA | PhysioNet Community account | Charité – Universitätsmedizin Berlin, Germany | Surgical ICU vitals; lacks standardized Sepsis-3 onset labels | Zero overlap (German surgical ICU) | **Moderate**: Open access, but requires manual Sepsis-3 consensus labeling from raw chart events. |

---

## 3. Legal, Ethical, and Credentialing Constraints

1. **Compliance with PhysioNet Governance:**
   Under PhysioNet's Data Use Agreement (DUA) for Credentialed Datasets (eICU, MIMIC-IV, HiRID), automated scripts are strictly prohibited from bypassing human credentialing or redistributing raw clinical records. Users must complete human-subjects CITI training and obtain credentialed account approval before downloading restricted partitions.
2. **Data Minimization & Localization:**
   In compliance with HIPAA Safe Harbor, GDPR Article 9 (Special Category Health Data), and India's Digital Personal Data Protection Act (DPDPA 2023), raw patient records must never be combined across institutions without verified institutional data transfer agreements.

---

## 4. Multi-Center Federated Client Partition Strategy

To align the codebase with rigorous scientific honesty without misrepresenting synthetic splits as real hospitals:

### 4.1 Ground-Truth Client Attribution
* **Hospital Node 1 (Tertiary Academic Center - Set A):** 
  * Patient population from Beth Israel Deaconess Medical Center (`training_setA`).
  * Characteristic: Comprehensive lab testing, high arterial blood gas (ABG) sampling frequency.
* **Hospital Node 2 (Multi-Facility Health System - Set B):**
  * Patient population from Emory University Healthcare (`training_setB`).
  * Characteristic: Distinct geographic demographic (Southeastern US), distinct EHR instrumentation.
* **Hospital Node 3 (Simulated High-Acuity / Geriatric Satellite):**
  * Sub-cohort stratified from Hospital A by age ($\ge 60$ years) and ICU length of stay, explicitly labeled as a **Non-IID Demographic Partition** rather than a fabricated independent medical center.

### 4.2 Modular External Dataset Ingestion Pipeline
To support researchers who hold active PhysioNet credentials for eICU or HiRID, the project provides a standardized ingestion interface in `preprocessing/external_loaders.py`:
* `EICUDataIngester`: Maps eICU `vitalPeriodic`, `lab`, and `patient` tables to the 40 FPDAF clinical features.
* `HiRIDDataIngester`: Aggregates 2-minute Inselspital telemetry into hourly sliding windows and aligns with international units.
* Marked as **Optional / External Plugin** until credentialed local data is provided.
