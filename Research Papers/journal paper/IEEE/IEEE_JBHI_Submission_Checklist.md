# IEEE JBHI Submission Preparation Checklist

**Journal:** IEEE Journal of Biomedical and Health Informatics (IEEE JBHI)  
**Publisher:** IEEE Engineering in Medicine and Biology Society (EMBS)  
**Article Type:** Regular Research Paper  
**Status:** Ready for Author Submission Review  

| # | Evaluation Criteria | IEEE JBHI Policy Requirement & Implementation | Compliance Status |
|---|---|---|:---:|
| 1 | **Manuscript Format** | Standard double-column IEEE Transactions LaTeX template (`IEEEtran.cls`), 10pt font, single-spaced. Source files cleanly compile to PDF. | **VERIFIED - COMPLIANT** |
| 2 | **Article Scope & Focus** | Focus on biomedical informatics, decentralized machine learning, critical care telemetry, and physiological time-series forecasting. | **VERIFIED - IN SCOPE** |
| 3 | **Structured/Unstructured Abstract** | Concise abstract under 250 words summarizing the clinical problem, FPDAF methodology, multi-center results, and clinical utility. | **VERIFIED (<250 Words) - COMPLIANT** |
| 4 | **Index Terms / Keywords** | 4–6 IEEE-style keywords: Sepsis forecasting, federated learning, concept drift adaptation, temporal attention, electronic health records, clinical decision support. | **VERIFIED (6 Keywords) - COMPLIANT** |
| 5 | **Section Hierarchy** | Standard IEEE structure: I. Introduction, II. Related Work, III. Methodology & Mathematical Formulation, IV. Multi-Center Experimental Design, V. Results & Validation, VI. Explainability & Clinical Decision Support, VII. Discussion & Limitations, VIII. Conclusion. | **VERIFIED - COMPLIANT** |
| 6 | **Empirical Rigor & Statistics** | Multi-center evaluation across 40,327 patients (102,994 test windows). Patient-level cluster bootstrap (B=2,000 resamples) 95% CIs and paired difference hypothesis tests reported for all comparisons. | **VERIFIED - COMPLIANT** |
| 7 | **Calibration & Clinical Reporting** | Both discrimination (AUROC, AUPRC) and calibration (ECE, Brier score) reported. Dual clinical operating thresholds (Screening vs Rule-In) and early warning lead times (4.98h) detailed. | **VERIFIED - COMPLIANT** |
| 8 | **Figures & Tables** | High-resolution 300+ DPI vector and raster figures with clear typography. Multi-panel tables separating client-stratified (Panel A) and pooled (Panel B) regimes. | **VERIFIED - COMPLIANT** |
| 9 | **Citation & Reference Style** | IEEE citation style (`[1]`, `[2]`) sorted by citation order. Complete metadata including authors, journal titles, volume, pages, and DOIs where applicable. | **VERIFIED - COMPLIANT** |
| 10 | **Ethics & De-Identification** | PhysioNet CinC 2019 / MIMIC-III credentialed access adherence. HIPAA Safe Harbor de-identification and India DPDPA 2023 alignment explicitly documented. | **VERIFIED - COMPLIANT** |
| 11 | **Reproducibility & Open Science** | Public GitHub repository with complete source code, PyTorch models, data preprocessing pipelines, evaluation scripts, and serialized prediction artifacts (`full_cohort_predictions.pt`). | **VERIFIED - OPEN ACCESS** |
| 12 | **Author Declarations** | CRediT authorship contributions, conflict of interest disclosure, and funding statements included in end-matter. | **VERIFIED - COMPLIANT** |
