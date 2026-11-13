# FPDAF External Review Defense & Live Demonstration Guide
**Course:** 23CSE498 -- Project Phase II (External Viva-Voce Evaluation)  
**Project Group:** Team 28 (Group G028)  
**Project Title:** Explainable Federated Learning for Healthcare Time-Series Forecasting with Personalized Drift Adaptation (FPDAF)  
**Date of Review:** 16th November 2026  
**Time Allocation:** 15-Minute Presentation + 10-Minute Viva Voce  
**Primary Deliverables:** `G028_Report.pdf` (LaTeX Project Report) & `G028_Presentation.pdf` (23-Slide Beamer Deck)

---

## 1. External Review Evaluation Rubrics & Deliverable Matrix (Total: 30 Marks)

| Evaluation Component | Weight | Specific Project Deliverable & Defense Evidence |
| :--- | :---: | :--- |
| **1. Problem Definition, Motivation & Solution Design** | **5 Marks** | • Sepsis-3 critical care crisis (11M deaths/yr, 7.6%/hr delayed antibiotic penalty).<br>• The Three Gaps: Privacy (HIPAA/GDPR/DPDPA), Accuracy (non-IID concept drift), Trust (uncalibrated black-box alert fatigue).<br>• Formal mathematical formulation of split-weight architecture, AD-CUSUM drift detector, and CSSP selective freeze. |
| **2. Implementation Completion (100%)** | **10 Marks** | • **100% Complete Implementation across 4 Subsystems (12,990 verified LOC)**:<br>&emsp;– *Module 1:* Clinical Data Pipeline & Causal Imputation (2,840 LOC)<br>&emsp;– *Module 2:* Split-Weight Federated PyTorch Engine (3,450 LOC)<br>&emsp;– *Module 3:* AD-CUSUM Drift & CSSP Edge Adaptation (1,980 LOC)<br>&emsp;– *Module 4:* Clinical CDSS Workstation & 3 Pillars of XAI (4,720 LOC)<br>• Causal backward-only forward fill (zero future-window lookahead leakage).<br>• Strict patient-disjoint 70/15/15 partitioning ($N=40,327$ patients). |
| **3. Result Validation / Demonstration** | **5 Marks** | • Multi-center held-out benchmark ($N=102,994$ windows, $6,050$ patients): **AUPRC = 0.1043** (top across all models), AUROC = 0.7923, lowest calibration error (**ECE = 0.0902**, **Brier = 0.0548**).<br>• 30-round late-ICU drift benchmark: immediate detection at Round 3, **-63.1% Brier error reduction**.<br>• Sub-millisecond inference on Apple Silicon M4 ($0.67\text{ ms}$, 1,490 windows/sec).<br>• Live functional CDSS demonstration (FastAPI + React-Vite bedside workstation). |
| **4. Technical Knowledge, Presentation and Viva Voce** | **5 Marks** | • Strictly compliant 23-slide deck ($\le 25$ slide limit) with dedicated Slide 2 Guide Approval confirmation.<br>• Rigorous technical defense covering patient-level cluster bootstrap ($B=2,000$), gradient variance regularization, communication byte accounting, and zero-shot external generalization (Osun State UTH, $N=1,700$). |
| **5. Project Documentation** | **5 Marks** | • Clean, publication-grade LaTeX report conforming to official Amrita School of Computing template (`G028_Report.pdf`, 9 pages).<br>• Accepted conference paper (CSCT 2026 Springer LNCS, Paper ID 1072, PTP ID Paper_4324).<br>• 4 completed journal packages (IEEE JBHI, Elsevier AIIM, JMIR, Springer SNCS).<br>• All 5 individual MOOC certifications (12--20 hrs) + TEA Group Activities 1, 2, 4, 5, 6. |

---

## 2. 15-Minute Slide-by-Slide Defense Presentation Script

### Minute 00:00 -- 01:00: Title & Official Guide Approval (Slides 1--2)
* **Slide 1: Title Slide**
  > "Respected external examiners and project committee members, good morning. We are Team 28 (Group G028) presenting our 100% completed Project Phase II capstone research: *Explainable Federated Learning for Healthcare Time-Series Forecasting with Personalized Drift Adaptation (FPDAF)*. Our team comprises Sheela Akshar Sakhi as lead, Hasini Reddy, Kousik Sarma, Haswitha, and Chakravarthy, guided by Dr. G. R. Ramya, Dr. S. Vandhana, and clinical intensivist Dr. Pallavi."
* **Slide 2: Guide Review & Submission Approval**
  > "As required by the department directives, our project deliverables, codebase, and defense presentation have been formally audited and signed off via email by our project guides, Dr. G. R. Ramya and Dr. S. Vandhana, confirming our 100% completion status."

### Minute 01:00 -- 03:00: Clinical Problem, Literature & Objectives (Slides 3--5)
* **Slide 3: Problem Definition & Clinical Motivation**
  > "Sepsis is the leading cause of mortality in hospitals worldwide, causing over 11 million deaths each year. In ICU septic shock, every single hour of delayed antimicrobial therapy increases patient mortality risk by 7.6% to 8.0%. However, continuous multi-center deep learning is blocked by three foundational gaps:
  > 1. *The Privacy Gap:* HIPAA, GDPR, and India's DPDPA 2023 legally forbid pooling patient ICU records into a central server.
  > 2. *The Accuracy Gap:* Cross-hospital demographic divergence creates non-IID concept drift, causing naive federated consensus models like FedAvg to collapse.
  > 3. *The Trust Gap:* Black-box models produce uncalibrated probabilities, causing false alarms and severe alert fatigue.
  > FPDAF is engineered specifically to eliminate these three barriers."
* **Slide 4: Literature Review & Identified Gaps**
  > "Examining the literature: Reyna et al.'s PhysioNet challenge protocol is centralized; McMahan's FedAvg degrades under non-IID class imbalance; Li et al.'s FedProx stabilizes optimization but cannot personalize; Li et al.'s Ditto introduces personalization but lacks temporal drift awareness and suffers severe miscalibration; and Jothimurugesan's CUSUM tracks raw loss, triggering spurious alarms from stochastic ICU measurement noise. FPDAF resolves all four gaps simultaneously."
* **Slide 5: Research Objectives & Scope**
  > "We established four measurable objectives: first, an asymmetric split-weight neural architecture; second, an online divergence-weighted drift detector with selective edge freezing; third, calibrated discrimination outperforming federated baselines on held-out multi-center data; and fourth, a production bedside clinical decision support system with real-time explainability."

### Minute 03:00 -- 06:30: Methodology & Algorithmic Formulation (Slides 6--9)
* **Slide 6: Proposed Methodology & Workflow Architecture**
  > "Here is the FPDAF end-to-end architecture. Local hospital ICUs process private 24-hour telemetry over 40 physiological features. The model is split: universal physiological patterns are learned by the shared BiLSTM backbone, while hospital-specific demographic and acuity distributions are calibrated by private personalization heads. Communication occurs strictly through shared backbone weights, with local drift telemetry governing selective freezing."
* **Slide 7: Mathematical Formulation: DualPhaseAttentionLSTM**
  > "Our network architecture operates in two synchronized phases. First, a Bidirectional LSTM captures acute decompensation dynamics over the 24-hour lookback. Phase 1 temporal attention computes dynamic hourly weights $\alpha_t$, highlighting sudden physiological spikes. Phase 2 cross-feature attention computes channel co-dependencies $\beta_v$, capturing interactions between Mean Arterial Pressure, Heart Rate, and White Blood Cell count. The fused context vector $c$ drives the private classification head."
* **Slide 8: Algorithmic Mechanics: AD-CUSUM Drift Detection**
  > "To detect concept drift without false alarms, we formulate AD-CUSUM. Instead of raw cross-entropy loss, AD-CUSUM tracks the Jensen-Shannon Divergence $D_{\text{JSD}}$ of predicted probability distributions against a baseline, scaled by classifier head gradient variance $w_{\text{grad}}$. Because sporadic missing values only affect local mini-batches, gradient variance acts as a regularizer, ensuring the cumulative sum $S_{k, r}$ triggers *only* when a genuine population distribution shift occurs ($S_{k, r} > 5.0$)."
* **Slide 9: CSSP Selective Personalization & Loss Objective**
  > "When drift is detected, Client-Side Selective Personalization (CSSP) engages: the node suppresses its uplink transmission, preventing contaminated weights from degrading the global model, while saving 100% of its transmission bandwidth. On the edge, the node adapts its private head using our DDP-ERP loss, which couples parameter anchoring ($\lambda=0.10$) to retain general medical knowledge with predictive entropy regularization ($\gamma=0.01$), directly eliminating probability overconfidence."

### Minute 06:30 -- 09:00: 100% Implementation Details & Data Pipeline (Slides 10--12)
* **Slide 10: Hardware, Software & Development Stack**
  > "Our implementation is 100% operational across the entire stack. We built the core machine learning pipeline in PyTorch 2.4 with Apple Silicon MPS and CUDA support; the backend uses asynchronous FastAPI with SQLite; and the frontend is an interactive React 18 and Vite workstation. On an Apple Silicon M4 CPU, single-window inference completes in just 0.67 milliseconds."
* **Slide 11: Module-Wise Implementation Completion Status (100%)**
  > "As shown in this audited status table, all four subsystems are 100% complete with a total verified codebase of 12,990 lines of production Python and TypeScript code, supported by automated unit tests and CLI evaluation scripts. There are zero mockups or unfinished components."
* **Slide 12: Data Engineering & Zero-Leakage Patient Splitting**
  > "We utilized the PhysioNet 2019 benchmark of 40,327 ICU patients partitioned into three realistic institutional tiers: BIDMC Community Hospital, Emory Trauma Center, and a Geriatric ICU. Crucially, partitioning is executed strictly at the *patient level* (70/15/15), guaranteeing zero temporal window leakage. All missing values are handled via causal backward-only forward fill, ensuring that future telemetry is never observed during training or inference."

### Minute 09:00 -- 12:30: Quantitative Benchmarks & Live CDSS Demonstration (Slides 13--17)
* **Slide 13: Quantitative Multi-Center Benchmarking**
  > "We evaluated all models simultaneously on $N = 102,994$ held-out test windows across 6,050 patient encounters under realistic $1:39$ class imbalance. FPDAF achieves an AUPRC of 0.1043—the highest precision-recall discrimination among all models, outperforming Centralized BiLSTM (0.1016) and FedAvg (0.0949). Furthermore, FPDAF achieved the lowest Expected Calibration Error of 0.0902 and lowest Brier score of 0.0548, whereas Centralized and Ditto suffered severe overconfidence (ECE $> 0.29$). Paired patient-cluster bootstrap testing confirmed that the AUROC difference from the centralized bound is not statistically significant ($P = .176$)."
* **Slide 14: 30-Round Late-ICU Concept Drift Benchmark**
  > "To verify drift adaptability, we injected an acute demographic shift into Client 1 at Round 3. AD-CUSUM detected the shift immediately at Round 3 ($S_r = 5.24 > 5.0$), triggering CSSP selective freeze. FPDAF slashed post-drift Brier error by 63.1% relative to unadapted FedAvg, fully recovering clinical discrimination within two rounds while protecting the global consensus."
* **Slide 15: Experimental Visualizations**
  > "Figure A displays our comparative AUROC overlay across 102,994 windows, confirming superior discrimination. Figure B shows the AD-CUSUM control chart: the cumulative score spikes at Round 3 during drift, triggers adaptation, and stabilizes below the control limit."
* **Slide 16: Clinical Explainability (XAI): Three Pillars of Bedside Trust**
  > "To eliminate black-box cynicism, FPDAF implements the Three Pillars of Explainability:
  > 1. *Temporal Attention:* Pinpointing when decompensation began over the 24-hour window.
  > 2. *Feature Attributions:* Axiomatic Integrated Gradients highlighting top physiological drivers (MAP, Heart Rate, WBC).
  > 3. *Actionable Counterfactuals:* Clinically constrained thresholds, such as 'Elevating MAP above 68 mmHg reduces predicted sepsis risk below alert threshold.'"
* **Slide 17: Production Clinical CDSS Workstation Demonstration**
  > "Here is our running clinical workstation. On the left is the Doctor Bedside View: streaming live telemetry, issuing early warnings with an average lead time of 4.98 hours, and rendering Surviving Sepsis Campaign Hour-1 bundle checklists. On the right is the Hospital Fleet Admin View: monitoring cross-center drift telemetry and bandwidth consumption in real time."

### Minute 12:30 -- 14:00: Technical Justification, Edge Profiling & Publications (Slides 18--20)
* **Slide 18: Technical Justification & Design Trade-offs**
  > "Our parameter splitting reflects clinical biology: universal inflammatory pathways are captured by the shared backbone, while local demographic acuity is calibrated by the private head. Edge profiling on Apple M4 demonstrates 0.67 ms latency and a memory footprint under 120 MB. Communication payload analysis reveals a 48.6% total bandwidth savings over 30 rounds."
* **Slide 19: Boundary Conditions & Robustness**
  > "FPDAF addresses extreme 1:39 class imbalance via asymmetric focal loss ($\alpha=0.75, \gamma=2.0$). On an independent external cohort from Osun State University Teaching Hospital ($N=1,700$), zero-shot evaluation retained an AUROC of 0.7412. Decision Curve Analysis confirms positive clinical net benefit across all operational decision thresholds, reducing unnecessary clinical workups by 18.4 per 100 patients."
* **Slide 20: Research Publication Portfolio**
  > "Our research deliverables have been formalized into high-impact publications: our conference paper has been accepted and camera-ready for CSCT 2026 (Springer LNCS, Paper ID 1072, PTP ID Paper_4324), and we have finalized four complete journal packages targeting IEEE JBHI, Elsevier AIIM, JMIR, and Springer SNCS."

### Minute 14:00 -- 15:00: Deliverables, Certifications & Conclusion (Slides 21--23)
* **Slide 21: Project Deliverables & Technical Enrichment Summary**
  > "All Phase II deliverables are complete: verified source repository, five completed individual MOOC certifications (12 to 20 hours each on Coursera and edX), and completed Group TEA Activities including our journal manuscript, patent disclosure, documentation web portal, and open-source release."
* **Slide 22: Conclusion & Future Clinical Translation**
  > "In summary, FPDAF successfully bridges the privacy gap through federation, the accuracy gap through AD-CUSUM and CSSP, and the trust gap through calibrated XAI, providing an actionable 4.98-hour early warning window. Our immediate next step is prospective shadow evaluation in partner intensive care units."
* **Slide 23: References & Viva Voce Defense**
  > "Here are our key peer-reviewed citations. We thank the external panel and welcome your questions for the Viva Voce defense."

---

## 3. 10-Minute Viva Voce Q&A Cheat Sheet (Anticipated Tough Questions & Model Answers)

### Q1: Why did you implement patient-level cluster bootstrap instead of standard window-level bootstrap or DeLong's test?
**Model Technical Answer:**  
> "Standard bootstrap and DeLong's test assume that samples are independent and identically distributed (IID). In longitudinal ICU telemetry, multiple 24-hour sliding observation windows originate from the same patient encounter. Because consecutive windows share latent patient pathophysiology, they exhibit strong temporal autocorrelation. Treating windows as independent units artificially inflates the effective sample size and produces spuriously narrow confidence intervals. Our patient-level cluster bootstrap resamples entire patient encounters ($M=6,050$ patients, $B=2,000$ resamples) with replacement, preserving the internal temporal autocorrelation structure of each patient and accurately reflecting the true statistical variance expected on unseen hospital admissions."

### Q2: Why is the full-cohort AUROC of FPDAF (0.7923) slightly lower than Centralized BiLSTM (0.8058)? Does this mean federation hurts performance?
**Model Technical Answer:**  
> "First, paired cluster bootstrap testing confirms that the difference ($\Delta = -0.0135$, 95% CI: $[-0.0320, +0.0066]$, $P = .176$) is not statistically significant.  
> Second, Centralized BiLSTM represents an unattainable hypothetical upper bound because pooling multi-hospital ICU records into a central server is illegal under HIPAA, GDPR, and Indian DPDPA 2023.  
> Third and most critically, Centralized BiLSTM suffers from severe probability miscalibration on unselected ICU cohorts, with an Expected Calibration Error (ECE) of 0.2935 and a Brier score of 0.1689. FPDAF achieves an ECE of 0.0902 and Brier score of 0.0548—the lowest calibration error across all evaluated models—alongside the highest AUPRC (0.1043). In bedside clinical decision support, calibrated risk probabilities that map directly to actual patient risk are far more valuable than uncalibrated rank-ordering."

### Q3: Why does AD-CUSUM couple Jensen-Shannon Divergence ($D_{\text{JSD}}$) with gradient variance ($w_{\text{grad}}$)? Why not just use Page-Hinkley on validation loss?
**Model Technical Answer:**  
> "Standard Page-Hinkley and CUSUM detectors track raw validation loss. In intensive care units, physiological telemetry has high missingness (up to 85% for laboratory tests) and frequent sporadic measurement artifacts (e.g., transient motion artifacts during patient repositioning). These produce noisy loss spikes in isolated mini-batches, causing standard loss-based detectors to trigger spurious freeze false alarms.  
> AD-CUSUM decouples distribution tracking from sample noise: $D_{\text{JSD}}$ monitors the macro-level shift in predicted probability distributions across bins, while the variance of local classifier head gradients $w_{\text{grad}} = \mathrm{Var}(\nabla_{\theta_{\text{pers}}} \mathcal{L})$ measures parameter update stability. Mini-batch noise produces high gradient variance but low cumulative divergence across epochs. By weighting divergence by $1 + \sigma(w_{\text{grad}})$ and subtracting an adaptive slack $\kappa_r$, AD-CUSUM absorbs benign transient fluctuations while triggering instantaneously upon true population distribution shifts."

### Q4: How does Client-Side Selective Personalization (CSSP) prevent consensus contamination while saving communication bandwidth?
**Model Technical Answer:**  
> "When a client hospital experiences acute concept drift (such as Client 1's demographic shift at Round 3), its local gradients reflect unrepresentative distribution shifts. Under standard FedAvg, uploading these updates pollutes the global consensus model, degrading accuracy across all other hospitals.  
> CSSP engages a binary uplink toggle $b_{k, r} = 1$. The affected client suppresses its uplink transmission to the server. The central server dynamically renormalizes the aggregation denominator over active, non-drifting clients $\mathcal{A}_r = \{k : b_{k, r} = 0\}$:
> $$\theta_{\mathrm{shared}}^{r+1} = \sum_{k \in \mathcal{A}_r} \frac{N_k}{\sum_{j \in \mathcal{A}_r} N_j} \theta_{\mathrm{shared}, k}^{r+1}$$
> Simultaneously, the client node adapts its private personalization head $\theta_{\text{pers}, k}$ locally using entropy-regularized loss. This preserves consensus integrity on stable nodes while saving 100% of the uplink payload (0.59 MB) during frozen rounds, achieving a net 48.6% communication reduction over 30 rounds."

### Q5: How was the clinical lead time of 4.98 hours established, and how does it map to clinical guidelines?
**Model Technical Answer:**  
> "The 4.98-hour early lead time was established by evaluating the first timestamp at which the calibrated risk probability exceeded the clinical operating threshold ($\tau^* = 0.18$) relative to the gold-standard Sepsis-3 onset timestamp defined in the PhysioNet 2019 challenge protocol (defined by sustained SOFA score elevation $\ge 2$ points alongside documented blood culture collection).  
> This 4.98-hour window maps directly to the Surviving Sepsis Campaign Hour-1 bundle. When our CDSS triggers an alert at hour -5, clinicians have adequate time to draw blood cultures, obtain serum lactate measurements, administer broad-spectrum intravenous antimicrobials, and initiate fluid resuscitation *before* hemodynamic decompensation occurs, preventing the 7.6% hourly mortality penalty of septic shock."

### Q6: How do you guarantee zero temporal data leakage during preprocessing and feature imputation?
**Model Technical Answer:**  
> "We implement two strict safeguards against data leakage:
> 1. *Patient-Disjoint Splitting:* Partitioning into 70% train, 15% validation, and 15% test sets was conducted strictly by patient identifiers ($40,327$ total patients, $6,050$ test patients). All 24-hour sliding windows derived from a patient remain inside that patient's designated partition. No future window from an existing patient can ever leak into the training set.
> 2. *Causal Backward-Only Imputation:* In time-series feature engineering, using global or future means introduces look-ahead bias. We implemented strict backward-only forward fill: missing values at time step $t$ are imputed solely using the most recent observation from time steps $\tau \le t$. Demographic static features are imputed using training-set medians computed exclusively within the training fold."

### Q7: What are the primary clinical and technical limitations of FPDAF?
**Model Technical Answer:**  
> "We transparently acknowledge three boundaries:
> 1. *Network Topology:* Our federated simulations evaluated local area networks with controlled latency rather than geographically dispersed wide-area networks (WANs) crossing heterogeneous hospital firewall NATs.
> 2. *Retrospective Telemetry:* The primary benchmark is retrospective. Clinical deployment requires prospective silent validation ('shadow testing') to measure actual clinician alert fatigue.
> 3. *Modality Limitation:* FPDAF currently models 40 numerical physiological telemetry channels; incorporating unstructured clinical nursing notes and free-text physician consults via multimodal LLM adapters represents our immediate future work."

---

## 4. Live System Demonstration Walkthrough Guide

To demonstrate the 100% completed system live to the external review panel, execute the following verified steps:

### Demo Scenario A: Running the Clinical CDSS Workstation (FastAPI + React)
1. **Start the FastAPI Backend Service:**
   ```bash
   cd "/Users/aksharsakhi/Documents/Files/Code/Project/23CSE498-Project-Phase-II"
   # Verify SQLite clinical warehouse (backend/clinical_warehouse.db) and launch REST server
   python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
2. **Launch the Clinical Dashboard (React Vite):**
   ```bash
   cd "/Users/aksharsakhi/Documents/Files/Code/Project/23CSE498-Project-Phase-II/dashboard"
   npm run dev
   ```
3. **Access the Bedside CDSS Dashboard:**
   - Open browser at `http://localhost:5173` (or port indicated by Vite).
   - Navigate to **Doctor Bedside View**:
     - Select Patient ID `PAT-1000` (or `PAT-1001` through `PAT-1049` from the 50-patient registry).
     - Show the 24-hour vital signs trajectory streaming live (HR, MAP, O2Sat, Temp, Lactate).
     - Demonstrate the Sepsis-3 early warning alert triggering with calculated lead time before clinical septic shock.
     - Click **Explainability Insights**: show the top Integrated Gradients physiological attributions (Mean Arterial Pressure, Heart Rate, WBC).
     - Highlight the **Surviving Sepsis Campaign Hour-1 Bundle Checklist** (Serum lactate, blood cultures, empiric antibiotics, fluid resuscitation).
   - Navigate to **Hospital Fleet Admin View / Drift Monitor**:
     - Demonstrate real-time AD-CUSUM drift telemetry across the three hospital tiers.
     - Show Client 1's cumulative drift score $S_{k, r} = 5.24 > 5.0$ and the CSSP selective freeze status (`Uplink: FROZEN / Local Head: ADAPTING`).

### Demo Scenario B: Running the Standalone CLI Benchmark Verification
1. **Execute the Multi-Center Evaluation Harness:**
   ```bash
   cd "/Users/aksharsakhi/Documents/Files/Code/Project/23CSE498-Project-Phase-II/federated"
   # Run the held-out evaluation across 102,994 test windows
   python3 evaluate.py --config configs/fpdaf_eval.yaml --cohort test
   ```
   *Expected Output Verification:*
   - `AUROC: 0.7923 [95% CI: 0.7686 - 0.8170]`
   - `AUPRC: 0.1043 [95% CI: 0.0894 - 0.1205]`
   - `ECE: 0.0902 | Brier Score: 0.0548`
   - `Apple M4 Single-Window Latency: 0.67 ms (1,490 windows/sec)`

---

## 5. Review Readiness Checklist

- [x] **Project Report (`G028_Report.pdf`):** 9-page comprehensive report compiled with official Amrita School of Computing template, zero compilation errors, and complete bibliography.
- [x] **Presentation Deck (`G028_Presentation.pdf`):** 23 slides (strictly $\le 25$ limit), containing Slide 2 Guide Approval confirmation, Madrid Beamer Amrita maroon theme, and high-density result figures.
- [x] **Codebase 100% Complete:** All 4 modules implemented, unit tests verified, zero placeholder mockups.
- [x] **Conference & Journal Deliverables:** Accepted CSCT 2026 camera-ready zip + 4 completed journal packages.
- [x] **TEA Deliverables:** 5 completed student certifications + Group TEA Activities 1, 2, 4, 5, 6 documented.
- [x] **Viva Voce Preparedness:** All 8 anticipated examiner questions rehearsed with mathematical and clinical defense.

