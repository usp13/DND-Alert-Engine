import React, { useState } from 'react';
import { formatINR } from '../utils/dndCalculations';
import { TrendingUp, Award, Calendar, FileText, ArrowUpRight, DollarSign, ShieldAlert, CheckCircle2, ChevronDown } from 'lucide-react';

export const SavingsReportTab: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('August 2026');

  // Month data map for responsive switching
  const monthData = {
    'August 2026': {
      tracked: 187,
      alerts: 94,
      savedCount: '82 (87%)',
      avoided: 328000,
      exceededCount: 12,
      incurred: 78000,
      roi: '32.8x',
      improvementVsLast: '↑ ₹1,50,000 vs last month'
    },
    'July 2026': {
      tracked: 165,
      alerts: 88,
      savedCount: '71 (83%)',
      avoided: 295000,
      exceededCount: 15,
      incurred: 95000,
      roi: '29.5x',
      improvementVsLast: '↑ ₹35,000 vs last month'
    },
    'June 2026': {
      tracked: 150,
      alerts: 80,
      savedCount: '62 (80%)',
      avoided: 260000,
      exceededCount: 18,
      incurred: 120000,
      roi: '26.0x',
      improvementVsLast: '↑ ₹50,000 vs last month'
    }
  };

  const currentData = monthData[selectedMonth as keyof typeof monthData] || monthData['August 2026'];

  const trendData = [
    { month: 'March', saved: 120000, incurred: 240000, savedLabel: '₹1.2L', incurredLabel: '₹2.4L' },
    { month: 'April', saved: 180000, incurred: 190000, savedLabel: '₹1.8L', incurredLabel: '₹1.9L' },
    { month: 'May', saved: 210000, incurred: 150000, savedLabel: '₹2.1L', incurredLabel: '₹1.5L' },
    { month: 'June', saved: 260000, incurred: 120000, savedLabel: '₹2.6L', incurredLabel: '₹1.2L' },
    { month: 'July', saved: 295000, incurred: 95000, savedLabel: '₹2.95L', incurredLabel: '₹0.95L' },
    { month: 'August', saved: 328000, incurred: 78000, savedLabel: '₹3.28L', incurredLabel: '₹0.78L' }
  ];

  const maxChartValue = 350000;

  const lineBreakdown = [
    { name: 'MSC', amount: 28000, percent: 36, color: '#f97316' },
    { name: 'Maersk', amount: 22000, percent: 28, color: '#3b82f6' },
    { name: 'CMA CGM', amount: 12000, percent: 15, color: '#10b981' },
    { name: 'Hapag-Lloyd', amount: 9000, percent: 12, color: '#eab308' },
    { name: 'Others', amount: 7000, percent: 9, color: '#8a99b0' }
  ];

  const topOverdueContainers = [
    { no: 'MSKU8456123', line: 'Maersk', days: 1, charged: 7000, cause: 'Late customs clearance (documents delayed by importer)' },
    { no: 'MSCU9123456', line: 'MSC', days: 1, charged: 6000, cause: 'Truck not arranged on time' },
    { no: 'CMAU5432198', line: 'CMA CGM', days: 2, charged: 12000, cause: 'Warehouse full — couldn\'t unload' },
    { no: 'ONEY7654321', line: 'ONE', days: 3, charged: 18000, cause: 'Payment delay — duty not paid' },
    { no: 'COSU8765431', line: 'COSCO', days: 2, charged: 12000, cause: 'Holiday — port closed' }
  ];

  const handleDownloadPDF = () => {
    alert(`📄 MAPS D&D Monthly Report (${selectedMonth}) generated successfully!\n\nSummary:\n- Saved: ${formatINR(currentData.avoided)}\n- Incurred: ${formatINR(currentData.incurred)}\n- Net ROI: ${currentData.roi}`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Month Selector Bento Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-extrabold font-mono-data uppercase tracking-wider border border-emerald-500/20">
              Financial Audit
            </span>
            <span className="text-xs font-bold text-white/60">August 2026 Audit</span>
          </div>
          <h2 className="text-2xl font-black font-heading text-white flex items-center gap-2.5 mt-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            D&D Financial Savings Report
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1 font-medium">
            Proof of value: Real-time financial audit of detention & demurrage costs avoided vs incurred.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-[var(--panel)] border border-[var(--border)] px-4 py-2.5 rounded-2xl shrink-0">
          <Calendar className="w-4 h-4 text-orange-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
          >
            <option value="August 2026" className="bg-[#0f172a]">August 2026 (Current)</option>
            <option value="July 2026" className="bg-[#0f172a]">July 2026</option>
            <option value="June 2026" className="bg-[#0f172a]">June 2026</option>
            <option value="May 2026" className="bg-[#0f172a]">May 2026</option>
            <option value="April 2026" className="bg-[#0f172a]">April 2026</option>
            <option value="March 2026" className="bg-[#0f172a]">March 2026</option>
          </select>
        </div>
      </div>

      {/* Bento Grid Stats Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Tile 1 */}
        <div className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--border)] flex flex-col justify-between">
          <span className="text-xs text-[var(--muted)] font-bold uppercase tracking-wider text-[10px]">Containers Tracked</span>
          <div className="text-3xl font-black font-heading text-white my-2">
            {currentData.tracked}
          </div>
          <span className="text-[10px] text-[var(--dim)] font-mono-data font-semibold">Total volume monitored</span>
        </div>

        {/* Tile 2 */}
        <div className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--border)] flex flex-col justify-between">
          <span className="text-xs text-orange-400 font-bold uppercase tracking-wider text-[10px]">Alerts Dispatched</span>
          <div className="text-3xl font-black font-heading text-orange-400 my-2">
            {currentData.alerts}
          </div>
          <span className="text-[10px] text-[var(--dim)] font-mono-data font-semibold">WhatsApp Business API</span>
        </div>

        {/* Tile 3 */}
        <div className="bg-[var(--card)] p-5 rounded-3xl border border-emerald-500/20 flex flex-col justify-between">
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Saved Before LFD</span>
          <div className="text-3xl font-black font-heading text-emerald-400 my-2">
            {currentData.savedCount}
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono-data font-bold">87% Clearance Rate</span>
        </div>

        {/* Tile 4: HERO BENTO METRIC */}
        <div className="bg-gradient-to-br from-emerald-950/80 to-emerald-900/40 p-5 rounded-3xl border-2 border-emerald-500/50 sm:col-span-2 xl:col-span-2 flex flex-col justify-between shadow-xl shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-black uppercase tracking-widest text-[10px] bg-emerald-500/20 px-3 py-0.5 rounded-full border border-emerald-500/30">
              ⭐ HERO METRIC — D&D AVOIDED
            </span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono-data text-emerald-300 my-2">
            {formatINR(currentData.avoided)}
          </div>
          <span className="text-xs text-white font-mono-data font-semibold">
            Direct bottom-line savings enabled by automated tracking
          </span>
        </div>

        {/* Tile 5 */}
        <div className="bg-[var(--card)] p-5 rounded-3xl border border-rose-500/20 flex flex-col justify-between">
          <span className="text-xs text-rose-400 font-bold uppercase tracking-wider text-[10px]">D&D Incurred</span>
          <div className="text-2xl font-black font-mono-data text-rose-400 my-2">
            {formatINR(currentData.incurred)}
          </div>
          <span className="text-[10px] text-rose-300/80 font-mono-data font-bold">{currentData.exceededCount} containers exceeded</span>
        </div>
      </div>

      {/* Net Savings Hero Card */}
      <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950 border border-indigo-500/30 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold font-mono-data px-3 py-1 rounded-full border border-emerald-500/30">
              NET FINANCIAL ROI
            </span>
            <span className="text-xs font-extrabold text-emerald-400 font-mono-data">
              {currentData.improvementVsLast}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white leading-snug font-heading">
            This month, MAPS D&D Alert Engine saved your firm <strong className="text-emerald-400 font-mono-data text-2xl ml-1">{formatINR(currentData.avoided)}</strong> in avoidable demurrage.
          </h3>
          <p className="text-xs text-[var(--muted)]">
            Service subscription cost: <span className="text-white font-bold">₹10,000/mo</span>. Return on Investment (ROI): <strong className="text-amber-400 font-mono-data font-bold">{currentData.roi}</strong>.
          </p>
        </div>

        <div className="bg-[var(--card)] p-4 rounded-2xl border border-indigo-500/30 shrink-0 text-center sm:text-right shadow-inner">
          <span className="text-[10px] text-[var(--muted)] font-mono-data block uppercase font-bold tracking-wider">Monthly ROI Ratio</span>
          <span className="text-3xl font-black font-mono-data text-amber-400">
            {currentData.roi}
          </span>
        </div>
      </div>

      {/* Charts Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section 1: 6-Month D&D Savings Trend (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-4 gap-2">
            <div>
              <h3 className="font-heading font-black text-white text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                6-Month D&D Savings Trend (March – August 2026)
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Green bars (Avoided) growing vs Red bars (Incurred losses) shrinking.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono-data">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span> D&D Avoided
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <span className="w-3 h-3 bg-rose-500 rounded-full inline-block"></span> D&D Incurred
              </span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-6 gap-3 sm:gap-6 h-52 items-end border-b border-[var(--border)] pb-3 px-2">
              {trendData.map((d, idx) => {
                const savedHeightPct = Math.round((d.saved / maxChartValue) * 100);
                const incurredHeightPct = Math.round((d.incurred / maxChartValue) * 100);

                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <div className="flex items-end gap-1.5 w-full justify-center h-full">
                      {/* Green Bar */}
                      <div
                        style={{ height: `${savedHeightPct}%` }}
                        className="w-4 sm:w-8 bg-emerald-500 hover:bg-emerald-400 rounded-t-lg transition-all relative group/bar shadow-md shadow-emerald-500/10"
                      >
                        <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--card)] border border-[var(--border)] text-white text-[10px] font-mono-data px-2 py-0.5 rounded-lg whitespace-nowrap pointer-events-none z-10 shadow-xl font-bold">
                          Saved: {d.savedLabel}
                        </div>
                      </div>

                      {/* Red Bar */}
                      <div
                        style={{ height: `${incurredHeightPct}%` }}
                        className="w-4 sm:w-8 bg-rose-500 hover:bg-rose-400 rounded-t-lg transition-all relative group/bar shadow-md shadow-rose-500/10"
                      >
                        <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--card)] border border-[var(--border)] text-white text-[10px] font-mono-data px-2 py-0.5 rounded-lg whitespace-nowrap pointer-events-none z-10 shadow-xl font-bold">
                          Lost: {d.incurredLabel}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono-data text-white font-bold mt-2.5">
                      {d.month.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] text-[var(--dim)] font-mono-data px-2 font-semibold">
              <span>₹0 Lakhs</span>
              <span>₹1.5 Lakhs</span>
              <span>₹3.5 Lakhs (Monthly Cap)</span>
            </div>
          </div>
        </div>

        {/* Chart Section 2: D&D by Shipping Line (1 col) */}
        <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-heading font-black text-white text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-400" />
              D&D Incurred by Line
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Breakdown of ₹78,000 lost charges in August
            </p>
          </div>

          {/* Horizontal Progress Bars */}
          <div className="space-y-3.5 pt-1">
            {lineBreakdown.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-data">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </span>
                  <span className="text-white font-semibold">
                    {formatINR(item.amount)} ({item.percent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[var(--panel)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[var(--panel)] p-3.5 rounded-2xl border border-[var(--border)] text-xs text-[var(--muted)]">
            💡 <strong className="text-white">Insight:</strong> MSC & Maersk account for 64% of all incurred D&D due to strict 5–7 day free time windows.
          </div>
        </div>
      </div>

      {/* Chart Section 3: Top Overdue Containers Bento Table */}
      <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="font-heading font-black text-white text-base">
              Containers That Exceeded LFD This Month & Root Cause Audit
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Detailed audit trail of containers that incurred demurrage/detention charges.
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>📄 Download Monthly Audit Report (PDF)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--panel)] border-b border-[var(--border)] text-[var(--dim)] font-mono-data uppercase text-[10px] font-extrabold tracking-wider">
                <th className="py-3 px-4">Container #</th>
                <th className="py-3 px-4">Shipping Line</th>
                <th className="py-3 px-4">Days Over LFD</th>
                <th className="py-3 px-4">D&D Charged</th>
                <th className="py-3 px-4">Primary Root Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {topOverdueContainers.map((row) => (
                <tr key={row.no} className="hover:bg-[var(--card-hover)] transition-colors">
                  <td className="py-3 px-4 font-mono-data font-bold text-white text-xs">
                    {row.no}
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {row.line}
                  </td>
                  <td className="py-3 px-4 font-mono-data text-rose-400 font-bold">
                    {row.days} {row.days === 1 ? 'day' : 'days'}
                  </td>
                  <td className="py-3 px-4 font-mono-data text-amber-300 font-extrabold">
                    {formatINR(row.charged)}
                  </td>
                  <td className="py-3 px-4 text-[var(--text)]">
                    <span className="bg-[var(--panel)] px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs block font-medium">
                      {row.cause}
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
