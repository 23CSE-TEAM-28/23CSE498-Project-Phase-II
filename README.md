<div align="center">

# 🏥 Explainable Federated Learning for Healthcare Time-Series Forecasting with Personalized Drift Adaptation (FPDAF)

### B.Tech Capstone Project (Phase II) & Technical Enrichment Activities (TEA)
**Department of Computer Science and Engineering • Amrita School of Computing**  
**Amrita Vishwa Vidyapeetham, Coimbatore Campus**  
**Team 28 (Group G028) • Track: Data Science & Data Analytics (DSDA) • Academic Year: 2026–2027**

[![Live Web Portal](https://img.shields.io/badge/Live_Portal-GitHub_Pages-success?style=for-the-badge&logo=google-chrome)](https://aksharsakhi.github.io/FPDAF-Sepsis-Federated-Learning/)
[![GitHub Organization](https://img.shields.io/badge/GitHub_Org-23CSE--TEAM--28-blue?style=for-the-badge&logo=github)](https://github.com/23CSE-TEAM-28)
[![Python Version](https://img.shields.io/badge/Python-3.13%2B-blue?style=for-the-badge&logo=python)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-orange?style=for-the-badge&logo=pytorch)](https://pytorch.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-teal?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-blueviolet?style=for-the-badge&logo=react)](https://vitejs.dev)
[![Q1 Journal Draft](https://img.shields.io/badge/Manuscript-Q1_Ready_(IEEE%2FElsevier%2FSpringer)-purple?style=for-the-badge)](Paper/main.pdf)
[![Patent Draft](https://img.shields.io/badge/Patent-IPO_Form_2_(15_Claims)-gold?style=for-the-badge)](TEA/Activity_2_Patent_Disclosure/Patent_Disclosure_Draft_FPDAF.pdf)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

🌐 **Official Live Documentation & Demonstration Portal:**  
👉 **[https://aksharsakhi.github.io/FPDAF-Sepsis-Federated-Learning/](https://aksharsakhi.github.io/FPDAF-Sepsis-Federated-Learning/)** 👈

</div>

---

## 📋 Academic Information

| Field | Detail |
| :--- | :--- |
| **Project Title** | Explainable Federated Learning for Healthcare Time-Series Forecasting with Personalized Drift Adaptation (FPDAF) |
| **Course & Code** | Project Phase II (Course: 23CSE498) & Technical Enrichment Activities (TEA) |
| **Institution** | Amrita Vishwa Vidyapeetham, Coimbatore Campus |
| **Department** | Department of Computer Science and Engineering |
| **Programme** | B.Tech Computer Science and Engineering (Batch 2023–2027) |
| **Team Designation** | Team 28 (Group **G028**) • TAG: **DSDA** |
| **Faculty Guide** | **Dr. G. R. Ramya** (Assistant Professor, Sr. Gr., Dept. of CSE) |
| **Faculty Co-Guide** | **Dr. Vandhana S** (Assistant Professor, Sr. Gr., Dept. of CSE) |
| **Official Repository** | [https://github.com/23CSE-TEAM-28/23CSE498-Project-Phase-II](https://github.com/23CSE-TEAM-28/23CSE498-Project-Phase-II) |

---

## 🎯 Executive Overview & Clinical Urgency

Sepsis is a life-threatening medical emergency accounting for **11 million deaths globally each year** (>1 in 5 worldwide deaths). In intensive care units (ICUs), clinical evidence demonstrates that **patient mortality increases by 7.6%–8.0% for every single hour of delayed antimicrobial therapy**.

Traditional centralized machine learning models fail in clinical deployment due to three structural barriers:
1. **The Privacy Barrier (Institutional Silos):** Strict statutory frameworks (**HIPAA**, **GDPR**, and India's **DPDPA 2023**) strictly prohibit pooling raw 40-biomarker ICU telemetry into centralized cloud servers.
2. **The Accuracy Barrier (Inter-Hospital Concept Drift):** Community hospitals (geriatric, mean age 68.4y), trauma centers (acute shock), and academic referral centers exhibit severe statistical heterogeneity (Non-IID distributions). Naive federated averaging (**FedAvg**) suffers catastrophic gradient divergence.
3. **The Bandwidth Barrier (Edge Saturation):** Continuous bi-level optimization frameworks (e.g., Ditto) transmit heavy parameter matrices back and forth, exhausting hospital edge WAN firewalls (>2.48 GB per 50 rounds).

**FPDAF** introduces a decoupled architecture separating shared temporal sequence learning from localized drift adaptation, achieving:
* **96.42% Diagnostic Accuracy** (exceeding committee requirement of >95%).
* **82.50% Clinical Sensitivity (Recall)** (>4 out of 5 septic episodes caught in advance).
* **0.9418 AUROC Score** (+0.157 over standard FedAvg baseline).
* **5.8 Hours Advance Lead Time** before physiological shock onset.
* **38.2% Edge Bandwidth Reduction** (saving 960 MB WAN payload per 50 rounds).

---

## 🔬 Core Algorithmic Inventions

### 1. Adaptive Divergence-Weighted CUSUM (AD-CUSUM)
A change-point detector coupling loss residuals with symmetric Jensen-Shannon Divergence ($D_{\text{JSD}}$) and a gradient variance damping factor:
$$S_r = \max\Big(0, S_{r-1} + w_{\text{grad}}^{(r)} \cdot \big((\mathcal{L}_{\text{val}, r} - \mu_0) + \beta D_{\text{JSD}}^{(r)} - \kappa_r\big)\Big)$$
- **Gradient Variance Damping:** $w_{\text{grad}}^{(r)} = 1 + \tanh(\gamma \cdot \text{Var}(\nabla_{\theta_k} \mathcal{L}))$, suppressing false triggers from mini-batch noise.
- **Self-Calibrating Slack:** $\kappa_r = \mu_{\text{loss}} + \alpha \sigma_{\text{loss}}$, automatically adapting to moving error variance.

### 2. Dynamic Dual-Phase Saliency & Entropy-Regularized Personalization (DDP-ERP)
Decouples the client head $\phi^k$ upon drift and optimizes a 4-term regularized objective:
$$\mathcal{L}_{\text{DDP-ERP}} = \mathcal{L}_{\text{CE}}(y, \hat{y}) + \lambda_1 \mathcal{L}_{\text{distill}} + \lambda_2 \mathcal{L}_{\text{align}} + \lambda_3 \mathcal{H}(P_{\text{local}})$$
- **Knowledge Distillation ($\mathcal{L}_{\text{distill}}$):** $D_{\text{KL}}(P_{\text{local}} \,\|\, P_{\text{global}})$ bounds divergence from global consensus.
- **Cosine Parameter Alignment ($\mathcal{L}_{\text{align}}$):** Preserves global trajectory alignment.

### 3. Client-Side Selective Personalization (CSSP)
Edge parameter freezing protocol where shared backbone representations are locked and localized classification heads remain strictly on-premise:
$$\nabla_\theta \mathcal{L} \leftarrow 0 \quad \text{and} \quad \text{Upload}(\phi^k) = \emptyset$$
- Reduces communication payload from **2.48 GB (Ditto) to 1.52 GB (-38.2%)**.

---

## 📊 Rigorous Six-Way Multi-Center Benchmark Evaluation

Evaluated across **40,327 ICU patient encounters** from the PhysioNet 2019 Computing in Cardiology Challenge cohort partitioned into 3 Non-IID clinical tiers (Community Hospital 1, Trauma Center Hospital 2, Academic Medical Center Hospital 3):

| Framework / Architecture | Accuracy | Sensitivity (Recall) | Specificity | Precision | F1-Score | AUROC | Communication (50 Rnds) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Centralized BiLSTM** (Upper Bound) | 75.09% | 72.17% | 75.19% | 7.14% | 0.1299 | 0.8058 | 0 MB (Violates Laws) |
| **Standard FedAvg** (McMahan et al.) | 75.94% | 67.19% | 76.25% | 6.94% | 0.1259 | 0.7844 | 1.24 GB |
| **FedProx Baseline** (Li et al.) | 78.85% | 60.64% | 79.49% | 8.12% | 0.1432 | 0.7933 | 1.24 GB |
| **Ditto Personalized FL** (Li et al.) | 82.45% | 63.58% | 83.11% | 8.98% | 0.1574 | 0.7989 | 2.48 GB |
| **FPDAF (v1 Baseline)** | 86.51% | 65.33% | 87.25% | 9.81% | 0.1706 | 0.8214 | 1.52 GB (-38.7%) |
| **FPDAF-v2 (Proposed Full Framework)** | **96.42%** | **82.50%** | **96.95%** | **18.75%** | **0.3056** | **0.9418** | **1.52 GB (-38.2%)** |

---

## 📂 Repository Directory Structure

```text
23CSE498-Project-Phase-II/
│
├── baseline/                   # Centralized baseline models & evaluators
│   ├── configs/config.yaml     # Baseline hyperparameters
│   ├── datasets/dataset.py     # PyTorch DataLoader for time-series sequences
│   ├── models/lstm.py          # Baseline LSTM neural network
│   ├── trainer/trainer.py      # Local training loop with early stopping
│   ├── test.py / train.py      # Entrypoints for baseline verification
│   └── results/                # Baseline ROC curves and confusion matrices
│
├── federated/                  # Distributed Federated Learning Pipeline
│   ├── server/server.py        # Central federated aggregator (FedAvg / FedProx / Ditto)
│   ├── clients/client.py       # Hospital edge node client logic
│   ├── models/attention_lstm.py# BiLSTM with Multi-Head Self-Attention
│   ├── train_fedavg.py         # Standard FedAvg benchmark execution
│   ├── train_fedprox.py        # FedProx with proximal regularization (mu=0.01)
│   ├── train_ditto.py          # Bi-level personalized FL benchmark
│   ├── train_fpdaf.py          # Proposed FPDAF-v2 with AD-CUSUM and CSSP
│   ├── run_ablation.py         # Comprehensive ablation analysis
│   └── results/                # 6-way benchmark JSON metrics and ROC curve plots
│
├── preprocessing/              # Clinical Data Preprocessing Pipeline
│   ├── loader.py               # Raw PhysioNet PSV file parser
│   ├── imputer.py              # Sequence-aware FFill/BFill/Zero-padding imputer
│   ├── scaler.py               # Leakage-free StandardScaler (training fitted)
│   ├── window_generator.py     # 24-hour sliding temporal window segmentation
│   ├── save_processed.py       # PyTorch tensor serialization (.pt)
│   └── tensor_converter.py     # Memory-mapped array conversion
│
├── backend/                    # Production FastAPI CDSS Backend
│   ├── main.py                 # REST API endpoints, real-time PyTorch inference
│   ├── init_db.py              # SQLite clinical telemetry warehouse initializer
│   └── clinical_warehouse.db   # 50 simulated bedside patient database
│
├── dashboard/                  # React + TypeScript Clinician Workstation
│   ├── src/pages/              # Bedside Monitor, XAI, Drift Telemetry, FL Monitor
│   ├── src/components/         # Glassmorphic UI components, charts, and dials
│   └── package.json            # Vite, Tailwind CSS v4, Recharts, Framer Motion
│
├── evaluation/                 # Quality assurance & verification scripts
│   ├── preprocessing_audit.py  # Leakage and padding audit script
│   └── inspect_processed_data.py # Tensor shape and statistical inspection
│
├── Paper/                      # Scholarly Research Manuscripts
│   ├── main.tex / main.pdf     # Primary LaTeX manuscript draft
│   └── ref.bib                 # 45 curated Q1 clinical AI citations
│
├── journal paper/              # 3 Q1 Journal Submission Formats
│   ├── IEEE/                   # IEEE Journal of Biomedical & Health Informatics (J-BHI)
│   ├── Elsevier/               # Computer Methods and Programs in Biomedicine (CMPB)
│   └── Springer_Nature/        # Scientific Reports
│
├── Review 3/ & Review 4/       # Capstone Defense Deliverables
│   ├── presentation.pdf / .tex # LaTeX Madrid Beamer presentation slides
│   ├── report.pdf / .tex       # Phase II academic review reports
│   └── hospital_pitch.pdf      # MedTech venture executive brief
│
├── MSME/                       # MSME Hackathon 6.0 Funding Proposal
│   ├── msmeproposal.pdf        # Full clinical proposal document
│   └── msmepresentation.pdf    # Commercialization presentation
│
├── config.py                   # Centralized project-wide hyperparameter configuration
├── requirements.txt            # Python dependencies (PyTorch, FastAPI, Scikit-learn)
├── run_app.sh                  # One-click startup script for backend & frontend
└── README.md                   # Comprehensive repository documentation (this file)
```

---

## 🚀 Quickstart & Installation Guide

### Prerequisites
* **Operating System:** Linux, macOS, or Windows (WSL2 recommended)
* **Python:** Version 3.10 to 3.13
* **Node.js:** Version 18.x or 20.x LTS

### 1. Clone the Technical Repository
```bash
git clone https://github.com/23CSE-TEAM-28/23CSE498-Project-Phase-II.git
cd 23CSE498-Project-Phase-II
```

### 2. Configure Python Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Run Data Preprocessing & Audit
```bash
# Verify data integrity, sliding window segmentation, and padding
python evaluation/preprocessing_audit.py
```

### 4. Execute Federated Learning Training Pipeline
```bash
# Run proposed FPDAF-v2 with AD-CUSUM drift adaptation and CSSP freezing:
python federated/train_fpdaf.py

# Or run comparative benchmarks:
python federated/train_fedavg.py
python federated/train_fedprox.py
python federated/train_ditto.py
```

### 5. Launch the Clinical Decision Support System (CDSS)
You can start both the backend and frontend simultaneously with the provided script:
```bash
chmod +x run_app.sh
./run_app.sh
```

Or start the services individually:
* **Start FastAPI Clinical Backend:**
  ```bash
  uvicorn backend.main:app --reload --port 8000
  ```
  *Swagger Interactive API docs:* `http://localhost:8000/docs`

* **Start React Bedside Dashboard:**
  ```bash
  cd dashboard
  npm install
  npm run dev
  ```
  *Bedside Workstation interface:* `http://localhost:5173`

---

## 👁️ Three Pillars of Clinical Explainability (XAI)

Physicians distrust black-box predictions. FPDAF decomposes neural activations into three actionable questions:
1. **Temporal Saliency ("WHEN Did Risk Accumulate?"):** Multi-head self-attention distribution over 24 historical hours highlights early risk accumulation peaking at **Hour 18 (19.8% weight)**, granting an actionable **5.8-hour clinical lead time**.
2. **Feature Attribution ("WHAT Biomarkers Drove Risk?"):** Integrated Gradients and SHAP decompose predictions into physiological contributors: **Heart Rate (35%)**, **Systolic BP (28%)**, and **SpO$_2$ (22%)**, strictly matching international SIRS/qSOFA criteria.
3. **Counterfactual Recourse ("HOW Can Clinicians Intervene?"):** Simulates point-of-care therapeutic interventions (e.g., $30\text{ mL/kg}$ crystalloid fluid bolus that restores MAP from 58 to 78 mmHg reduces predicted risk from **84% to <20%**).

---

## 📚 Scholarly Publications & Intellectual Property

| Deliverable | Target / Venue | Status | Format |
| :--- | :--- | :---: | :---: |
| **Q1 Journal Paper (Format 1)** | IEEE Journal of Biomedical and Health Informatics (J-BHI) | Ready for Submission | IEEEtran 14-page double-column PDF |
| **Q1 Journal Paper (Format 2)** | Elsevier Computer Methods and Programs in Biomedicine (CMPB) | Ready for Submission | elsarticle 15-page PDF |
| **Q1 Journal Paper (Format 3)** | Springer Nature Scientific Reports | Ready for Submission | Springer Nature 17-page PDF |
| **Patent Specification Draft** | Indian Patent Office (IPO) Form 2 Specification | Complete Draft | 13-page, 15 legal claims, 5 drawing sheets |
| **Project Documentation Dossier** | Comprehensive System Specification | Complete | 32-page engineering dossier & schema |

---

## 👥 Project Team 28 (Group G028)

* **Sheela Akshar Sakhi** (`CB.SC.U4CSE23547`) — *Team Lead & System Architect*
* **Hasini Reddy M** (`CB.SC.U4CSE23529`) — *Algorithm Engineer (AD-CUSUM)*
* **Kousik Sarma Lakkaraju** (`CB.SC.U4CSE23761`) — *CDSS Full-Stack Developer*
* **Haswitha K** (`CB.SC.U4CSE23363`) — *Biostatistics & XAI Specialist*
* **V. Chakravarthy** (`CB.SC.U4CSE23753`) — *Edge Optimization & Data Pipeline*

### Faculty Mentors
* **Dr. G. R. Ramya** — *Assistant Professor (Sr. Gr.), Department of Computer Science & Engineering*
* **Dr. Vandhana S** — *Assistant Professor (Sr. Gr.), Department of Computer Science & Engineering*

---

## 📄 License & Ethical Compliance

This project is released under the **MIT License**. All experimental evaluations utilize de-identified, open-access clinical data from the **PhysioNet Computing in Cardiology Challenge 2019**, adhering to HIPAA Safe Harbor guidelines and university academic ethics policies.
