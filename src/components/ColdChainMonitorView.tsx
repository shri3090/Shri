import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { ColdChainSensor, ColdChainReading, ColdChainAlert, ColdChainAlertSeverity } from '../types';
import { COLD_CHAIN_SENSORS, COLD_CHAIN_READINGS, INITIAL_COLD_CHAIN_ALERTS } from '../data/mockData';
import {
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  WifiOff,
  ShieldCheck,
  Battery,
  Clock,
  Wifi,
  Bluetooth,
  Radio,
  FileText,
  ChevronRight,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function sensorStatusConfig(status: ColdChainSensor['status']): {
  icon: React.ReactNode;
  badge: string;
  dot: string;
} {
  switch (status) {
    case 'Active':
      return { icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
    case 'Warning':
      return { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, badge: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-400' };
    case 'Breach':
      return { icon: <XCircle className="w-4 h-4 text-rose-600" />, badge: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500 animate-pulse' };
    case 'Offline':
      return { icon: <WifiOff className="w-4 h-4 text-neutral-400" />, badge: 'bg-neutral-100 text-neutral-600 border-neutral-300', dot: 'bg-neutral-300' };
    case 'Inactive':
      return { icon: <WifiOff className="w-4 h-4 text-neutral-300" />, badge: 'bg-neutral-50 text-neutral-400 border-neutral-200', dot: 'bg-neutral-200' };
  }
}

function alertSeverityConfig(sev: ColdChainAlertSeverity): { badge: string; icon: React.ReactNode } {
  switch (sev) {
    case 'Critical': return { badge: 'bg-rose-100 text-rose-800 border-rose-300', icon: <XCircle className="w-3.5 h-3.5 text-rose-600" /> };
    case 'Warning':  return { badge: 'bg-amber-100 text-amber-800 border-amber-300', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> };
    case 'Info':     return { badge: 'bg-blue-100 text-blue-800 border-blue-300', icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> };
  }
}

function typeIcon(type: ColdChainSensor['type']) {
  switch (type) {
    case 'BLE':      return <Bluetooth className="w-3 h-3" />;
    case 'Cellular': return <Radio className="w-3 h-3" />;
    case 'WiFi':     return <Wifi className="w-3 h-3" />;
  }
}

// ── D3 Temperature Timeline Chart ────────────────────────────────────────────

interface TempChartProps {
  readings: ColdChainReading[];
  minThreshold: number;
  maxThreshold: number;
}

const TempChart: React.FC<TempChartProps> = ({ readings, minThreshold, maxThreshold }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || readings.length === 0) return;

    const el = svgRef.current;
    const W = el.clientWidth || 600;
    const H = 180;
    const margin = { top: 16, right: 16, bottom: 32, left: 38 };
    const iW = W - margin.left - margin.right;
    const iH = H - margin.top - margin.bottom;

    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el)
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const parseTime = (d: ColdChainReading) => new Date(d.recordedAt);
    const xExtent = d3.extent(readings, parseTime) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, iW]);

    const allTemps = readings.map(r => r.tempC);
    const yMin = Math.min(d3.min(allTemps) ?? 0, minThreshold - 1);
    const yMax = Math.max(d3.max(allTemps) ?? 10, maxThreshold + 1);
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([iH, 0]).nice();

    // Safe zone band (2–8°C)
    g.append('rect')
      .attr('x', 0).attr('y', yScale(maxThreshold))
      .attr('width', iW)
      .attr('height', yScale(minThreshold) - yScale(maxThreshold))
      .attr('fill', '#d1fae5').attr('opacity', 0.5);

    // Threshold lines
    [minThreshold, maxThreshold].forEach(val => {
      g.append('line')
        .attr('x1', 0).attr('x2', iW)
        .attr('y1', yScale(val)).attr('y2', yScale(val))
        .attr('stroke', '#10b981').attr('stroke-dasharray', '4,3')
        .attr('stroke-width', 1).attr('opacity', 0.7);
      g.append('text')
        .attr('x', iW + 3).attr('y', yScale(val) + 4)
        .attr('font-size', 9).attr('fill', '#059669').attr('font-family', 'sans-serif')
        .text(`${val}°`);
    });

    // Breach segments background
    const breachReadings = readings.filter(r => r.isBreachEvent);
    breachReadings.forEach(r => {
      g.append('line')
        .attr('x1', xScale(parseTime(r))).attr('x2', xScale(parseTime(r)))
        .attr('y1', 0).attr('y2', iH)
        .attr('stroke', '#fca5a5').attr('stroke-width', 6).attr('opacity', 0.35);
    });

    // Temperature line
    const line = d3.line<ColdChainReading>()
      .x(d => xScale(parseTime(d)))
      .y(d => yScale(d.tempC))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Colour segments: green within range, red outside
    g.append('path')
      .datum(readings)
      .attr('fill', 'none')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    // Overlay with coloured strokes per breach/safe
    const safeReadings = readings.filter(r => !r.isBreachEvent);
    if (safeReadings.length > 1) {
      g.append('path')
        .datum(safeReadings)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2)
        .attr('d', d3.line<ColdChainReading>()
          .x(d => xScale(parseTime(d)))
          .y(d => yScale(d.tempC))
          .defined(d => !d.isBreachEvent)
          .curve(d3.curveCatmullRom.alpha(0.5)));
    }

    if (breachReadings.length > 0) {
      breachReadings.forEach(r => {
        g.append('circle')
          .attr('cx', xScale(parseTime(r))).attr('cy', yScale(r.tempC))
          .attr('r', 3.5).attr('fill', '#ef4444').attr('stroke', 'white').attr('stroke-width', 1);
      });
    }

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d => {
      const date = d as Date;
      return `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
    });
    g.append('g').attr('transform', `translate(0,${iH})`).call(xAxis)
      .selectAll('text').attr('font-size', 9).attr('fill', '#9ca3af');

    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}°C`);
    g.append('g').call(yAxis)
      .selectAll('text').attr('font-size', 9).attr('fill', '#9ca3af');

    g.selectAll('.domain,.tick line').attr('stroke', '#e5e7eb');

  }, [readings, minThreshold, maxThreshold]);

  return (
    <div className="w-full">
      <svg ref={svgRef} className="w-full" style={{ height: 180 }} />
    </div>
  );
};

// ── Cold-Chain Compliance Certificate ────────────────────────────────────────

interface CertProps {
  sensor: ColdChainSensor;
  readings: ColdChainReading[];
}

const ColdChainCertificate: React.FC<CertProps> = ({ sensor, readings }) => {
  const breachCount = readings.filter(r => r.isBreachEvent).length;
  const avgTemp = readings.length > 0 ? readings.reduce((s, r) => s + r.tempC, 0) / readings.length : 0;
  const minTemp = readings.length > 0 ? Math.min(...readings.map(r => r.tempC)) : 0;
  const maxTemp = readings.length > 0 ? Math.max(...readings.map(r => r.tempC)) : 0;
  const isCompliant = breachCount === 0 && sensor.status !== 'Offline';

  return (
    <div className={`rounded-2xl border-2 p-5 space-y-4 ${isCompliant ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-6 h-6 ${isCompliant ? 'text-emerald-600' : 'text-rose-600'}`} />
          <span className="font-bold text-sm text-neutral-900">Cold-Chain Compliance Certificate</span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isCompliant ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
          {isCompliant ? '✓ COMPLIANT' : '✗ BREACH DETECTED'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {[
          { label: 'Avg Temperature', value: `${avgTemp.toFixed(1)}°C`, ok: avgTemp >= sensor.minThresholdC && avgTemp <= sensor.maxThresholdC },
          { label: 'Min Recorded', value: `${minTemp.toFixed(1)}°C`, ok: minTemp >= sensor.minThresholdC },
          { label: 'Max Recorded', value: `${maxTemp.toFixed(1)}°C`, ok: maxTemp <= sensor.maxThresholdC },
          { label: 'Breach Events', value: breachCount.toString(), ok: breachCount === 0 },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-3 border border-neutral-200 space-y-1">
            <div className="text-[10px] text-neutral-500">{stat.label}</div>
            <div className={`font-bold text-sm ${stat.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-neutral-600 space-y-1 border-t border-neutral-200 pt-3">
        <div className="flex justify-between">
          <span>Sensor ID:</span>
          <span className="font-mono font-semibold text-neutral-800">{sensor.id.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Regulatory Range:</span>
          <span className="font-semibold">{sensor.minThresholdC}°C – {sensor.maxThresholdC}°C (CDSCO Schedule M)</span>
        </div>
        <div className="flex justify-between">
          <span>Readings analysed:</span>
          <span className="font-semibold">{readings.length} data points (48h window)</span>
        </div>
        <div className="flex justify-between">
          <span>Certificate generated:</span>
          <span className="font-semibold">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      <button
        id={`btn-download-cert-${sensor.id}`}
        onClick={() => {
          const text = [
            'GENERICMED COLD-CHAIN COMPLIANCE CERTIFICATE',
            '─'.repeat(52),
            `Sensor: ${sensor.label}`,
            `Partner: ${sensor.partnerName}`,
            `Location: ${sensor.location}`,
            `Category: ${sensor.medicineCategory}`,
            '',
            'TEMPERATURE ANALYSIS (48-HOUR WINDOW)',
            `  Average: ${avgTemp.toFixed(1)}°C`,
            `  Minimum: ${minTemp.toFixed(1)}°C`,
            `  Maximum: ${maxTemp.toFixed(1)}°C`,
            `  Regulatory Range: ${sensor.minThresholdC}°C – ${sensor.maxThresholdC}°C`,
            `  Breach Events: ${breachCount}`,
            `  Readings Analysed: ${readings.length}`,
            '',
            `STATUS: ${isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT — BREACH DETECTED'}`,
            '',
            `Generated: ${new Date().toISOString()}`,
            'Authority: GenericMed Platform | CDSCO Schedule M Compliant',
          ].join('\n');
          const blob = new Blob([text], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cold-chain-cert-${sensor.id}-${new Date().toISOString().slice(0, 10)}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        Download Compliance Certificate (.txt)
      </button>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

interface ColdChainMonitorViewProps {
  /** If provided, filters to a specific partner's sensors */
  partnerId?: string;
}

export const ColdChainMonitorView: React.FC<ColdChainMonitorViewProps> = ({ partnerId }) => {
  const [sensors, setSensors] = useState<ColdChainSensor[]>([]);
  const [allReadings, setAllReadings] = useState<ColdChainReading[]>([]);
  const [alerts, setAlerts] = useState<ColdChainAlert[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sensors' | 'alerts' | 'certificate'>('sensors');

  const fetchData = useCallback(async () => {
    try {
      const url = partnerId ? `/api/cold-chain/sensors?partnerId=${partnerId}` : '/api/cold-chain/sensors';
      const [sensRes, alertRes] = await Promise.allSettled([
        fetch(url).then(r => r.ok ? r.json() : null),
        fetch('/api/cold-chain/alerts?resolved=false').then(r => r.ok ? r.json() : null),
      ]);
      if (sensRes.status === 'fulfilled' && sensRes.value?.sensors?.length) {
        setSensors(sensRes.value.sensors);
      }
      if (alertRes.status === 'fulfilled' && alertRes.value?.alerts?.length) {
        setAlerts(alertRes.value.alerts);
      }
    } catch {
      // fallback to seed
    }
    // Always seed from mockData as fallback
    const fallbackSensors = partnerId
      ? COLD_CHAIN_SENSORS.filter(s => s.partnerId === partnerId)
      : COLD_CHAIN_SENSORS;
    setSensors(prev => prev.length > 0 ? prev : fallbackSensors);
    setAllReadings(COLD_CHAIN_READINGS);
    setAlerts(prev => prev.length > 0 ? prev : INITIAL_COLD_CHAIN_ALERTS.filter(a => !a.resolvedAt));
  }, [partnerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-select first breach sensor or just first sensor
  useEffect(() => {
    if (sensors.length > 0 && !selectedSensorId) {
      const breach = sensors.find(s => s.status === 'Breach' || s.status === 'Warning');
      setSelectedSensorId(breach?.id ?? sensors[0].id);
    }
  }, [sensors, selectedSensorId]);

  const selectedSensor = sensors.find(s => s.id === selectedSensorId) || null;
  const selectedReadings = allReadings
    .filter(r => r.sensorId === selectedSensorId)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/cold-chain/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy: 'Duty Pharmacist' }),
      });
    } catch { /* silent */ }
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // KPI summary
  const activeSensors = sensors.filter(s => s.status === 'Active').length;
  const breachSensors = sensors.filter(s => s.status === 'Breach').length;
  const warningSensors = sensors.filter(s => s.status === 'Warning').length;
  const offlineSensors = sensors.filter(s => s.status === 'Offline').length;
  const unresolvedAlerts = alerts.length;

  return (
    <div className="space-y-5">

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Sensors', value: activeSensors, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Breach', value: breachSensors, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
          { label: 'Warning', value: warningSensors, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Unresolved Alerts', value: unresolvedAlerts, color: 'text-neutral-700', bg: 'bg-neutral-50 border-neutral-200' },
        ].map(kpi => (
          <div key={kpi.label} className={`rounded-2xl border p-4 ${kpi.bg} space-y-1`}>
            <div className="text-[11px] text-neutral-500 font-medium">{kpi.label}</div>
            <div className={`text-2xl font-extrabold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-semibold w-fit">
        {(['sensors', 'alerts', 'certificate'] as const).map(tab => (
          <button
            key={tab}
            id={`cold-chain-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg capitalize transition-all ${
              activeTab === tab ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab === 'certificate' ? 'Compliance Cert' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'alerts' && unresolvedAlerts > 0 && (
              <span className="ml-1.5 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unresolvedAlerts}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Sensors & Chart ─────────────────────────────────────────────── */}
      {activeTab === 'sensors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Sensor List */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-1">IoT Sensors ({sensors.length})</div>
            {sensors.map(sensor => {
              const cfg = sensorStatusConfig(sensor.status);
              const isSelected = sensor.id === selectedSensorId;
              return (
                <button
                  key={sensor.id}
                  id={`cold-chain-sensor-${sensor.id}`}
                  onClick={() => { setSelectedSensorId(sensor.id); setActiveTab('sensors'); }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-teal-400 bg-teal-50 shadow-xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-neutral-900 truncate">{sensor.label}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="flex items-center gap-0.5">{typeIcon(sensor.type)} {sensor.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><Battery className="w-3 h-3" />{sensor.batteryPercent}%</span>
                        <span>•</span>
                        <span>{relativeTime(sensor.lastPingAt)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {sensor.status !== 'Offline' ? (
                        <span className={`text-sm font-extrabold ${
                          sensor.currentTempC > sensor.maxThresholdC ? 'text-rose-600' :
                          sensor.currentTempC < sensor.minThresholdC ? 'text-blue-600' : 'text-emerald-700'
                        }`}>{sensor.currentTempC.toFixed(1)}°C</span>
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 mx-auto mt-0.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chart + Details */}
          <div className="lg:col-span-2 space-y-4">
            {selectedSensor ? (
              <>
                {/* Sensor detail card */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-neutral-900 text-sm">{selectedSensor.label}</div>
                      <div className="text-xs text-neutral-500">{selectedSensor.location}</div>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sensorStatusConfig(selectedSensor.status).badge}`}>
                          {selectedSensor.status}
                        </span>
                        <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{selectedSensor.medicineCategory}</span>
                        <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          {typeIcon(selectedSensor.type)} {selectedSensor.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className={`text-3xl font-extrabold ${
                        selectedSensor.currentTempC > selectedSensor.maxThresholdC ? 'text-rose-600' :
                        selectedSensor.currentTempC < selectedSensor.minThresholdC ? 'text-blue-600' : 'text-emerald-700'
                      }`}>
                        {selectedSensor.status !== 'Offline' ? `${selectedSensor.currentTempC.toFixed(1)}°C` : '—'}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Safe range: {selectedSensor.minThresholdC}–{selectedSensor.maxThresholdC}°C
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {relativeTime(selectedSensor.lastPingAt)}
                      </div>
                    </div>
                  </div>

                  {/* D3 Chart */}
                  <div className="border border-neutral-100 rounded-xl overflow-hidden bg-neutral-50 p-3">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 px-1">
                      48-Hour Temperature Timeline
                    </div>
                    {selectedReadings.length > 0 ? (
                      <TempChart
                        readings={selectedReadings}
                        minThreshold={selectedSensor.minThresholdC}
                        maxThreshold={selectedSensor.maxThresholdC}
                      />
                    ) : (
                      <div className="h-28 flex items-center justify-center text-xs text-neutral-400">
                        No readings available
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-neutral-500 px-1">
                      <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-emerald-500 rounded" /> Within range</span>
                      <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-rose-500" /> Breach event</span>
                      <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-3 bg-emerald-100 rounded border border-emerald-300" /> Safe zone (2–8°C)</span>
                    </div>
                  </div>

                  {/* Battery indicator */}
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                    <Battery className={`w-4 h-4 ${selectedSensor.batteryPercent > 30 ? 'text-emerald-600' : 'text-amber-500'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-neutral-600 font-medium">Sensor Battery</span>
                        <span className={`font-bold ${selectedSensor.batteryPercent > 30 ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {selectedSensor.batteryPercent}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${selectedSensor.batteryPercent > 30 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${selectedSensor.batteryPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-500">
                <Thermometer className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm">Select a sensor to view its temperature timeline</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Alerts ──────────────────────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-medium text-emerald-800">All clear — no active cold-chain alerts</p>
              <p className="text-xs text-neutral-500">All sensors are operating within the 2–8°C regulatory range.</p>
            </div>
          ) : (
            alerts.map(alert => {
              const cfg = alertSeverityConfig(alert.severity);
              return (
                <div key={alert.id} id={`cold-chain-alert-${alert.id}`} className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-start gap-3 justify-between">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {cfg.icon}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                            {alert.severity}
                          </span>
                          <span className="text-[10px] text-neutral-500">{relativeTime(alert.triggeredAt)}</span>
                        </div>
                        <p className="text-xs text-neutral-700">{alert.message}</p>
                        <p className="text-[11px] text-neutral-400">{alert.sensorLabel}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <div className={`text-xl font-extrabold ${alert.tempC > alert.thresholdC ? 'text-rose-600' : 'text-blue-600'}`}>
                        {alert.tempC.toFixed(1)}°C
                      </div>
                      <div className="text-[10px] text-neutral-500">Threshold: {alert.thresholdC}°C</div>
                      <button
                        id={`btn-ack-alert-${alert.id}`}
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-semibold transition-colors"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                  {alert.orderId && (
                    <div className="text-[11px] bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-amber-800">
                      ⚠ Linked to Order #{alert.orderId} — inspect shipment immediately
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Tab: Compliance Certificate ──────────────────────────────────────── */}
      {activeTab === 'certificate' && (
        <div className="space-y-4">
          {selectedSensor ? (
            <ColdChainCertificate sensor={selectedSensor} readings={selectedReadings} />
          ) : (
            <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center text-neutral-500 text-sm">
              Select a sensor from the Sensors tab first.
            </div>
          )}
          {/* Sensor picker for certificate tab */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4">
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-3">
              Generate certificate for a different sensor
            </div>
            <div className="flex flex-wrap gap-2">
              {sensors.filter(s => s.status !== 'Offline').map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSensorId(s.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    s.id === selectedSensorId
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-teal-400'
                  }`}
                >
                  {s.id.toUpperCase().slice(-8)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
