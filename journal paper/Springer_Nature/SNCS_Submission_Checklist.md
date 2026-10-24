# Springer Nature SN Computer Science (SNCS) Submission Checklist

**Journal:** SN Computer Science  
**Publisher:** Springer Nature Switzerland AG  
**Article Type:** Original Research  
**Status:** Ready for Author Submission Review  

| # | Evaluation Criteria | Springer Nature SNCS Policy Requirement & Implementation | Compliance Status |
|---|---|---|:---:|
| 1 | **Manuscript Format** | Official Springer Nature LaTeX template (`sn-jnl.cls`, default option), single-column format with clear section headings. Clean PDF generation. | **VERIFIED - COMPLIANT** |
| 2 | **Aims and Scope** | Applied computer science, decentralized systems, AI in digital health, and biomedical data mining. | **VERIFIED - IN SCOPE** |
| 3 | **Abstract & Keywords** | Structured or unstructured abstract under 250 words. 4–6 keywords covering federated learning, sepsis forecasting, attention mechanisms, concept drift, and EHR analytics. | **VERIFIED - COMPLIANT** |
| 4 | **Section Organization** | Introduction, Literature Review, Methodology, Experimental Evaluation, Clinical Decision Support System, Discussion & Limitations, Conclusions. | **VERIFIED - COMPLIANT** |
| 5 | **Clustered Bootstrap Validation** | Patient-level cluster bootstrap (B=2,000 resamples) 95% CIs and paired hypothesis testing (Delta = AUROC_A - AUROC_B) accounting for intra-patient autocorrelation. | **VERIFIED - COMPLIANT** |
| 6 | **Fair Multi-Panel Benchmarking** | Panel A (Client-Stratified, N=15,000, 408 positives) and Panel B (Uniform Pooled, N=15,000, 387 positives) strictly demarcated to prevent cross-distribution conflation. | **VERIFIED - COMPLIANT** |
| 7 | **Calibration & Clinical Utility** | Full reporting of Expected Calibration Error (ECE), Brier score, dual operating thresholds (tau=0.08 and 0.65), and clinical early warning lead times (4.98h). | **VERIFIED - COMPLIANT** |
| 8 | **Display Items** | All figures formatted at 300+ DPI. Clear tabular presentation of multi-center results across 102,994 held-out ICU observation windows. | **VERIFIED - COMPLIANT** |
| 9 | **Springer Nature Reference Style** | Standard `sn-basic` or `sn-mathphys` bibliography style with numbered citations in square brackets and complete references. | **VERIFIED - COMPLIANT** |
| 10 | **Statutory & Ethical Compliance** | PhysioNet CinC 2019 / MIMIC-III cohort de-identification, HIPAA compliance, India DPDPA 2023 alignment, and IRB exemption statement. | **VERIFIED - COMPLIANT** |
| 11 | **Compliance with Ethical Standards** | Mandatory declarations: Funding statement, Conflicts of interest / Competing interests, Ethics approval, Consent to participate, Consent for publication. | **VERIFIED - COMPLIANT** |
| 12 | **Data & Code Availability** | Direct links to reproducible GitHub repository containing PyTorch models, causal imputation scripts, checkpoint weights, and prediction tensors. | **VERIFIED - COMPLIANT** |
