# Springer Nature SN Computer Science Submission Cover Letter

**Journal:** SN Computer Science  
**Publisher:** Springer Nature Switzerland AG  
**Date:** October 24, 2026  

**To:**  
Prof. Ugo Fiore, Ph.D.  
Editor-in-Chief, SN Computer Science  
Parthenope University of Naples, Italy  
Email: `sncs@springernature.com`  

**Subject:** Submission of Original Research Paper — *"FPDAF: A Federated Personalized Drift-Aware Attention Framework for Privacy-Preserving Early Sepsis Forecasting in Multi-Center Critical Care"*

---

Dear Prof. Fiore and Distinguished Members of the Editorial Board,

On behalf of my co-authors from Amrita Vishwa Vidyapeetham and our clinical intensive care collaborators, I am pleased to submit our original research paper entitled **"FPDAF: A Federated Personalized Drift-Aware Attention Framework for Privacy-Preserving Early Sepsis Forecasting in Multi-Center Critical Care"** for consideration for publication as an **Original Research Article** in *SN Computer Science*.

### 1. Context & Systems Motivation
Early prediction of clinical sepsis in intensive care units is a high-priority challenge in critical care informatics. Sepsis is implicated in 11 million global fatalities annually, with survival dropping by 7.6% to 8.0% for each hour of delayed antimicrobial and fluid resuscitation therapy.

While modern deep recurrent neural networks can model multivariate ICU telemetry effectively, deploying them across hospital networks is obstructed by three foundational constraints:
1. **The Privacy Gap:** Strict statutory privacy mandates (HIPAA in the US, GDPR in Europe, and India's Digital Personal Data Protection Act 2023) prohibit centralizing sensitive health records;
2. **The Accuracy Gap:** Inter-institutional demographic shifts (community hospitals vs. trauma centers vs. academic referral networks) and temporal concept drift lead to severe degradation in conventional federated models;
3. **The Trust Gap:** Black-box neural architectures produce uncalibrated probabilities that induce clinical alert fatigue.

### 2. Methodological & Empirical Highlights
To address these challenges within a unified decentralized intelligence framework, this paper presents the **Federated Personalized Drift-Aware Attention Framework (FPDAF)**:
- **Adaptive Divergence-Weighted Cumulative Sum (AD-CUSUM):** A real-time statistical drift monitor coupling prediction entropy divergence ($D_{\text{JSD}}$) with local gradient variance ($w_{\text{grad}}$), eliminating false triggers from stochastic sensor noise while reliably detecting authentic population shifts.
- **Dynamic Dual-Phase Saliency & Entropy-Regularized Personalization (DDP-ERP):** Couples 4-head temporal self-attention with parameter anchoring and predictive entropy regularization, decoupling shared representations from local decision heads to prevent catastrophic forgetting.
- **Client-Side Selective Personalization (CSSP):** An edge-freezing protocol that suppresses client parameter uploads during drift adaptation, reducing communication bandwidth by up to **38.0%** in a 50-round deployment model (1.52 GB vs. 2.48 GB in Ditto).
- **Multi-Center Benchmarking on 40,327 ICU Patients:** Evaluated on 40,327 ICU admissions (1,551,697 hourly records) from the PhysioNet 2019 multi-center repository:
  - On the standardized 15,000-window client-stratified benchmark (prevalence 2.72%), FPDAF-v2 achieves an **AUROC of 0.7821** (patient-level cluster bootstrap 95% CI: 0.7447--0.8163; unadjusted window 95% CI: 0.7554--0.8088), an **AUPRC of 0.1241**, an ECE of **0.0961**, and a Brier score of **0.0585**, demonstrating comparable discrimination to personalized Ditto ($\Delta = +0.0025$, paired $P = .77$) alongside modest numerical calibration gains and concept-drift resilience. On a parallel global multi-center pooled benchmark (15,000 windows, prevalence 2.58%), FPDAF-v2 achieved higher discrimination than Centralized BiLSTM (AUROC 0.7309), FedAvg (0.7559), and FedProx (0.7676).
  - On the complete held-out test partition ($N=102,994$ windows across $M=6,050$ disjoint patients, prevalence 2.58%), continuous prediction serialization (`full_cohort_predictions.pt`) and patient-level cluster bootstrap verification ($B=2,000$ resamples with replacement) confirm that FPDAF-v2 delivers an **AUROC of 0.7923** (cluster bootstrap 95% CI: 0.7686--0.8170; unadjusted window 95% CI: 0.7820--0.8026), an Accuracy of **88.72%** at default threshold $\tau=0.50$ (with peak accuracy of **96.20%** at $\tau=0.65$), and lowest calibration error across all evaluated baselines (ECE **0.0902**, Brier **0.0548**). Paired cluster bootstrap difference testing against Centralized BiLSTM ($P = .176$), FedAvg ($P = .634$), FedProx ($P = .864$), and Ditto ($P = .459$) confirms statistically equivalent discrimination across architectures.
- **Dual Clinical Operating Modes:** Threshold tuning accommodates operational ICU workflows: an **Early Bedside Screening mode** ($\tau=0.08$, Sensitivity 80.15%, Specificity 63.85%) and a **High-Confidence Rule-In mode** ($\tau=0.65$, Accuracy 96.20%, Specificity 97.80%).
- **Interactive CDSS with Three-Pillar Explainability:** A production 3-tier Clinical Decision Support System providing temporal window attribution, physiological feature saliency via Integrated Gradients, and counterfactual intervention simulation with an advance warning lead time of **4.98 hours** on average (and 5.8 hours in exemplar cases) before clinical sepsis onset.

### 3. Submission Disclosures
- **Originality:** This paper represents original research, has not been published previously, and is not currently under consideration by any other journal.
- **Compliance with Ethical Standards:** All data were analyzed from de-identified PhysioNet 2019 records in full accordance with HIPAA Safe Harbor and India's DPDPA 2023. Protocol approval with waiver of informed consent was granted by the Institutional Ethics Committee of Amrita Vishwa Vidyapeetham.
- **Conflicts of Interest:** The authors declare no competing financial or personal conflicts of interest.
- **Data & Code Availability:** The full codebase, PyTorch models, and evaluation artifacts are maintained in an open repository: `https://github.com/aksharsakhi/23CSE498-Project-Phase-II`.

### 4. Suggested Peer Reviewers
1. **Prof. Supreeth P. Shashikumar, Ph.D.** — Harvard Medical School (`shashikumar@hms.harvard.edu`)
2. **Prof. Shamim Nemati, Ph.D.** — University of California San Diego (`snemati@ucsd.edu`)
3. **Prof. Tian Li, Ph.D.** — University of Chicago / Carnegie Mellon University (`tianli@uchicago.edu`)
4. **Prof. Christopher W. Seymour, MD, MSc** — University of Pittsburgh School of Medicine (`seymourcw@upmc.edu`)

Thank you for your editorial evaluation of our submission.

Respectfully submitted,

**Sheela Akshar Sakhi** (Corresponding Author)  
Department of Computer Science and Engineering, Amrita School of Computing  
Amrita Vishwa Vidyapeetham, Coimbatore 641112, India  
Email: `cb.sc.u4cse23547@cb.amrita.edu` • ORCID: `0009-0002-8931-419X`  

**Dr. G. R. Ramya, M.Tech, Ph.D** (Faculty Supervisor & Co-Corresponding Author)  
Assistant Professor (Sr. Gr.), Department of Computer Science and Engineering  
Amrita School of Computing, Amrita Vishwa Vidyapeetham, Coimbatore 641112, India  
Email: `gr_ramya@cb.amrita.edu` • ORCID: `0000-0002-7654-3210`  
