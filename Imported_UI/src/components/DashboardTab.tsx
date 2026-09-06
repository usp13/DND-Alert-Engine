import React, { useState, useMemo } from 'react';
import { ContainerItem, FilterOption, SortOption } from '../types';
import { calculateContainerStatus, formatINR, formatDateDDMMM } from '../utils/dndCalculations';
import { ContainerTimeline } from './ContainerTimeline';
import { Search, Filter, ArrowUpDown, Send, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert, Layers } from 'lucide-react';

interface DashboardTabProps {
  containers: ContainerItem[];
  onSendAlert: (container: ContainerItem) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ containers, onSendAlert }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('urgency');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Precompute calculated status for all containers
  const calculatedList = useMemo(() => {
    return containers.map((c) => ({
      item: c,
      calc: calculateContainerStatus(c)
    }));
  }, [containers]);

  // Counts for Stats Cards
  const stats = useMemo(() => {
    let total = calculatedList.length;
    let safe = 0;
    let warning = 0;
    let critical = 0;

    calculatedList.forEach(({ calc }) => {
      if (calc.status === 'safe') safe++;
      else if (calc.status === 'warning') warning++;
      else if (calc.status === 'critical') critical++;
    });

    return { total, safe, warning, critical };
  }, [calculatedList]);

  // Total daily exposure if warning containers are missed
  const totalExposure = useMemo(() => {
    return calculatedList
      .filter(({ calc }) => calc.status === 'warning' || calc.status === 'critical')
      .reduce((sum, { calc }) => sum + calc.dailyRate, 0);
  }, [calculatedList]);

  // Filtering & Sorting
  const filteredAndSortedContainers = useMemo(() => {
    let list = calculatedList.filter(({ item, calc }) => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        item.containerNo.toLowerCase().includes(searchLower) ||
        item.line.toLowerCase().includes(searchLower) ||
        item.importer.toLowerCase().includes(searchLower) ||
        item.port.toLowerCase().includes(searchLower) ||
        item.blNumber.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Filter
      if (filter === 'safe') return calc.status === 'safe';
      if (filter === 'warning') return calc.status === 'warning';
      if (filter === 'critical') return calc.status === 'critical';
      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sort === 'urgency') {
        // Most urgent first: critical (daysLeft negative, most negative first), then warning (ascending daysLeft), then safe
        return a.calc.daysLeft - b.calc.daysLeft;
      }
      if (sort === 'shippingLine') {
        return a.item.line.localeCompare(b.item.line);
      }
      if (sort === 'dischargeDate') {
        return new Date(b.item.dischargeDate).getTime() - new Date(a.item.dischargeDate).getTime();
      }
      if (sort === 'type') {
        return a.item.type.localeCompare(b.item.type);
      }
      return 0;
    });

    return list;
  }, [calculatedList, searchTerm, filter, sort]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Bento Grid Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Tile 1: Total Watchlist */}
        <div className="bg-[var(--card)] hover:bg-[var(--card-hover)] p-6 rounded-3xl border border-[var(--border)] transition-all flex flex-col justify-between shadow-md group">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-indigo-500/20">
              Active Watchlist
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-black font-heading text-white tracking-tight">
              {stats.total}
            </div>
            <span className="text-xs text-[var(--muted)] mt-1 block font-medium">
              Containers being monitored
            </span>
          </div>
        </div>

        {/* Bento Tile 2: Safe */}
        <div className="bg-[var(--card)] hover:bg-[var(--card-hover)] p-6 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-md group">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-emerald-500/20">
              Safe Free Time 🟢
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-black font-heading text-emerald-400 tracking-tight">
              {stats.safe}
            </div>
            <span className="text-xs text-[var(--muted)] mt-1 block font-medium">
              4+ days before LFD
            </span>
          </div>
        </div>

        {/* Bento Tile 3: Warning */}
        <div className="bg-[var(--card)] hover:bg-[var(--card-hover)] p-6 rounded-3xl border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-md group">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/20">
              Warning Window ⚠️
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-black font-heading text-amber-400 tracking-tight">
              {stats.warning}
            </div>
            <span className="text-xs text-[var(--muted)] mt-1 block font-medium">
              0–3 days remaining
            </span>
          </div>
        </div>

        {/* Bento Tile 4: Critical / Overdue */}
        <div className="bg-[var(--card)] hover:bg-[var(--card-hover)] p-6 rounded-3xl border-2 border-red-500/40 hover:border-red-500/70 transition-all flex flex-col justify-between shadow-lg shadow-red-500/5 animate-pulse-red group">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-red-500/40">
              Critical / Overdue 🔴
            </span>
            <div className="w-9 h-9 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-black font-heading text-red-400 tracking-tight">
              {stats.critical}
            </div>
            <span className="text-xs text-red-300/90 mt-1 block font-bold font-mono-data">
              Immediate Dispatch Needed
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar Bento Row */}
      <div className="bg-[var(--card)] p-4 sm:p-5 rounded-3xl border border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[var(--dim)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search container, line, importer, port..."
            className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-[var(--orange)] rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-[var(--muted)] outline-none transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          <span className="text-xs text-[var(--dim)] font-mono-data font-bold mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              filter === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] hover:text-white'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              filter === 'safe'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-[var(--panel)] border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            Safe 🟢 ({stats.safe})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              filter === 'warning'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-[var(--panel)] border border-amber-500/20 text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            Warning ⚠️ ({stats.warning})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              filter === 'critical'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'bg-[var(--panel)] border border-red-500/20 text-red-400 hover:bg-red-500/10'
            }`}
          >
            Critical 🔴 ({stats.critical})
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <ArrowUpDown className="w-3.5 h-3.5 text-[var(--dim)]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-[var(--panel)] border border-[var(--border)] text-xs text-white font-semibold rounded-2xl px-3 py-2 outline-none focus:border-[var(--orange)] cursor-pointer"
          >
            <option value="urgency">Sort: Most Urgent First</option>
            <option value="shippingLine">Sort: Shipping Line</option>
            <option value="dischargeDate">Sort: Discharge Date</option>
            <option value="type">Sort: Container Size</option>
          </select>
        </div>
      </div>

      {/* Main Container Bento Table Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--panel)] border-b border-[var(--border)] text-[var(--dim)] font-mono-data uppercase text-[10px] tracking-widest font-extrabold">
                <th className="py-3.5 px-4 text-center w-12">Status</th>
                <th className="py-3.5 px-4">Container #</th>
                <th className="py-3.5 px-4">Shipping Line</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Port</th>
                <th className="py-3.5 px-4">Importer</th>
                <th className="py-3.5 px-4">Discharge</th>
                <th className="py-3.5 px-4">LFD</th>
                <th className="py-3.5 px-4">Days Left</th>
                <th className="py-3.5 px-4 text-right">Daily / Acc. Charge</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredAndSortedContainers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-[var(--muted)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-9 h-9 text-[var(--dim)]" />
                      <span className="font-semibold">No containers found matching your criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedContainers.map(({ item, calc }) => {
                  const isExpanded = expandedId === item.id;
                  const dischargeDate = new Date(item.dischargeDate);

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => toggleExpand(item.id)}
                        className={`hover:bg-[var(--card-hover)] transition-colors cursor-pointer ${
                          isExpanded ? 'bg-[var(--panel)]/80' : ''
                        }`}
                      >
                        {/* Status Icon */}
                        <td className="py-3.5 px-4 text-center">
                          {calc.status === 'safe' && (
                            <span className="inline-block w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" title="Safe: 4+ days remaining"></span>
                          )}
                          {calc.status === 'warning' && (
                            <span className="inline-block w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" title="Warning: 0-3 days remaining"></span>
                          )}
                          {calc.status === 'critical' && (
                            <span className="inline-block w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-ping" title="Critical / Overdue"></span>
                          )}
                        </td>

                        {/* Container # */}
                        <td className="py-3.5 px-4 font-mono-data font-bold text-white text-xs tracking-wider">
                          {item.containerNo}
                        </td>

                        {/* Line */}
                        <td className="py-3.5 px-4 text-white font-medium">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]"></span>
                            {item.line}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-4">
                          <span className="bg-[var(--panel)] border border-[var(--border)] px-2.5 py-1 rounded-lg text-[10px] font-mono-data text-white font-extrabold">
                            {item.type}
                          </span>
                        </td>

                        {/* Port */}
                        <td className="py-3.5 px-4 text-[var(--text)] font-medium">
                          {item.port}
                        </td>

                        {/* Importer */}
                        <td className="py-3.5 px-4 text-[var(--text)] max-w-[140px] truncate font-medium" title={item.importer}>
                          {item.importer}
                        </td>

                        {/* Discharge */}
                        <td className="py-3.5 px-4 font-mono-data text-[var(--muted)]">
                          {formatDateDDMMM(dischargeDate)}
                        </td>

                        {/* LFD */}
                        <td className="py-3.5 px-4 font-mono-data font-semibold">
                          {calc.daysLeft < 0 ? (
                            <span className="text-rose-400 line-through">
                              {calc.formattedLFD}
                            </span>
                          ) : (
                            <span className="text-white font-bold">{calc.formattedLFD}</span>
                          )}
                        </td>

                        {/* Days Left */}
                        <td className="py-3.5 px-4 font-mono-data">
                          {calc.status === 'safe' && (
                            <span className="text-emerald-400 font-bold">
                              {calc.daysLeft}d {calc.hoursLeft}h
                            </span>
                          )}
                          {calc.status === 'warning' && !calc.isExpiresToday && (
                            <span className="text-amber-400 font-bold">
                              {calc.daysLeft}d {calc.hoursLeft}h
                            </span>
                          )}
                          {calc.isExpiresToday && (
                            <span className="bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-[10px] px-2.5 py-1 rounded-full animate-blink-yellow inline-block">
                              EXPIRES TODAY
                            </span>
                          )}
                          {calc.status === 'critical' && (
                            <div>
                              <span className="text-rose-400 font-black block leading-none">
                                OVERDUE
                              </span>
                              <span className="text-[10px] text-rose-300/80 block font-normal mt-0.5">
                                ({calc.overdueDays} {calc.overdueDays === 1 ? 'day' : 'days'})
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Daily Charge */}
                        <td className="py-3.5 px-4 text-right font-mono-data">
                          {calc.overdueDays > 0 ? (
                            <div>
                              <span className="text-rose-400 font-black block">
                                {formatINR(calc.accumulatedCost)}
                              </span>
                              <span className="text-[10px] text-[var(--muted)] block">
                                ({calc.overdueDays}d × {formatINR(calc.dailyRate)})
                              </span>
                            </div>
                          ) : (
                            <span className="text-amber-300 font-bold">
                              {formatINR(calc.dailyRate)}/day
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onSendAlert(item)}
                              className="bg-orange-500/15 border border-orange-500/30 hover:bg-orange-500 hover:text-white text-orange-400 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                              title="Send WhatsApp Alert Preview"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Alert</span>
                            </button>

                            <button
                              onClick={() => toggleExpand(item.id)}
                              className="bg-[var(--panel)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-[var(--text)] px-2.5 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <span>Details</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[var(--dim)]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[var(--dim)]" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Timeline Panel */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={11} className="p-0">
                            <ContainerTimeline
                              container={item}
                              onSendAlert={onSendAlert}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hero Financial Exposure Bento Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-orange-500/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-md">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-heading font-black text-base sm:text-lg leading-tight">
              ⚠️ {stats.warning + stats.critical} containers requiring attention in the next 48 hours.
            </h4>
            <p className="text-xs text-white/90 mt-0.5">
              Financial exposure: <strong className="font-mono-data text-white font-extrabold text-sm">{formatINR(totalExposure)}/day</strong>. WhatsApp alerts configured.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const urgentFirst = calculatedList.find(({ calc }) => calc.status === 'warning' || calc.status === 'critical');
            if (urgentFirst) onSendAlert(urgentFirst.item);
          }}
          className="bg-white text-orange-600 hover:bg-zinc-100 font-extrabold px-6 py-3 rounded-2xl text-xs whitespace-nowrap transition-all shadow-lg cursor-pointer shrink-0"
        >
          Dispatch All Alerts 📱
        </button>
      </div>
    </div>
  );
};
