# JMIR Submission Cover Letter

**Journal:** Journal of Medical Internet Research (JMIR)  
**Publisher:** JMIR Publications Inc.  
**Date:** October 23, 2026  

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
2. **Dynamic Dual-Phase Saliency & Entropy-Regularized Personalization (DDP-ERP):** Couples 2D cross-attention with asymmetric KL-divergence loss to decouple shared representations from localized decision heads, fine-tuning local hospital heads without catastrophic forgetting.
3. **Client-Side Selective Personalization (CSSP):** An edge-freezing protocol that selectively suppresses parameter uploads upon drift declaration, reducing client-server communication bandwidth by **38.0%** (1.52 GB vs. 2.48 GB in Ditto) while strictly safeguarding hospital data sovereignty.
4. **Empirical Benchmarking & External Validation:** Evaluated on 40,327 ICU admissions (102,994 test windows, prevalence 2.58%) under strict patient-level splitting and backward-only causal imputation, FPDAF-v2 achieves **88.33% Accuracy**, **47.79% Sensitivity** (up to **75.00%** at Youden-optimal threshold $\tau=0.12$), **89.47% Specificity**, an **AUROC of 0.7821** (sweep peak **0.7973**), and best-in-class calibration with a Brier score of **0.0585** and ECE of **0.0961**. Furthermore, zero-shot domain transfer on an independent hospital cohort (Osun State UTH, N=1,700) achieves an external AUROC of **0.7761** and Specificity of **94.76%**.
5. **Explainability & Lead Time:** Coupled with an interactive Clinical Decision Support System (CDSS) providing the *Three Pillars of Explainability* (temporal window attribution, vital feature saliency via SHAP, and counterfactual intervention simulation), delivering an automated **5.8-hour advance lead-time** before overt septic shock.

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
