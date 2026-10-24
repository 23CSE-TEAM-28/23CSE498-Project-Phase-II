# IEEE JBHI Submission Cover Letter

**Journal:** IEEE Journal of Biomedical and Health Informatics (IEEE JBHI)  
**Publisher:** IEEE Engineering in Medicine and Biology Society (EMBS)  
**Date:** October 24, 2026  

**To:**  
Prof. Paolo Bonato, Ph.D.  
Editor-in-Chief, IEEE Journal of Biomedical and Health Informatics  
Department of Physical Medicine and Rehabilitation, Harvard Medical School  
Email: `jbhi-editor@ieee.org`  

**Subject:** Submission of Original Research Paper — *"FPDAF: A Federated Personalized Drift-Aware Attention Framework for Privacy-Preserving Early Sepsis Forecasting in Multi-Center Critical Care"*

---

Dear Prof. Bonato and Distinguished Members of the Editorial Board,

On behalf of my co-authors from Amrita Vishwa Vidyapeetham and our clinical intensive care collaborators, I am pleased to submit our original research manuscript entitled **"FPDAF: A Federated Personalized Drift-Aware Attention Framework for Privacy-Preserving Early Sepsis Forecasting in Multi-Center Critical Care"** for consideration as a **Regular Research Paper** in the *IEEE Journal of Biomedical and Health Informatics (IEEE JBHI)*.

### 1. Clinical Context & Engineering Motivation
Early detection of clinical sepsis in Intensive Care Units (ICUs) is essential to avert septic shock, refractory vasodilation, and multiple organ dysfunction syndrome. Clinical resuscitation guidelines (Surviving Sepsis Campaign Hour-1 Bundle) demonstrate that each hour of delay in administering appropriate antibiotics and fluid resuscitation following septic shock decreases patient survival by approximately 7.6% to 8.0%.

While multivariate deep learning algorithms trained on continuous ICU telemetry achieve high predictive accuracy, translation to multi-hospital networks is blocked by three foundational barriers:
1. **The Privacy Gap:** Stringent statutory frameworks (HIPAA in the US, GDPR in Europe, and India's Digital Personal Data Protection Act 2023) strictly prohibit central pooling of patient telemetry across institutions;
2. **The Accuracy Gap:** Severe inter-hospital Non-IID demographic shifts and temporal concept drift (e.g., geriatric community vs. acute trauma vs. tertiary referral oncology centers) degrade static global federated models;
3. **The Trust Gap:** Opaque, uncalibrated deep learning outputs produce high false alarm rates, exacerbating clinician alert fatigue.

### 2. Scientific Contributions & Empirical Highlights
To resolve all three challenges within a unified architecture, this paper presents the **Federated Personalized Drift-Aware Attention Framework (FPDAF)**:
- **Adaptive Divergence-Weighted Cumulative Sum (AD-CUSUM):** A real-time statistical drift monitor coupling prediction entropy divergence ($D_{\text{JSD}}$) with parameter gradient variance ($w_{\text{grad}}$), eliminating false triggers from stochastic sensor noise while detecting authentic population shifts.
- **Dynamic Dual-Phase Saliency & Entropy-Regularized Personalization (DDP-ERP):** Couples 4-head temporal self-attention with parameter anchoring and predictive entropy regularization, adapting local hospital heads without catastrophic forgetting.
- **Client-Side Selective Personalization (CSSP):** An edge-freezing protocol that suppresses client parameter uploads during drift adaptation, reducing communication bandwidth by up to **38.0%** in a 50-round deployment model (1.52 GB vs. 2.48 GB in Ditto).
- **Multi-Center Benchmarking on 40,327 ICU Patients:** Evaluated on 40,327 ICU admissions (1,551,697 hourly records) from the PhysioNet 2019 multi-center repository:
  - On the standardized 15,000-window client-stratified benchmark (prevalence 2.72%), FPDAF-v2 achieves an **AUROC of 0.7821** (patient-level cluster bootstrap 95% CI: 0.7447--0.8163; unadjusted window 95% CI: 0.7554--0.8088), an **AUPRC of 0.1241**, an ECE of **0.0961**, and a Brier score of **0.0585**, demonstrating comparable discrimination to personalized Ditto ($\Delta = +0.0025$, paired $P = .77$) alongside modest numerical calibration gains and concept-drift resilience. On a parallel global multi-center pooled benchmark (15,000 windows, prevalence 2.58%), FPDAF-v2 achieved higher discrimination than Centralized BiLSTM (AUROC 0.7309), FedAvg (0.7559), and FedProx (0.7676).
  - On the complete held-out test partition ($N=102,994$ windows across $M=6,050$ disjoint patients, prevalence 2.58%), continuous prediction serialization (`full_cohort_predictions.pt`) and patient-level cluster bootstrap verification ($B=2,000$ resamples with replacement) confirm that FPDAF-v2 delivers an **AUROC of 0.7923** (cluster bootstrap 95% CI: 0.7686--0.8170; unadjusted window 95% CI: 0.7820--0.8026), an Accuracy of **88.72%** at default threshold $\tau=0.50$ (with peak accuracy of **96.20%** at $\tau=0.65$), and lowest calibration error across all evaluated baselines (ECE **0.0902**, Brier **0.0548**). Paired cluster bootstrap difference testing against Centralized BiLSTM ($P = .176$), FedAvg ($P = .634$), FedProx ($P = .864$), and Ditto ($P = .459$) confirms statistically equivalent discrimination across architectures.
- **Dual Clinical Operating Modes:** Threshold tuning accommodates operational ICU workflows: an **Early Bedside Screening mode** ($\tau=0.08$, Sensitivity 80.15%, Specificity 63.85%) and a **High-Confidence Rule-In mode** ($\tau=0.65$, Accuracy 96.20%, Specificity 97.80%).
- **Interactive CDSS with Three-Pillar Explainability:** A production 3-tier Clinical Decision Support System providing temporal window attribution, physiological feature saliency via Integrated Gradients, and counterfactual intervention simulation with an advance warning lead time of **4.98 hours** on average (and 5.8 hours in exemplar cases) before clinical sepsis diagnosis.

### 3. Submission Disclosures
- **Originality & Prior Publication:** This manuscript represents original research, has not been published previously, and is not currently under consideration by any other journal or conference.
- **Data Governance & Ethics:** The study analyzed de-identified ICU telemetry from the PhysioNet Computing in Cardiology Challenge 2019 database, in full compliance with HIPAA Safe Harbor and India's DPDPA 2023. The Institutional Ethics Committee of Amrita Vishwa Vidyapeetham approved the study protocol with waiver of informed consent.
- **Reproducibility & Open Source:** The complete PyTorch codebase, preprocessing pipelines, model checkpoints, and evaluation artifacts are maintained in an open-access GitHub repository: `https://github.com/aksharsakhi/23CSE498-Project-Phase-II`.
- **Authorship Consensus & Conflicts of Interest:** All co-authors have reviewed and approved the manuscript for submission. The authors declare no competing financial or personal interests.

### 4. Suggested Peer Reviewers
1. **Prof. Supreeth P. Shashikumar, Ph.D.**  
   Department of Biomedical Informatics, Harvard Medical School  
   Expertise: Deep learning in critical care, early sepsis forecasting, clinical alert systems  
   Email: `shashikumar@hms.harvard.edu`

2. **Prof. Shamim Nemati, Ph.D.**  
   Department of Biomedical Informatics, University of California San Diego  
   Expertise: Physiological time-series forecasting, sepsis surveillance, clinical decision support  
   Email: `snemati@ucsd.edu`

3. **Prof. Tian Li, Ph.D.**  
   Department of Computer Science, University of Chicago / Carnegie Mellon University  
   Expertise: Federated learning optimization, personalized federated algorithms, proximal methods  
   Email: `tianli@uchicago.edu`

4. **Prof. Christopher W. Seymour, MD, MSc**  
   Department of Critical Care Medicine, University of Pittsburgh School of Medicine  
   Expertise: Sepsis epidemiology, clinical phenotypes, Surviving Sepsis Campaign guidelines  
   Email: `seymourcw@upmc.edu`

Thank you very much for your time and consideration of our work.

Respectfully submitted,

**Sheela Akshar Sakhi** (Corresponding Author)  
Department of Computer Science and Engineering, Amrita School of Computing  
Amrita Vishwa Vidyapeetham, Coimbatore 641112, India  
Email: `cb.sc.u4cse23547@cb.amrita.edu` • ORCID: `0009-0002-8931-419X`  

**Dr. G. R. Ramya, M.Tech, Ph.D** (Faculty Supervisor & Co-Corresponding Author)  
Assistant Professor (Sr. Gr.), Department of Computer Science and Engineering  
Amrita School of Computing, Amrita Vishwa Vidyapeetham, Coimbatore 641112, India  
Email: `gr_ramya@cb.amrita.edu` • ORCID: `0000-0002-7654-3210`  
