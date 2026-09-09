import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { PharmacyPartner } from '../types';
import {
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface PeakHoursHeatmapProps {
  partner: PharmacyPartner;
}

interface HeatmapDataPoint {
  dayIndex: number; // 0 = Mon, 6 = Sun
  dayName: string;
  hour: number; // 0 to 23
  hourLabel: string;
  orders: number;
  recommendedStaff: number;
  rushLevel: 'low' | 'moderate' | 'high' | 'peak';
  avgPackMins: number;
  topCategory: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Deterministic seed generation based on partner ID so each partner has distinct operational dynamics
function generateWeeklyHeatmapData(partner: PharmacyPartner, timeframe: string): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];
  const isJanAushadhi = partner.isJanAushadhiKendra;
  const is24x7 = partner.name.toLowerCase().includes('wellness') || partner.name.toLowerCase().includes('apollo');

  // Base multiplier from partner rating/size
  const scale = (partner.rating / 4.7) * (timeframe === 'month' ? 1.05 : timeframe === 'surge' ? 1.25 : 1.0);

  for (let d = 0; d < 7; d++) {
    const isWeekend = d >= 5;
    const isMonday = d === 0;

    for (let h = 0; h < 24; h++) {
      let baseVolume = 2;

      // Closed/low night hours vs 24x7
      if (h >= 0 && h < 7) {
        baseVolume = is24x7 ? (h === 6 ? 6 : 2 + (d % 3)) : 0;
      } else if (h >= 7 && h < 9) {
        baseVolume = isJanAushadhi ? 8 : 10;
      } else if (h >= 9 && h <= 12) {
        // Morning doctor OPD rush & chronic refills
        baseVolume = isMonday ? 38 : isWeekend ? 32 : 28;
      } else if (h >= 13 && h <= 16) {
        // Post-lunch steady hours
        baseVolume = 14 + (d % 4);
      } else if (h >= 17 && h <= 21) {
        // Major evening peak - after-work clinic visits & prescription drop-offs
        baseVolume = isMonday || d === 3 ? 46 : isWeekend && d === 5 ? 42 : 36;
      } else if (h === 22) {
        baseVolume = is24x7 ? 16 : isJanAushadhi ? 4 : 10;
      } else {
        baseVolume = is24x7 ? 6 : 1;
      }

      // Add pseudo-random fluctuation based on day and hour
      const variance = Math.sin(d * 1.5 + h * 0.8) * 4;
      const rawOrders = Math.max(0, Math.round((baseVolume + variance) * scale));

      // Calculate staffing requirement based on pharma dispensing SLA
      // Formula: 1 pharmacist per ~10 prescriptions/hour + 1 packing associate per 15 orders/hour
      let staff = 1;
      let rush: 'low' | 'moderate' | 'high' | 'peak' = 'low';

      if (rawOrders > 35) {
        staff = 4;
        rush = 'peak';
      } else if (rawOrders >= 22) {
        staff = 3;
        rush = 'high';
      } else if (rawOrders >= 10) {
        staff = 2;
        rush = 'moderate';
      } else {
        staff = rawOrders === 0 ? 0 : 1;
        rush = 'low';
      }

      const avgPackMins = rawOrders > 35 ? 24 : rawOrders > 20 ? 16 : 9;
      const topCategory =
        h < 12
          ? 'Chronic (Metformin & BP)'
          : h < 17
          ? 'Gastro & Pain'
          : 'Acute Rx & Antibiotics';

      data.push({
        dayIndex: d,
        dayName: DAYS[d],
        hour: h,
        hourLabel: `${h.toString().padStart(2, '0')}:00`,
        orders: rawOrders,
        recommendedStaff: staff,
        rushLevel: rush,
        avgPackMins,
        topCategory,
      });
    }
  }

  return data;
}

export const PeakHoursHeatmap: React.FC<PeakHoursHeatmapProps> = ({ partner }) => {
  const [metric, setMetric] = useState<'orders' | 'staff'>('orders');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'surge'>('week');
  const [highlightPeaksOnly, setHighlightPeaksOnly] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<HeatmapDataPoint | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HeatmapDataPoint | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(850);

  // Measure container for responsive SVG
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect.width > 0) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Generate data memoized
  const heatmapData = useMemo(() => {
    return generateWeeklyHeatmapData(partner, timeframe);
  }, [partner, timeframe]);

  // Overall analytics
  const { maxOrders, peakCell, totalWeeklyOrders, busiestShift } = useMemo(() => {
    let max = 0;
    let peak: HeatmapDataPoint = heatmapData[0];
    let total = 0;
    let morningSum = 0;
    let eveningSum = 0;
    let nightSum = 0;

    heatmapData.forEach((d) => {
      total += d.orders;
      if (d.orders > max) {
        max = d.orders;
        peak = d;
      }
      if (d.hour >= 8 && d.hour < 15) morningSum += d.orders;
      else if (d.hour >= 15 && d.hour < 22) eveningSum += d.orders;
      else nightSum += d.orders;
    });

    const busiest =
      eveningSum >= morningSum && eveningSum >= nightSum
        ? 'Evening Rush (15:00 - 22:00)'
        : morningSum >= eveningSum
        ? 'Morning OPD (08:00 - 15:00)'
        : 'Night Shift (22:00 - 08:00)';

    return { maxOrders: max, peakCell: peak, totalWeeklyOrders: total, busiestShift: busiest };
  }, [heatmapData]);

  // Auto-select peak on first load
  useEffect(() => {
    if (!selectedCell && peakCell) {
      setSelectedCell(peakCell);
    }
  }, [peakCell, selectedCell]);

  // Render D3 SVG Heatmap
  useEffect(() => {
    if (!svgRef.current || !heatmapData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 20, bottom: 40, left: 48 };
    const width = Math.max(containerWidth, 680) - margin.left - margin.right;
    const height = 230; // 7 rows

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    // X scale: 24 hours
    const xScale = d3
      .scaleBand<number>()
      .domain(hours)
      .range([0, width])
      .padding(0.08);

    // Y scale: 7 days
    const yScale = d3
      .scaleBand<string>()
      .domain(DAYS)
      .range([0, height])
      .padding(0.1);

    // Color Scales
    // Orders scale: from soft neutral/purple to deep royal purple
    const ordersColorScale = d3
      .scaleSequential<string>()
      .domain([0, maxOrders || 50])
      .interpolator(d3.interpolate('#ede9fe', '#4c1d95'));

    // Staffing scale: from pale emerald to deep emerald
    const staffColorScale = d3
      .scaleSequential<string>()
      .domain([1, 4])
      .interpolator(d3.interpolate('#ecfdf5', '#065f46'));

    // Top X Axis (Hour labels)
    const xAxis = d3
      .axisTop<number>(xScale)
      .tickValues([0, 3, 6, 9, 12, 15, 18, 21, 23])
      .tickFormat((h) => `${h}h`);

    const xAxisGroup = g
      .append('g')
      .attr('class', 'x-axis text-[10px] font-mono text-neutral-400 select-none')
      .call(xAxis);

    xAxisGroup.select('.domain').remove();
    xAxisGroup.selectAll('.tick line').attr('stroke', '#e5e5e5');
    xAxisGroup.selectAll('.tick text').attr('fill', '#737373');

    // Y Axis (Day labels)
    const yAxis = d3.axisLeft<string>(yScale);
    const yAxisGroup = g
      .append('g')
      .attr('class', 'y-axis text-xs font-semibold select-none')
      .call(yAxis);

    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('.tick line').remove();
    yAxisGroup.selectAll('.tick text').attr('fill', '#404040').attr('dx', '-6');

    // Draw Heatmap Cells
    const cellGroups = g
      .selectAll<SVGGElement, HeatmapDataPoint>('.cell-group')
      .data(heatmapData)
      .enter()
      .append('g')
      .attr('class', 'cell-group cursor-pointer')
      .on('mouseenter', (_event: MouseEvent, d: HeatmapDataPoint) => {
        setHoveredCell(d);
      })
      .on('mouseleave', () => {
        setHoveredCell(null);
      })
      .on('click', (_event: MouseEvent, d: HeatmapDataPoint) => {
        setSelectedCell(d);
      });

    cellGroups
      .append('rect')
      .attr('x', (d: HeatmapDataPoint) => xScale(d.hour) || 0)
      .attr('y', (d: HeatmapDataPoint) => yScale(d.dayName) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 3.5)
      .attr('ry', 3.5)
      .attr('fill', (d: HeatmapDataPoint) => {
        if (d.orders === 0) return '#f5f5f5';
        if (highlightPeaksOnly && d.rushLevel !== 'peak') {
          return '#f4f4f5';
        }
        return metric === 'orders' ? ordersColorScale(d.orders) : staffColorScale(d.recommendedStaff);
      })
      .attr('stroke', (d: HeatmapDataPoint) => {
        const isSelected = selectedCell?.dayIndex === d.dayIndex && selectedCell?.hour === d.hour;
        const isHovered = hoveredCell?.dayIndex === d.dayIndex && hoveredCell?.hour === d.hour;
        if (isSelected) return '#18181b';
        if (isHovered) return '#7c3aed';
        return d.orders === 0 ? '#f0f0f0' : 'rgba(255,255,255,0.7)';
      })
      .attr('stroke-width', (d: HeatmapDataPoint) => {
        const isSelected = selectedCell?.dayIndex === d.dayIndex && selectedCell?.hour === d.hour;
        const isHovered = hoveredCell?.dayIndex === d.dayIndex && hoveredCell?.hour === d.hour;
        return isSelected ? 2 : isHovered ? 1.5 : 1;
      })
      .attr('opacity', (d: HeatmapDataPoint) => {
        if (highlightPeaksOnly && d.rushLevel !== 'peak') return 0.35;
        return 1;
      });

    // Peak marker dots for highest rush slots
    cellGroups
      .filter((d: HeatmapDataPoint) => d.rushLevel === 'peak')
      .append('circle')
      .attr('cx', (d: HeatmapDataPoint) => (xScale(d.hour) || 0) + xScale.bandwidth() / 2)
      .attr('cy', (d: HeatmapDataPoint) => (yScale(d.dayName) || 0) + yScale.bandwidth() / 2)
      .attr('r', 2)
      .attr('fill', '#ffffff')
      .attr('pointer-events', 'none')
      .attr('opacity', 0.9);

    // Bottom Axis hint
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 28)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-[11px] fill-neutral-400 select-none')
      .text('Hours of Day (00:00 to 23:00) • Click any cell to view hourly staffing & SLA impact');
  }, [containerWidth, heatmapData, metric, highlightPeaksOnly, selectedCell, hoveredCell, maxOrders]);

  return (
    <div
      id="peak-hours-heatmap-container"
      className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-700" />
              <span>Weekly Peak Order Volume & Staffing Optimization (D3 Analytics)</span>
            </h3>
            <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
              Staffing AI
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            D3 heat distribution of prescription dispatches and counter pickups across 168 weekly hours. Adjust pharmacist duty rosters to eliminate delivery bottleneck.
          </p>
        </div>

        {/* Action / Metric Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Metric Selector */}
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 border border-neutral-200">
            <button
              id="btn-metric-orders"
              onClick={() => setMetric('orders')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                metric === 'orders'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Order Volume (hr)
            </button>
            <button
              id="btn-metric-staff"
              onClick={() => setMetric('staff')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                metric === 'staff'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Recommended Staff
            </button>
          </div>

          {/* Timeframe Filter */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'surge')}
            className="bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-lg p-2 font-medium text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="week">Current Week (Real-Time)</option>
            <option value="month">4-Week Normalized Average</option>
            <option value="surge">Monsoon/Flu Seasonal Surge (+25%)</option>
          </select>

          {/* Peak Highlight Toggle */}
          <button
            onClick={() => setHighlightPeaksOnly(!highlightPeaksOnly)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              highlightPeaksOnly
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>{highlightPeaksOnly ? 'Showing Peaks (>35/hr)' : 'Filter Surge Hours'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/80">
          <span className="text-[11px] text-neutral-500 font-medium">Weekly Total Volume</span>
          <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
            {totalWeeklyOrders.toLocaleString()} <span className="text-xs font-normal text-neutral-400">orders</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">99.4% packaged on-time</span>
        </div>

        <div className="bg-purple-50/70 rounded-xl p-3 border border-purple-200">
          <span className="text-[11px] text-purple-700 font-medium">Busiest Shift Window</span>
          <div className="text-sm font-bold text-purple-950 mt-1 truncate">
            {busiestShift}
          </div>
          <span className="text-[10px] text-purple-600 font-medium">Requires 3–4 Pharmacists</span>
        </div>

        <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200">
          <span className="text-[11px] text-amber-800 font-medium">Weekly Highest Surge</span>
          <div className="text-sm font-bold text-amber-950 mt-1">
            {FULL_DAYS[peakCell.dayIndex]} @ {peakCell.hourLabel}
          </div>
          <span className="text-[10px] text-amber-700 font-medium font-mono">
            {peakCell.orders} orders / hour
          </span>
        </div>

        <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200">
          <span className="text-[11px] text-emerald-800 font-medium">Staffing Efficiency Gain</span>
          <div className="text-xl font-bold text-emerald-950 mt-1">
            +38%
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">Reduces packing SLA to 11m</span>
        </div>
      </div>

      {/* D3 Heatmap SVG Visualization */}
      <div className="relative overflow-x-auto" ref={containerRef}>
        <div className="min-w-[680px]">
          <svg ref={svgRef} className="w-full select-none" />
        </div>

        {/* Hover Floating Tooltip Preview */}
        {hoveredCell && (
          <div className="absolute top-1 right-2 bg-neutral-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-md pointer-events-none flex items-center gap-2 border border-neutral-700">
            <span className="font-bold">
              {FULL_DAYS[hoveredCell.dayIndex]} {hoveredCell.hourLabel}:
            </span>
            <span className="text-purple-300 font-mono font-semibold">
              {hoveredCell.orders} orders
            </span>
            <span>•</span>
            <span className="text-emerald-300 font-semibold">
              Needs {hoveredCell.recommendedStaff} staff
            </span>
          </div>
        )}
      </div>

      {/* Color Scale Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs text-neutral-500 border-t border-neutral-100">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-neutral-700">
            {metric === 'orders' ? 'Order Volume Scale:' : 'Staffing Roster Scale:'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono">0</span>
            <div
              className={`h-2.5 w-32 rounded-full ${
                metric === 'orders'
                  ? 'bg-gradient-to-r from-[#ede9fe] via-[#a78bfa] to-[#4c1d95]'
                  : 'bg-gradient-to-r from-[#ecfdf5] via-[#34d399] to-[#065f46]'
              }`}
            />
            <span className="text-[10px] font-mono">{metric === 'orders' ? `${maxOrders}+` : '4+ Staff'}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#4c1d95] inline-block" />
            <span>Peak Rush (4 staff)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#a78bfa] inline-block" />
            <span>Moderate (2-3 staff)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#ede9fe] inline-block" />
            <span>Low (1 staff)</span>
          </div>
        </div>
      </div>

      {/* Detailed Slot Inspection & Staffing Recommendation Card */}
      {selectedCell && (
        <div
          id="slot-staffing-deep-dive"
          className="bg-neutral-50 rounded-xl p-4 sm:p-5 border border-neutral-200 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  selectedCell.rushLevel === 'peak'
                    ? 'bg-rose-500 animate-pulse'
                    : selectedCell.rushLevel === 'high'
                    ? 'bg-amber-500'
                    : selectedCell.rushLevel === 'moderate'
                    ? 'bg-purple-500'
                    : 'bg-neutral-400'
                }`}
              />
              <div>
                <h4 className="font-bold text-sm text-neutral-900">
                  Hour Analysis: {FULL_DAYS[selectedCell.dayIndex]}, {selectedCell.hourLabel} -{' '}
                  {`${(selectedCell.hour + 1).toString().padStart(2, '0')}:00`}
                </h4>
                <p className="text-xs text-neutral-500">
                  Category demand: <strong>{selectedCell.topCategory}</strong>
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                selectedCell.rushLevel === 'peak'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : selectedCell.rushLevel === 'high'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : selectedCell.rushLevel === 'moderate'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-neutral-200 text-neutral-700 border-neutral-300'
              }`}
            >
              {selectedCell.rushLevel.toUpperCase()} VOLUME
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Projected Demand */}
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-1.5">
              <span className="text-[11px] text-neutral-500 font-medium">Hourly Throughput</span>
              <div className="text-lg font-black font-mono text-neutral-900">
                {selectedCell.orders} Orders
              </div>
              <p className="text-[11px] text-neutral-500">
                {selectedCell.orders > 20
                  ? `High volume window: ~${(selectedCell.orders / 60).toFixed(1)} orders booked every minute.`
                  : 'Manageable flow with standard packaging queue.'}
              </p>
            </div>

            {/* Recommended Roster Allocation */}
            <div className="bg-white p-3.5 rounded-xl border border-purple-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-purple-700 font-semibold">Recommended Roster</span>
                <Users className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-lg font-black font-mono text-purple-950">
                {selectedCell.recommendedStaff} Staff on Duty
              </div>
              <div className="text-[11px] text-neutral-600 space-y-0.5">
                <div>• {Math.min(2, Math.max(1, Math.ceil(selectedCell.recommendedStaff / 2)))} Registered Pharmacist (Schedule H verification)</div>
                <div>• {Math.max(1, selectedCell.recommendedStaff - 1)} Packing & Cold-Chain Dispatch Associate</div>
              </div>
            </div>

            {/* Turnaround & SLA Forecast */}
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-1.5">
              <span className="text-[11px] text-neutral-500 font-medium">Turnaround Time (TAT)</span>
              <div className="text-lg font-black font-mono text-neutral-900">
                ~{selectedCell.avgPackMins} mins / order
              </div>
              <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Meets 30-min hyper-local chemist dispatch SLA</span>
              </p>
            </div>
          </div>

          {/* Actionable Staffing Recommendation Note */}
          <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 text-xs text-purple-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Pharmacist Shift Recommendation:</div>
              <p className="text-neutral-700 leading-relaxed">
                {selectedCell.rushLevel === 'peak'
                  ? `For ${FULL_DAYS[selectedCell.dayIndex]} evening surge, schedule two duty pharmacists between 17:00 and 21:00 to pre-verify digital doctor prescriptions. Pre-pack high-frequency generic batches (Metformin 500mg, Telmisartan 40mg, Paracetamol 650mg) by 16:30 to avoid dispatch backlog.`
                  : selectedCell.rushLevel === 'high'
                  ? `Maintain staggered lunch and tea breaks so at least 2 staff remain at the dispensing counter during ${selectedCell.hourLabel}.`
                  : `Optimal window for stock auditing, cold-chain temperature verification, and invoice reconciliation.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
