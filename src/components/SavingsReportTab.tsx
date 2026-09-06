"use client";

import React, { useState, useEffect } from 'react';
import { formatINR } from '../utils/dndCalculations';
import * as XLSX from 'xlsx';
import {
  TrendingUp,
  Award,
  Calendar,
  FileText,
  ArrowUpRight,
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Download,
  Layers,
  Clock,
  ShieldCheck,
  Ship,
  PieChart as PieIcon,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const SavingsReportTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let userEmail = "";
      let firmName = "";
      let ownerPhone = "";
      if (typeof window !== "undefined") {
        try {
          const session = JSON.parse(localStorage.getItem("dnd_user_session") || "{}");
          userEmail = session.email || "";
          firmName = session.firmName || "";
          ownerPhone = session.mobile || "";
        } catch (_) {}
      }

      const params = new URLSearchParams({
        ...(userEmail ? { user_email: userEmail } : {}),
        ...(firmName ? { firm_name: firmName } : {}),
        ...(ownerPhone ? { phone: ownerPhone } : {}),
      });

      const res = await fetch(`/api/reports/generate?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success && data.report) {
        setReportData(data.report);
      }
    } catch (err) {
      console.error('Error fetching savings report from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const totalContainers = reportData?.totalContainers || 0;
  const totalSavings = reportData?.totalSavings || 0;
  const totalActualCost = reportData?.totalActualCost || 0;
  const containersWithDD = reportData?.containersWithDD || 0;
  const containersSafe = reportData?.containersSafe || 0;
  const alertsCount = reportData?.alertsCount || 0;
  const timelineData = reportData?.timelineData || [];
  const carrierBreakdown = reportData?.carrierBreakdown || [];
  const turnaroundDistribution = reportData?.turnaroundDistribution || [];
  const recentLedger = reportData?.recentLedger || [];

  const onTimePercentage = totalContainers > 0
    ? Math.round((containersSafe / totalContainers) * 100)
    : 100;

  // Native Excel (.xlsx) Export Handler
  const handleExportExcel = () => {
    if (!reportData) return;

    const wb = XLSX.utils.book_new();

    // 1. Executive Summary Sheet
    const summaryData = [
      { Parameter: 'Report Generation Timestamp', Value: new Date().toLocaleString('en-IN') },
      { Parameter: 'Data Source', Value: 'Supabase PostgreSQL Database' },
      { Parameter: 'Total Shipments / Containers Tracked', Value: totalContainers },
      { Parameter: 'Demurrage-Free Containers Protected', Value: containersSafe },
      { Parameter: 'Overdue Containers Under Penalty', Value: containersWithDD },
      { Parameter: 'On-Time Protection Rate', Value: `${onTimePercentage}%` },
      { Parameter: 'Total Demurrage Penalties Avoided (INR)', Value: totalSavings },
      { Parameter: 'Total Penalties Incurred (INR)', Value: totalActualCost },
      { Parameter: 'Net Financial Demurrage Savings (INR)', Value: totalSavings - totalActualCost },
      { Parameter: 'Automated WhatsApp Alerts Dispatched', Value: alertsCount },
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 45 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Executive ROI Summary');

    // 2. Carrier Adherence Breakdown Sheet
    if (carrierBreakdown.length > 0) {
      const carrierSheetData = carrierBreakdown.map((c: any) => ({
        'Carrier / Shipping Line': c.line,
        'Containers Tracked': c.boxes,
        'Avg Free Days Allowed': c.freeDays,
        'Total Penalties Paid (INR)': c.incurred,
        'Total Demurrage Saved (INR)': c.saved,
        'Net Financial Benefit (INR)': c.saved - c.incurred,
        'Performance Grade': c.incurred === 0 ? 'A+' : 'A',
      }));
      const carrierWs = XLSX.utils.json_to_sheet(carrierSheetData);
      carrierWs['!cols'] = [
        { wch: 25 },
        { wch: 20 },
        { wch: 22 },
        { wch: 28 },
        { wch: 28 },
        { wch: 28 },
        { wch: 18 },
      ];
      XLSX.utils.book_append_sheet(wb, carrierWs, 'Carrier Scorecard');
    }

    // 3. Container Audit Ledger Sheet
    if (recentLedger.length > 0) {
      const ledgerSheetData = recentLedger.map((c: any) => ({
        'Container Number': c.containerNo,
        'Shipping Line': c.shippingLine,
        'Port': c.port,
        'Discharge Date': c.dischargeDate,
        'Last Free Day (LFD)': c.lfd,
        'Free Days Allowed': c.freeDays,
        'Current Status': c.status,
        'Avoided Demurrage (INR)': c.avoidedSavings,
        'Incurred Penalty (INR)': c.incurredPenalty,
      }));
      const ledgerWs = XLSX.utils.json_to_sheet(ledgerSheetData);
      ledgerWs['!cols'] = [
        { wch: 20 },
        { wch: 18 },
        { wch: 15 },
        { wch: 16 },
        { wch: 20 },
        { wch: 18 },
        { wch: 25 },
        { wch: 25 },
        { wch: 22 },
      ];
      XLSX.utils.book_append_sheet(wb, ledgerWs, 'Container Ledger');
    }

    // 4. Timeline Monthly Breakdown Sheet
    if (timelineData.length > 0) {
      const timelineSheetData = timelineData.map((t: any) => ({
        'Timeline Period': t.month,
        'Containers Tracked': t.containers,
        'Demurrage Saved (INR)': t.saved,
        'Penalties Incurred (INR)': t.incurred,
        'Net Savings (INR)': t.saved - t.incurred,
      }));
      const timelineWs = XLSX.utils.json_to_sheet(timelineSheetData);
      timelineWs['!cols'] = [
        { wch: 20 },
        { wch: 20 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
      ];
      XLSX.utils.book_append_sheet(wb, timelineWs, 'Monthly Timeline');
    }

    // Write and trigger download (.xlsx only)
    const dateStamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `DND_Savings_Financial_Report_${dateStamp}.xlsx`);

    setDownloadToast('📥 Excel Report (DND_Savings_Financial_Report.xlsx) downloaded successfully!');
    setTimeout(() => setDownloadToast(null), 4000);
  };

  if (loading) {
    return (
      <div className="bg-[#0c1420] border border-[var(--border)] rounded-3xl p-20 text-center text-xs text-[var(--muted)] flex flex-col items-center justify-center gap-4 shadow-2xl">
        <RefreshCw className="w-9 h-9 text-orange-400 animate-spin" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-white font-heading">
            Querying Live Database Analytics...
          </p>
          <p className="text-xs text-[var(--muted)] font-mono-data">
            Aggregating container timestamps, demurrage rates, and avoided penalties from Supabase.
          </p>
        </div>
      </div>
    );
  }

  // If no containers exist in the database yet
  if (totalContainers === 0) {
    return (
      <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-3xl p-16 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/10">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-lg font-extrabold text-white font-heading">
            No Live Container Data in Supabase
          </h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">
            Financial analytics and demurrage savings are computed 100% dynamically from your live database. Once you upload Delivery Orders via <strong>Bulk Import</strong> or <strong>Add Container</strong>, live charts, timeline ROI, and carrier scorecards will render here.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/containers/bulk"
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Bulk Import Delivery Orders</span>
          </Link>
          <button
            onClick={fetchReport}
            className="px-4 py-2.5 bg-[#162032] hover:bg-[#1f2c42] border border-white/10 text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{downloadToast}</span>
          </div>
          <button
            onClick={() => setDownloadToast(null)}
            className="text-[var(--muted)] hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-[#0c1420] border border-[var(--border)] p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-mono-data font-extrabold uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Supabase Data
          </span>
          <span className="text-xs text-[var(--muted)] font-mono-data">
            {totalContainers} active database record(s)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReport}
            className="p-2.5 bg-[#162032] hover:bg-[#1f2c42] border border-white/10 text-[var(--muted)] hover:text-white rounded-2xl transition-all cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer border border-emerald-400/30"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Download Excel Report (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Hero Financial ROI Banner */}
      <div className="bg-gradient-to-br from-[#0c182c] via-[#101d33] to-[#0a1424] border border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-mono-data font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Live Automated ROI Calculation
              </span>
              <span className="px-3 py-1 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-full text-[10px] font-mono-data font-extrabold uppercase">
                Zero-Loss Guard
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
              Demurrage Penalties Avoided & Saved
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed font-medium">
              Calculated dynamically from all active containers and verified Last Free Day (LFD) schedules stored in Supabase.
            </p>
          </div>

          <div className="bg-[#070e1a]/80 backdrop-blur-md border border-emerald-500/40 p-6 sm:p-7 rounded-3xl shrink-0 text-center lg:text-right shadow-2xl min-w-[280px]">
            <span className="text-[10px] font-mono-data text-emerald-400 font-extrabold uppercase tracking-widest block">
              Total Realized Savings
            </span>
            <span className="text-3xl sm:text-4xl font-black font-mono-data text-emerald-300 block mt-1">
              {formatINR(totalSavings)}
            </span>
            <div className="flex items-center justify-center lg:justify-end gap-1.5 text-xs text-emerald-400 font-bold font-mono-data mt-2">
              <ArrowUpRight className="w-4 h-4" />
              <span>{onTimePercentage}% on-time protection rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 SaaS KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--border)] shadow-lg space-y-3 hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-data text-[var(--muted)] font-extrabold uppercase">
              Total Boxes Managed
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black font-mono-data text-white block">
              {totalContainers} TEUs
            </span>
            <span className="text-[11px] text-emerald-400 font-mono-data font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100% Ingested in Supabase
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--border)] shadow-lg space-y-3 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-data text-[var(--muted)] font-extrabold uppercase">
              On-Time Return Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black font-mono-data text-emerald-400 block">
              {onTimePercentage}%
            </span>
            <span className="text-[11px] text-emerald-400 font-mono-data font-bold flex items-center gap-1 mt-1">
              {containersSafe} of {totalContainers} containers protected
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--border)] shadow-lg space-y-3 hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-data text-[var(--muted)] font-extrabold uppercase">
              Overdue Penalty Accrual
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black font-mono-data text-rose-400 block">
              {formatINR(totalActualCost)}
            </span>
            <span className="text-[11px] text-rose-400 font-mono-data font-bold flex items-center gap-1 mt-1">
              {containersWithDD} overdue container(s)
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[var(--card)] p-5 rounded-3xl border border-[var(--border)] shadow-lg space-y-3 hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-data text-[var(--muted)] font-extrabold uppercase">
              Dispatched Alerts
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black font-mono-data text-sky-400 block">
              {alertsCount} Sent
            </span>
            <span className="text-[11px] text-sky-300 font-mono-data font-bold flex items-center gap-1 mt-1">
              WhatsApp 72h, 48h, 24h reminders
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section 1: Timeline Area Chart + Turnaround Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Area Chart: Timeline (8 cols) */}
        <div className="lg:col-span-8 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-black text-white text-base">
                  Demurrage Avoidance & Penalty Exposure Timeline
                </h3>
                <p className="text-xs text-[var(--muted)] font-medium">
                  Aggregated from container discharge dates in database.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono-data text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-extrabold">
              {formatINR(totalSavings)} Total Saved
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSavedDb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorIncurredDb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c1420',
                      borderColor: '#26334d',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    }}
                    formatter={(value: any) => [formatINR(Number(value)), '']}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="saved"
                    name="Demurrage Saved"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSavedDb)"
                  />
                  <Area
                    type="monotone"
                    dataKey="incurred"
                    name="Penalties Incurred"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncurredDb)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--muted)] font-mono-data">
                No timeline records available yet.
              </div>
            )}
          </div>
        </div>

        {/* Turnaround Distribution Donut Chart (4 cols) */}
        <div className="lg:col-span-4 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-white text-base">
                Turnaround Breakdown
              </h3>
              <p className="text-xs text-[var(--muted)] font-medium">
                Live database container return stages
              </p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={turnaroundDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {turnaroundDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1420',
                    borderColor: '#26334d',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(value: any, name: any, item: any) => [`${value}% (${item.payload.count} containers)`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] font-mono-data">
            {turnaroundDistribution.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[var(--muted)]">{item.name}</span>
                </div>
                <strong className="text-white">{item.value}% ({item.count})</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section 2: Carrier-Wise Savings & Penalty Comparison Bar Chart */}
      {carrierBreakdown.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold">
                <Ship className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-black text-white text-base">
                  Carrier Penalty Performance & Savings Comparison
                </h3>
                <p className="text-xs text-[var(--muted)] font-medium">
                  Demurrage saved vs penalties paid per shipping line from database.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono-data text-[var(--muted)]">
              {carrierBreakdown.length} Shipping Lines
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carrierBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="line" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1420',
                    borderColor: '#26334d',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                  formatter={(value: any) => [formatINR(Number(value)), '']}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                />
                <Bar dataKey="saved" name="Demurrage Avoided (Saved ₹)" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="incurred" name="Actual Penalties Paid (₹)" fill="#f43f5e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Carrier Performance Table */}
      {carrierBreakdown.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-heading font-black text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Carrier Free-Time Adherence Scorecard
            </h3>
            <span className="text-xs font-mono-data text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-extrabold">
              {onTimePercentage}% Overall Adherence
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#162032] text-[var(--dim)] font-mono-data uppercase text-[10px] tracking-wider font-extrabold">
                <tr>
                  <th className="py-3 px-4">Carrier / Line</th>
                  <th className="py-3 px-4">Boxes Tracked</th>
                  <th className="py-3 px-4">Avg Free Days</th>
                  <th className="py-3 px-4">Total Penalties Paid</th>
                  <th className="py-3 px-4">Demurrage Saved</th>
                  <th className="py-3 px-4 text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {carrierBreakdown.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{row.line}</span>
                    </td>
                    <td className="py-3 px-4 font-mono-data text-white font-semibold">
                      {row.boxes} Containers
                    </td>
                    <td className="py-3 px-4 font-mono-data text-orange-300 font-bold">
                      {row.freeDays} Days
                    </td>
                    <td className="py-3 px-4 font-mono-data text-rose-400 font-extrabold">
                      {formatINR(row.incurred)}
                    </td>
                    <td className="py-3 px-4 font-mono-data text-emerald-400 font-black">
                      {formatINR(row.saved)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full font-mono-data text-[10px] font-black">
                        {row.incurred === 0 ? 'A+' : 'A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Container Audit Ledger from Supabase */}
      {recentLedger.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-heading font-black text-white text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" />
              Live Container Savings Ledger (Supabase Audit Trail)
            </h3>
            <span className="text-xs font-mono-data text-[var(--muted)]">
              Showing top {recentLedger.length} shipments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#162032] text-[var(--dim)] font-mono-data uppercase text-[10px] tracking-wider font-extrabold">
                <tr>
                  <th className="py-3 px-4">Container #</th>
                  <th className="py-3 px-4">Line & Port</th>
                  <th className="py-3 px-4">Discharge Date</th>
                  <th className="py-3 px-4">LFD Schedule</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Avoided Demurrage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentLedger.map((row: any) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono-data font-bold text-white">
                      {row.containerNo}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {row.shippingLine} ({row.port})
                    </td>
                    <td className="py-3 px-4 font-mono-data text-[var(--muted)]">
                      {row.dischargeDate}
                    </td>
                    <td className="py-3 px-4 font-mono-data text-emerald-300 font-semibold">
                      {row.lfd}
                    </td>
                    <td className="py-3 px-4 font-mono-data">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        row.status === 'Overdue'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono-data font-bold text-emerald-400">
                      {row.avoidedSavings > 0 ? formatINR(row.avoidedSavings) : '₹0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
