"use client";

import React, { useState, useMemo } from 'react';
import { shippingLineRules } from '@/data/shippingLines';
import { ContainerType } from '@/types';
import { calculateCalculatorCost, formatINR, getShippingLineRule } from '@/utils/dndCalculations';
import { Calculator, ShieldCheck, Sliders, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from "next/link";

export const QuickCostCalculatorView: React.FC = () => {
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
            <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-[10px] font-extrabold uppercase font-mono-data border border-orange-500/20">
              Interactive Financial Simulator
            </span>
          </div>
          <h2 className="text-2xl font-black font-heading text-white flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-orange-400" />
            Quick D&D Cost Calculator
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1 font-medium">
            Simulate container delays and calculate exact multi-slab demurrage financial liability across Indian port rules.
          </p>
        </div>

        <Link
          href="/tariffs"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--panel)] border border-[var(--border)] hover:border-orange-500/40 rounded-2xl text-xs font-mono-data text-orange-400 font-bold transition-all self-start sm:self-auto shrink-0 shadow-inner"
        >
          <span>View All Carrier Tariffs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* D&D Calculator Section Bento Card */}
      <div className="bg-[var(--card)] p-6 sm:p-8 rounded-3xl border border-orange-500/25 space-y-6 shadow-2xl">
        <div className="border-b border-[var(--border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-extrabold font-heading text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-400" />
              Configure Delay Parameters
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5 font-medium">
              Select your shipping line, box size, and estimated delay past the free time window.
            </p>
          </div>
          <span className="text-[10px] bg-orange-500/10 text-orange-400 font-mono-data px-3 py-1 rounded-full font-extrabold border border-orange-500/30 self-start sm:self-auto">
            Dynamic Calculation
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
                <div key={idx} className="bg-[var(--card)] p-3.5 rounded-2xl border border-[var(--border)] text-xs shadow-sm">
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

        {/* Carrier Free Period Info */}
        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-[var(--panel)] p-4 rounded-2xl border border-[var(--border)]">
            <span className="text-[10px] text-[var(--muted)] font-mono-data uppercase font-bold block">
              Carrier Free Days
            </span>
            <span className="text-sm font-extrabold text-white mt-1 block">
              {selectedRule.demurrageFree} Demurrage Days
            </span>
          </div>

          <div className="bg-[var(--panel)] p-4 rounded-2xl border border-[var(--border)]">
            <span className="text-[10px] text-[var(--muted)] font-mono-data uppercase font-bold block">
              D&D Tariff Model
            </span>
            <span className="text-sm font-extrabold text-white mt-1 block">
              {selectedRule.model} ({selectedRule.calendarBasis})
            </span>
          </div>

          <div className="bg-[var(--panel)] p-4 rounded-2xl border border-[var(--border)]">
            <span className="text-[10px] text-[var(--muted)] font-mono-data uppercase font-bold block">
              Container ISO Prefix
            </span>
            <span className="text-sm font-extrabold text-orange-400 font-mono-data mt-1 block">
              {selectedRule.prefix}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
