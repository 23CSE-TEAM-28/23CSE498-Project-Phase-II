# FPDAF: Remaining Research Work, Inaccessible Data, & Future Roadmap

This document provides a transparent, rigorous accounting of all components, external datasets, computational experiments, and clinical validations that remain incomplete, inaccessible due to institutional credentialing, or scheduled for future multi-center research phases.

---

## 1. External ICU Datasets & Credentialing Status

In accordance with Section 4 of the research protocol, five major critical care databases were investigated for cross-institutional evaluation. None of these restricted databases can be downloaded or integrated without authorized individual credentials:

| Dataset | Access Status | Reason / Blocker | Integration Plan & Readiness |
| :--- | :--- | :--- | :--- |
| **PhysioNet/CinC 2019** | **Active & Verified** | Primary benchmark. 40,327 patients, 1,551,697 hourly records across 2 hospital cohorts (BIDMC + Emory). | **Fully Integrated.** Leakage-free, causal forward-fill + train median baseline, 684,701 sliding 24h windows. |
| **MIMIC-IV (v2.2)** | **Restricted / Pending Approval** | Requires completion of CITI "Data or Specimens Only Research" training, signed Data Use Agreement (DUA), and PhysioNet credentialed account. | Modular loader specification created in `DATASET_ACCESS_AND_COMPATIBILITY.md`. Code ready once credentials are provided. |
| **eICU-CRD (v2.0)** | **Restricted / Pending Approval** | Multi-center database covering 208 US hospitals. Requires identical CITI training and DUA approval. | Natural target for true multi-center federated evaluation (genuine hospital IDs available). |
| **HiRID (v1.1.1)** | **Restricted / Pending Approval** | Swiss tertiary ICU dataset (Bern University Hospital). High-resolution monitoring (2-min resolution). Requires PhysioNet Credentialed DUA. | Resampling module (downsampling from 2-min to 1-hour resolution) designed in architecture. |
| **Trajectory Flow ICU** | **Derived / Restricted** | Derived from MIMIC-III and eICU. Carries identical credentialing requirements as parent databases. | Redundant with direct MIMIC-IV / eICU evaluation. |
| **SICdb (v1.0.8)** | **Restricted Research Access** | Graz University Hospital (Austria). Surgical intensive care cohort. Requires data request form. | Feasible secondary benchmark for European surgical ICU population drift. |

> [!IMPORTANT]
> **Action Required for Phase III:** To evaluate FPDAF across real independent health systems rather than demographic splits, the principal investigator must complete CITI credentialing on PhysioNet and link the authorized credential to download eICU-CRD.

---

## 2. Experimental & Computational Limitations

### 2.1 Compute Budget vs. Exhaustive Multi-Seed Runs
- **Current Execution:** Master experiments were executed with a stratified budget ($N = 12,000$ training windows per client, $N = 15,000$ test windows) across 5–10 communication rounds on Apple Metal GPU (`mps`).
- **Exhaustive Scale:** Training 50 rounds across the entire 477,669 sliding-window cohort without subsampling requires approximately 14–18 hours of continuous compute on local hardware. A cloud-based cluster (NVIDIA A100 / H100) is recommended for final multi-seed (10 random seeds) confidence interval generation prior to journal camera-ready submission.

### 2.2 Physical Multi-Node Network Deployment
- **Simulated Communication:** Communication payloads and transfer times are currently measured via exact in-memory state dictionary serialization (`compute_state_dict_bytes` in `federated/server/server.py`).
- **Real-World WAN Deployment:** Testing actual socket latency, TLS encryption overhead, dropout robustness, and asynchronous aggregation over real wide-area networks (WAN) connecting disparate hospital firewalls requires deploying dedicated nodes across physically separated cloud VPCs (e.g. using Flower or gRPC).

---

## 3. Clinical & Methodological Frontiers

### 3.1 Prospective Interventional Validation
- **Current Validation:** The 5.8-hour early warning horizon is established retrospectively on historical ICU admissions where sepsis onset was clinically adjudicated ($t_{sepsis}$).
- **Remaining Need:** Prospective observational and silent-mode clinical trials in an active ICU setting are required to measure real clinician alert fatigue, alert acceptance rate, and actual reduction in time-to-antibiotic administration.

### 3.2 Formal Differential Privacy at Production Scale
- **Current State:** DP-SGD gradient clipping and Gaussian noise mechanisms were implemented in `LocalTrainer` and evaluated in ablation benchmarks ($\epsilon \approx 4.5, \delta = 10^{-5}$).
- **Remaining Need:** Rigorous Rényi Differential Privacy (RDP) accounting integrated with cryptographically secure multi-party computation (SMPC) or SecAgg+ for joint privacy against curious aggregation servers.

---

## 4. Manuscript Revision Handoff (Prompt 2)

As specified in the execution rules:
- **No LaTeX manuscripts were overwritten** during this phase.
- All genuine machine-generated metrics, corrected patient and window counts, audited client provenance, and newly generated publication figures are recorded in `EXPERIMENT_RESULTS.md` and `PROJECT_AUDIT.md`.
- **Prompt 2** will execute the comprehensive text and table revisions in `journal paper/JMIR/main.tex` and IEEE conference drafts.
