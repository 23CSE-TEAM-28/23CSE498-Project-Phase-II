# MSME Idea Hackathon 6.0 - Form Submission Data
**Event:** Data for Evaluation by Expert Panel on 11th - 14th Aug 2026 @ Amrita  
**Project:** FPDAF (Federated Personalized Drift Alerting Framework): CLINICAL AI EARLY-WARNING WORKSTATION  

---

## SECTION 1: Applicant & General Information

### Declaration
- **Criterion:** I undertake that I satisfy the eligibility criterion...
- **Selection:** `I agree`

### 1.3 Category of Applicant (Incubatee)
- **Selection:** `Student`
- **File Upload:** Upload single combined PDF: *(Student ID + Bonafide Certificate valid till 30 Jun 2027, < 1 MB)*

### Personal & Regional Details
- **1.4 Incubatee Name (Applicant Name):** Sheela Akshar Sakhi
- **1.5 State:** Tamil Nadu
- **1.6 District:** Coimbatore
- **1.7 Registered Email ID:** aksharsakhi@gmail.com
- **1.8 Registered Mobile Number:** [Your Registered Mobile Number]
- **1.9 Category of Caste:** General
- **Consent to share Aadhaar No.:** `I agree`
- **Aadhaar No.:** [Your Aadhaar Number]
- **Name in Aadhaar:** Sheela Akshar Sakhi
- **1.10 Gender:** Male
- **1.11 Address with Pincode:** Amrita Vishwa Vidyapeetham, Amrita Nagar, Ettimadai, Coimbatore, Tamil Nadu - 641112
- **1.12 Reference No.:** [Your MSME Portal Reference Number, e.g., 26INC06TN012345]

### 1.13 Details of Associated Team Members (Updated with Exact Aadhaar Numbers)
1. Name: M. Hasini Reddy  
   Aadhaar No: 425630290206  

2. Name: K. Haswitheswari  
   Aadhaar No: 512821502827  

3. Name: Vemula Chakravarthy  
   Aadhaar No: 786936130945  

4. Name: Kousik Sarma Lakkaraju  
   Aadhaar No: 367534037827  

### 1.14 Mentor Information (Dr. Ramya G. R. - Lead Mentor & Dr. Vandhana S. - Co-Mentor)
- **1.14.1 Name and details of Mentors (Max 500 chars - Exact 382 chars):**
  > 1. Dr. Ramya G. R., Assistant Professor – CSE, Amrita School of Computing, Coimbatore. Expertise: AI, ML, Deep Learning, NLP, Social Network Analysis, Explainable AI.
  > 2. Dr. Vandhana S., Assistant Professor – CSE, Amrita School of Computing, Coimbatore. Qualification: Ph.D. (VIT). Expertise: Machine Learning, Artificial Intelligence, Spatial Epidemiology, Data Science.

- **1.14.2 Experience and Qualification of Mentors:**
  > 1. Dr. Ramya G. R.: Ph.D. in CSE from Amrita School of Computing with 18+ years of teaching and research experience. Assistant Professor, Dept of CSE, Amrita School of Computing, Amrita Vishwa Vidyapeetham, Coimbatore. Expertise in AI, ML, Deep Learning, NLP, Social Network Analysis, and Explainable AI (XAI).  
  > 2. Dr. Vandhana S.: Ph.D. from VIT University, M.E., B.Tech. Assistant Professor, School of Computing, Amrita Vishwa Vidyapeetham, Coimbatore. Research expertise in Machine Learning, Artificial Intelligence, Data Science, and Spatial Epidemiology.

- **1.14.3 Contact Details of Mentors:**
  > 1. Dr. Ramya G. R.  
  > Assistant Professor – CSE, Amrita School of Computing, Amrita Vishwa Vidyapeetham, Coimbatore  
  > Email: gr_ramya@cb.amrita.edu | Mobile: 9442549388  
  >  
  > 2. Dr. Vandhana S.  
  > Assistant Professor – CSE, Amrita School of Computing, Amrita Vishwa Vidyapeetham, Coimbatore  
  > Email: s_vandhana@cb.amrita.edu  

---

## SECTION 2: Details of Idea
*(CRITICAL RULE: NO personal/institution names included in this section)*

- **Declaration:** `I agree`

### 2.1 Title of proposed idea/innovation
> FPDAF (Federated Personalized Drift Alerting Framework): CLINICAL AI EARLY-WARNING WORKSTATION

### 2.2 Intellectual Property Details (Max 1500 chars)
> The proposed idea utilizes open-source foundational deep learning concepts (Bidirectional LSTM, Self-Attention mechanisms, and Federated Averaging primitives) and publicly available benchmark critical care datasets (PhysioNet ICU Sepsis Challenge dataset). No third-party proprietary patents or restricted commercial intellectual properties are infringed or utilized. All core adaptation algorithms, including Client-Side Selective Personalization (CSSP) and statistical CUSUM residual drift monitoring, are original technical formulations developed specifically for this solution. A provisional patent application is planned for the proprietary edge-drift adaptation mechanism.

### 2.7 Summary of the idea (Max 750 chars)
> We present FPDAF, an Edge-AI Clinical Decision Support System (CDSS) for early sepsis detection in ICUs. FPDAF processes continuous bedside vital streams using a shared Bidirectional LSTM with temporal self-attention. To solve patient data privacy and hospital demographic variation, FPDAF executes federated learning with local CUSUM drift auditing. When patient distribution drift occurs, Client-Side Selective Personalization (CSSP) selectively fine-tunes local classifier heads while keeping raw patient records local. The solution includes a functional bedside workstation dashboard providing explainable attention heatmaps to alert clinicians hours before shock onset.

### 2.8 (a) Is it a new concept?
- **Selection:** `No`
- **If no / uniqueness (Max 300 chars):**
  > Existing EHR tools (e.g. Epic, Philips) use static cloud models or rigid threshold alarms. They fail under hospital demographic drift and require centralizing patient data. Our solution uses federated learning with edge CUSUM drift adaptation and temporal XAI heatmaps without moving raw data.

### 2.8 (b) Prior art on the concept (Max 300 chars)
> Prior art includes standard Federated Averaging (FedAvg) and basic CUSUM quality control charts. However, standard FL lacks drift-triggered localized personalization, and classic CUSUM fails under SGD gradient noise. Our system combines both uniquely for bedside clinical decision support.

### 2.9 Main Problem Being Addressed (Max 500 chars)
> Sepsis causes 2.9-3.0M annual deaths in India with ICU mortality reaching 34-50%. Every hour of delayed treatment reduces survival by 8%. Existing bedside alarms trigger late after organ damage occurs, while cloud AI violates privacy (DPDPA) and fails under hospital demographic drift. FPDAF provides privacy-preserving, drift-adaptive early alerts hours before septic shock.

### 2.10 Background for getting the idea
- **a. Who is it for? (Max 300 chars):**
  > Intensive Care Unit (ICU) clinicians, critical care nurses, and hospital networks (Government Hospitals, Medical Colleges, District Hospitals, and Corporate chains) seeking automated, privacy-compliant sepsis early-warning support.
- **b. What will it do? (Max 300 chars):**
  > Continuously monitors multi-parameter ICU vital streams (HR, SBP, SpO2, Temp, Resp), predicts sepsis risk hours in advance, outputs explainable hourly attention saliency maps, and automatically adapts to local ICU patient demographics without leaking private records.
- **c. Any unique features? Explain? (Max 300 chars):**
  > 1) CUSUM Drift Auditing: Detects population shifts in real-time. 2) Client-Side Selective Personalization (CSSP): Saves 38% network bandwidth and adapts in 6 mins. 3) Bedside XAI Heatmaps: Visualizes exact sequence hours driving risk.

### 2.11 Execution Complexity & Risk Factors (Max 500 chars)
> Execution utilizes modular Edge-AI compute nodes connected to hospital bedside monitors and local SQLite warehouses via lightweight FastAPI endpoints. Implementation risk is low to moderate: clinical data drift is mitigated by automated CUSUM recalibration; hospital IT bandwidth constraints are mitigated by edge-based CSSP local head fine-tuning; alert fatigue is avoided via interpretable XAI saliency heatmaps.

### 2.12 Technology Readiness Level (TRL) (Max 200 chars)
> Technology Readiness Level: TRL 4/5. Core algorithms validated on multi-center ICU dataset. Functional Edge-AI workstation prototype and React clinician dashboard ready for shadow pilot runs.

### 2.13 Prototyping Investment Needed (Max 200 chars)
> Total estimated prototyping outlay is Rs. 15.00 Lakhs (Rs. 10 Lakhs technology/hardware prototyping, Rs. 3 Lakhs mentorship/validation, Rs. 2 Lakhs travel/pilot setup).

### 2.14 (a) How do you intend to protect IP? Status (Max 300 chars)
> Provisional Indian patent application planned covering the Client-Side Selective Personalization (CSSP) protocol and CUSUM-based drift adaptation framework. Software source code and dashboard UI will be protected via copyright and proprietary trade secrets.

### 2.14 (b) Related Background (Max 500 chars)
> Traditional clinical scoring systems (SIRS, qSOFA) rely on rigid single-parameter thresholds that trigger late. Commercial cloud AI models achieve higher accuracy but require centralizing sensitive EHR data, violating privacy mandates (DPDPA 2023). Standard federated learning (FedAvg) protects privacy but suffers severe accuracy loss when hospital patient demographics drift. Our past work benchmarked BiLSTM networks on 40 vital parameters to establish baseline performance.

### 2.15 Current Development Status (Max 500 chars)
> Core neural architecture (BiLSTM + Temporal Self-Attention), CUSUM drift detection engine, and CSSP personalized head fine-tuning algorithms are fully implemented in PyTorch. SQLite clinical warehouse, FastAPI REST backend, and interactive React Vite bedside dashboard (Doctor and Admin portals) are fully functional and validated on PhysioNet ICU sepsis dataset. Ready for shadow pilot deployment.

### 2.16 Expected Time of Completion (Max 500 chars)
> Project completion time frame: 6 to 9 months.  
> Months 1-2: Edge-AI hardware enclosure & PCB assembly with local MSME partners.  
> Months 3-4: Local network deployment & multi-node federated simulation setup.  
> Months 5-6: Shadow pilot clinical validation across 3 regional ICU partner sites.  
> Months 7-9: ISO 13485 / DPDPA audit pack compilation, CDSCO Class B filing, and commercial SaaS packaging.

### 2.19 How is this project made and used (Max 500 chars)
> Made by assembling Edge-AI compute modules (ARM/NVIDIA Jetson) running containerized PyTorch, FastAPI, and SQLite backend connected to React Vite bedside UI. Used in ICUs: local patient vitals stream into the edge node; BiLSTM + Self-Attention computes real-time sepsis risk; CUSUM monitors loss residuals for drift; CSSP fine-tunes local heads during drift without raw data leaving the site; clinicians view hourly risk dials and XAI heatmaps on bedside workstations.

---

## SECTION 3: Budget Breakup & Uploads

### 3.1 Activity-wise Breakup (Total Cost: Rs. 15.00 Lakhs)
- **a. Technology related Expenditure:** `10.00` (Lakhs)
  *(Prototyping component fabrication, edge hardware prototyping and validation, embedded assembly (3.6L), Local Clinical Curation/Annotation (3.4L), Penetration testing & DPDPA compliance audits (3.0L))*
- **b. Charges for mentor/handholding:** `3.00` (Lakhs)
  *(Incubation facility support, expert CDSS clinical validation guidance, regulatory filing mentorship)*
- **c. Travelling Expenses:** `2.00` (Lakhs)
  *(Travel expenses for physical node setup and clinical data audits across partnering regional ICUs)*
- **d. Total project cost:** `15.00` (Lakhs)

### Declarations & Uploads
- **Grant Norms & Share:** `I understand`
- **No Personal Info in Diagram:** `Agree`
- **Block Diagram PDF Upload:** Upload `fpdafarcdiagram.pdf` (or `FPDAF.pdf` from the `MSME` directory)
- **Additional Declarations (1-7):** `I agree`
