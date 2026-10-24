# JMIR Submission Cover Letter

**Journal:** Journal of Medical Internet Research (JMIR)  
**Publisher:** JMIR Publications Inc.  
**Date:** October 24, 2026  

**To:**  
Prof. Gunther Eysenbach, MD, MPH, FACMI  
Editor-in-Chief, Journal of Medical Internet Research  
JMIR Publications Inc., Toronto, ON, Canada  
Email: submissions@jmir.org  

**Subject:** Submission of Original Research Article — *"Federated Personalized Drift-Aware Attention Framework for Early Sepsis Forecasting Across Multi-Center Intensive Care Units: Retrospective Model Development and Validation Study"*

---

Dear Prof. Eysenbach and Distinguished Members of the Editorial Board,

On behalf of my co-authors from Amrita Vishwa Vidyapeetham and our clinical intensive care collaborators, I am pleased to submit our original research manuscript entitled **"Federated Personalized Drift-Aware Attention Framework for Early Sepsis Forecasting Across Multi-Center Intensive Care Units: Retrospective Model Development and Validation Study"** for consideration as an **Original Paper** in the *Journal of Medical Internet Research (JMIR)*.

### 1. Clinical Background & Need
Sepsis represents one of the most critical public health emergencies globally, accounting for nearly 49 million cases and 11 million deaths annually (~20% of all global fatalities). In India and other developing nations, sepsis causes between 2.9 and 3.0 million deaths annually, implicated in nearly 30% of all hospital deaths. Every hour of delayed antimicrobial or resuscitation therapy following septic shock increases patient mortality by 7.6% to 8.0%. However, translating deep learning models to bedside clinical deployment is severely obstructed by:
1. **The Privacy Gap:** Strict statutory regulations (HIPAA, GDPR, India's DPDPA 2023) prohibiting centralized pooling of sensitive EHR records;
2. **The Accuracy Gap:** Concept drift across multi-tier hospitals with distinct patient demographics (geriatric community vs. acute trauma vs. tertiary oncology);
3. **The Trust Gap:** Clinician distrust driven by opaque black-box deep learning architectures causing alarm fatigue.

### 2. Core Innovations & Results
To resolve these challenges, we present the **Federated Personalized Drift-Aware Attention Framework (FPDAF)**, featuring three primary innovations:
1. **Adaptive Divergence-Weighted CUSUM (AD-CUSUM):** Combines prediction entropy divergence ($D_{\text{JSD}}$) with client gradient variance to detect concept drift in real time without false triggers from bedside sensor noise.
2. **Dynamic Dual-Phase Saliency & Entropy-Regularized Personalization (DDP-ERP):** Couples temporal attention with parameter anchoring and entropy regularization to decouple shared representations from localized decision heads, fine-tuning local hospital heads without catastrophic forgetting.
3. **Client-Side Selective Personalization (CSSP):** An edge-freezing protocol that selectively suppresses parameter uploads upon drift declaration, reducing client-server communication bandwidth by up to **38.0%** in a 50-round deployment model (1.52 GB vs. 2.48 GB in Ditto) while strictly safeguarding hospital data sovereignty.
4. **Empirical Benchmarking with Grounded Confidence Intervals:** Evaluated on 40,327 ICU admissions (1,551,697 hourly records) from the PhysioNet 2019 cohort under strict patient-level splitting:
   - On a standardized 15,000-window client-stratified benchmark (prevalence 2.72%), FPDAF-v2 achieves an **AUROC of 0.7821** (patient-level cluster bootstrap 95% CI: 0.7447--0.8163; unadjusted window-level 95% CI: 0.7554--0.8088), an **AUPRC of 0.1241**, a Brier score of **0.0585**, and an ECE of **0.0961**. In paired cluster bootstrap testing against personalized Ditto (AUROC 0.7796, Brier 0.0613, ECE 0.0982), FPDAF-v2 demonstrates equivalent discrimination ($\Delta = +0.0025$, paired 95% CI: -0.0193 to +0.0229, $P = .77$) alongside modest numerical calibration gains and drift resilience. On a parallel global multi-center pooled benchmark (15,000 windows, prevalence 2.58%), FPDAF-v2 achieves higher discrimination than Centralized BiLSTM (AUROC 0.7309), FedAvg (0.7559), and FedProx (0.7676).
   - On the full 102,994-window test partition (prevalence 2.58%), FPDAF-v2 achieves an **AUROC of 0.7603** (95% CI: 0.7496--0.7710), Accuracy of 83.51%, and Sensitivity of 55.33%.
   - Clinical threshold calibration supports dual operational workflows: an **Early Bedside Screening mode** ($\tau=0.08$, Sensitivity 80.15%, Specificity 63.85%) and a **High-Confidence Rule-In mode** ($\tau=0.65$, Accuracy 96.20%, Specificity 97.80%).
5. **Explainability & Lead Time:** Coupled with an interactive Clinical Decision Support System (CDSS) providing the *Three Pillars of Explainability* (temporal window attribution, vital feature saliency via Integrated Gradients, and counterfactual intervention simulation), delivering a cohort mean advance lead-time of **4.98 hours** (up to 5.8 hours in exemplar cases) before overt septic shock.

### 3. Editorial Disclosures
- **Originality:** This manuscript is original, has not been published previously, and is not under consideration elsewhere.
- **Non-Duplication:** No part of this manuscript has been duplicated or concurrently submitted. All source code and preprocessing pipelines are open access.
- **Ethical Compliance:** The study was conducted on de-identified PhysioNet data, strictly compliant with HIPAA Safe Harbor and DPDPA 2023.
- **Authorship Consensus:** All 7 authors and our clinical advisor have reviewed and approved the submission. All coauthors hold active ORCIDs.
- **Conflicts of Interest:** The authors declare no competing interests.
- **Funding:** Academic capstone research self-funded at Amrita Vishwa Vidyapeetham; no commercial funding was received.

### 4. Suggested Reviewers
1. **Dr. Supreeth P. Shashikumar, Ph.D.** — Harvard Medical School (`shashikumar@hms.harvard.edu`)
2. **Dr. Shamim Nemati, Ph.D.** — Emory University School of Medicine (`shamim.nemati@emory.edu`)
3. **Dr. Tian Li, Ph.D.** — Carnegie Mellon University (`tianli@cmu.edu`)
4. **Dr. Christopher W. Seymour, MD, MSc** — University of Pittsburgh Medical Center (`seymourcw@upmc.edu`)

Respectfully submitted,

**Sheela Akshar Sakhi** (Corresponding Author)  
Department of Computer Science and Engineering, Amrita School of Computing  
Amrita Vishwa Vidyapeetham, Coimbatore, India  
Email: `cb.sc.u4cse23547@cb.amrita.edu` • ORCID: `0009-0002-8931-419X`  

**Dr. G. R. Ramya, M.Tech, Ph.D** (Faculty Supervisor & Co-Corresponding Author)  
Email: `gr_ramya@cb.amrita.edu` • ORCID: `0000-0002-7654-3210`  
