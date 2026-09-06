import React, { useState, useEffect } from 'react';
import { ContainerItem, AlertRecipient } from '../types';
import { calculateContainerStatus, formatINR } from '../utils/dndCalculations';
import { fetchRecipientsByContainer } from '../services/recipientService';
import { sendWhatsAppAlert } from '../server/services/whatsappGupshup';
import { buildWhatsAppMessage } from '../server/services/alertCron';
import {
  Send,
  X,
  CheckCheck,
  Phone,
  AlertTriangle,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AlertModalProps {
  container: ContainerItem | null;
  urgentContainers?: ContainerItem[];
  onClose: () => void;
  onSelectContainer?: (c: ContainerItem) => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  container,
  urgentContainers = [],
  onClose,
  onSelectContainer,
}) => {
  const [recipients, setRecipients] = useState<AlertRecipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState<boolean>(true);
  const [dispatching, setDispatching] = useState<boolean>(false);
  const [dispatchResults, setDispatchResults] = useState<{
    phone: string;
    name?: string;
    success: boolean;
  }[] | null>(null);

  const activeContainer = container || urgentContainers[0] || null;

  useEffect(() => {
    if (!activeContainer) return;
    setLoadingRecipients(true);
    setDispatchResults(null);
    fetchRecipientsByContainer(activeContainer.id).then((list) => {
      if (list.length > 0) {
        setRecipients(list);
      } else {
        // Fallback default list
        const defs: AlertRecipient[] = [
          {
            id: 'r1',
            containerId: activeContainer.id,
            phoneNumber: activeContainer.ownerPhone || '+91 8160024858',
            recipientName: 'You (Account Owner)',
            isActive: true,
            isOwner: true,
          },
          ...(activeContainer.opsPhone
            ? [
                {
                  id: 'r2',
                  containerId: activeContainer.id,
                  phoneNumber: activeContainer.opsPhone,
                  recipientName: 'Operations Desk',
                  isActive: true,
                  isOwner: false,
                },
              ]
            : []),
        ];
        setRecipients(defs);
      }
      setLoadingRecipients(false);
    });
  }, [activeContainer?.id]);

  if (!activeContainer) return null;

  const calc = calculateContainerStatus(activeContainer);
  const { alertType, messageText } = buildWhatsAppMessage(activeContainer, calc);
  const activeRecipients = recipients.filter((r) => r.isActive);

  const handleDispatch = async () => {
    setDispatching(true);
    const results: { phone: string; name?: string; success: boolean }[] = [];

    for (const rec of activeRecipients) {
      try {
        const res = await sendWhatsAppAlert({
          containerId: activeContainer.id,
          recipientPhone: rec.phoneNumber,
          recipientName: rec.recipientName,
          alertType,
          messageContent: messageText,
        });
        results.push({
          phone: rec.phoneNumber,
          name: rec.recipientName,
          success: res.success,
        });
      } catch (e) {
        results.push({
          phone: rec.phoneNumber,
          name: rec.recipientName,
          success: false,
        });
      }
    }

    setDispatching(false);
    setDispatchResults(results);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#101828] border border-[var(--border)] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in space-y-0 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#0b1019] px-6 py-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-sm">
              📱
            </div>
            <div>
              <h3 className="font-heading font-black text-white text-base">
                WhatsApp Multi-Recipient Alert
              </h3>
              <span className="text-xs text-[var(--muted)] font-mono-data font-bold">
                {activeContainer.containerNo} • {activeContainer.line}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--dim)] hover:text-white p-2 rounded-2xl hover:bg-[var(--card)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Urgent Containers Switcher if multiple */}
        {urgentContainers.length > 1 && (
          <div className="bg-[var(--panel)] px-5 py-2.5 border-b border-[var(--border)] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] text-[var(--dim)] font-mono-data font-bold uppercase shrink-0">
              Urgent:
            </span>
            {urgentContainers.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectContainer && onSelectContainer(c)}
                className={`px-3 py-1 rounded-full text-xs font-mono-data font-extrabold shrink-0 transition-all cursor-pointer ${
                  c.id === activeContainer.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-white'
                }`}
              >
                {c.containerNo}
              </button>
            ))}
          </div>
        )}

        {/* Modal Body: Scrollable Content */}
        <div className="p-5 space-y-4 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] bg-[#0b141a] overflow-y-auto flex-1">
          {/* Dispatch Results Toast */}
          {dispatchResults && (
            <div className="bg-emerald-950/90 border border-emerald-500/60 p-4 rounded-2xl space-y-2 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <CheckCheck className="w-4 h-4" /> Dispatched to {dispatchResults.length} Recipients
                </span>
                <span className="text-[10px] font-mono-data text-emerald-300">
                  {dispatchResults.filter((r) => r.success).length}/{dispatchResults.length} Successful
                </span>
              </div>
              <div className="space-y-1 pt-1 border-t border-emerald-800/60">
                {dispatchResults.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] font-mono-data text-white"
                  >
                    <span className="flex items-center gap-1.5">
                      {r.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span>{r.phone}</span>
                      {r.name && <span className="text-[var(--dim)]">({r.name})</span>}
                    </span>
                    <span className={r.success ? 'text-emerald-300 font-bold' : 'text-rose-400 font-bold'}>
                      {r.success ? 'Delivered' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Recipients List Badge Card */}
          <div className="bg-[#1f2c34] p-3.5 rounded-2xl border border-white/10 text-xs space-y-2">
            <div className="flex items-center justify-between text-amber-300 font-bold border-b border-white/10 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-400" /> Active Alert Recipients ({activeRecipients.length})
              </span>
              <span className="text-[10px] font-mono-data text-white/70">
                Logged in alert_logs
              </span>
            </div>

            {loadingRecipients ? (
              <div className="flex items-center gap-2 text-white/70 py-1 font-mono-data">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching recipients...
              </div>
            ) : activeRecipients.length === 0 ? (
              <p className="text-white/60 text-[11px]">No active recipients enabled. Enable at least one number.</p>
            ) : (
              <div className="space-y-1.5">
                {activeRecipients.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between text-[11px] font-mono-data"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-white font-bold">{rec.phoneNumber}</span>
                      {rec.recipientName && (
                        <span className="text-white/70 font-sans text-xs">
                          • {rec.recipientName}
                        </span>
                      )}
                    </div>
                    {rec.isOwner && (
                      <span className="text-[9px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30 font-bold">
                        Owner
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simulated WhatsApp Chat Bubble */}
          <div className="bg-[#005c4b] text-white p-5 rounded-3xl rounded-tr-none text-xs font-mono-data leading-relaxed shadow-xl space-y-3 border border-emerald-600/30">
            <div className="font-black text-amber-300 border-b border-emerald-500/30 pb-2 text-sm flex items-center justify-between">
              <span>
                {calc.daysLeft < 0
                  ? `🔴 OVERDUE ALERT — DAY ${calc.overdueDays}`
                  : calc.isExpiresToday
                  ? '⚠️ EXPIRES TODAY ALERT'
                  : `📦 D&D ALERT — ${calc.daysLeft} DAYS LEFT`}
              </span>
              <span className="text-[10px] bg-emerald-900/80 px-2.5 py-0.5 rounded-full text-emerald-200 font-extrabold">
                Gupshup Cloud API
              </span>
            </div>

            <div className="font-medium">
              <strong className="text-emerald-200">Container:</strong> {activeContainer.containerNo}
              <br />
              <strong className="text-emerald-200">Line:</strong> {activeContainer.line} ({activeContainer.type})
              <br />
              <strong className="text-emerald-200">Port:</strong> {activeContainer.port}
              <br />
              <strong className="text-emerald-200">Importer:</strong> {activeContainer.importer}
            </div>

            <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-500/30 space-y-1 font-semibold">
              <div>
                ⏰ <strong>Last Free Day (LFD):</strong> {calc.formattedLFD}
              </div>
              <div>
                📅 <strong>Days Remaining:</strong>{' '}
                {calc.daysLeft < 0 ? `Overdue by ${calc.overdueDays}d` : `${calc.daysLeft} days`}
              </div>
              <div>
                💰 <strong>Charge Rate:</strong>{' '}
                {calc.overdueDays > 0
                  ? `${formatINR(calc.accumulatedCost)} accumulated`
                  : `${formatINR(calc.dailyRate)}/day after LFD`}
              </div>
            </div>

            <div className="font-medium">
              <strong>Action Checklist:</strong>
              <br />
              ☐ Confirm Customs Clearance
              <br />
              ☐ Dispatch Trucking Driver
              <br />
              ☐ Verify Delivery Yard Readiness
            </div>

            <div className="pt-2 border-t border-emerald-500/30 text-[10px] text-emerald-200 flex items-center justify-between font-bold">
              <span>
                — MAPS D&D Alert Engine
                <br />
                📞 +91 8160024858
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-300">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0b1019] px-6 py-4 border-t border-[var(--border)] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="text-xs text-[var(--muted)] hover:text-white font-bold cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleDispatch}
            disabled={dispatching || activeRecipients.length === 0}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            {dispatching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Broadcasting to {activeRecipients.length} numbers...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Dispatch to {activeRecipients.length} Active Recipients</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
