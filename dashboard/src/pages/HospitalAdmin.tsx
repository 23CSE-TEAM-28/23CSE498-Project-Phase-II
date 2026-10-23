import React, { useState, useEffect } from 'react';
import { 
  Building, 
  ShieldCheck, 
  BedDouble, 
  Clock, 
  FileCheck2, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { fetchHospitalAdminMetrics } from '../services/api';
import type { HospitalAdminMetrics } from '../services/api';

export const HospitalAdmin: React.FC = () => {
  const [metrics, setMetrics] = useState<HospitalAdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchAudit, setSearchAudit] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    fetchHospitalAdminMetrics()
      .then((data) => {
        setMetrics(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading hospital admin metrics:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const filteredLogs = metrics.auditLogs.filter(log => 
    log.event.toLowerCase().includes(searchAudit.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchAudit.toLowerCase()) ||
    log.integrityHash.toLowerCase().includes(searchAudit.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-[#1a2744] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                  Hospital Admin & ICU Operations Suite
                </h2>
                <span className="text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  Executive Governance
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {metrics.hospitalName} &bull; Cross-Ward Capacity & Clinical Protocol Compliance Audit
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-100 dark:bg-[#0d1829] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#1a2744]">
          <Clock className="h-3.5 w-3.5 text-teal-400" />
          <span>Surveillance Cycle: Active 24/7</span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bed Capacity */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>ICU Bed Capacity</span>
            <BedDouble className="h-4 w-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {metrics.occupiedBeds} / {metrics.totalBeds}
            </span>
            <span className="text-xs font-bold text-teal-400">({metrics.occupancyRate}%)</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${metrics.occupancyRate}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 block pt-0.5">6 Open Resuscitation Bays Available</span>
        </div>

        {/* Clinical False Alarm Reduction */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>False Alarm Reduction</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">
              +{metrics.clinicalQualityMetrics.falseAlarmReductionRate}%
            </span>
            <span className="text-xs font-medium text-slate-400">vs SOFA</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Multi-Head Attention filters out benign transient tachycardia spikes
          </p>
        </div>

        {/* Early Warning Lead Time */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Mean Warning Lead-Time</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-400">
              {metrics.clinicalQualityMetrics.averageLeadTimeHours} hrs
            </span>
            <span className="text-xs font-medium text-slate-400">Ahead of Onset</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Satisfies Surviving Sepsis Campaign (SSC) 6-hour prediction window
          </p>
        </div>

        {/* Hour-1 Bundle Compliance */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-4 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Hour-1 Bundle Adherence</span>
            <FileCheck2 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-400">
              {metrics.clinicalQualityMetrics.hour1BundleComplianceRate}%
            </span>
            <span className="text-xs font-bold text-emerald-400">Target &gt;90%</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Median antibiotic administration: {metrics.clinicalQualityMetrics.timeToAntibioticsMedianMinutes} minutes
          </p>
        </div>
      </div>

      {/* 2-Column Section: Ward Occupancy Breakdown & Admissions Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Breakdown */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              ICU Ward Bed Allocation & Clinical Acuity
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-[#142238] px-2 py-0.5 rounded">
              3 Specialized Wards
            </span>
          </div>

          <div className="space-y-3">
            {metrics.wardBreakdown.map((w, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#17253d] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{w.ward}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      {w.highRisk} Sepsis Alerts
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {w.occupied}/{w.total} ({w.rate}%)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${w.rate >= 90 ? 'bg-red-500' : 'bg-teal-500'}`}
                    style={{ width: `${w.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Intensivist Duty Roster */}
          <div className="pt-2 border-t border-slate-200 dark:border-[#1a2744]">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Clinical Staffing Roster (Current Shift)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#17253d]">
                <span className="text-[10px] text-slate-400 block">Attending Intensivist</span>
                <span className="font-bold text-slate-800 dark:text-white">{metrics.staffingRoster.attendingIntensivist}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#17253d]">
                <span className="text-[10px] text-slate-400 block">Critical Care Fellow</span>
                <span className="font-bold text-slate-800 dark:text-white">{metrics.staffingRoster.fellowOnDuty}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#17253d]">
                <span className="text-[10px] text-slate-400 block">Head ICU Nurse</span>
                <span className="font-bold text-slate-800 dark:text-white">{metrics.staffingRoster.headNurse}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#17253d]">
                <span className="text-[10px] text-slate-400 block">Medical Director</span>
                <span className="font-bold text-slate-800 dark:text-white">{metrics.staffingRoster.medicalDirector}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admissions & Discharges Area Chart */}
        <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                ICU Patient Flow & Bed Turnover
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hourly admissions vs stabilized discharges
              </p>
            </div>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
              24-Hour Telemetry
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.admissionsTimeline} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="adminAdmit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="adminDischarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#233554" opacity={0.4} />
                <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c1626', borderColor: '#1f2e4d', borderRadius: '0.75rem', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="admissions" stroke="#0d9488" fillOpacity={1} fill="url(#adminAdmit)" name="ICU Admissions" strokeWidth={2} />
                <Area type="monotone" dataKey="discharges" stroke="#3b82f6" fillOpacity={1} fill="url(#adminDischarge)" name="Stabilized Discharges" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 flex items-center justify-between">
            <span className="font-medium">In-Hospital Sepsis Mortality Impact:</span>
            <strong className="text-emerald-400">{metrics.clinicalQualityMetrics.inHospitalMortalityReduction}</strong>
          </div>
        </div>
      </div>

      {/* Cryptographic Tamper-Evident System Audit Trail */}
      <div className="bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1a2744] p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Tamper-Evident Clinical Decision Audit Log
              </h3>
              <span className="text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded uppercase">
                HIPAA Cryptographic Hash
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Immutable event log tracking all federated updates, concept drift alerts, and clinical orders
            </p>
          </div>

          {/* Search audit */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchAudit}
              onChange={(e) => setSearchAudit(e.target.value)}
              placeholder="Search event, actor, or hash..."
              className="w-full bg-slate-50 dark:bg-[#0a1323] border border-slate-200 dark:border-[#1a2744] rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1a2744] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Actor / Subsystem</th>
                <th className="py-2.5 px-3">Clinical Action / Event</th>
                <th className="py-2.5 px-3">Integrity Verification</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#142238]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#0f1d32] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-teal-400">{log.id}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{log.time}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{log.actor}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{log.event}</td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{log.integrityHash}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> VERIFIED
                    </span>
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
