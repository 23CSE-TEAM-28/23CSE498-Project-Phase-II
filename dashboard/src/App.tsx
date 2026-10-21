import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { DashboardCDSS } from './pages/DashboardCDSS';
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
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

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
          setUserRole={(newRole) => setUser(prev => prev ? { ...prev, role: newRole } : null)}
          userName={user.name} 
          theme={theme} 
          setTheme={setTheme}
          isLiveStreaming={isLiveStreaming}
          setIsLiveStreaming={setIsLiveStreaming}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 overflow-hidden bg-slate-100 dark:bg-[#080e1a] transition-colors relative">
          {activeTab === 'dashboard' && (
            <DashboardCDSS 
              onSelectPatient={setSelectedPatient} 
              setActiveTab={setActiveTab} 
            />
          )}
          
          {activeTab === 'patients' && (
            <PatientList 
              patients={patients}
              onSelectPatient={setSelectedPatient} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'patient-details' && selectedPatient && (
            <PatientDetails 
              patient={selectedPatient} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'prediction' && selectedPatient && (
            <PredictionScreen 
              patient={selectedPatient} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'xai' && (selectedPatient || patients[0]) && (
            <ExplainableAI 
              patient={selectedPatient || patients[0]} 
            />
          )}

          {activeTab === 'drift' && <DriftMonitor />}
          
          {activeTab === 'federated' && <FLMonitor />}
          
          {activeTab === 'comparison' && <ModelComparison />}
          
          {activeTab === 'research' && <ResearchInsights />}
        </main>
      </div>
    </div>
  );
}

export default App;

