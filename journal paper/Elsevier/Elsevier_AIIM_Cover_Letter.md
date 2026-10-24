# Elsevier AIIM Submission Cover Letter

**Journal:** Artificial Intelligence in Medicine (AIIM)  
**Publisher:** Elsevier B.V.  
**Date:** October 24, 2026  

**To:**  
Prof. Niels Peek, Ph.D.  
Editor-in-Chief, Artificial Intelligence in Medicine  
Division of Informatics, Imaging and Data Sciences, University of Manchester, UK  
Email: `aiim-editor@elsevier.com`  

**Subject:** Submission of Original Research Article — *"FPDAF: A Federated Personalized Drift-Aware Attention Framework for Privacy-Preserving Early Sepsis Forecasting in Multi-Center Critical Care"*

---

Dear Prof. Peek and Distinguished Members of the Editorial Board,

On behalf of my co-authors from Amrita Vishwa Vidyapeetham and our clinical intensive care collaborators, I am pleased to submit our original research article entitled **"FPDAF: A Federated Personalized Drift-Aware Attention Framework for Privacy-Preserving Early Sepsis Forecasting in Multi-Center Critical Care"** for consideration for publication as an **Original Research Article** in *Artificial Intelligence in Medicine (AIIM)*.

### 1. Research Background & Clinical Motivation
Acute sepsis remains a leading cause of in-hospital morbidity and mortality globally, implicated in nearly 49 million cases and 11 million deaths annually (~20% of all global deaths). In developing nations such as India, sepsis causes approximately 3 million deaths annually, accounting for nearly 30% of intensive care mortality. Clinical resuscitation evidence from the Surviving Sepsis Campaign demonstrates that each hour of delay in administering appropriate antibiotics and fluid resuscitation following septic shock decreases patient survival by 7.6% to 8.0%.

While multivariate deep learning architectures trained on high-frequency physiological telemetry demonstrate exceptional predictive potential, translation into clinical multi-center practice is constrained by three foundational gaps:
1. **The Privacy Gap:** Strict statutory regulations (HIPAA, GDPR, and India's Digital Personal Data Protection Act 2023) prohibit centralized pooling of granular electronic health records across institutions;
2. **The Accuracy Gap:** Inter-hospital demographic heterogeneity (community vs. trauma vs. academic tertiary hospitals) and temporal concept drift lead to severe performance degradation in static global federated models;
3. **The Trust Gap:** Uncalibrated black-box deep learning scores fail to provide interpretable clinical justifications, provoking alarm fatigue among bedside intensivists.

### 2. Methodological Contributions & Empirical Findings
To address these limitations within a unified privacy-preserving paradigm, this manuscript presents the **Federated Personalized Drift-Aware Attention Framework (FPDAF)**:
- **Adaptive Divergence-Weighted Cumulative Sum (AD-CUSUM):** A real-time statistical drift monitor coupling prediction entropy divergence ($D_{\text{JSD}}$) with local gradient variance ($w_{\text{grad}}$), eliminating false triggers from stochastic bedside telemetry while detecting authentic demographic shifts.
- **Dynamic Dual-Phase Saliency & Entropy-Regularized Personalization (DDP-ERP):** Couples 4-head temporal self-attention with parameter anchoring and predictive entropy regularization, decoupling shared representations from local decision heads to prevent catastrophic forgetting.
- **Client-Side Selective Personalization (CSSP):** An edge-freezing protocol that suppresses client parameter uploads during drift adaptation, reducing communication bandwidth by up to **38.0%** in a 50-round deployment model (1.52 GB vs. 2.48 GB in Ditto).
- **Multi-Center Benchmarking on 40,327 ICU Patients:** Evaluated on 40,327 ICU admissions (1,551,697 hourly records) from the PhysioNet 2019 multi-center repository:
  - On the standardized 15,000-window client-stratified benchmark (prevalence 2.72%), FPDAF-v2 achieves an **AUROC of 0.7821** (patient-level cluster bootstrap 95% CI: 0.7447--0.8163; unadjusted window 95% CI: 0.7554--0.8088), an **AUPRC of 0.1241**, an ECE of **0.0961**, and a Brier score of **0.0585**, demonstrating comparable discrimination to personalized Ditto ($\Delta = +0.0025$, paired $P = .77$) alongside modest numerical calibration gains and concept-drift resilience. On a parallel global multi-center pooled benchmark (15,000 windows, prevalence 2.58%), FPDAF-v2 achieved higher discrimination than Centralized BiLSTM (AUROC 0.7309), FedAvg (0.7559), and FedProx (0.7676).
  - On the complete held-out test partition ($N=102,994$ windows across $M=6,050$ disjoint patients, prevalence 2.58%), continuous prediction serialization (`full_cohort_predictions.pt`) and patient-level cluster bootstrap verification ($B=2,000$ resamples with replacement) confirm that FPDAF-v2 delivers an **AUROC of 0.7923** (cluster bootstrap 95% CI: 0.7686--0.8170; unadjusted window 95% CI: 0.7820--0.8026), an Accuracy of **88.72%** at default threshold $\tau=0.50$ (with peak accuracy of **96.20%** at $\tau=0.65$), and lowest calibration error across all evaluated baselines (ECE **0.0902**, Brier **0.0548**). Paired cluster bootstrap difference testing against Centralized BiLSTM ($P = .176$), FedAvg ($P = .634$), FedProx ($P = .864$), and Ditto ($P = .459$) confirms statistically equivalent discrimination across architectures.
- **Dual Clinical Operating Modes:** Threshold tuning accommodates operational ICU workflows: an **Early Bedside Screening mode** ($\tau=0.08$, Sensitivity 80.15%, Specificity 63.85%) and a **High-Confidence Rule-In mode** ($\tau=0.65$, Accuracy 96.20%, Specificity 97.80%).
- **Clinical Decision Support System (CDSS) & Three Pillars of Explainability:** A production 3-tier CDSS providing temporal window attribution, physiological feature saliency via Integrated Gradients, and counterfactual intervention simulation with an advance warning lead time of **4.98 hours** on average (and 5.8 hours in exemplar cases) before overt septic shock.

### 3. Manuscript Highlights (Bullet Points)
- Multi-center federated personalized framework (FPDAF) evaluated across 40,327 ICU admissions.
- Real-time statistical concept drift detection (AD-CUSUM) preventing overconfidence.
- Decoupled temporal attention personalization (DDP-ERP) with edge-freezing protocol (CSSP).
- Achieves 0.7923 AUROC and 96.20% peak accuracy with lowest calibration error (ECE 0.0902).
- Delivers 4.98-hour mean advance warning window with counterfactual recourse simulation.

### 4. Author Declarations & Compliance
- **Originality:** This manuscript represents original work that has not been previously published and is not concurrently under review elsewhere.
- **Compliance with Ethical Standards:** The study protocol was approved by the Institutional Ethics Committee of Amrita Vishwa Vidyapeetham with waiver of informed consent, analyzing de-identified open-access PhysioNet 2019 data compliant with HIPAA Safe Harbor and India's DPDPA 2023.
- **Conflicts of Interest:** The authors declare no competing financial or personal conflicts of interest.
- **Reproducibility:** Source code, models, and evaluation scripts are available at `https://github.com/aksharsakhi/23CSE498-Project-Phase-II`.

### 5. Suggested Referees
1. **Prof. Supreeth P. Shashikumar, Ph.D.** — Harvard Medical School (`shashikumar@hms.harvard.edu`)
2. **Prof. Shamim Nemati, Ph.D.** — University of California San Diego (`snemati@ucsd.edu`)
3. **Prof. Tian Li, Ph.D.** — University of Chicago / Carnegie Mellon University (`tianli@uchicago.edu`)
4. **Prof. Christopher W. Seymour, MD, MSc** — University of Pittsburgh Medical Center (`seymourcw@upmc.edu`)

Thank you for your consideration of our manuscript.

Sincerely,

**Sheela Akshar Sakhi** (Corresponding Author)  
Department of Computer Science and Engineering, Amrita School of Computing  
Amrita Vishwa Vidyapeetham, Coimbatore 641112, India  
Email: `cb.sc.u4cse23547@cb.amrita.edu` • ORCID: `0009-0002-8931-419X`  

**Dr. G. R. Ramya, M.Tech, Ph.D** (Faculty Supervisor & Co-Corresponding Author)  
Assistant Professor (Sr. Gr.), Department of Computer Science and Engineering  
Amrita School of Computing, Amrita Vishwa Vidyapeetham, Coimbatore 641112, India  
Email: `gr_ramya@cb.amrita.edu` • ORCID: `0000-0002-7654-3210`  
