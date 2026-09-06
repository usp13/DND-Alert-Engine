import React from 'react';
import {
  MessageSquare,
  CheckCheck,
} from 'lucide-react';

interface WhatsAppPreviewTabProps {
  customContainerNo?: string;
  customLine?: string;
  customImporter?: string;
}

export const WhatsAppPreviewTab: React.FC<WhatsAppPreviewTabProps> = ({
  customContainerNo,
  customLine,
  customImporter,
}) => {
  const containerNo1 = customContainerNo || 'MSKU7234561';
  const line1 = customLine || 'Maersk';
  const importer1 = customImporter || 'Agarwalla Teak Industries';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)] p-5 rounded-3xl border border-[var(--border)] shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-orange-500/10 text-orange-400 rounded-full text-[10px] font-extrabold uppercase font-mono-data border border-orange-500/20">
              Gupshup WhatsApp Cloud API • Express Engine
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            WhatsApp Alert Engine & Multi-Recipient Dispatch
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1 font-medium">
            Automated alerts dispatched to Ops, Owner, CHA, and Importers per container schedule.
          </p>
        </div>
      </div>

      {/* Grid of 4 WhatsApp Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Message 1 — 72 Hour Alert */}
        <div className="bg-[#0b141a] rounded-3xl border border-[var(--border)] overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#121c2c] border border-orange-500/30 flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img src="/dnd-logo-nobg.png" alt="Avatar" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-semibold text-white text-xs block">MAPS D&D Alert Engine</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono-data">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Gupshup Meta Verified
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono-data text-white/60 bg-[#111b21] px-2 py-0.5 rounded-full">
              72h Notice
            </span>
          </div>

          <div className="p-4 space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] bg-[#0b141a] min-h-[290px]">
            <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-mono-data leading-relaxed shadow-md space-y-2 border border-emerald-600/30">
              <div className="font-bold text-emerald-200 border-b border-emerald-500/30 pb-1 text-[13px]">
                📦 D&D ALERT — 3 DAYS LEFT
              </div>
              <div>
                <strong>Container:</strong> {containerNo1}<br />
                <strong>Line:</strong> {line1} (40ft)<br />
                <strong>Port:</strong> Kandla<br />
                <strong>Importer:</strong> {importer1}
              </div>
              <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/20 text-[11px]">
                ⏰ <strong>Last Free Day:</strong> 08 Aug 2026<br />
                📅 <strong>Days Remaining:</strong> 3 days<br />
                💰 <strong>Charges after LFD:</strong> ₹7,000/day
              </div>
              <div>
                <strong>Action Needed:</strong><br />
                ☐ Check customs clearance status<br />
                ☐ Arrange truck for pickup<br />
                ☐ Confirm warehouse readiness
              </div>
              <div className="pt-1 border-t border-emerald-500/30 text-[10px] text-emerald-200 flex items-center justify-between">
                <span>— MAPS D&D Alert Engine<br />📞 8160024858</span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-300">
                  10:11 AM <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1f2c34] p-3 flex items-center justify-between border-t border-white/5">
            <span className="text-[10px] text-white/60 font-mono-data">Alerts auto-sent to: Owner, Ops Team, and Importer (if configured)</span>
          </div>
        </div>

        {/* Message 2 — 48 Hour Alert */}
        <div className="bg-[#0b141a] rounded-3xl border border-[var(--border)] overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#121c2c] border border-amber-500/40 flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img src="/dnd-logo-nobg.png" alt="Avatar" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-semibold text-white text-xs block">MAPS D&D Alert Engine</span>
                <span className="text-[10px] text-amber-400 font-mono-data">⚠️ Escalation Level 2</span>
              </div>
            </div>
            <span className="text-[10px] font-mono-data text-white/60 bg-[#111b21] px-2 py-0.5 rounded-full">
              48h Urgent
            </span>
          </div>

          <div className="p-4 space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] bg-[#0b141a] min-h-[290px]">
            <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-mono-data leading-relaxed shadow-md space-y-2 border border-emerald-600/30">
              <div className="font-bold text-amber-300 border-b border-emerald-500/30 pb-1 text-[13px]">
                ⚠️ URGENT D&D ALERT — 2 DAYS LEFT
              </div>
              <div>
                <strong>Container:</strong> {containerNo1}<br />
                <strong>Line:</strong> {line1} (40ft)<br />
                <strong>Importer:</strong> {importer1}
              </div>
              <div className="bg-amber-950/40 p-2 rounded-xl border border-amber-500/30 text-[11px] text-amber-200">
                ⏰ <strong>Last Free Day:</strong> 08 Aug (DAY AFTER TOMORROW)<br />
                💰 <strong>If missed:</strong> ₹7,000/day → ₹49,000/week
              </div>
              <div className="pt-1 border-t border-emerald-500/30 text-[10px] text-emerald-200 flex items-center justify-between">
                <span>— MAPS D&D Alert Engine</span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-300">
                  10:11 AM <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1f2c34] p-3 flex items-center justify-between border-t border-white/5">
            <span className="text-[10px] text-white/60 font-mono-data">Alerts auto-sent to: Owner, Ops Team, and Importer (if configured)</span>
          </div>
        </div>

        {/* Message 3 — 24 Hour Alert (Critical) */}
        <div className="bg-[#0b141a] rounded-3xl border border-[var(--border)] overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#121c2c] border border-rose-500/40 flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img src="/dnd-logo-nobg.png" alt="Avatar" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-semibold text-white text-xs block">MAPS D&D Alert Engine</span>
                <span className="text-[10px] text-rose-400 font-mono-data font-bold">🔴 Owner Escalation</span>
              </div>
            </div>
            <span className="text-[10px] font-mono-data text-white/60 bg-[#111b21] px-2 py-0.5 rounded-full">
              24h Critical
            </span>
          </div>

          <div className="p-4 space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] bg-[#0b141a] min-h-[290px]">
            <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-mono-data leading-relaxed shadow-md space-y-2 border border-rose-500/40">
              <div className="font-bold text-rose-300 border-b border-rose-500/30 pb-1 text-[13px]">
                🔴🔴🔴 CRITICAL — EXPIRES TOMORROW
              </div>
              <div>
                <strong>Container:</strong> {containerNo1}<br />
                <strong>Line:</strong> {line1} (40ft)<br />
                <strong>Importer:</strong> {importer1}
              </div>
              <div className="bg-rose-950/60 p-2 rounded-xl border border-rose-500/40 text-[11px] text-rose-200 space-y-1">
                ❗ <strong>LAST FREE DAY:</strong> TOMORROW (08 Aug)<br />
                ❗ <strong>After tomorrow:</strong> ₹7,000/DAY charges begin<br />
                ❗ 7 days overdue = ₹49,000 | 14 days = ₹1,47,000
              </div>
              <div className="text-rose-300 font-bold bg-rose-900/30 p-1.5 rounded-xl text-center text-[11px]">
                🚨 LAST CHANCE TO AVOID D&D PENALTIES
              </div>
              <div className="pt-1 border-t border-emerald-500/30 text-[10px] text-emerald-200 flex items-center justify-between">
                <span>— MAPS D&D Alert Engine<br />📞 8160024858</span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-300">
                  10:11 AM <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1f2c34] p-3 flex items-center justify-between border-t border-white/5">
            <span className="text-[10px] text-white/60 font-mono-data">Alerts auto-sent to: Owner, Ops Team, and Importer (if configured)</span>
          </div>
        </div>

        {/* Message 4 — Overdue Alert */}
        <div className="bg-[#0b141a] rounded-3xl border border-[var(--border)] overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#121c2c] border border-amber-400/40 flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img src="/dnd-logo-nobg.png" alt="Avatar" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-semibold text-white text-xs block">MAPS D&D Alert Engine</span>
                <span className="text-[10px] text-amber-400 font-mono-data font-bold">💸 Demurrage Running</span>
              </div>
            </div>
            <span className="text-[10px] font-mono-data text-white/60 bg-[#111b21] px-2 py-0.5 rounded-full">
              Daily Overdue
            </span>
          </div>

          <div className="p-4 space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] bg-[#0b141a] min-h-[290px]">
            <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-mono-data leading-relaxed shadow-md space-y-2 border border-amber-500/40">
              <div className="font-bold text-amber-300 border-b border-emerald-500/30 pb-1 text-[13px]">
                💸 D&D CHARGES RUNNING — DAY 3
              </div>
              <div>
                <strong>Container:</strong> ONEY7654321<br />
                <strong>Line:</strong> ONE (40ft)<br />
                <strong>Importer:</strong> Gujarat Minerals Corp
              </div>
              <div className="bg-black/30 p-2 rounded-xl border border-amber-500/30 text-[11px] space-y-1">
                🔴 <strong>Overdue since:</strong> 01 Aug 2026<br />
                🔴 <strong>Days overdue:</strong> 3<br />
                🔴 <strong>D&D accumulated:</strong> ₹18,000<br />
                🔴 <strong>Rate today:</strong> ₹6,000/day
              </div>
              <div className="bg-rose-950/60 p-1.5 rounded-xl text-center text-rose-200 font-bold text-xs border border-rose-500/40">
                ⚡ RETURN EMPTY CONTAINER IMMEDIATELY
              </div>
              <div className="pt-1 border-t border-emerald-500/30 text-[10px] text-emerald-200 flex items-center justify-between">
                <span>— MAPS D&D Alert Engine</span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-300">
                  10:11 AM <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#1f2c34] p-3 flex items-center justify-between border-t border-white/5">
            <span className="text-[10px] text-white/60 font-mono-data">Alerts auto-sent to: Owner, Ops Team, and Importer (if configured)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

