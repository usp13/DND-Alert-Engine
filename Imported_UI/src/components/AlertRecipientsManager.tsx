import React, { useState, useEffect } from 'react';
import { AlertRecipient } from '../types';
import {
  fetchRecipientsByContainer,
  addRecipientToContainer,
  updateRecipient,
  deleteRecipient,
  fetchContainerAlertLogs,
} from '../services/recipientService';
import {
  Users,
  Plus,
  Trash2,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
} from 'lucide-react';

interface AlertRecipientsManagerProps {
  containerId: string;
  containerNo: string;
  line: string;
  onSendAlert?: () => void;
}

export const AlertRecipientsManager: React.FC<AlertRecipientsManagerProps> = ({
  containerId,
  containerNo,
  line,
  onSendAlert,
}) => {
  const [recipients, setRecipients] = useState<AlertRecipient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State for Adding New Recipient
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [phoneDigits, setPhoneDigits] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Alert Logs State
  const [logs, setLogs] = useState<{ sentAt: string; recipientPhone: string; alertType: string; status: string }[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  const loadRecipients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecipientsByContainer(containerId);
      setRecipients(data);
    } catch (err: unknown) {
      setError('Could not load recipients');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const logData = await fetchContainerAlertLogs(containerId);
      setLogs(logData);
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    loadRecipients();
    loadLogs();
  }, [containerId]);

  const handleToggleActive = async (recipient: AlertRecipient) => {
    const updatedStatus = !recipient.isActive;
    const res = await updateRecipient(containerId, recipient.id, { isActive: updatedStatus });
    if (res.success && res.recipient) {
      setRecipients((prev) =>
        prev.map((r) => (r.id === recipient.id ? res.recipient! : r))
      );
      setSuccessMsg(
        `${recipient.recipientName || recipient.phoneNumber} is now ${
          updatedStatus ? 'ACTIVE 🟢 (will receive alerts)' : 'MUTED ⚪ (alerts paused)'
        }`
      );
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(res.error || 'Failed to update status');
      setTimeout(() => setError(null), 3500);
    }
  };

  const handleDeleteRecipient = async (recipientId: string, name?: string) => {
    const res = await deleteRecipient(containerId, recipientId);
    if (res.success) {
      setRecipients((prev) => prev.filter((r) => r.id !== recipientId));
      setSuccessMsg(`Recipient ${name || ''} removed.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(res.error || 'Failed to delete recipient');
      setTimeout(() => setError(null), 3500);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const clean = phoneDigits.replace(/\D/g, '');
    if (clean.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(clean)) {
      setFormError('Mobile number must begin with 6, 7, 8, or 9 (Indian telecom standard).');
      return;
    }

    if (recipients.length >= 5) {
      setFormError('Maximum 5 recipients reached for this container.');
      return;
    }

    const fullPhone = `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    const fullPhoneRaw = `+91${clean}`;

    // Duplicate check
    if (
      recipients.some(
        (r) => r.phoneNumber.replace(/\D/g, '').endsWith(clean)
      )
    ) {
      setFormError('This phone number is already registered for this container.');
      return;
    }

    setFormSubmitting(true);
    const res = await addRecipientToContainer(containerId, {
      phoneNumber: fullPhone,
      recipientName: recipientName.trim() || undefined,
      isOwner: false,
    });

    setFormSubmitting(false);

    if (res.success && res.recipient) {
      setRecipients((prev) => [...prev, res.recipient!]);
      setPhoneDigits('');
      setRecipientName('');
      setIsAdding(false);
      setSuccessMsg(`New recipient added: ${res.recipient.phoneNumber}`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setFormError(res.error || 'Failed to add recipient');
    }
  };

  const activeCount = recipients.filter((r) => r.isActive).length;

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 space-y-4 shadow-lg">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-black text-white text-sm flex items-center gap-2">
              WhatsApp Alert Recipients
              <span className="text-[10px] font-mono-data bg-[var(--panel)] px-2 py-0.5 rounded-full text-orange-400 border border-[var(--border)] font-bold">
                {recipients.length}/5 Configured
              </span>
            </h4>
            <p className="text-[11px] text-[var(--muted)] font-medium">
              Multi-stakeholder alerts dispatched simultaneously to Ops, Owner, CHA & Importer.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSendAlert && (
            <button
              onClick={onSendAlert}
              className="bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Test WhatsApp dispatch to all active recipients"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast ({activeCount} Active)</span>
            </button>
          )}

          {!isAdding && recipients.length < 5 && (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-orange-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Recipient</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Recipient Form (Collapsible) */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-[var(--panel)] border border-orange-500/40 rounded-2xl p-4 space-y-3 animate-fade-in shadow-inner"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add New WhatsApp Recipient
            </span>
            <span className="text-[10px] text-[var(--muted)] font-mono-data">
              Limit: {recipients.length}/5 slots used
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone input with +91 prefix */}
            <div>
              <label className="block text-[11px] font-bold text-white mb-1">
                WhatsApp Mobile Number <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center bg-[var(--card)] border border-[var(--border)] focus-within:border-orange-500 rounded-xl overflow-hidden px-3 py-2">
                <span className="text-xs font-mono-data text-orange-400 font-extrabold mr-2 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneDigits}
                  onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="bg-transparent text-xs text-white placeholder-[var(--muted)] outline-none w-full font-mono-data font-semibold tracking-wider"
                  autoFocus
                />
              </div>
            </div>

            {/* Recipient name / role */}
            <div>
              <label className="block text-[11px] font-bold text-white mb-1">
                Recipient Name / Role <span className="text-[var(--dim)]">(Optional)</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Ramesh — Ops Manager"
                className="w-full bg-[var(--card)] border border-[var(--border)] focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white placeholder-[var(--muted)] outline-none font-medium"
              />
            </div>
          </div>

          {formError && (
            <div className="text-[11px] text-rose-400 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setFormError(null);
                setPhoneDigits('');
                setRecipientName('');
              }}
              className="text-xs text-[var(--muted)] hover:text-white px-3 py-1.5 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting || phoneDigits.length !== 10}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              {formSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save Recipient
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Recipients List */}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-xs text-[var(--muted)] gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          <span>Loading configured alert recipients...</span>
        </div>
      ) : recipients.length === 0 ? (
        <div className="text-center py-6 bg-[var(--panel)] rounded-xl border border-[var(--border)] space-y-2">
          <Phone className="w-8 h-8 text-[var(--dim)] mx-auto" />
          <p className="text-xs text-[var(--muted)] font-medium">
            No alert recipients configured yet.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs font-bold text-orange-400 hover:underline"
          >
            + Add first recipient now
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {recipients.map((rec) => (
            <div
              key={rec.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                rec.isActive
                  ? 'bg-[var(--panel)] border-[var(--border)] hover:border-orange-500/30'
                  : 'bg-[var(--panel)]/40 border-[var(--border)]/50 opacity-65'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Active Indicator Dot */}
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    rec.isActive
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      : 'bg-zinc-600'
                  }`}
                  title={rec.isActive ? 'Active: Will receive automated alerts' : 'Muted: Alerts paused'}
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono-data font-bold text-white text-xs tracking-wide">
                      {rec.phoneNumber}
                    </span>
                    {rec.isOwner ? (
                      <span className="px-2 py-0.5 bg-orange-500/15 text-orange-400 rounded-full text-[9px] font-mono-data font-extrabold border border-orange-500/30">
                        Account Owner (You)
                      </span>
                    ) : rec.recipientName ? (
                      <span className="text-xs text-[var(--text)] font-semibold truncate">
                        {rec.recipientName}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] text-[var(--dim)] font-mono-data block">
                    {rec.isActive ? '🟢 Active recipient' : '⚪ Muted (No alerts sent)'}
                  </span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Active Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(rec)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    rec.isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                  }`}
                  title={rec.isActive ? 'Click to Mute Alerts' : 'Click to Activate Alerts'}
                >
                  {rec.isActive ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-zinc-500" />
                      <span className="hidden sm:inline">Muted</span>
                    </>
                  )}
                </button>

                {/* Delete Button (Allowed for non-owners) */}
                {!rec.isOwner ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteRecipient(rec.id, rec.recipientName || rec.phoneNumber)}
                    className="p-1.5 text-[var(--dim)] hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove recipient"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <span
                    className="text-[10px] text-[var(--dim)] font-mono-data px-1.5 py-0.5 select-none"
                    title="Primary owner account cannot be deleted, but can be toggled off"
                  >
                    Protected
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Logs Collapsible Footer */}
      {logs.length > 0 && (
        <div className="pt-2 border-t border-[var(--border)]">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="text-[11px] font-mono-data text-orange-400 hover:underline flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{showLogs ? 'Hide' : 'View'} Dispatch History ({logs.length} logged alerts)</span>
          </button>

          {showLogs && (
            <div className="mt-2 space-y-1.5 bg-[var(--panel)] p-3 rounded-xl border border-[var(--border)] max-h-40 overflow-y-auto">
              {logs.map((l, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[10px] font-mono-data border-b border-[var(--border)]/40 pb-1 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        l.status === 'sent' ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-white font-bold">{l.recipientPhone}</span>
                    <span className="text-[var(--dim)]">({l.alertType})</span>
                  </div>
                  <span className="text-[var(--muted)]">
                    {new Date(l.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
