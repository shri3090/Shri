import React, { useState, useEffect } from 'react';
import { AuditEvent, Medicine, Offer, PharmacyPartner } from '../types';
import { ShieldCheck, Activity, AlertOctagon, Database, Filter, Download, CheckCircle2, Clock, FileSpreadsheet, Award, MapPin } from 'lucide-react';
import { RegionalDeliveryHeatmap } from './RegionalDeliveryHeatmap';
import { PilotMetricsView } from './PilotMetricsView';
import { PHARMACY_PARTNERS } from '../data/mockData';

interface AdminAuditViewProps {
  auditLogs: AuditEvent[];
  partners?: PharmacyPartner[];
  onClearFilter?: () => void;
}

export const AdminAuditView: React.FC<AdminAuditViewProps> = ({
  auditLogs,
  partners = PHARMACY_PARTNERS,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'pilot' | 'audit' | 'heatmap'>('pilot');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // DB Status Badge State
  const [dbStatus, setDbStatus] = useState<{
    isConnected: boolean;
    provider: 'postgresql' | 'in-memory-fallback';
    latencyMs: number;
    counts?: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    fetch('/api/db-status')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setDbStatus(data); })
      .catch(() => { /* silent if offline */ });
  }, []);

  const filteredLogs = auditLogs.filter((log) => {
    if (filterRole !== 'all' && log.role !== filterRole) return false;
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (searchTerm && !JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const exportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Entity ID', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.actor}"`,
      l.role,
      l.action,
      l.entity,
      l.entityId,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `genericmed_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900">
                Operations, Compliance & Immutable Audit Cockpit
              </h2>
              <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                PRD Section 9.11 & Section 18
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              Continuous regulatory audit logging, SLA monitoring, and exception queue for CDSCO compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab Switcher */}
          <div className="bg-rose-100/60 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              id="tab-admin-pilot"
              onClick={() => setActiveAdminTab('pilot')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeAdminTab === 'pilot'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-rose-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Phase 1 Pilot Cockpit (50 Stores)</span>
            </button>

            <button
              id="tab-admin-audit"
              onClick={() => setActiveAdminTab('audit')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeAdminTab === 'audit'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-rose-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Audit Logs</span>
            </button>

            <button
              id="tab-admin-heatmap"
              onClick={() => setActiveAdminTab('heatmap')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeAdminTab === 'heatmap'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-rose-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Logistics Heatmap</span>
            </button>
          </div>

          {activeAdminTab === 'audit' && (
            <button
              onClick={exportCsv}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* DB Status Badge */}
      {dbStatus && (
        <div
          id="db-status-badge"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-medium ${
            dbStatus.isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <Database className={`w-4 h-4 shrink-0 ${dbStatus.isConnected ? 'text-emerald-600' : 'text-amber-500'}`} />
          <span className="font-bold">
            {dbStatus.isConnected ? 'PostgreSQL Connected' : 'In-Memory Fallback Active'}
          </span>
          <span className="text-neutral-500">•</span>
          <span>{dbStatus.latencyMs}ms latency</span>
          {dbStatus.counts && (
            <>
              <span className="text-neutral-500">•</span>
              <span>
                {dbStatus.counts.pharmacyPartners ?? 0} partners · {dbStatus.counts.medicines ?? 0} medicines · {dbStatus.counts.auditEvents ?? 0} audit records
              </span>
            </>
          )}
          {!dbStatus.isConnected && (
            <span className="ml-auto text-amber-600 text-[11px]">
              Configure DATABASE_URL in .env to enable PostgreSQL persistence
            </span>
          )}
        </div>
      )}
      {/* Sub-tab 1: Phase 1 Pilot Performance & Statutory Compliance Cockpit */}
      {activeAdminTab === 'pilot' && (
        <PilotMetricsView partners={partners} />
      )}

      {/* Sub-tab 2: Immutable Regulatory Audit Trail & KPIs */}
      {activeAdminTab === 'audit' && (
        <div className="space-y-6">

      {/* PRD North Star & Core Engineering Metrics (PRD Section 4 & 14) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            North Star Metric
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            2,410 Orders
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Verified savings-enabled orders delivered successfully
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            Search Success Rate
          </span>
          <div className="text-2xl font-black text-neutral-900 mt-1">
            98.4%
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Target &gt;= 90% (Composition & Brand matching)
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            P95 Search Latency
          </span>
          <div className="text-2xl font-black text-neutral-900 mt-1">
            185 ms
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            SLA target &lt; 1,000 ms at peak throughput
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            Core Service Availability
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            99.98%
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Zero-downtime microservice architecture
          </p>
        </div>
      </div>

      {/* Exception Queue (FR-ADM-02) */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-neutral-900">
              Active Exception & Anomaly Queue (FR-ADM-02)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-neutral-500">
            3 Monitored Alerts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Partner Price Feeds Freshness</span>
            </div>
            <p className="text-emerald-800 text-[11px]">
              5/5 partner feeds updated within last 60 minutes. 0 stale feeds suppressed.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Prescription SLA Monitoring</span>
            </div>
            <p className="text-blue-800 text-[11px]">
              Average pharmacist review turnaround: <strong>4.2 minutes</strong>. 100% within 15m SLA.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
              <span>Drug License Expiry Audit</span>
            </div>
            <p className="text-neutral-600 text-[11px]">
              All partner retail chemists have active Form 20B/21B licenses verified on state portal.
            </p>
          </div>
        </div>
      </div>

      {/* Regional Order Delivery Concentration Heat Map (PRD Section 14 & Section 18) */}
      <RegionalDeliveryHeatmap />

      {/* Immutable Audit Log Table (FR-ADM-04 & Section 18) */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-base text-neutral-900">
                Immutable Regulatory Audit Trail (Section 18)
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              WORM (Write Once, Read Many) compliant event log capturing all clinical, financial, and partner inventory events
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-1.5 px-2.5 rounded-lg border border-neutral-300 text-xs w-44"
            />

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="p-1.5 rounded-lg border border-neutral-300 text-xs text-neutral-800"
            >
              <option value="all">All Roles</option>
              <option value="Customer">Customer</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Partner Chemist">Partner Chemist</option>
              <option value="System">System</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="border border-neutral-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-neutral-100/70 border-b border-neutral-200 text-[11px] font-semibold text-neutral-700">
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Actor & Role</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Audit Details & Cryptographic Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-semibold text-neutral-900">{log.actor}</div>
                    <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                    {log.entity} ({log.entityId})
                  </td>
                  <td className="p-3 text-neutral-700 text-xs">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}

      {/* Sub-tab 3: Regional Order Delivery Concentration Heat Map */}
      {activeAdminTab === 'heatmap' && (
        <RegionalDeliveryHeatmap />
      )}
    </div>
  );
};
