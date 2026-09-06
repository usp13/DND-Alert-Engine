import React from 'react';
import { ContainerItem } from '../types';
import { calculateContainerStatus, formatINR, getShippingLineRule, formatDateDDMMM } from '../utils/dndCalculations';
import { AlertRecipientsManager } from './AlertRecipientsManager';
import { Ship, FileText, Phone, AlertTriangle, CheckCircle2, Clock, Calendar, HelpCircle, Send } from 'lucide-react';

interface ContainerTimelineProps {
  container: ContainerItem;
  onSendAlert: (container: ContainerItem) => void;
}

export const ContainerTimeline: React.FC<ContainerTimelineProps> = ({ container, onSendAlert }) => {
  const calc = calculateContainerStatus(container);
  const rule = getShippingLineRule(container.line);
  const slabs = rule.slabs[container.type || '20ft'];

  const dischargeDate = new Date(container.dischargeDate);
  const lfdDemurrage = calc.lfd;

  // Calculate LFD Detention date if split model
  const lfdDetention = new Date(lfdDemurrage);
  if (rule.model === 'Split') {
    lfdDetention.setDate(lfdDetention.getDate() + rule.detentionFree);
  }

  const gateOutDate = container.gateOutDate ? new Date(container.gateOutDate) : null;

  // Milestone logic
  const isGateOutDone = !!gateOutDate;
  const isLfdDemurrageOverdue = calc.daysLeft < 0;
  const isLfdDemurrageWarning = calc.daysLeft >= 0 && calc.daysLeft <= 3;

  return (
    <div className="bg-[#0b1019] border-t border-[var(--border)] p-4 sm:p-6 text-xs text-[var(--text)] rounded-b-2xl space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-black font-mono-data">
            {container.line.slice(0, 2)}
          </div>
          <div>
            <div className="text-white font-bold flex items-center gap-2">
              <span className="font-mono-data">{container.containerNo}</span>
              <span className="text-[10px] bg-[var(--panel)] px-2 py-0.5 rounded-full border border-[var(--border)] font-mono-data font-semibold">
                {container.type} • {container.line}
              </span>
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">
              Importer: <strong className="text-white">{container.importer}</strong> | Port:{' '}
              <strong className="text-white">{container.port}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSendAlert(container)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast WhatsApp Alert</span>
          </button>
        </div>
      </div>

      {/* Horizontal Timeline */}
      <div>
        <h4 className="text-[11px] font-mono-data uppercase text-[var(--dim)] tracking-wider mb-3 font-extrabold">
          Container Lifecycle Timeline
        </h4>
        <div className="relative overflow-x-auto pb-2">
          <div className="min-w-[650px] flex items-center justify-between relative px-4">
            {/* Connecting Line */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-[var(--border)] -z-0"></div>

            {/* Milestone 1: Discharged */}
            <div className="relative z-10 flex flex-col items-center text-center w-28">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mb-1 bg-[#0b1019]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-semibold text-white text-[11px]">📦 Discharged</span>
              <span className="text-[10px] text-[var(--muted)] font-mono-data">{formatDateDDMMM(dischargeDate)}</span>
              <span className="text-[9px] text-emerald-400 font-medium">✅ Done</span>
            </div>

            {/* Milestone 2: Gate Out */}
            <div className="relative z-10 flex flex-col items-center text-center w-28">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 bg-[#0b1019] ${
                isGateOutDone
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-orange-500/10 border-orange-500 text-orange-400'
              }`}>
                {isGateOutDone ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <span className="font-semibold text-white text-[11px]">🚪 Gate Out</span>
              <span className="text-[10px] text-[var(--muted)] font-mono-data">
                {gateOutDate ? formatDateDDMMM(gateOutDate) : 'In Port Yard'}
              </span>
              <span className={`text-[9px] font-medium ${isGateOutDone ? 'text-emerald-400' : 'text-orange-400'}`}>
                {isGateOutDone ? '✅ Done' : '⏳ Pending'}
              </span>
            </div>

            {/* Milestone 3: LFD Demurrage */}
            <div className="relative z-10 flex flex-col items-center text-center w-32">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1 bg-[#0b1019] ${
                isLfdDemurrageOverdue
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : isLfdDemurrageWarning
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-orange-500/10 border-orange-500 text-orange-400'
              }`}>
                {isLfdDemurrageOverdue ? <AlertTriangle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              </div>
              <span className="font-semibold text-white text-[11px]">📅 LFD Demurrage</span>
              <span className="text-[10px] text-[var(--muted)] font-mono-data">{calc.formattedLFD}</span>
              <span className={`text-[9px] font-medium ${
                isLfdDemurrageOverdue
                  ? 'text-rose-400 font-bold'
                  : isLfdDemurrageWarning
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {isLfdDemurrageOverdue
                  ? `🔴 Overdue (${calc.overdueDays}d)`
                  : calc.isExpiresToday
                  ? '⚠️ Expires Today!'
                  : `⚠️ ${calc.daysLeft} days left`}
              </span>
            </div>

            {/* Milestone 4: LFD Detention */}
            <div className="relative z-10 flex flex-col items-center text-center w-32">
              <div className="w-8 h-8 rounded-full bg-[var(--panel)] border-2 border-sky-500 text-sky-400 flex items-center justify-center mb-1">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="font-semibold text-white text-[11px]">📅 LFD Detention</span>
              <span className="text-[10px] text-[var(--muted)] font-mono-data">
                {rule.model === 'Split' ? formatDateDDMMM(lfdDetention) : 'Merged with Demurrage'}
              </span>
              <span className="text-[9px] text-sky-400 font-medium">
                {isGateOutDone ? 'ℹ️ Active after gate-out' : 'ℹ️ After gate-out'}
              </span>
            </div>

            {/* Milestone 5: Empty Return */}
            <div className="relative z-10 flex flex-col items-center text-center w-28">
              <div className="w-8 h-8 rounded-full bg-[var(--panel)] border-2 border-[var(--dim)] text-[var(--dim)] flex items-center justify-center mb-1">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="font-semibold text-white text-[11px]">📤 Empty Return</span>
              <span className="text-[10px] text-[var(--muted)] font-mono-data">(pending)</span>
              <span className="text-[9px] text-[var(--dim)] font-medium">❓ Not yet</span>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Recipient Management Component for this Container */}
      <AlertRecipientsManager
        containerId={container.id}
        containerNo={container.containerNo}
        line={container.line}
        onSendAlert={() => onSendAlert(container)}
      />

      {/* Details Grid: Vessel, BL, CHA & Demurrage Tariff Slabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Shipment Info */}
        <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] space-y-3">
          <h4 className="text-[11px] font-mono-data uppercase text-orange-400 font-bold tracking-wider flex items-center gap-1.5 border-b border-[var(--border)] pb-2">
            <Ship className="w-3.5 h-3.5" /> Shipment & CHA Details
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[var(--dim)] block text-[10px] font-mono-data uppercase">Vessel Name</span>
              <span className="font-semibold text-white">{container.vessel}</span>
            </div>
            <div>
              <span className="text-[var(--dim)] block text-[10px] font-mono-data uppercase">Voyage No.</span>
              <span className="font-semibold text-white">{container.voyage || '026W'}</span>
            </div>
            <div>
              <span className="text-[var(--dim)] block text-[10px] font-mono-data uppercase">Bill of Lading (BL)</span>
              <span className="font-mono-data text-white">{container.blNumber}</span>
            </div>
            <div>
              <span className="text-[var(--dim)] block text-[10px] font-mono-data uppercase">CHA Customs Agent</span>
              <span className="font-semibold text-white">{container.chaFirm}</span>
            </div>
            {container.opsPhone && (
              <div>
                <span className="text-[var(--dim)] block text-[10px] font-mono-data uppercase">Ops Contact</span>
                <span className="font-mono-data text-white flex items-center gap-1">
                  <Phone className="w-3 h-3 text-orange-400" />
                  {container.opsPhone}
                </span>
              </div>
            )}
            <div>
              <span className="text-[var(--dim)] block text-[10px] font-mono-data uppercase">Model & Free Days</span>
              <span className="text-emerald-400 font-semibold">
                {rule.model} ({rule.demurrageFree} Days Free)
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Line Tariff Slabs & Current Cost Exposure */}
        <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] space-y-3">
          <h4 className="text-[11px] font-mono-data uppercase text-amber-400 font-bold tracking-wider flex items-center gap-1.5 border-b border-[var(--border)] pb-2">
            <FileText className="w-3.5 h-3.5" /> {container.line} D&D Tariff Slabs ({container.type})
          </h4>

          {/* Slabs breakdown */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-[var(--muted)] flex justify-between font-mono-data border-b border-[var(--border)] pb-1">
              <span>Slab Period</span>
              <span>Daily Rate</span>
            </div>
            {slabs.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-[var(--text)]">{s.label}</span>
                <span className="font-mono-data text-white font-semibold">
                  {formatINR(s.rate)} / day
                </span>
              </div>
            ))}
          </div>

          {/* Cost summary banner */}
          {calc.overdueDays > 0 ? (
            <div className="bg-rose-500/15 border border-rose-500/30 p-3 rounded-xl flex items-center justify-between text-xs mt-2">
              <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Accumulated D&D Charges:
              </span>
              <span className="font-mono-data font-bold text-white text-sm">
                {formatINR(calc.accumulatedCost)} ({calc.overdueDays} days)
              </span>
            </div>
          ) : (
            <div className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs mt-2">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Within Free Period:
              </span>
              <span className="font-mono-data font-bold text-emerald-300 text-xs">
                {calc.daysLeft} days remaining ({formatINR(calc.dailyRate)}/day after LFD)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

