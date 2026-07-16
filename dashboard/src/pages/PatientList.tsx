import { useState } from 'react';
import { Search, Filter, ShieldAlert, User, RefreshCw } from 'lucide-react';
import type { Patient } from '../services/mockDataService';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  setActiveTab: (tab: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  // Filter patients based on user options
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          patient.ward.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHospital = hospitalFilter === 'All' || patient.hospital.includes(hospitalFilter);
    const matchesRisk = riskFilter === 'All' || patient.riskLevel === riskFilter;
    return matchesSearch && matchesHospital && matchesRisk;
  });

  const handlePredictClick = (patient: Patient) => {
    onSelectPatient(patient);
    setActiveTab('prediction');
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      {/* Header section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white leading-tight">ICU Patient Ward Telemetry</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time Sepsis prediction monitoring across nodes</p>
      </div>

      {/* Control panel */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-4 rounded-md flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-450" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Patient ID or Bed..."
            className="w-full bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] rounded-md py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-650"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-450" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filter By:</span>
          </div>

          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="All">All Hospitals</option>
            <option value="Hospital A">Hospital A (Age &lt; 60)</option>
            <option value="Hospital B">Hospital B (Age &gt;= 60)</option>
            <option value="Hospital C">Hospital C (General)</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="All">All Risks</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0a1323] border-b border-slate-200 dark:border-[#1a2744]">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Details</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">ICU Placement</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Hospital Node</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinical Status</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Forecasting Risk</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
              {filteredPatients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-slate-50 dark:hover:bg-[#152238] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-slate-100 dark:bg-[#1a2744] flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-800 dark:text-white leading-tight">{patient.id}</h4>
                        <span className="text-[10px] text-slate-450 font-medium">{patient.age}y / {patient.gender}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{patient.ward}</span>
                  </td>

                  <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {patient.hospital}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      patient.status === 'Critical'
                        ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      <span className={`h-1 w-1 rounded-full ${patient.status === 'Critical' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                      {patient.status}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${
                      patient.riskLevel === 'High' 
                        ? 'text-red-500' 
                        : patient.riskLevel === 'Medium' 
                        ? 'text-orange-500' 
                        : 'text-emerald-500'
                    }`}>
                      {patient.riskLevel === 'High' && <ShieldAlert className="h-3.5 w-3.5" />}
                      {patient.riskLevel} Risk
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handlePredictClick(patient)}
                      className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-900/15 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 text-teal-600 dark:text-teal-400 font-semibold px-2.5 py-1.5 rounded transition-colors text-[10px]"
                    >
                      <RefreshCw className="h-3 w-3" /> Predict
                    </button>
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
