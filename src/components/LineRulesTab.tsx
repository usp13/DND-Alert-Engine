import React, { useState, useMemo } from 'react';
import { shippingLineRules } from '../data/shippingLines';
import { ContainerType } from '../types';
import { calculateCalculatorCost, formatINR, getShippingLineRule } from '../utils/dndCalculations';
import { BookOpen, Calculator, Info, Shield, CheckCircle2 } from 'lucide-react';

export const LineRulesTab: React.FC = () => {
  // Calculator State
  const [calcLine, setCalcLine] = useState('Maersk');
  const [calcType, setCalcType] = useState<ContainerType>('40ft');
  const [calcDays, setCalcDays] = useState<number>(5);

  const calcResult = useMemo(() => {
    return calculateCalculatorCost(calcLine, calcType, Math.max(1, calcDays));
  }, [calcLine, calcType, calcDays]);

  const selectedRule = useMemo(() => {
    return getShippingLineRule(calcLine);
  }, [calcLine]);

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-extrabold uppercase font-mono-data border border-amber-500/20">
              India Port Tariffs 2026
            </span>
          </div>
          <h2 className="text-2xl font-black font-heading text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-orange-400" />
            Shipping Line D&D Tariff Database
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1 font-medium">
            Master tariff rules, free days, and escalation slabs for top 10 ocean carriers in India.
          </p>
        </div>
        <div className="bg-[var(--panel)] border border-[var(--border)] px-4 py-2 rounded-2xl text-xs font-mono-data text-orange-400 font-bold flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          Tariffs Updated: August 2026
        </div>
      </div>

      {/* Main Tariff Database Bento Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl p-2 sm:p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[var(--panel)] border-b border-[var(--border)] text-[var(--dim)] font-mono-data uppercase text-[10px] font-extrabold tracking-wider">
                <th className="py-3.5 px-4 rounded-l-2xl">Shipping Line</th>
                <th className="py-3.5 px-3">Prefix</th>
                <th className="py-3.5 px-3 text-center">Demurrage Free</th>
                <th className="py-3.5 px-3 text-center">Detention Free</th>
                <th className="py-3.5 px-3 text-center">Model</th>
                <th className="py-3.5 px-3 font-mono-data text-right bg-orange-500/10 text-orange-300">20ft Day 1–7</th>
                <th className="py-3.5 px-3 font-mono-data text-right bg-orange-500/10 text-orange-300">20ft Day 8–14</th>
                <th className="py-3.5 px-3 font-mono-data text-right bg-orange-500/10 text-orange-300">20ft Day 15+</th>
                <th className="py-3.5 px-3 font-mono-data text-right bg-amber-500/10 text-amber-300">40ft Day 1–7</th>
                <th className="py-3.5 px-3 font-mono-data text-right bg-amber-500/10 text-amber-300">40ft Day 8–14</th>
                <th className="py-3.5 px-4 font-mono-data text-right bg-amber-500/10 text-amber-300 rounded-r-2xl">40ft Day 15+</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {shippingLineRules.map((line) => {
                const s20 = line.slabs['20ft'];
                const s40 = line.slabs['40ft'];

                return (
                  <tr key={line.name} className="hover:bg-[var(--card-hover)] transition-colors">
                    {/* Line Name */}
                    <td className="py-3.5 px-4 font-black text-white text-xs">
                      {line.name}
                    </td>

                    {/* Prefix */}
                    <td className="py-3.5 px-3 font-mono-data text-[var(--muted)] font-bold">
                      {line.prefix}
                    </td>

                    {/* Demurrage Free */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-mono-data px-2.5 py-1 rounded-full font-extrabold">
                        {line.demurrageFree} days
                      </span>
                    </td>

                    {/* Detention Free */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] text-[10px] font-mono-data px-2.5 py-1 rounded-full font-bold">
                        {line.model === 'Merged' ? 'Merged' : `${line.detentionFree} days`}
                      </span>
                    </td>

                    {/* Model */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        line.model === 'Split'
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                      }`}>
                        {line.model}
                      </span>
                    </td>

                    {/* 20ft Slabs */}
                    <td className="py-3.5 px-3 font-mono-data text-right text-white font-bold bg-orange-500/5">
                      {formatINR(s20[0]?.rate || 0)}
                    </td>
                    <td className="py-3.5 px-3 font-mono-data text-right text-white font-bold bg-orange-500/5">
                      {formatINR(s20[1]?.rate || 0)}
                    </td>
                    <td className="py-3.5 px-3 font-mono-data text-right text-rose-400 font-extrabold bg-orange-500/5">
                      {formatINR(s20[2]?.rate || 0)}
                    </td>

                    {/* 40ft Slabs */}
                    <td className="py-3.5 px-3 font-mono-data text-right text-white font-bold bg-amber-500/5">
                      {formatINR(s40[0]?.rate || 0)}
                    </td>
                    <td className="py-3.5 px-3 font-mono-data text-right text-white font-bold bg-amber-500/5">
                      {formatINR(s40[1]?.rate || 0)}
                    </td>
                    <td className="py-3.5 px-4 font-mono-data text-right text-rose-400 font-extrabold bg-amber-500/5">
                      {formatINR(s40[2]?.rate || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Bento Card */}
      <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] text-xs text-[var(--muted)] space-y-2.5">
        <h4 className="font-bold text-white flex items-center gap-2 text-xs">
          <Info className="w-4 h-4 text-orange-400" /> Tariff Notes & Carrier Policies:
        </h4>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-[var(--muted)] leading-relaxed font-medium">
          <li>All rates are per container, per calendar day, per container size specification.</li>
          <li>40ft & High Cube containers are typically 2x the 20ft daily tariff rate across all carriers.</li>
          <li>Reefer and special equipment containers carry separate higher tariffs (contact line directly).</li>
          <li>Rates may vary by specific Indian port. The above tariffs represent general India import tariffs.</li>
          <li>Some shipping lines offer extended free days for high-volume contract shippers.</li>
          <li><strong className="text-white">Source:</strong> Official published tariffs from ocean carrier websites (2026). MAPS updates this engine automatically when tariffs revision notices are published.</li>
        </ul>
      </div>

      {/* D&D Calculator Section Bento Card */}
      <div className="bg-[var(--card)] p-6 sm:p-8 rounded-3xl border-2 border-orange-500/40 space-y-6 shadow-2xl">
        <div className="border-b border-[var(--border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-black font-heading text-white flex items-center gap-2.5">
              <Calculator className="w-6 h-6 text-orange-400" />
              Quick D&D Cost Calculator
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1 font-medium">
              Simulate container delays and calculate exact multi-slab financial liability instantly.
            </p>
          </div>
          <span className="text-[10px] bg-orange-500/10 text-orange-400 font-mono-data px-3 py-1 rounded-full font-extrabold border border-orange-500/30 self-start sm:self-auto">
            Interactive Tool
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Input 1: Shipping Line */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">
              Shipping Line
            </label>
            <select
              value={calcLine}
              onChange={(e) => setCalcLine(e.target.value)}
              className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-2xl px-4 py-3 text-xs text-white font-semibold outline-none cursor-pointer"
            >
              {shippingLineRules.map((l) => (
                <option key={l.name} value={l.name} className="bg-[#0f172a]">
                  {l.name} ({l.prefix})
                </option>
              ))}
            </select>
          </div>

          {/* Input 2: Container Type */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">
              Container Size
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[var(--panel)] p-1.5 rounded-2xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setCalcType('20ft')}
                className={`py-2 text-xs font-mono-data rounded-xl font-bold transition-all cursor-pointer ${
                  calcType === '20ft'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-[var(--muted)] hover:text-white'
                }`}
              >
                20ft
              </button>
              <button
                type="button"
                onClick={() => setCalcType('40ft')}
                className={`py-2 text-xs font-mono-data rounded-xl font-bold transition-all cursor-pointer ${
                  calcType === '40ft'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-[var(--muted)] hover:text-white'
                }`}
              >
                40ft
              </button>
            </div>
          </div>

          {/* Input 3: Days Overdue */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">
              Days Overdue After Free Period: <strong className="text-orange-400 font-mono-data">{calcDays} days</strong>
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={calcDays}
              onChange={(e) => setCalcDays(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer mt-3"
            />
            <div className="flex justify-between text-[10px] text-[var(--dim)] font-mono-data font-bold mt-1.5">
              <span>1 Day</span>
              <span>15 Days</span>
              <span>30 Days</span>
            </div>
          </div>
        </div>

        {/* Calculation Result Highlight Bento Box */}
        <div className="bg-[var(--panel)] border border-amber-500/40 p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div>
              <span className="text-[10px] text-amber-400 font-mono-data uppercase font-extrabold tracking-wider block">
                Total Demurrage Liability Simulation
              </span>
              <p className="text-xs text-white mt-1 font-medium">
                For a <strong className="text-orange-400 font-bold">{calcLine} ({calcType})</strong> container overdue by <strong className="text-amber-300 font-bold">{calcDays} days</strong>:
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono-data text-amber-300 block">
                {formatINR(calcResult.total)}
              </span>
              <span className="text-[10px] text-[var(--muted)] font-mono-data font-semibold">
                Total Estimated Bill Amount Owed
              </span>
            </div>
          </div>

          {/* Slab-by-slab breakdown */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] text-[var(--dim)] font-mono-data uppercase tracking-wider block font-bold">
              Slab-by-Slab Calculation Breakdown:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {calcResult.breakdown.map((item, idx) => (
                <div key={idx} className="bg-[var(--card)] p-3 rounded-xl border border-[var(--border)] text-xs">
                  <span className="text-[10px] text-[var(--muted)] block font-mono-data font-semibold">
                    {item.label} ({item.days} {item.days === 1 ? 'day' : 'days'})
                  </span>
                  <div className="flex items-center justify-between font-mono-data mt-1.5">
                    <span className="text-white text-xs font-semibold">{formatINR(item.rate)}/day</span>
                    <span className="font-extrabold text-amber-300">{formatINR(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
