export interface Patient {
  id: string;
  age: number;
  gender: 'Male' | 'Female';
  hospital: string;
  ward: string;
  admittedAt: string;
  status: 'Stable' | 'Critical' | 'Discharged';
  riskLevel: 'Low' | 'Medium' | 'High';
  scores: {
    centralized: number;
    fedavg: number;
    fedprox: number;
    ditto: number;
    fpdaf: number;
    fpdaf_v2?: number;
  };
  latestVitals?: {
    heartRate: number;
    spo2: number;
  };
  confidence: number;
}

export interface VitalSignRecord {
  hour: number;
  heartRate: number;
  bloodPressure: number;
  meanArterialPressure?: number;
  temperature: number;
  respiration: number;
  spo2: number;
}

export interface AttentionData {
  hour: number;
  attentionScore: number;
}

export interface FeatureImportance {
  name: string;
  importance: number;
  color: string;
}

export interface DriftRecord {
  round: number;
  client0: number;
  client1: number;
  client2: number;
  jsd_divergence?: number;
  w_grad?: number;
  kappa_r?: number;
}

export interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auroc: number;
  commCost: string;
  trainTime: string;
  driftAdaptTime: string;
  color: string;
}

export interface ICUStats {
  total_patients: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  admissions: Array<{ time: string; admissions: number; discharges: number }>;
  trends: Array<{ date: string; sepsisAlerts: number; fpdafBypasses: number }>;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
  category: 'Observation' | 'Intervention' | 'Alert';
}

// ----------------- LIVE REAL PYTORCH INFERENCE INTERFACES -----------------

export interface VitalsOverride {
  heart_rate?: number;
  spo2?: number;
  temperature?: number;
  blood_pressure?: number;
  mean_arterial_pressure?: number;
  respiration?: number;
  wbc?: number;
  lactate?: number;
}

export interface LiveInferenceRequest {
  patient_id?: string;
  client_node?: number;
  vitals_override?: VitalsOverride;
}

export interface FeatureAttribution {
  feature: string;
  value: number;
  unit: string;
  normalRange: string;
  attribution: number;
  status: 'Critical' | 'Normal' | 'Warning';
}

export interface LiveInferenceResponse {
  patientId: string;
  inferenceEngine: string;
  inferenceLatencyMs: number;
  tensorDimensions: number[];
  groundTruth: number;
  probabilities: {
    centralized: number;
    fedavg: number;
    fedprox: number;
    ditto: number;
    fpdaf: number;
    fpdaf_v2: number;
  };
  riskAssessment: {
    status: 'Critical' | 'Stable';
    riskLevel: 'High' | 'Medium' | 'Low';
    confidencePct: number;
    leadTimeHours: number;
    bundleProtocol: string;
  };
  attentionWeights: Array<{
    hour: number;
    weight: number;
    isCritical: boolean;
  }>;
  topFeatureAttributions: FeatureAttribution[];
  timestamp: string;
}

// ----------------- MULTI-CENTER HOSPITAL FEDERATED NODES -----------------

export interface HospitalNodeInfo {
  id: string;
  name: string;
  shortName: string;
  tier: string;
  location: string;
  role: string;
  activeBeds: number;
  totalBeds: number;
  occupancyRate: number;
  patientsMonitored: number;
  criticalSepsisCount: number;
  federatedMetadata: {
    cohortShare: string;
    sampleCount: string;
    localAuroc: number;
    localAccuracy: number;
    driftStatisticSr: number;
    driftThreshold: number;
    driftStatus: string;
    csspStatus: string;
    backboneState: string;
    headState: string;
    privacyBudgetEpsilon: number;
    privacyBudgetDelta: string;
    bandwidthSaved: string;
    lastSync: string;
  };
}

// ----------------- HOSPITAL ADMIN & OPERATIONS -----------------

export interface AuditLogEntry {
  id: string;
  time: string;
  actor: string;
  event: string;
  integrityHash: string;
  status: string;
}

export interface HospitalAdminMetrics {
  hospitalName: string;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  totalMonitoredPatients: number;
  activeSepsisAlerts: number;
  clinicalQualityMetrics: {
    falseAlarmReductionRate: number;
    averageLeadTimeHours: number;
    hour1BundleComplianceRate: number;
    timeToAntibioticsMedianMinutes: number;
    inHospitalMortalityReduction: string;
  };
  wardBreakdown: Array<{
    ward: string;
    occupied: number;
    total: number;
    rate: number;
    highRisk: number;
  }>;
  admissionsTimeline: Array<{
    hour: string;
    admissions: number;
    discharges: number;
  }>;
  staffingRoster: {
    attendingIntensivist: string;
    fellowOnDuty: string;
    headNurse: string;
    medicalDirector: string;
  };
  auditLogs: AuditLogEntry[];
}

// ----------------- COMPREHENSIVE PATIENT FULL PROFILE -----------------

export interface PatientFullProfile {
  id: string;
  age: number;
  gender: 'Male' | 'Female';
  hospital: string;
  ward: string;
  admittedAt: string;
  status: 'Stable' | 'Critical' | 'Discharged';
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
  latestVitals: {
    heartRate: number;
    bloodPressure: number;
    meanArterialPressure: number;
    temperature: number;
    respiration: number;
    spo2: number;
  };
  sofaScore: {
    total: number;
    max: number;
    interpretation: string;
    cardiovascular: number;
    respiratory: number;
    renal: number;
    coagulation: number;
    liver: number;
    cns: number;
  };
  qsofaScore: {
    score: number;
    max: number;
    interpretation: string;
  };
  laboratories: {
    lactate: number;
    lactateUnit: string;
    lactateRef: string;
    wbc: number;
    wbcUnit: string;
    wbcRef: string;
    creatinine: number;
    creatinineUnit: string;
    creatinineRef: string;
    platelets: number;
    plateletsUnit: string;
    plateletsRef: string;
    bilirubin: number;
    bilirubinUnit: string;
    bilirubinRef: string;
    ph: number;
    phRef: string;
  };
  scores: {
    centralized: number;
    fedavg: number;
    fedprox: number;
    ditto: number;
    fpdaf: number;
    fpdaf_v2?: number;
  };
  vitalsHistory: VitalSignRecord[];
  attentionWeights: Array<{ hour: number; attentionScore: number }>;
  notes: ClinicalNote[];
}

const API_BASE_URL = "http://localhost:8000/api";

// ----------------- API CLIENT FUNCTIONS -----------------

export const fetchPatients = async (): Promise<Patient[]> => {
  const res = await fetch(`${API_BASE_URL}/patients`);
  if (!res.ok) throw new Error("API Patients Error");
  return await res.json();
};

export const fetchPatientVitals = async (patientId: string): Promise<VitalSignRecord[]> => {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/vitals`);
  if (!res.ok) throw new Error("API Vitals Error");
  return await res.json();
};

export const fetchPatientAttention = async (patientId: string): Promise<AttentionData[]> => {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/attention`);
  if (!res.ok) throw new Error("API Attention Error");
  return await res.json();
};

export const fetchPatientNotes = async (patientId: string): Promise<ClinicalNote[]> => {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/notes`);
  if (!res.ok) throw new Error("API Notes Error");
  return await res.json();
};

export const addPatientNote = async (
  patientId: string, 
  note: { author: string; role: string; content: string; category: 'Observation' | 'Intervention' | 'Alert' }
): Promise<ClinicalNote> => {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note)
  });
  if (!res.ok) throw new Error("API Post Note Error");
  return await res.json();
};

export const fetchDriftData = async (): Promise<DriftRecord[]> => {
  const res = await fetch(`${API_BASE_URL}/drift`);
  if (!res.ok) throw new Error("API Drift Error");
  return await res.json();
};

export const fetchModelComparison = async (): Promise<ModelMetrics[]> => {
  const res = await fetch(`${API_BASE_URL}/comparison`);
  if (!res.ok) throw new Error("API Comparison Error");
  return await res.json();
};

export const fetchAblationData = async (): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/ablation`);
  if (!res.ok) throw new Error("API Ablation Error");
  return await res.json();
};

export const fetchStats = async (): Promise<ICUStats> => {
  const res = await fetch(`${API_BASE_URL}/stats`);
  if (!res.ok) throw new Error("API Stats Error");
  return await res.json();
};

// ----------------- NEW ENDPOINTS -----------------

export const runLiveInference = async (request: LiveInferenceRequest): Promise<LiveInferenceResponse> => {
  const res = await fetch(`${API_BASE_URL}/inference/live`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });
  if (!res.ok) throw new Error("Live PyTorch Inference Error");
  return await res.json();
};

export const fetchHospitalNodes = async (): Promise<HospitalNodeInfo[]> => {
  const res = await fetch(`${API_BASE_URL}/hospital/nodes`);
  if (!res.ok) throw new Error("Hospital Nodes API Error");
  return await res.json();
};

export const syncHospitalNode = async (nodeId: string): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/hospital/nodes/${nodeId}/sync`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Hospital Sync API Error");
  return await res.json();
};

export const fetchHospitalAdminMetrics = async (): Promise<HospitalAdminMetrics> => {
  const res = await fetch(`${API_BASE_URL}/hospital/admin/metrics`);
  if (!res.ok) throw new Error("Hospital Admin API Error");
  return await res.json();
};

export const fetchPatientFullProfile = async (patientId: string): Promise<PatientFullProfile> => {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/full`);
  if (!res.ok) throw new Error("Patient Full Profile API Error");
  return await res.json();
};

export const getFeatureImportance = (): FeatureImportance[] => {
  return [
    { name: "Heart Rate", importance: 0.28, color: "#ef4444" },
    { name: "MAP", importance: 0.22, color: "#3b82f6" },
    { name: "Temperature", importance: 0.18, color: "#f59e0b" },
    { name: "Respiration", importance: 0.14, color: "#10b981" },
    { name: "SpO2", importance: 0.10, color: "#06b6d4" },
    { name: "WBC Count", importance: 0.08, color: "#8b5cf6" }
  ];
};
