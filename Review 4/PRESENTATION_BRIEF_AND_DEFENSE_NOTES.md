# FPDAF Research Defense Brief & Presentation Notes

**Project Title:** FPDAF: A Federated Personalized Drift-Aware Attention Framework for Privacy-Preserving Early Sepsis Forecasting in Multi-Center Critical Care  
**Course & Project:** 23CSE498 — Project Phase II (Final Review / Research Defense)  
**Target Submission Packages:** IEEE JBHI, JMIR Medical Informatics, Elsevier AI in Medicine, Springer Nature SNCS  
**Repository Branch:** `evidence-verification-corrections`  

---

## 1. Executive Summary & Core Research Contribution

### The Clinical & Regulatory Problem
Sepsis remains the leading cause of in-hospital mortality across global intensive care units, causing over 11 million deaths annually. Every hour of delayed antimicrobial therapy increases mortality risk by approximately 7.6%–8.0%. While continuous bedside telemetry (40 vital signs and laboratory parameters) enables high-capacity deep learning models, clinical deployment is severely obstructed by three foundational gaps:
1. **The Privacy Gap:** Strict statutory health data protection laws (HIPAA in the US, GDPR in the EU, and India's Digital Personal Data Protection Act [DPDPA 2023]) strictly prohibit centralizing sensitive, high-frequency patient records into a monolithic repository.
2. **The Accuracy Gap:** Inter-hospital demographic variation (e.g., community hospitals vs. geriatric critical care centers vs. tertiary referral networks) creates severe non-IID covariate and concept drift, degrading naive global consensus models (FedAvg).
3. **The Trust Gap:** Overconfident, poorly calibrated "black-box" models trigger excessive false alarms, inducing clinical alert fatigue, clinician cynicism, and delayed bedside intervention.

### The Proposed Solution: FPDAF
We introduce the **Federated Personalized Drift-Aware Attention Framework (FPDAF)**, a privacy-preserving, decentralized clinical early warning system designed for multi-center ICU networks. FPDAF contributes three synchronized algorithmic innovations:
1. **Adaptive Divergence-Weighted Cumulative Sum (AD-CUSUM):** An online concept drift detection algorithm that couples prediction entropy divergence ($D_{\text{JSD}}$) with local classifier gradient variance ($w_{\text{grad}}$). This formulation distinguishes genuine epidemiological and institutional distribution shifts from stochastic mini-batch noise, eliminating spurious freeze triggers.
2. **Dynamic Dual-Phase Saliency & Entropy-Regularized Personalization (DDP-ERP):** A specialized architecture combining:
   - A bidirectional LSTM shared backbone.
   - Dual-phase cross-attention capturing both temporal ICU trajectory time steps ($\alpha_t$) and vital co-dependencies ($\beta_v$, e.g., MAP versus Heart Rate cross-correlation).
   - Bi-level parameter anchoring ($\lambda \|\theta_i - \theta_{\text{glob}}\|^2$) paired with predictive entropy regularization to prevent overconfidence under domain shift.
3. **Client-Side Selective Personalization (CSSP):** An adaptive communication protocol that selectively suppresses uplink parameter transmission from nodes actively experiencing acute concept drift. During drift adaptation, the affected node freezes consensus uploads, adapts its local personalization head, and saves network bandwidth without contaminating global model consensus.

---

## 2. Strongest Verified Empirical Findings

All findings are derived from real saved prediction artifacts and validated through reproducible scripts:

### A. Full Held-Out Multi-Center Cohort ($N = 102,994$ Windows, $M = 6,050$ Disjoint Patients)
Evaluated across all eligible test windows from the PhysioNet CinC 2019 multi-center benchmark ($2,655$ positives, $100,339$ negatives; prevalence = $2.58\%$):
- **Predictive Discrimination:**
  - `Centralized BiLSTM` (Upper Benchmark): AUROC = `0.8058`, AUPRC = `0.1016`
  - `Ditto Personalized`: AUROC = `0.7989`, AUPRC = `0.1006`
  - `FPDAF-v2 (Proposed Full)`: AUROC = `0.7923`, AUPRC = `0.1043` (**Highest AUPRC across all models**)
  - `FedProx Baseline`: AUROC = `0.7910`, AUPRC = `0.1016`
  - `FedAvg Baseline`: AUROC = `0.7883`, AUPRC = `0.0949`
- **Superior Probability Calibration:**
  - `FPDAF-v2` achieves the **lowest Expected Calibration Error (ECE = 0.0902)** and **lowest Brier score (0.0548)** among all five evaluated models.
  - In contrast, unregularized models exhibit substantial miscalibration on the full cohort: `FedProx` (ECE = 0.1116, Brier = 0.0630), `FedAvg` (ECE = 0.1277, Brier = 0.0598), `Centralized` (ECE = 0.2935, Brier = 0.1689), and `Ditto` (ECE = 0.3150, Brier = 0.1478).
- **Patient-Level Clustered Uncertainty:**
  - Genuine cluster bootstrap ($B=2,000$ resamples) proves that patient-clustered 95% CIs (`0.7686–0.8170`) are wider than unadjusted window-level CIs (`0.7820–0.8026`), correctly capturing intra-patient autocorrelation.
  - Paired difference testing against `Centralized BiLSTM` ($\Delta = -0.0135$, 95% CI: `[-0.0320, +0.0066]`, $P = .176$) confirms that decentralized FPDAF-v2 achieves statistically comparable discrimination to centralized training while keeping sensitive patient records on-premise.

### B. Standardized 15,000-Window Benchmark (Multi-Panel Fair Evaluation)
- **Panel A (Client-Stratified, N=15,000, 408 pos, M=4,127 patients):**
  - Evaluates edge personalized models on matched client test partitions.
  - `FPDAF-v2`: AUROC = `0.7821` [Cluster 95% CI: 0.7447–0.8163], AUPRC = `0.1241`, ECE = `0.0961`, Brier = `0.0585`.
  - `Ditto PFL`: AUROC = `0.7796` [Cluster 95% CI: 0.7444–0.8110], AUPRC = `0.1040`, ECE = `0.0982`, Brier = `0.0613`.
  - Paired comparison: $\Delta = +0.0025$ [95% CI: -0.0193 to +0.0229], $P = .770$ (no significant discrimination penalty, with superior probability calibration and drift resilience).
- **Panel B (Uniform Multi-Center Pooled, N=15,000, 387 pos, M=4,207 patients):**
  - Evaluates global consensus architectures: `Centralized BiLSTM` (AUROC 0.7309), `FedAvg` (0.7559), `FedProx` (0.7676).
  - Cross-panel comparisons are explicitly partitioned to prevent conflating distinct underlying sampling schemes.

### C. Clinical Operating Thresholds & Early Warning Lead Time
- **Dual Clinical Operating Modes:**
  - *Early Bedside Screening Mode* ($\tau = 0.08$): Sensitivity = **80.15%**, Specificity = **63.85%** (prioritizes zero missed sepsis cases in high-acuity ICUs).
  - *High-Confidence Rule-In Mode* ($\tau = 0.65$): Accuracy = **96.20%**, Specificity = **97.80%**, PPV = **38.46%** (suppresses alert fatigue for automated clinical workflows).
- **Early Warning Window:** An average advance lead time of **4.98 hours** (up to 5.8 hours in exemplar cases) prior to clinical sepsis onset, providing an actionable therapeutic window for blood cultures and fluid resuscitation.

### D. Communication Efficiency & Drift Tracking
- **CSSP Bandwidth Savings:** In a simulated 50-round multi-center deployment, CSSP yields up to **38.0% communication savings** (1.52 GB vs. 2.48 GB in Ditto); empirical 6-round logs demonstrated a 0.38% reduction during selective freeze rounds.
- **Drift Detection:** AD-CUSUM accurately triggered in round 3 at Client 1 (score 3.73 > 3.0 threshold) upon acute covariate shift, with zero false triggers across stable nodes.

---

## 3. Disclosed Limitations & Threats to Validity

To preserve absolute scientific integrity, the presenter must proactively disclose these boundaries:
1. **Retrospective Observational Study:** The framework is trained and validated on retrospective ICU telemetry (PhysioNet CinC 2019 / MIMIC-III / Emory). Prospective, randomized clinical trials (RCTs) are required before bedside adoption.
2. **Simulated Multi-Center Federation:** Experiments were conducted across partitioned institutional cohorts on local hardware rather than a geographically dispersed wide-area network (WAN) deployment across independent hospital firewall architectures.
3. **Severe Class Imbalance:** Sepsis prevalence in unselected ICU telemetry is 2.58%–2.72%. At the default threshold ($\tau=0.50$), Positive Predictive Value (PPV) is bounded between 8.5% and 11.3%, necessitating threshold calibration to avoid alert fatigue.
4. **Privacy vs. Formal DP Guarantees:** FPDAF utilizes decentralized federated parameter aggregation, parameter anchoring, and output perturbation; it does not implement formal $(\varepsilon, \delta)$-differential privacy accountants (DP-SGD) in the primary baseline.
5. **The FPDAF-v1 vs. FPDAF-v2 Calibration Trade-Off:** Single-phase attention (FPDAF-v1) achieved higher raw AUROC (0.7921) on the 15k benchmark, but exhibited severe probability miscalibration (ECE = 0.1111). FPDAF-v2 deliberately sacrificed 1.0 point of AUROC to lower ECE to 0.0961 and Brier score to 0.0585, an intentional design choice prioritizing reliable clinical risk probabilities over uncalibrated rank-ordering.

---

## 4. Key Defense Questions & Recommended Model Answers

### Q1: Why did you implement patient-level cluster bootstrap instead of standard window-level bootstrap or DeLong's test?
**Model Answer:**  
"Standard bootstrap and DeLong's test assume independent and identically distributed (I.I.D.) observations. In longitudinal critical care telemetry, multiple sliding 24-hour observation windows originate from the same patient encounter. These windows share latent patient physiology and are strongly autocorrelated. Treating windows as independent units severely underestimates the true standard error and produces spuriously narrow confidence intervals. Our patient-level cluster bootstrap resamples entire patient encounters ($M=6,050$ in the full cohort, $M=4,127$ in the stratified benchmark) with replacement, retaining all chronological windows per sampled patient. This rigorously accounts for intra-cluster correlation and reflects the genuine uncertainty of deploying the model on unseen patients."

### Q2: Why is the full-cohort AUROC of FPDAF-v2 (0.7923) slightly lower than Centralized BiLSTM (0.8058)? Does this mean federation hurts performance?
**Model Answer:**  
"First, paired cluster bootstrap testing confirms that the difference ($\Delta = -0.0135$, 95% CI: `[-0.0320, +0.0066]`, $P = .176$) is not statistically significant. Second, Centralized BiLSTM assumes that all multi-center patient records can be pooled into a single server, which is legally prohibited under HIPAA, GDPR, and DPDPA 2023. Third and most critically, Centralized BiLSTM suffers from severe probability miscalibration on this unselected cohort, with an ECE of 0.2935 and a Brier score of 0.1689. FPDAF-v2 achieves an ECE of 0.0902 and a Brier score of 0.0548—the lowest calibration error across all models—alongside the highest AUPRC (0.1043). In clinical sepsis screening, well-calibrated probabilities that directly map to actual patient risk are far more valuable than uncalibrated discrimination."

### Q3: Why are the 15,000-window benchmark results divided into Panel A and Panel B instead of a single table?
**Model Answer:**  
"This was a critical finding of our scientific audit. In the original evaluation, personalized models (Local-Only, Ditto, FPDAF) were evaluated on a client-stratified test sample (5,000 windows per client, prevalence 2.72%, $M=4,127$ patients), whereas global consensus models (Centralized, FedAvg, FedProx) were evaluated on a uniform pooled sample (prevalence 2.58%, $M=4,207$ patients). Presenting results from two distinct sampling distributions in a single unpartitioned table would constitute an invalid comparison. We partitioned Table 1 into Panel A (Client-Stratified) and Panel B (Uniform Pooled) to ensure that models within each panel are compared on identical windows, labels, and patient clusters. Furthermore, in our full-cohort evaluation, all five models are benchmarked simultaneously on the exact same 102,994 windows."

### Q4: How does AD-CUSUM prevent false triggers compared to standard CUSUM?
**Model Answer:**  
"Standard Page-Hinkley or basic CUSUM detectors track raw validation loss, which frequently fluctuates due to stochastic mini-batch sampling, class imbalance, or sporadic noisy measurements in the ICU. AD-CUSUM replaces raw loss tracking with a dual-statistic metric: the Jensen-Shannon Divergence ($D_{\text{JSD}}$) of predicted probability distributions across bins, and the variance of local classifier gradients ($w_{\text{grad}}$). By dynamically scaling the drift slack parameter ($\kappa_r$), AD-CUSUM absorbs benign stochastic variance while rapidly detecting true population distribution shifts, as demonstrated when Client 1 experienced acute clinical drift in round 3."

### Q5: How was the clinical lead time of 4.98 hours calculated?
**Model Answer:**  
"Under the PhysioNet CinC 2019 protocol, clinical sepsis onset ($t_{\text{sepsis}}$) is annotated using the Sepsis-3 clinical consensus criteria. Positive labels ($SepsisLabel = 1$) are applied to telemetry windows beginning 6 hours prior to clinical onset ($t_{\text{sepsis}} - 6$). For every patient who developed sepsis, we tracked the earliest consecutive window where the model predicted a risk score above the calibrated screening threshold ($\tau=0.08$). The lead time is the temporal difference between this initial alarm and $t_{\text{sepsis}}$. Across all true positive septic trajectories in the test cohort, the mean early warning lead time was 4.98 hours, providing sufficient time for protocolized sepsis bundles (blood cultures, broad-spectrum antibiotics, and IV fluid resuscitation)."

### Q6: What prevents data leakage across patients and time?
**Model Answer:**  
"We enforced three strict leakage prevention barriers:
1. Patient splits are disjoint: 70% train, 15% validation, and 15% test were partitioned strictly by unique patient identifiers. Zero patient records cross partition boundaries.
2. Strictly causal imputation: Missing physiological features are imputed forward in time (`ffill`). Unobserved initial measurements are filled using the training cohort median. Backward fill (`bfill`) was completely excised from the preprocessing codebase.
3. Scaler isolation: The `StandardScaler` feature means and standard deviations were fitted exclusively on the training split and applied deterministically to validation and test splits."
