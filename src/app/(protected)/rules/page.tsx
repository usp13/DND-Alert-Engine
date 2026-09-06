"use client";

import { WhatsAppPreviewTab } from "@/components/WhatsAppPreviewTab";
import { MessageSquare, ChevronLeft, BellRing, Settings, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AlertRulesPage() {
  const [cronTime, setCronTime] = useState("09:00 AM");
  const [notifyOwner, setNotifyOwner] = useState(true);
  const [notifyOps, setNotifyOps] = useState(true);
  const [notifyImporter, setNotifyImporter] = useState(true);
  const [autoSendOverdue, setAutoSendOverdue] = useState(true);
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSaveConfig = () => {
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="space-y-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs text-[var(--muted)] hover:text-white transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-white font-heading flex items-center gap-2.5">
          <MessageSquare className="h-6 w-6 text-emerald-400" />
          WhatsApp Alert Engine & Notification Rules
        </h1>
        <p className="text-xs text-[var(--muted)] font-medium">
          Configure automated multi-recipient escalation schedules, trigger timings, and preview live WhatsApp message templates.
        </p>
      </div>

      {/* AUTOMATION TRIGGER CONFIGURATION CARD */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="text-base font-extrabold font-heading text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Automated Dispatch Schedule & Escalation Rules
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Rules governing when and to whom WhatsApp notices are automatically transmitted.
            </p>
          </div>
          {savedSettings && (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-mono-data font-bold">
              ✓ Alert Settings Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Setting 1 */}
          <div className="bg-[var(--panel)] p-4 rounded-2xl border border-[var(--border)] space-y-2">
            <span className="text-[10px] font-mono-data text-[var(--muted)] font-bold uppercase block">
              Daily CRON Dispatch Time
            </span>
            <select
              value={cronTime}
              onChange={(e) => setCronTime(e.target.value)}
              className="w-full bg-[#0d131f] border border-[var(--border)] rounded-xl px-3 py-2 text-white font-mono-data font-bold outline-none cursor-pointer"
            >
              <option value="08:00 AM">08:00 AM IST</option>
              <option value="09:00 AM">09:00 AM IST (Recommended)</option>
              <option value="10:00 AM">10:00 AM IST</option>
              <option value="11:00 AM">11:00 AM IST</option>
            </select>
          </div>

          {/* Setting 2 */}
          <div className="bg-[var(--panel)] p-4 rounded-2xl border border-[var(--border)] space-y-2">
            <span className="text-[10px] font-mono-data text-[var(--muted)] font-bold uppercase block">
              72h & 48h Reminders
            </span>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={notifyOps}
                onChange={(e) => setNotifyOps(e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
              />
              <span className="text-white font-semibold text-xs">Dispatch to Ops Desk</span>
            </label>
          </div>

          {/* Setting 3 */}
          <div className="bg-[var(--panel)] p-4 rounded-2xl border border-[var(--border)] space-y-2">
            <span className="text-[10px] font-mono-data text-[var(--muted)] font-bold uppercase block">
              24h Critical Escalation
            </span>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={notifyOwner}
                onChange={(e) => setNotifyOwner(e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
              />
              <span className="text-white font-semibold text-xs">Escalate to CHA Owner</span>
            </label>
          </div>

          {/* Setting 4 */}
          <div className="bg-[var(--panel)] p-4 rounded-2xl border border-[var(--border)] space-y-2">
            <span className="text-[10px] font-mono-data text-[var(--muted)] font-bold uppercase block">
              Overdue Daily Notice
            </span>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={autoSendOverdue}
                onChange={(e) => setAutoSendOverdue(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
              <span className="text-white font-semibold text-xs">Daily Running Bill Alert</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSaveConfig}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-orange-500/20 cursor-pointer transition-all"
          >
            Save Notification Rules
          </button>
        </div>
      </div>

      {/* WHATSAPP MESSAGE PREVIEWS */}
      <WhatsAppPreviewTab />
    </div>
  );
}
