import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { DashboardCDSS } from './pages/DashboardCDSS';
import { HospitalNetwork } from './pages/HospitalNetwork';
import { HospitalAdmin } from './pages/HospitalAdmin';
import { PatientList } from './pages/PatientList';
import { PatientDetails } from './pages/PatientDetails';
import { PredictionScreen } from './pages/PredictionScreen';
import { ExplainableAI } from './pages/ExplainableAI';
import { DriftMonitor } from './pages/DriftMonitor';
import { FLMonitor } from './pages/FLMonitor';
import { ModelComparison } from './pages/ModelComparison';
import { ResearchInsights } from './pages/ResearchInsights';
import { fetchPatients } from './services/api';
import type { Patient } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ role: 'Doctor' | 'Admin' | 'Full Access'; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default to dark mode for medical aesthetics
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Load patients from API or Fallback
  useEffect(() => {
    fetchPatients()
      .then((data) => {
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatient(data[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch initial patients:", err);
      });
  }, []);

  // Dark Mode side effects
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleLoginSuccess = (role: 'Doctor' | 'Admin', name: string) => {
    setUser({ role, name });
    setIsAuthenticated(true);
    // Role-dependent landing tab
    if (role === 'Admin') {
      setActiveTab('hospital-network');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Active patient fallback
  const currentPatient = selectedPatient || (patients.length > 0 ? patients[0] : {
    id: "PAT-1000",
    age: 68,
    gender: "Male" as const,
    hospital: "Hospital 1",
    ward: "ICU Bed 01",
    admittedAt: "2026-07-15 12:00",
    status: "Critical" as const,
    riskLevel: "High" as const,
    scores: {
      centralized: 0.81,
      fedavg: 0.76,
      fedprox: 0.78,
      ditto: 0.79,
      fpdaf: 0.84,
      fpdaf_v2: 0.9418
    },
    latestVitals: { heartRate: 122, spo2: 90 },
    confidence: 94
  });

  return (
    <div className="flex h-screen w-screen bg-slate-100 dark:bg-[#080e1a] text-slate-800 dark:text-slate-200 transition-colors overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Sidebar 
        userRole={user.role}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      {/* Main clinical workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          userRole={user.role}
          setUserRole={(newRole) => {
            setUser(prev => prev ? { ...prev, role: newRole } : null);
            if (newRole === 'Admin') setActiveTab('hospital-network');
            if (newRole === 'Doctor') setActiveTab('dashboard');
          }}
          userName={user.name} 
          theme={theme} 
          setTheme={setTheme}
          isLiveStreaming={isLiveStreaming}
          setIsLiveStreaming={setIsLiveStreaming}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 overflow-hidden bg-slate-100 dark:bg-[#080e1a] transition-colors relative">
          {/* 1. Clinician Doctor CDSS Overview */}
          {activeTab === 'dashboard' && (
            <DashboardCDSS 
              onSelectPatient={setSelectedPatient} 
              setActiveTab={setActiveTab} 
            />
          )}

          {/* 2. Hospital Side Network (3 Multi-Center Silos) */}
          {activeTab === 'hospital-network' && (
            <HospitalNetwork />
          )}

          {/* 3. Hospital Admin Operations & Audit Suite */}
          {activeTab === 'hospital-admin' && (
            <HospitalAdmin />
          )}
          
          {/* 4. ICU Patient Ward Cohort */}
          {activeTab === 'patients' && (
            <PatientList 
              patients={patients}
              onSelectPatient={setSelectedPatient} 
              setActiveTab={setActiveTab} 
            />
          )}

          {/* 5. Patient Bedside Monitor */}
          {activeTab === 'patient-details' && (
            <PatientDetails 
              patient={currentPatient} 
              setActiveTab={setActiveTab} 
            />
          )}

          {/* 6. Sepsis Predictor & Live PyTorch Engine */}
          {activeTab === 'prediction' && (
            <PredictionScreen 
              patient={currentPatient} 
              setActiveTab={setActiveTab} 
            />
          )}

          {/* 7. Explainable AI */}
          {activeTab === 'xai' && (
            <ExplainableAI 
              patient={currentPatient} 
            />
          )}

          {/* 8. AD-CUSUM Drift Monitor */}
          {activeTab === 'drift' && <DriftMonitor />}
          
          {/* 9. Federated Learning Monitor */}
          {activeTab === 'federated' && <FLMonitor />}
          
          {/* 10. Model Benchmarks */}
          {activeTab === 'comparison' && <ModelComparison />}
          
          {/* 11. Research Insights & Methodology */}
          {activeTab === 'research' && <ResearchInsights />}
        </main>
      </div>
    </div>
  );
}

export default App;
