import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
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
import { fetchPatients } from './services/mockDataService';
import type { Patient } from './services/mockDataService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ role: 'Doctor' | 'Admin'; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hasConnectionError, setHasConnectionError] = useState(false);

  // Load patients from API
  useEffect(() => {
    fetchPatients()
      .then((data) => {
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatient(data[0]);
        }
        setHasConnectionError(false);
      })
      .catch((err) => {
        console.error("Clinical Server Offline: Failed to fetch patient cohort.", err);
        setHasConnectionError(true);
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
    <div className="flex h-screen w-screen bg-slate-100 dark:bg-[#080e1a] text-slate-800 dark:text-slate-200 transition-colors overflow-hidden">
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
          userName={user.name} 
          theme={theme} 
          setTheme={setTheme} 
        />

        <main className="flex-1 overflow-hidden bg-slate-100 dark:bg-[#080e1a] transition-colors">
          {hasConnectionError ? (
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
              <AlertTriangle className="h-16 w-16 text-amber-500 animate-bounce" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Clinical Node Offline</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Unable to connect to the SQLite clinical warehouse database server (port 8000). Please ensure your FastAPI backend is running.
              </p>
              <code className="bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded font-mono text-xs dark:text-slate-350 select-all">
                python3 backend/main.py
              </code>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardCDSS />}
              
              {activeTab === 'patients' && (
                <PatientList 
                  patients={patients}
                  onSelectPatient={setSelectedPatient} 
                  setActiveTab={(tab) => {
                    // If user clicks predict, redirect properly
                    if (tab === 'prediction') {
                      setActiveTab('patient-details');
                    } else {
                      setActiveTab(tab);
                    }
                  }} 
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

              {activeTab === 'xai' && selectedPatient && (
                <ExplainableAI 
                  patient={selectedPatient} 
                />
              )}

              {activeTab === 'drift' && <DriftMonitor />}
              
              {activeTab === 'federated' && <FLMonitor />}
              
              {activeTab === 'comparison' && <ModelComparison />}
              
              {activeTab === 'research' && <ResearchInsights />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
