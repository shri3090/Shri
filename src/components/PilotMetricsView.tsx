import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  ThermometerSnowflake,
  Store,
  MapPin,
  FileCheck,
  Search,
  ExternalLink,
  Award,
} from 'lucide-react';
import { PharmacyPartner } from '../types';

interface PilotMetricsViewProps {
  partners: PharmacyPartner[];
}

export const PilotMetricsView: React.FC<PilotMetricsViewProps> = ({ partners }) => {
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('all');
  const [searchKendraQuery, setSearchKendraQuery] = useState<string>('');

  const clusterStats = [
    {
      cluster: 'Mumbai MMR',
      state: 'Maharashtra',
      stores: 15,
      slaCompliance: '99.1%',
      avgMinutes: 31,
      coldChainRate: '98.8%',
      savings: '₹5,82,400',
    },
    {
      cluster: 'Pune Hub',
      state: 'Maharashtra',
      stores: 9,
      slaCompliance: '98.6%',
      avgMinutes: 33,
      coldChainRate: '98.2%',
      savings: '₹2,44,100',
    },
    {
      cluster: 'Delhi NCR',
      state: 'Delhi',
      stores: 9,
      slaCompliance: '97.9%',
      avgMinutes: 29,
      coldChainRate: '98.5%',
      savings: '₹3,18,600',
    },
    {
      cluster: 'Bengaluru',
      state: 'Karnataka',
      stores: 9,
      slaCompliance: '98.2%',
      avgMinutes: 34,
      coldChainRate: '97.9%',
      savings: '₹2,12,300',
    },
    {
      cluster: 'Hyderabad',
      state: 'Telangana',
      stores: 8,
      slaCompliance: '98.0%',
      avgMinutes: 32,
      coldChainRate: '98.4%',
      savings: '₹1,91,200',
    },
  ];

  const filteredPartners = partners.filter((p) => {
    if (selectedClusterFilter === 'mumbai' && p.city !== 'Mumbai') return false;
    if (selectedClusterFilter === 'pune' && p.city !== 'Pune') return false;
    if (selectedClusterFilter === 'delhi' && p.city !== 'Delhi') return false;
    if (selectedClusterFilter === 'bengaluru' && p.city !== 'Bengaluru') return false;
    if (selectedClusterFilter === 'hyderabad' && p.city !== 'Hyderabad') return false;

    if (searchKendraQuery.trim()) {
      const q = searchKendraQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.licenseNumber.toLowerCase().includes(q) ||
        p.pincode.includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Phase 1 Pilot Operational Dashboard • 50 Stores Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            National Pilot Performance & Statutory Compliance Cockpit
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Live telemetry, CDSCO Rule 65 regulatory verification, and delivery performance metrics across the 50 pilot <strong>Pradhan Mantri Jan Aushadhi Kendras</strong> and licensed chemist hubs in India.
          </p>
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Pilot Stores</span>
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">50 / 50</div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Form 20B/21B Verified</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Avg Hyperlocal SLA</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">32.8 min</div>
          <div className="text-[11px] text-blue-700 font-semibold">
            <span>Target: &lt; 60 min (98.4% met)</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Cold-Chain Telemetry</span>
            <ThermometerSnowflake className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">98.4%</div>
          <div className="text-[11px] text-cyan-800 font-semibold">
            <span>Maintained &lt; 8°C in transit</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Total Patient Savings</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800">₹15.48 L</div>
          <div className="text-[11px] text-neutral-500">
            <span>vs. Branded MRP baseline</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Rx Review Speed</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">11.4 min</div>
          <div className="text-[11px] text-purple-700 font-semibold">
            <span>By Registered Pharmacists</span>
          </div>
        </div>
      </div>

      {/* Regional Cluster Breakdown Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/50">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Regional Healthcare Corridors & Performance Metrics
            </h2>
            <p className="text-xs text-neutral-500">
              Aggregated fulfillment SLAs, cold-chain preservation rates, and patient savings across pilot cities.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="p-3.5 font-semibold">Cluster Corridor</th>
                <th className="p-3.5 font-semibold">State Jurisdiction</th>
                <th className="p-3.5 font-semibold">Active Pilot Stores</th>
                <th className="p-3.5 font-semibold">SLA Compliance</th>
                <th className="p-3.5 font-semibold">Avg Delivery Time</th>
                <th className="p-3.5 font-semibold">Cold-Chain Rate</th>
                <th className="p-3.5 font-semibold text-right">Cumulative Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {clusterStats.map((c, i) => (
                <tr key={i} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="p-3.5 font-bold text-neutral-900 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{c.cluster}</span>
                  </td>
                  <td className="p-3.5 text-neutral-600">{c.state}</td>
                  <td className="p-3.5 font-mono font-semibold">{c.stores} Stores</td>
                  <td className="p-3.5 font-semibold text-emerald-700">{c.slaCompliance}</td>
                  <td className="p-3.5 font-mono">{c.avgMinutes} mins</td>
                  <td className="p-3.5 font-mono text-cyan-700">{c.coldChainRate}</td>
                  <td className="p-3.5 font-bold text-emerald-800 text-right">{c.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CDSCO Rule 65 Compliance Audit Verification Box */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-neutral-900">
              Drugs and Cosmetics Rules, 1945 (Rule 65) Statutory Compliance Status
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            ✓ 100% Audit Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Registered Pharmacist Supervision</span>
            </div>
            <p className="text-neutral-600 text-[11px] leading-relaxed">
              Every Schedule H/H1 formulation verified and approved by a qualified pharmacist registered under the Pharmacy Act, 1948 before order release.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Digital Register & 3-Year Record Retention</span>
            </div>
            <p className="text-neutral-600 text-[11px] leading-relaxed">
              Prescription images, doctor registration numbers, and batch dispense records securely logged with WORM-compliant tamper-evident audit timestamps.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Drug License (Form 20B/21B) Verification</span>
            </div>
            <p className="text-neutral-600 text-[11px] leading-relaxed">
              All 50 pilot partners possess active Form 20B (wholesale/retail) & 21B (biological) licenses authenticated with State Food & Drug Administrations (FDAs).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cold-Chain Transit Protocol (&lt; 8°C)</span>
            </div>
            <p className="text-neutral-600 text-[11px] leading-relaxed">
              Biologicals, insulins, and temperature-sensitive drugs packaged with phase-change material (PCM) cool-packs and temperature-log stickers.
            </p>
          </div>
        </div>
      </div>

      {/* Pilot Kendra Directory Search & Inspection */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-neutral-900">
              Pilot Kendra Directory & License Registry ({filteredPartners.length} of {partners.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Filter by city cluster or search by partner name, drug license number, or PIN code.
            </p>
          </div>

          {/* Cluster filter pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {['all', 'mumbai', 'pune', 'delhi', 'bengaluru', 'hyderabad'].map((cl) => (
              <button
                key={cl}
                onClick={() => setSelectedClusterFilter(cl)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                  selectedClusterFilter === cl
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cl === 'all' ? 'All 50' : cl}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchKendraQuery}
            onChange={(e) => setSearchKendraQuery(e.target.value)}
            placeholder="Search by Kendra Name (e.g. 'Kothrud #1010', 'AIIMS #1016'), License No, or PIN..."
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 bg-neutral-50/50 focus:bg-white focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* Grid of Partners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
          {filteredPartners.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/30 hover:border-neutral-300 hover:bg-white transition-all space-y-1.5 text-xs"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="font-bold text-neutral-900 text-xs leading-tight">
                  {p.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                    p.isJanAushadhiKendra
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}
                >
                  {p.isJanAushadhiKendra ? 'PMBJK' : 'Licensed Chemist'}
                </span>
              </div>

              <div className="text-[11px] text-neutral-500 font-mono">
                Lic: {p.licenseNumber}
              </div>

              <div className="text-[11px] text-neutral-500 font-mono">
                GSTIN: {p.gstin}
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-1 border-t border-neutral-100">
                <span>PIN: <strong>{p.pincode}</strong> ({p.city})</span>
                <span className="text-amber-700 font-semibold">★ {p.rating.toFixed(1)} ({p.reviewCount})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
