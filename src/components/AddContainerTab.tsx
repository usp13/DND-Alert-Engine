import React, { useState, useMemo, useEffect } from 'react';
import { ContainerItem, ContainerType, AlertRecipient } from '../types';
import { shippingLineRules } from '../data/shippingLines';
import { getShippingLineRule, calculateLFD, formatDateFull, formatINR } from '../utils/dndCalculations';
import { addRecipientToContainer } from '../services/recipientService';
import {
  Truck,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronDown,
  ShieldCheck,
  Users,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Phone,
  FileText,
} from 'lucide-react';
import { detectShippingLineFromPrefix } from '../data/prefixDirectory';

interface AddContainerTabProps {
  onAddContainer: (container: ContainerItem) => void;
  onOpenQuickImport?: () => void;
}

interface FormRecipientItem {
  id: string;
  phoneDigits: string; // 10 digits
  recipientName: string;
  isActive: boolean;
  isOwner: boolean;
}

const DEFAULT_OWNER_PHONE = '8160024858'; // Aman Dana / Account Owner

export const AddContainerTab: React.FC<AddContainerTabProps> = ({ onAddContainer, onOpenQuickImport }) => {
  const [containerNo, setContainerNo] = useState('');
  const [selectedLine, setSelectedLine] = useState('Maersk');
  const [containerType, setContainerType] = useState<ContainerType>('20ft');
  const [blDate, setBlDate] = useState('');
  const [dischargeDate, setDischargeDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().split('T')[0];
  });
  const [importer, setImporter] = useState('');
  const [port, setPort] = useState('Kandla');
  const [vessel, setVessel] = useState('');
  const [blNumber, setBlNumber] = useState('');
  const [chaFirm, setChaFirm] = useState('My Freight CHA');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Alert Recipients State (Default row 1: Logged in owner)
  const [recipientsList, setRecipientsList] = useState<FormRecipientItem[]>([
    {
      id: 'owner-row',
      phoneDigits: DEFAULT_OWNER_PHONE,
      recipientName: 'You (Account Owner)',
      isActive: true,
      isOwner: true,
    },
    {
      id: 'ops-row',
      phoneDigits: '9876543210',
      recipientName: 'Ops Manager',
      isActive: true,
      isOwner: false,
    },
  ]);

  // Load user session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dnd_user_session');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setCurrentUser(u);
          if (u.firmName) setChaFirm(u.firmName);
          if (u.city) setPort(u.city === 'Mundra' ? 'Mundra' : 'Kandla');
          if (u.mobile) {
            setRecipientsList([
              {
                id: 'owner-row',
                phoneDigits: u.mobile,
                recipientName: u.contactPerson ? `${u.contactPerson} (Owner)` : 'You (Owner)',
                isActive: true,
                isOwner: true,
              },
              {
                id: 'ops-row',
                phoneDigits: u.opsPhone ? u.opsPhone.replace(/[^0-9]/g, '').slice(-10) : '9876543210',
                recipientName: 'Ops Desk',
                isActive: true,
                isOwner: false,
              },
            ]);
          }
        } catch (_) {}
      }
    }
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  // Validate container number: 4 uppercase letters + 7 digits
  const isValidContainerNo = useMemo(() => {
    const regex = /^[A-Z]{4}\d{7}$/;
    return regex.test(containerNo);
  }, [containerNo]);

  const handleContainerNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uppercase = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    setContainerNo(uppercase);

    // Auto-detect shipping line if at least 4 letters
    if (uppercase.length >= 4) {
      const detected = detectShippingLineFromPrefix(uppercase);
      if (detected.line && detected.line !== selectedLine) {
        setSelectedLine(detected.line);
      }
    }
  };

  const [freeDays, setFreeDays] = useState<number>(7);

  // Selected Line Rules
  const activeRule = useMemo(() => {
    return getShippingLineRule(selectedLine);
  }, [selectedLine]);

  // Sync freeDays when carrier changes
  useEffect(() => {
    setFreeDays(activeRule.demurrageFree);
  }, [selectedLine, activeRule.demurrageFree]);

  // Calculate LFD with inclusive Day 1 maritime standard
  const calculatedLfdInfo = useMemo(() => {
    if (!dischargeDate || !selectedLine) return null;
    const lfd = calculateLFD(dischargeDate, selectedLine, freeDays);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const lfdMid = new Date(lfd);
    lfdMid.setHours(0, 0, 0, 0);

    const daysFromNow = Math.round((lfdMid.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // First penalty date is LFD + 1 day
    const penaltyStartDate = new Date(lfdMid);
    penaltyStartDate.setDate(penaltyStartDate.getDate() + 1);

    return {
      formatted: formatDateFull(lfd.toISOString().split('T')[0]),
      lfdIso: lfd.toISOString().split('T')[0],
      daysFromNow,
      penaltyStartFormatted: formatDateFull(penaltyStartDate.toISOString().split('T')[0]),
    };
  }, [dischargeDate, selectedLine, freeDays]);

  // Handle Add Recipient Row
  const handleAddRecipientRow = () => {
    if (recipientsList.length >= 5) {
      setRecipientError('Maximum of 5 alert recipients allowed per container.');
      return;
    }
    setRecipientError(null);
    setRecipientsList((prev) => [
      ...prev,
      {
        id: `rec-row-${Date.now()}`,
        phoneDigits: '',
        recipientName: '',
        isActive: true,
        isOwner: false,
      },
    ]);
  };

  // Handle Remove Recipient Row
  const handleRemoveRecipientRow = (rowId: string) => {
    setRecipientError(null);
    setRecipientsList((prev) => prev.filter((r) => r.id !== rowId));
  };

  // Handle Update Recipient Row
  const handleUpdateRecipientRow = (
    rowId: string,
    field: 'phoneDigits' | 'recipientName' | 'isActive',
    value: string | boolean
  ) => {
    setRecipientError(null);
    setRecipientsList((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        if (field === 'phoneDigits') {
          const cleanDigits = (value as string).replace(/\D/g, '').slice(0, 10);
          return { ...r, phoneDigits: cleanDigits };
        }
        if (field === 'recipientName') {
          return { ...r, recipientName: value as string };
        }
        if (field === 'isActive') {
          return { ...r, isActive: value as boolean };
        }
        return r;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecipientError(null);

    if (!isValidContainerNo) {
      alert('Please enter a valid container number format (e.g. MSKU1234567 - 4 letters + 7 digits).');
      return;
    }

    if (!importer.trim()) {
      alert('Please enter the Importer Name.');
      return;
    }

    // Validate recipients
    const phoneSet = new Set<string>();
    for (let i = 0; i < recipientsList.length; i++) {
      const rec = recipientsList[i];
      if (rec.phoneDigits.length !== 10) {
        setRecipientError(`Recipient row ${i + 1} has an incomplete phone number. Must be exactly 10 digits.`);
        return;
      }
      if (!/^[6-9]\d{9}$/.test(rec.phoneDigits)) {
        setRecipientError(`Recipient row ${i + 1} (${rec.phoneDigits}) must start with 6, 7, 8, or 9.`);
        return;
      }
      if (phoneSet.has(rec.phoneDigits)) {
        setRecipientError(`Duplicate phone number detected: +91 ${rec.phoneDigits}. Each number must be unique.`);
        return;
      }
      phoneSet.add(rec.phoneDigits);
    }

    const containerId = `cont-${Date.now()}`;

    // Convert Form Recipients to AlertRecipient objects
    const finalRecipients: AlertRecipient[] = recipientsList.map((r) => ({
      id: `rec-${Math.random().toString(36).substring(2, 9)}`,
      containerId,
      phoneNumber: `+91 ${r.phoneDigits.slice(0, 5)} ${r.phoneDigits.slice(5)}`,
      recipientName: r.recipientName.trim() || undefined,
      isActive: r.isActive,
      isOwner: r.isOwner,
      createdAt: new Date().toISOString(),
    }));

    const opsRecipient = recipientsList.find((r) => !r.isOwner && r.isActive);
    const ownerRecipient = recipientsList.find((r) => r.isOwner);

    const newContainer: ContainerItem = {
      id: containerId,
      containerNo,
      line: selectedLine,
      type: containerType,
      port,
      dischargeDate: dischargeDate || new Date().toISOString().split('T')[0],
      importer,
      vessel: vessel || 'MAERSK SALALAH',
      blNumber: blNumber || `${activeRule.prefix}/${port.slice(0, 3).toUpperCase()}/2026/08/${Math.floor(1000 + Math.random() * 9000)}`,
      chaFirm: chaFirm || 'Riddhi Siddhi CHA',
      opsPhone: opsRecipient ? `+91 ${opsRecipient.phoneDigits}` : '+91 98765 43210',
      ownerPhone: ownerRecipient ? `+91 ${ownerRecipient.phoneDigits}` : '+91 8160024858',
      importerPhone: importer ? '+91 94262 33445' : undefined,
      customsCleared: true,
      truckArranged: false,
      warehouseReady: false,
      recipients: finalRecipients,
    };

    // Save recipients to service cache
    finalRecipients.forEach((fr) => {
      addRecipientToContainer(containerId, {
        phoneNumber: fr.phoneNumber,
        recipientName: fr.recipientName,
        isOwner: fr.isOwner,
      });
    });

    onAddContainer(newContainer);

    // Save to user's isolated local workspace
    if (typeof window !== 'undefined' && currentUser?.email) {
      try {
        const userEmail = currentUser.email;
        const existing = JSON.parse(localStorage.getItem(`dnd_containers_${userEmail}`) || '[]');
        const updated = [newContainer, ...existing.filter((c: any) => c.containerNo !== newContainer.containerNo)];
        localStorage.setItem(`dnd_containers_${userEmail}`, JSON.stringify(updated));
      } catch (_) {}
    }

    // Persist container to Supabase in background
    fetch('/api/containers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        container_number: newContainer.containerNo,
        shipping_line: newContainer.line,
        container_type: newContainer.type,
        port: newContainer.port,
        discharge_date: newContainer.dischargeDate,
        importer_name: newContainer.importer,
        importer_phone: newContainer.importerPhone || newContainer.opsPhone,
        vessel_name: newContainer.vessel,
        bl_number: newContainer.blNumber,
        demurrage_free_days: freeDays,
        demurrage_lfd: calculatedLfdInfo?.lfdIso,
        status: 'active',
        firm_name: chaFirm || currentUser?.firmName || undefined,
        owner_phone: currentUser?.mobile || undefined,
        user_email: currentUser?.email || undefined,
      }),
    }).catch((err) => console.error('Failed saving container to Supabase:', err));

    // Show toast
    setToastMessage(
      `✅ ${containerNo} added successfully! ${finalRecipients.filter((r) => r.isActive).length} WhatsApp alert recipients registered.`
    );
    setTimeout(() => setToastMessage(null), 5000);

    // Reset container number field for quick next entry
    setContainerNo('');
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[var(--muted)] hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Bento Form Box */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-[10px] font-extrabold uppercase font-mono-data border border-orange-500/20">
              Watchlist Entry
            </span>
          </div>
          <h2 className="text-2xl font-black font-heading text-white flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-orange-400" />
            Add Container to Watchlist
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1 font-medium">
            Track free-time deadlines, calculate LFD, and dispatch automated WhatsApp alerts to your team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Container Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono-data text-orange-400 font-extrabold uppercase tracking-widest">
              1. Container Details
            </h3>

            {/* Container Number */}
            <div>
              <label className="block text-xs font-bold text-white mb-1.5">
                Container Number <span className="text-orange-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={containerNo}
                  onChange={handleContainerNoChange}
                  placeholder="e.g. MSKU1234567"
                  className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-2xl px-4 py-3 text-base font-mono-data text-white font-extrabold placeholder-[var(--dim)] outline-none uppercase transition-all"
                  maxLength={11}
                  required
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {containerNo.length > 0 &&
                    (isValidContainerNo ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 text-xs font-bold">
                        <XCircle className="w-4 h-4" /> 4 Letters + 7 Digits
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Shipping Line & Container Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shipping Line */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Shipping Line <span className="text-orange-400">*</span>
                </label>
                <select
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value)}
                  className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-2xl px-4 py-3 text-xs text-white font-semibold outline-none cursor-pointer"
                >
                  {shippingLineRules.map((line) => (
                    <option key={line.name} value={line.name} className="bg-[#0f172a]">
                      {line.name} ({line.prefix}) — Free: {line.demurrageFree}d
                    </option>
                  ))}
                </select>
              </div>

              {/* Container Type */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Container Type <span className="text-orange-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[var(--panel)] p-1.5 rounded-2xl border border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setContainerType('20ft')}
                    className={`py-2 text-xs font-mono-data rounded-xl font-bold transition-all cursor-pointer ${
                      containerType === '20ft'
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'text-[var(--muted)] hover:text-white'
                    }`}
                  >
                    20ft Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setContainerType('40ft')}
                    className={`py-2 text-xs font-mono-data rounded-xl font-bold transition-all cursor-pointer ${
                      containerType === '40ft'
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'text-[var(--muted)] hover:text-white'
                    }`}
                  >
                    40ft High Cube
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Line Rules Preview Bento Card */}
          {activeRule && (
            <div className="bg-[var(--panel)] border border-orange-500/30 p-5 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <span className="font-heading font-black text-white text-sm text-orange-400 flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5" /> {activeRule.name} — India Tariff Rules
                </span>
                <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 font-mono-data px-2.5 py-0.5 rounded-full font-bold">
                  {activeRule.model} Model
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-[var(--text)] pt-1">
                <div>
                  <span className="text-[var(--dim)] block text-[10px] font-mono-data uppercase font-bold">Demurrage Free</span>
                  <strong className="text-emerald-400 font-bold">{activeRule.demurrageFree} Calendar Days</strong>
                </div>
                <div>
                  <span className="text-[var(--dim)] block text-[10px] font-mono-data uppercase font-bold">Detention Free</span>
                  <strong className="text-sky-400 font-bold">
                    {activeRule.model === 'Merged' ? 'Included in Demurrage' : `${activeRule.detentionFree} Calendar Days`}
                  </strong>
                </div>
                <div>
                  <span className="text-[var(--dim)] block text-[10px] font-mono-data uppercase font-bold">Basis</span>
                  <strong className="text-white font-bold">Vessel Discharge Date</strong>
                </div>
              </div>

              {/* Slabs list */}
              <div className="pt-2.5 border-t border-[var(--border)]">
                <span className="text-[10px] font-mono-data text-amber-300 uppercase tracking-wider block mb-1.5 font-bold">
                  Charges After Free Time ({containerType}):
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono-data text-white">
                  {activeRule.slabs[containerType].map((slab, i) => (
                    <div key={i} className="bg-[var(--card)] p-2 rounded-xl border border-[var(--border)]">
                      <span className="text-[var(--muted)] block font-medium">{slab.label}</span>
                      <span className="font-extrabold text-amber-300">{formatINR(slab.rate)}/day</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Dates */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-mono-data text-orange-400 font-extrabold uppercase tracking-widest">
              2. Vessel & Free-Time Dates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Bill of Lading (BL) Date
                </label>
                <input
                  type="date"
                  value={blDate}
                  onChange={(e) => setBlDate(e.target.value)}
                  className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-2xl px-4 py-2.5 text-xs text-white font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Vessel Discharge Date <span className="text-orange-400">*</span>
                </label>
                <input
                  type="date"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-2xl px-4 py-2.5 text-xs text-white font-semibold outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-white">
                    Free Days Allowed <span className="text-orange-400">*</span>
                  </label>
                  <span className="text-[10px] text-orange-300 font-mono-data">
                    {activeRule.name} default: {activeRule.demurrageFree}d
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={freeDays}
                    onChange={(e) => setFreeDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-2xl px-3 py-2.5 text-xs text-white font-mono-data font-bold outline-none text-center"
                    required
                  />
                  <div className="flex flex-wrap gap-1">
                    {[5, 7, 14, 21].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setFreeDays(days)}
                        className={`px-2 py-1 rounded-xl text-[10px] font-mono-data font-bold transition-all cursor-pointer ${
                          freeDays === days
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'bg-[var(--card)] text-[var(--muted)] hover:text-white border border-[var(--border)]'
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated LFD Highlight Card */}
            {calculatedLfdInfo && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-3xl space-y-3 shadow-lg transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-md shadow-emerald-500/10">
                      <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[var(--muted)] block text-[10px] font-mono-data uppercase font-extrabold tracking-wider">
                        Calculated Last Free Day (Demurrage LFD)
                      </span>
                      <span className="font-black text-slate-900 dark:text-white text-lg font-mono-data">
                        📅 {calculatedLfdInfo.formatted}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-xs font-bold font-mono-data px-3.5 py-1.5 rounded-xl border ${
                        calculatedLfdInfo.daysFromNow < 0
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {calculatedLfdInfo.daysFromNow < 0
                        ? `⚠️ Overdue by ${Math.abs(calculatedLfdInfo.daysFromNow)} day(s)`
                        : `⏳ ${calculatedLfdInfo.daysFromNow} days remaining`}
                    </span>
                  </div>
                </div>

                {/* Timeline Step Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono-data">
                  <div className="bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)] shadow-xs">
                    <span className="text-[var(--muted)] block text-[10px] uppercase font-bold">1. Discharge Date (Day 1)</span>
                    <span className="text-slate-900 dark:text-white font-bold">{formatDateFull(dischargeDate)}</span>
                  </div>
                  <div className="bg-[var(--card)] p-3 rounded-2xl border border-emerald-500/30 shadow-xs">
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[10px] uppercase font-bold">2. Last Free Day (Day {freeDays})</span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">{calculatedLfdInfo.formatted}</span>
                  </div>
                  <div className="bg-[var(--card)] p-3 rounded-2xl border border-rose-500/30 shadow-xs">
                    <span className="text-rose-600 dark:text-rose-400 block text-[10px] uppercase font-bold">3. Penalties Start (Day {freeDays + 1})</span>
                    <span className="text-rose-700 dark:text-rose-300 font-extrabold">{calculatedLfdInfo.penaltyStartFormatted}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Shipment Info */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-mono-data text-orange-400 font-extrabold uppercase tracking-widest">
              3. Shipment & Stakeholder Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Importer Name <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={importer}
                  onChange={(e) => setImporter(e.target.value)}
                  placeholder="e.g. Agarwalla Teak Industries"
                  className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-[var(--dim)] outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Port of Discharge <span className="text-orange-400">*</span>
                </label>
                <select
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-2xl px-4 py-2.5 text-xs text-white font-semibold outline-none cursor-pointer"
                >
                  <option value="Kandla" className="bg-[#0f172a]">Kandla (Deendayal Port)</option>
                  <option value="Mundra" className="bg-[#0f172a]">Mundra Port</option>
                  <option value="Nhava Sheva" className="bg-[#0f172a]">Nhava Sheva (JNPT)</option>
                  <option value="Chennai" className="bg-[#0f172a]">Chennai Port</option>
                  <option value="Kolkata" className="bg-[#0f172a]">Kolkata / Haldia</option>
                  <option value="Vizag" className="bg-[#0f172a]">Visakhapatnam (Vizag)</option>
                  <option value="Tuticorin" className="bg-[#0f172a]">Tuticorin (V.O.C.)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Vessel Name
                </label>
                <input
                  type="text"
                  value={vessel}
                  onChange={(e) => setVessel(e.target.value)}
                  placeholder="e.g. MAERSK SALALAH"
                  className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-[var(--dim)] outline-none uppercase font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  BL Number
                </label>
                <input
                  type="text"
                  value={blNumber}
                  onChange={(e) => setBlNumber(e.target.value)}
                  placeholder="e.g. MSKU/KAN/2026/07/4567"
                  className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-[var(--dim)] outline-none font-mono-data uppercase font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1.5">
                CHA Customs Broker Agency
              </label>
              <input
                type="text"
                value={chaFirm}
                onChange={(e) => setChaFirm(e.target.value)}
                placeholder="e.g. Riddhi Siddhi CHA"
                className="w-full bg-[var(--panel)] border border-[var(--border)] focus:border-orange-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-[var(--dim)] outline-none font-medium"
              />
            </div>
          </div>

          {/* Section 4: Alert Recipients Management (FEATURE REQUEST) */}
          <div className="space-y-4 pt-2 border-t border-[var(--border)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-mono-data text-orange-400 font-extrabold uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  4. Alert Recipients ({recipientsList.length}/5)
                </h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5 font-medium">
                  Add phone numbers to receive automated WhatsApp alerts (Ops Manager, CHA, Importer).
                </p>
              </div>

              {recipientsList.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddRecipientRow}
                  className="bg-orange-500/15 border border-orange-500/30 hover:bg-orange-500 hover:text-white text-orange-400 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Recipient</span>
                </button>
              )}
            </div>

            {recipientError && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{recipientError}</span>
              </div>
            )}

            {/* Recipient Rows */}
            <div className="space-y-3">
              {recipientsList.map((rec, index) => (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    rec.isActive
                      ? 'bg-[var(--panel)] border-[var(--border)] shadow-sm'
                      : 'bg-[var(--panel)]/40 border-[var(--border)]/40 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Status Indicator & Row Label */}
                    <div className="flex items-center gap-2 sm:w-28 shrink-0">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          rec.isActive
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                            : 'bg-zinc-600'
                        }`}
                      />
                      <span className="text-xs font-bold text-white">
                        {rec.isOwner ? 'You (Owner)' : `Recipient #${index + 1}`}
                      </span>
                    </div>

                    {/* Phone Number Field */}
                    <div className="flex-1 min-w-[180px]">
                      <div className="flex items-center bg-[var(--card)] border border-[var(--border)] focus-within:border-orange-500 rounded-xl px-3 py-2">
                        <span className="text-xs font-mono-data text-orange-400 font-extrabold mr-2 select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={rec.phoneDigits}
                          onChange={(e) =>
                            handleUpdateRecipientRow(rec.id, 'phoneDigits', e.target.value)
                          }
                          placeholder="10-digit mobile"
                          className="bg-transparent text-xs text-white placeholder-[var(--muted)] outline-none w-full font-mono-data font-semibold tracking-wider"
                          required
                        />
                      </div>
                    </div>

                    {/* Recipient Name / Role Field */}
                    <div className="flex-1 min-w-[180px]">
                      <input
                        type="text"
                        value={rec.recipientName}
                        onChange={(e) =>
                          handleUpdateRecipientRow(rec.id, 'recipientName', e.target.value)
                        }
                        placeholder="e.g. Ramesh — Ops Manager"
                        className="w-full bg-[var(--card)] border border-[var(--border)] focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white placeholder-[var(--muted)] outline-none font-medium"
                      />
                    </div>

                    {/* Row Controls */}
                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      {/* Active Toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateRecipientRow(rec.id, 'isActive', !rec.isActive)
                        }
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          rec.isActive
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                        title={rec.isActive ? 'Alerts active (Click to mute)' : 'Alerts muted (Click to activate)'}
                      >
                        {rec.isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-400" />
                            <span className="text-[11px]">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-zinc-500" />
                            <span className="text-[11px]">Muted</span>
                          </>
                        )}
                      </button>

                      {/* Delete Button (disabled for owner row) */}
                      {!rec.isOwner ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipientRow(rec.id)}
                          className="p-1.5 text-[var(--dim)] hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete recipient row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span
                          className="text-[10px] text-[var(--dim)] font-mono-data px-1 select-none"
                          title="Primary owner cannot be removed"
                        >
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hint Box */}
            <div className="bg-[var(--panel)] p-3.5 rounded-2xl border border-[var(--border)] text-[11px] text-[var(--muted)] flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-400 shrink-0" />
              <span>
                All active recipients will simultaneously receive WhatsApp template notices at 72h, 48h, 24h, and daily overdue stages.
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold py-4 px-6 rounded-2xl text-sm transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Truck className="w-5 h-5" />
            <span>Add Container & Schedule WhatsApp Alerts</span>
          </button>
        </form>
      </div>
    </div>
  );
};
