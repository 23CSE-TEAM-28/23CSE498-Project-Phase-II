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
  // Novel AD-CUSUM specific metrics
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

const API_BASE_URL = "http://localhost:8000/api";

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

export const getFeatureImportance = (): FeatureImportance[] => [
  { name: "Heart Rate (HR)", importance: 35, color: "#ef4444" },
  { name: "Systolic Blood Pressure (SBP)", importance: 28, color: "#f97316" },
  { name: "Oxygen Saturation (SpO₂)", importance: 22, color: "#3b82f6" },
  { name: "Body Temperature (Temp)", importance: 15, color: "#10b981" }
];
