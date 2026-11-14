# 📚 FPDAF Project Documentation Index

This directory centralizes all architectural specifications, clinical data dictionaries, experimental validation protocols, reproducibility guides, and developer workflows for the **Federated Personalized Drift-Aware Framework (FPDAF)** for ICU Sepsis Prediction.

---

## 📑 Documentation Catalog

### 🏥 Clinical Data & Preprocessing Specifications
- **[`DATA_DICTIONARY.md`](./DATA_DICTIONARY.md)**  
  Comprehensive 40-feature clinical ontology, physiological ranges, imputation boundaries, unit definitions, and clinical importance tiers across vital signs, laboratory measurements, and demographic indicators.
- **[`DATASET_SETUP.md`](./DATASET_SETUP.md)**  
  End-to-end instructions for downloading, verifying, and preprocessing the PhysioNet Computing in Cardiology Challenge 2019 dataset (40,327 ICU stays across Hospital A and Hospital B).
- **[`DATASET_ACCESS_AND_COMPATIBILITY.md`](./DATASET_ACCESS_AND_COMPATIBILITY.md)**  
  Compatibility analysis and credentialing roadmaps for prospective multi-cohort expansions (eICU-CRD, MIMIC-IV v2.2, HiRID, Trajectory Flow, and SICdb).

---

### 🔬 Empirical Protocols & Benchmarks
- **[`EXPERIMENT_PLAN.md`](./EXPERIMENT_PLAN.md)**  
  Empirical design, ablation matrices, baseline configurations (Centralized, Local-Only, FedAvg, FedProx, FedPer, Ditto, FPDAF), and formal hypotheses $H_1$–$H_4$.
- **[`EXPERIMENT_RESULTS.md`](./EXPERIMENT_RESULTS.md)**  
  Machine-verified benchmark results, confusion matrices, AUROC/AUPRC tables, drift response latencies, and communication payload comparisons.
- **[`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md)**  
  Exhaustive technical audit log resolving data discrepancies, metric consistency checks, synthetic partition disclosures, and ablation verifications.
- **[`REMAINING_WORK.md`](./REMAINING_WORK.md)**  
  Roadmap for future clinical deployments, prospective EHR integration, and pending multi-center institutional credentialing.
- **[`REPRODUCIBILITY.md`](./REPRODUCIBILITY.md)**  
  Step-by-step instructions, hardware requirements, virtual environment setup, seed specifications, and execution scripts for reproducing all benchmark figures.

---

### 💻 Developer & System Guides
- **[`DASHBOARD_PROTOTYPE_GUIDE.md`](./DASHBOARD_PROTOTYPE_GUIDE.md)**  
  Architecture overview, state management, and real-time WebSocket/REST API documentation for the dual-view Clinical/Administrative React dashboard.
- **[`walkthrough.md`](./walkthrough.md)**  
  Step-by-step developer tour and code walkthrough across federated coordination, temporal self-attention networks, AD-CUSUM drift tracking, and XAI saliency generation.
- **[`CONTRIBUTING.md`](./CONTRIBUTING.md)**  
  Code standards, branch workflows, pre-commit checks, testing conventions, and pull request guidelines.
- **[`CHANGELOG.md`](./CHANGELOG.md)**  
  Chronological record of feature additions, architectural refactorings, and milestone releases.

---

### 📊 Project Planning & Literature Review
- **`Literature_Survey.xlsx`**  
  Systematic comparison of 45+ peer-reviewed studies across federated learning, sepsis onset detection, concept drift mitigation, and clinical explainability.
- **`project_requirements.xlsx`**  
  Traceability matrix mapping clinical requirements to software modules, validation criteria, and regulatory standards.
