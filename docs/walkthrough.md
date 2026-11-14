# Walkthrough Report: Clinical ICU Decision Support System (CDSS) Dashboard

We have successfully built and verified a modern, production-quality Clinical Decision Support System (CDSS) Dashboard for the **FPDAF** (Federated Personalized Drift-Aware Attention Framework) project. 

The application is completely decoupled from static mock data and directly queries our python models and results via a **FastAPI backend API**.

---

## 📂 1. Directory Structure

```
dashboard/
├── public/
│   ├── favicon.svg
│   └── FPDAF_Research_Paper.pdf  # [NEW] Manuscript PDF for clinical download
├── src/
│   ├── assets/                   # Static icons & images
│   ├── components/
│   │   ├── Sidebar.tsx           # ICU sidebar menu tabs
│   │   └── Header.tsx            # Clinician info, alerts notification, light/dark mode
│   ├── pages/
│   │   ├── Login.tsx             # HIPAA-compliant Portal login
│   │   ├── DashboardCDSS.tsx     # ICU metrics, admissions, and sepsis trend curves
│   │   ├── PatientList.tsx       # Beds searchable table & filtration options
│   │   ├── PatientDetails.tsx    # Bedside stack vital logs chart (HR, SBP, Temp, SpO2, Resp)
│   │   ├── PredictionScreen.tsx  # Live model prediction score dial & treatment recommendations
│   │   ├── ExplainableAI.tsx     # Temporal attention weights bar chart & horizontal attributions
│   │   ├── DriftMonitor.tsx      # CUSUM drift scores curves & CSSP adaptation flags
│   │   ├── ModelComparison.tsx   # 5-way benchmark overlays & ROC charts
│   │   └── ResearchInsights.tsx  # Objective pill summaries, bi-level formulas, and ablation tables
│   ├── services/
│   │   └── mockDataService.ts    # [MODIFIED] API endpoints integration wrapper (fetch data dynamically)
│   ├── App.tsx                   # Main state container & dark mode toggle
│   ├── main.tsx
│   └── index.css                 # [MODIFIED] Tailwind v4 CSS-first themes
backend/
└── main.py                       # [NEW] FastAPI backend loading datasets, un-scaling features, and running live PyTorch inferences
```

---

## 🚀 2. Live API Service Specifications

The FastAPI backend (**`backend/main.py`**) directly loads our PyTorch model weights and datasets:
1. **`/api/patients`**: Scans the test dataset `datasets/processed/test.pt` to extract 15 Sepsis-positive and 15 Sepsis-negative patients. It runs **live inferences** on their 24h sequence inputs using our FedAvg, FedProx, Ditto, and FPDAF weights.
2. **`/api/patients/{id}/vitals`**: Decodes the 24-hour sequence features using `datasets/processed/scaler.pkl` to render actual real-world vital signs (HR, SBP, Temp, Resp, SpO2) in clinical ranges.
3. **`/api/patients/{id}/attention`**: Feeds the sequence to the `PersonalizedAttentionLSTM` model and returns the **actual temporal attention weights** computed by the model.
4. **`/api/drift`**: Retrieves the running CUSUM scores directly from the logs.
5. **`/api/comparison`**: Retrieves the true 5-way benchmarks directly from the results.
6. **`/api/ablation`**: Retrieves the true ablation scores directly from the results.

---

## 💻 3. Installation & Running

### Step 1: Start the FastAPI Backend
Ensure you are in the root directory:
```bash
uvicorn backend.main:app --reload --port 8000
```

### Step 2: Start the React Dashboard
Navigate to `dashboard/` subdirectory:
```bash
cd dashboard
npm install
npm run dev
```

---

## 📊 4. UI Screen Features

1. **Doctor Login**: Login using physician credentials.
2. **Dashboard**: occupancy, alert notifications, and admissions.
3. **Bed Monitor**: Active patient beds table with critical filters.
4. **Vitals details**: Multi-metric Recharts timeline graphs.
5. **Prediction dial**: Sepsis probability score dial with treatment recommendation panels.
6. **XAI explainability**: self-attention timelines highlight peak ICU hours (e.g. 17-22), rendering alerts explainable to ICU staff.
7. **CUSUM Drift Monitor**: Plots real-time drift triggers (resetting CUSUM scores to 0) and explains how selective head personalization stabilizes training.
8. **Federated Workflow animation**: Framer-motion arrows animating local updates from nodes to central server and back.
9. **Model Benchmarks**: Bar and line charts comparing F1, Recall, and ROC overlays.
10. **Research Insights**: Objective definitions, bi-level equations, ablation tables, and manuscript downloads.

---

## 📄 5. Git Commit & Push
All code updates staged, compiled, verified, committed, and pushed to your remote repository (Commit ID: `9a41460`).

---

## 🎓 6. Academic Deliverables for Review 3 (Final Capstone Review)
We have successfully compiled and committed the academic deliverables for the Final Capstone Review inside the **[Review 3/](file:///Users/aksharsakhi/Documents/Files/VScode/Project/23CSE498-Project-Phase-II/Review%203)** directory:

1. **LaTeX Technical Report**:
   * **Source File**: **[report.tex](file:///Users/aksharsakhi/Documents/Files/VScode/Project/23CSE498-Project-Phase-II/Review%203/report.tex)**
   * **Compiled Output**: **[report.pdf](file:///Users/aksharsakhi/Documents/Files/VScode/Project/23CSE498-Project-Phase-II/Review%203/report.pdf)** (5 pages)
   * **Formatting**: Clean layout featuring Amrita colors (Maroon), tables for five-way model benchmarks (Centralized vs. FedAvg vs. FedProx vs. Ditto vs. FPDAF), ablation studies, and mathematical formulations for the split-weight optimization and CUSUM Neural Trigger.
2. **LaTeX Presentation Slides**:
   * **Source File**: **[presentation.tex](file:///Users/aksharsakhi/Documents/Files/VScode/Project/23CSE498-Project-Phase-II/Review%203/presentation.tex)**
   * **Compiled Output**: **[presentation.pdf](file:///Users/aksharsakhi/Documents/Files/VScode/Project/23CSE498-Project-Phase-II/Review%203/presentation.pdf)** (10 slides)
   * **Formatting**: Standard Beamer Madrid theme modified with Maroon accents (`amritaMaroon`), covering clinical contexts, SDG mappings, split-layer neural systems, cumulative validation residual triggers, experimental telemetry, and custom Doctor/Admin workstation architectures.
3. **Citations & Image resources**:
   * **BibTeX Database**: **[ref.bib](file:///Users/aksharsakhi/Documents/Files/VScode/Project/23CSE498-Project-Phase-II/Review%203/latex/ref.bib)** (25+ peer-reviewed papers).
   * **Figures**: System Architecture, CUSUM drift dataflow, and university branding logos are saved inside `Review 3/images/`.

All files compile cleanly with zero package warnings, using the local system MacTeX engine (`/Library/TeX/texbin/pdflatex`).

---

## 🧠 7. Model Architecture Upgrade & Training Verification

We have upgraded the proposed model architecture to incorporate advanced sequence learning techniques:
1. **Bidirectional LSTM Backbone**: Replaced the unidirectional LSTM feature extractor with a bidirectional LSTM layers (`bidirectional=True`). The hidden states output processes time steps from both past-to-future and future-to-past, doubling the temporal feature representation capacity to `hidden_dim * 2`.
2. **Multi-Head Temporal Self-Attention (MHA)**: Replaced the single-head linear query attention with a custom 4-head self-attention module (`MultiHeadTemporalAttention`). It maps outputs across key/query projections, averages attention scores, and returns a high-fidelity context vector alongside a consolidated average temporal weights map.
3. **Optimized Classifier & Personalization Freezing**: The classification head is configured to map from `hidden_dim * 2` through intermediate linear projections. During concept drift episodes on client nodes, the Client-Side Selective Personalization (CSSP) protocol freezes both the LSTM and MHA backbone, adapting only the classifier head parameters locally.
4. **Execution & Sync Verification**:
   - The training script (`train_fpdaf.py`) was successfully executed, demonstrating correct training loops, loss evaluations, CUSUM drift detection thresholds, and checkpoint outputs.
   - Sepsis prediction database targets were synchronized using `backend/init_db.py`, ensuring all bedside diagnostic alerts and attention weights query from the newly upgraded model weights.

