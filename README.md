# Explainable Federated Learning for Healthcare Time-Series Forecasting with Personalized Drift Adaptation (FPDAF)

### B.Tech Capstone Project (Phase II)
**Department of Computer Science and Engineering**  
**Amrita School of Computing, Amrita Vishwa Vidyapeetham, Coimbatore**  
**Academic Year:** 2026–2027

---

# Academic Information

| Field | Detail |
| :--- | :--- |
| **Project Title** | Explainable Federated Learning for Healthcare Time-Series Forecasting with Personalized Drift Adaptation (FPDAF) |
| **Institution** | Amrita Vishwa Vidyapeetham |
| **Campus** | Coimbatore Campus |
| **Department** | Department of Computer Science and Engineering |
| **Programme** | B.Tech Computer Science and Engineering |
| **Course** | Project Phase II |
| **Academic Year** | 2026–2027 |
| **Guide** | Dr. G R Ramya (Assistant Professor, Department of CSE) |
| **Co-Guide** | Dr. Vandhana S (Assistant Professor, Department of CSE) |

---

> [!IMPORTANT]
> This project is being carried out as part of the B.Tech Final Year Project under the guidance of **Dr. G R Ramya**, Department of Computer Science and Engineering, Amrita Vishwa Vidyapeetham, Coimbatore Campus.

---

### 🏥 Project Overview
This repository implements the **Federated Personalized Drift-Aware Attention Framework (FPDAF)**, a decentralized deep learning architecture designed for **early Sepsis prediction and patient deterioration forecasting** in Intensive Care Units (ICUs).

By exploiting time-series clinical signals, the framework addresses three main challenges:
* **The Privacy Gap**: Collaborative training across hospital nodes without sharing raw patient records, conforming to HIPAA/DPDPA regulations.
* **The Accuracy Gap**: Personalization using localized classification heads to adapt to hospital-specific patient demographics.
* **The Trust Gap**: Dual-level clinical explainability incorporating sequential multi-head attention weights and SHAP explanations.

---

## Table of Contents
* [Objectives](#objectives)
* [Key Features](#key-features)
* [Repository Structure](#repository-structure)
* [Technology Stack](#technology-stack)
* [Dataset](#dataset)
* [Quick Setup](#quick-setup)
* [Data Preprocessing](#data-preprocessing)
* [Current Project Status](#current-project-status)
* [Project Team](#project-team)
* [Project Guides](#project-guides)
* [Additional Documentation](#additional-documentation)
* [SDG Mapping](#sdg-mapping)
* [Contributing](#contributing)
* [References](#references)
* [Project Information](#project-information)

---

## Objectives
* **Collaborative Modeling**: Train sequential deep learning models across multiple simulated clinical sites without transferring patient data.
* **Hospital Personalization**: Implement model personalization strategies to handle demographic shifts between clinical centers.
* **Dynamic Adaptation**: Integrate statistical monitoring to detect concept drift in patient populations.
* **Clinical Interpretability**: Render patient predictions transparent by extracting temporal and feature-level explanations.

---

## Key Features

| Feature | Description |
| :--- | :--- |
| **Federated Collaboration (FedAvg/FedProx)** | Joint model training using decentralized parameter aggregation and proximal constraints. |
| **Personalized Adaptation (Ditto & CSSP)** | Bi-level optimization decoupling global models from client heads, combined with Client-Side Selective Personalization (CSSP) under drift. |
| **Concept Drift Detection (CUSUM)** | Monitors validation loss residuals in real-time to flag institutional patient population shifts. |
| **Explainable AI (Multi-Head Attention)** | Saliency visualization extracting temporal timeline importance across 24-hour ICU sequence segments. |
| **Data Quality Verification** | Automatic testing pipeline verifying imputer, scaling, and sequence padding consistency. |

---

## 📂 Repository Structure

```text
23CSE498-Project-Phase-II/
│
├── datasets/
│   ├── raw/                    # Original PhysioNet 2019 data (training_setA & training_setB)
│   └── processed/              # Preprocessed tensors & sliding windows
│
├── notebooks/                  # Jupyter notebooks for EDA & experiments
├── preprocessing/              # Data cleaning, imputation & scaling pipelines
├── models/                     # Unidirectional and bidirectional baseline models
├── federated/                  # FedAvg, FedProx, Ditto personalization, CUSUM drift detection, and local training
├── backend/                    # FastAPI REST API database endpoints loading PyTorch model checkpoints
├── dashboard/                  # React Vite clinician dashboard workstation overlay
├── evaluation/                 # Metrics, AUC-ROC, confusion matrices & benchmarking
├── results/                    # Generated reports, plots and evaluation outputs
│
├── config.py                   # Centralized hyperparameter & path configuration
├── requirements.txt            # Python dependencies
├── README.md                   # Main project overview (this file)
├── DATASET_SETUP.md            # Dataset download and setup guide
├── CONTRIBUTING.md             # Team collaboration guide
└── CHANGELOG.md                # Project milestones and versions
```

---

## Technology Stack
* **Deep Learning Framework**: PyTorch
* **Data Processing & ML**: Pandas, NumPy, Scikit-learn, Joblib
* **ICU Workstation API Backend**: FastAPI, Uvicorn, SQLite3
* **Clinician Web Dashboard**: React (TypeScript), Vite, Tailwind CSS v4, Recharts, Framer Motion
* **Academic Deliverables**: pdfTeX (LaTeX Madrid Beamer templates)

---

## Dataset
* **Source**: [PhysioNet Computing in Cardiology Challenge 2019](https://physionet.org/content/challenge-2019/)
* **Hospitals**: 2 Hospital Systems (`training_setA` and `training_setB`)
* **Patients**: 40,327 total (20,336 Hospital A, 19,991 Hospital B)
* **Format**: Pipe-separated values (`.psv`) recorded hourly containing 40 clinical variables + `SepsisLabel` target.
* **Storage**: Local dataset files are placed in `datasets/raw/` and excluded from Git tracking. See [DATASET_SETUP.md](DATASET_SETUP.md) for details.

---

## Quick Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/23CSE-TEAM-28/23CSE498-Project-Phase-II.git
   cd 23CSE498-Project-Phase-II
   ```
2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Setup raw data**: Refer to [DATASET_SETUP.md](DATASET_SETUP.md) for instructions on downloading and placing the dataset.

---

## Data Preprocessing

```text
Raw Dataset (.psv) ──> Imputation (FFill/BFill) ──> Scaling (StandardScaler) ──> Sliding Windows (24h) ──> PyTorch Tensors (.pt)
```

* **Imputation**: Sequence-based patient-level imputation (Forward Fill $\rightarrow$ Backward Fill $\rightarrow$ Zero-padding).
* **Leakage-Free Scaling**: `StandardScaler` fitted strictly on the training partition and saved to `scaler.pkl`.
* **Sliding Window Segmenting**: Reshapes time-series features into sequence blocks of 24 hours.
* **Short-Stay Padding**: ICU patient stays less than 24 hours are pre-padded with zeros at sequence starts.
* **Patient Isolation**: Partitioned at patient-level into disjoint sets (70% train, 15% val, 15% test) to prevent leakage.
* **Validation Check**: Preprocessing verified using an independent quality audit script generating visual and PDF verification reports.

---

## Current Project Status

| Module / Milestone | Status | Completion Date |
| :--- | :---: | :---: |
| Repository & Workspace Setup | ✅ Completed | July 2026 |
| Exploratory Data Analysis (EDA) | ✅ Completed | July 2026 |
| PyTorch Preprocessing Pipeline | ✅ Completed | July 2026 |
| Preprocessing Quality Audit | ✅ Completed | July 2026 |
| Centralized Baseline LSTM Model | ✅ Completed | July 2026 |
| Federated Baselines (FedAvg/FedProx) | ✅ Completed | August 2026 |
| Personalized Local Heads (Ditto Optimization) | ✅ Completed | August 2026 |
| CUSUM Drift Detection & CSSP Module | ✅ Completed | September 2026 |
| Multi-Head Attention Explainability (XAI) | ✅ Completed | October 2026 |
| Clinician CDSS Workstation Dashboard | ✅ Completed | October 2026 |

---

## Project Team

| Roll Number | Name | Primary Role |
| :--- | :--- | :--- |
| CB.SC.U4CSE23547 | SHEELA AKSHAR SAKHI | Team Lead / ML Engineer |
| CB.SC.U4CSE23529 | HASINI REDDY M | Federated Learning Engineer |
| CB.SC.U4CSE23761 | KOUSIK SARMA LAKKARAJU | Explainable AI Researcher |
| CB.SC.U4CSE23363 | HASWITHA K | Backend & Evaluation Developer |
| CB.SC.U4CSE23753 | V. CHAKRAVARTHY | Quality Assurance & Testing |

---

## Project Guides
* **Dr. G. R. Ramya** (Assistant Professor, Department of Computer Science and Engineering, Amrita School of Computing)
* **Dr. Vandhana S** (Assistant Professor, Department of Computer Science and Engineering, Amrita School of Computing)

---

## Additional Documentation
* **[DATASET_SETUP.md](DATASET_SETUP.md)**: Details downloading raw dataset splits, folder directories, and running preprocessing scripts.
* **[CONTRIBUTING.md](CONTRIBUTING.md)**: Explains the Git Flow strategy, PR submission workflow, coding standards, and PEP 8 guidelines.
* **[CHANGELOG.md](CHANGELOG.md)**: Records development milestones, release history, and quality verification scores.

---

## SDG Mapping

| SDG | Target | Role in FPDAF |
| :---: | :--- | :--- |
| **SDG 3** | Good Health and Well-being | Early clinical detection of life-threatening Sepsis in intensive care units. |
| **SDG 9** | Industry, Innovation, and Infrastructure | Resilient, secure, and privacy-preserving AI architecture for decentralized healthcare systems. |
| **SDG 16** | Peace, Justice, and Strong Institutions | Ethical data processing respecting hospital boundaries and HIPAA compliance regulations. |

---

## Contributing
* Create a new feature branch (`feature/feature-name`) from the `develop` branch.
* Adhere to PEP 8 formatting rules and document code using Google-style docstrings.
* Commit logical changes using descriptive, imperative message descriptions.
* Run the verification audit script local checks before committing code.
* Submit a Pull Request targeting the `develop` branch. Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 🏥 Clinical ICU Decision Support System Dashboard (FPDAF Demo)

To showcase the unified sepsis forecasting pipeline, we provide a modern Clinical Decision Support System (CDSS) Dashboard. It is split into a **FastAPI backend** (which runs live PyTorch model inference on test sequences, un-scales physiological metrics, and processes real-time CUSUM scores) and a **React+TypeScript frontend** (configured with Tailwind CSS v4, Recharts, and Framer Motion).

### ⚙️ Installation & Running

#### 1. Start the FastAPI Backend
Ensure you are in the root directory:
```bash
uvicorn backend.main:app --reload --port 8000
```
*API docs will be available at [http://localhost:8000/docs](http://localhost:8000/docs).*

#### 2. Start the React Frontend Dashboard
Navigate to the `dashboard/` subdirectory:
```bash
cd dashboard
npm install
npm run dev
```
*The ICU CDSS application will be active at [http://localhost:5173](http://localhost:5173).*

### 🖥️ Dashboard Page Highlights
1. **Login Portal**: Interactive physician credentials verification.
2. **ICU Dashboard**: Occupancy, alert statistics, and admissions charts.
3. **Bedside Patient List**: Beds mapping, search, and prediction triggers.
4. **Vitals details**: Multi-line medical monitor graphs (HR, SBP, Temp, Resp, SpO2).
5. **Prediction dial**: FPDAF prediction engine with loader screens.
6. **XAI Interpretability**: Temporal attention timelines and feature importance bars.
7. **CUSUM Drift Monitor**: Control charts displaying triggers and CSSP adaptation statuses.
8. **Federated FL Monitor**: Loop animations of parameter exchanges across hospitals.
9. **Model Benchmarks**: 5-way comparative overlays and efficiency tables.
10. **Research Insights**: Objective definitions, bi-level equations, and download links for the compiled manuscript PDF.

---

## References
* **PhysioNet Challenge 2019**: Early Prediction of Sepsis from Clinical Data (Computing in Cardiology Challenge).
* **PyTorch Documentation**: Deep Learning framework implementations.
* **Scikit-learn API**: StandardScaler preprocessing details.
* **SHAP Documentation**: Model explanations using Shapley values.

---

## Project Information

<div align="center">

![Python Version](https://img.shields.io/badge/Python-3.13%2B-blue)
![PyTorch Version](https://img.shields.io/badge/PyTorch-2.0%2B-orange)
![Federated Framework](https://img.shields.io/badge/Federated-Learning-purple)
![Explainable AI](https://img.shields.io/badge/Explainability-SHAP%20%26%20Attention-brightgreen)
![Status](https://img.shields.io/badge/Status-Preprocessing%20Verified-green)

</div>

---
*B.Tech Capstone Project (Project Phase II) | Department of Computer Science and Engineering | Amrita School of Computing | Amrita Vishwa Vidyapeetham, Coimbatore Campus*
