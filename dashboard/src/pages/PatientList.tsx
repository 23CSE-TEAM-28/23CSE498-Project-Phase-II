import { useState } from 'react';
import { Search, Filter, ShieldAlert, User, Activity, FileText, ArrowUpDown } from 'lucide-react';
import type { Patient } from '../services/api';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  setActiveTab: (tab: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'id' | 'risk' | 'age'>('risk');

  // Filter and sort patients based on user options
  const filteredPatients = patients
    .filter(patient => {
      const matchesSearch = patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            patient.ward.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHospital = hospitalFilter === 'All' || patient.hospital.includes(hospitalFilter);
      const matchesRisk = riskFilter === 'All' || patient.riskLevel === riskFilter;
      return matchesSearch && matchesHospital && matchesRisk;
    })
    .sort((a, b) => {
      if (sortBy === 'risk') {
        const order = { High: 3, Medium: 2, Low: 1 };
        return order[b.riskLevel] - order[a.riskLevel];
      }
      if (sortBy === 'age') {
        return b.age - a.age;
      }
      return a.id.localeCompare(b.id);
    });

  const handlePredictClick = (patient: Patient) => {
    onSelectPatient(patient);
    setActiveTab('prediction');
  };

  const handleDetailsClick = (patient: Patient) => {
    onSelectPatient(patient);
    setActiveTab('patient-details');
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] font-sans">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">ICU Patient Ward Telemetry Cohort</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time Sepsis Risk Monitoring across Node Hospital Wards</p>
        </div>

        <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-3.5 py-1.5 rounded-full border border-teal-500/20">
          Showing {filteredPatients.length} Active ICU Beds
        </span>
      </div>

      {/* Control panel */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Patient ID, Ward, Bed..."
            className="w-full bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filter:</span>
          </div>

          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All Hospital Nodes</option>
            <option value="Hospital 1">Hospital 1</option>
            <option value="Hospital 2">Hospital 2</option>
            <option value="Hospital 3">Hospital 3</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All Risk Profiles</option>
            <option value="High">High Sepsis Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          <button
            onClick={() => setSortBy(prev => prev === 'risk' ? 'age' : 'risk')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-400 transition-colors"
          >
            <ArrowUpDown className="h-3.5 w-3.5" /> Sort: {sortBy === 'risk' ? 'High Risk First' : 'By Age'}
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0a1323] border-b border-slate-200 dark:border-[#1a2744]">
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Bed & Patient</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Ward Placement</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Hospital Node</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical Telemetry</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">FPDAF Probability</th>
                <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
              {filteredPatients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-slate-50/80 dark:hover:bg-[#152238]/60 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">{patient.id}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{patient.age}y / {patient.gender}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{patient.ward}</span>
                  </td>

                  <td className="px-5 py-4 text-xs text-slate-400 font-medium">
                    {patient.hospital}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`telemetry-mono text-xs font-black ${
                        (patient.latestVitals?.heartRate || 80) > 100 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        HR {patient.latestVitals?.heartRate || '--'} bpm
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className={`telemetry-mono text-xs font-black ${
                        (patient.latestVitals?.spo2 || 96) < 92 ? 'text-red-500' : 'text-cyan-500 dark:text-cyan-400'
                      }`}>
                        SpO₂ {patient.latestVitals?.spo2 || '--'}%
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {(() => {
                      const fpdafScore = patient.scores.fpdaf_v2 ?? patient.scores.fpdaf;
                      const scorePct = Math.round((fpdafScore || 0.1) * 100);
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-black flex items-center gap-1 ${
                              patient.riskLevel === 'High' 
                                ? 'text-red-500' 
                                : patient.riskLevel === 'Medium' 
                                ? 'text-amber-500' 
                                : 'text-emerald-500'
                            }`}>
                              {patient.riskLevel === 'High' && <ShieldAlert className="h-3.5 w-3.5" />}
                              {patient.riskLevel}
                            </span>
                            <span className={`telemetry-mono font-bold ${patient.riskLevel === 'High' ? 'text-red-400' : 'text-slate-400'}`}>
                              {scorePct}%
                            </span>
                          </div>
                          <div className="w-24 bg-slate-200 dark:bg-[#152238] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                patient.riskLevel === 'High' ? 'bg-red-500' : patient.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${scorePct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDetailsClick(patient)}
                        className="inline-flex items-center gap-1 bg-slate-100 dark:bg-[#152238] hover:bg-slate-200 dark:hover:bg-[#1c2c48] text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-xl transition-all text-[11px]"
                      >
                        <FileText className="h-3.5 w-3.5 text-teal-400" /> Records
                      </button>

                      <button
                        onClick={() => handlePredictClick(patient)}
                        className="inline-flex items-center gap-1 bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1.5 rounded-xl shadow-md shadow-teal-600/20 transition-all text-[11px]"
                      >
                        <Activity className="h-3.5 w-3.5" /> Predict
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

