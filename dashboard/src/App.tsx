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
import { mockPatients, Patient } from './services/mockDataService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ role: 'Doctor' | 'Admin'; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient>(mockPatients[0]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar 
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

        <main className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
          {activeTab === 'dashboard' && <DashboardCDSS />}
          
          {activeTab === 'patients' && (
            <PatientList 
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

          {activeTab === 'patient-details' && (
            <PatientDetails 
              patient={selectedPatient} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'prediction' && (
            <PredictionScreen 
              patient={selectedPatient} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'xai' && (
            <ExplainableAI 
              patient={selectedPatient} 
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
