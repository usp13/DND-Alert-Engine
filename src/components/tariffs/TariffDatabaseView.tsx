"use client";

import React, { useState } from 'react';
import { shippingLineRules } from '@/data/shippingLines';
import { formatINR } from '@/utils/dndCalculations';
import { BookOpen, Info, Search, Filter } from 'lucide-react';

export const TariffDatabaseView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModel, setFilterModel] = useState<'All' | 'Split' | 'Merged'>('All');

  const filteredRules = shippingLineRules.filter((line) => {
    const matchesSearch =
      line.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      line.prefix.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = filterModel === 'All' || line.model === filterModel;
    return matchesSearch && matchesModel;
  });

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
            Master tariff rules, free days, and progressive escalation slabs for top ocean carriers across Indian ports (Kandla, Mundra, Nhava Sheva).
          </p>
        </div>
        <div className="bg-[var(--panel)] border border-[var(--border)] px-4 py-2 rounded-2xl text-xs font-mono-data text-orange-400 font-bold flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          Tariffs Updated: August 2026
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-2.5 w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-[var(--muted)] mr-2 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search carrier or prefix (e.g. Maersk, MSCU)..."
            className="bg-transparent border-0 text-xs text-white placeholder-[var(--muted)] outline-none w-full font-mono-data"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[var(--muted)] shrink-0 hidden sm:block" />
          <div className="grid grid-cols-3 gap-1 bg-[var(--card)] p-1 rounded-2xl border border-[var(--border)] w-full sm:w-auto">
            {(['All', 'Split', 'Merged'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterModel(m)}
                className={`px-3 py-1.5 text-xs font-mono-data rounded-xl font-bold transition-all cursor-pointer ${
                  filterModel === m
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-[var(--muted)] hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Tariff Database Bento Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl p-2 sm:p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
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
              {filteredRules.map((line) => {
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
      <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] text-xs text-[var(--muted)] space-y-2.5 shadow-md">
        <h4 className="font-bold text-white flex items-center gap-2 text-xs">
          <Info className="w-4 h-4 text-orange-400" /> Tariff Notes & Carrier Policies:
        </h4>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-[var(--muted)] leading-relaxed font-medium">
          <li>All rates are per container, per calendar day, per container size specification.</li>
          <li>40ft & High Cube containers are typically 2x the 20ft daily tariff rate across all carriers.</li>
          <li>Reefer and special equipment containers carry separate higher tariffs (contact carrier line directly).</li>
          <li>Rates apply to major Indian container ports (Kandla, Mundra, Nhava Sheva / JNPT, Chennai, Hazira).</li>
          <li>Some shipping lines offer extended free days for high-volume contract shippers.</li>
          <li><strong className="text-white">Source:</strong> Official published tariffs from ocean carrier websites (2026).</li>
        </ul>
      </div>
    </div>
  );
};
