"use client";

import React, { useState, useEffect } from "react";
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Zap, 
  Layers, 
  Save, 
  AlertCircle,
  Shield,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [containerCount, setContainerCount] = useState(0);

  // Form editable states
  const [firmName, setFirmName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [mobile, setMobile] = useState("");
  const [gstin, setGstin] = useState("");
  const [city, setCity] = useState("Gandhidham");
  const [opsPhone, setOpsPhone] = useState("");

  // Profile save states
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileToast, setProfileToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dnd_user_session");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setCurrentUser(u);
          setFirmName(u.firmName || "My Freight Agency");
          setContactPerson(u.contactPerson || "Operations Lead");
          setMobile(u.mobile || "");
          setGstin(u.gstin || "24AAXYZ1234A1Z5");
          setCity(u.city || "Gandhidham");
          setOpsPhone(u.opsPhone || "");

          // Fetch live container count for quota
          fetch(`/api/containers?firm_name=${encodeURIComponent(u.firmName || "")}&phone=${encodeURIComponent(u.mobile || "")}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.success && Array.isArray(d.containers)) {
                setContainerCount(d.containers.length);
              }
            })
            .catch(() => {});
        } catch (_) {}
      }
      setLoading(false);
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileToast(null);

    const cleanGstin = gstin.trim().toUpperCase();
    if (cleanGstin.length !== 15) {
      setProfileToast({ type: "error", msg: "GSTIN must be exactly 15 characters." });
      setSavingProfile(false);
      return;
    }

    const updatedUser = {
      ...currentUser,
      firmName: firmName.trim(),
      contactPerson: contactPerson.trim(),
      mobile: mobile.replace(/[^0-9]/g, ""),
      gstin: cleanGstin,
      city: city,
      opsPhone: opsPhone.trim(),
    };

    try {
      // 1. Update in Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: {
          firmName: updatedUser.firmName,
          contactPerson: updatedUser.contactPerson,
          mobile: updatedUser.mobile,
          gstin: updatedUser.gstin,
          city: updatedUser.city,
          opsPhone: updatedUser.opsPhone,
        },
      });

      // 2. Update profiles table
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          await supabase.from("profiles").upsert({
            id: authData.user.id,
            email: updatedUser.email,
            firm_name: updatedUser.firmName,
            contact_person: updatedUser.contactPerson,
            mobile: updatedUser.mobile,
            gstin: updatedUser.gstin,
            city: updatedUser.city,
            ops_phone: updatedUser.opsPhone,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (_) {}

      // 3. Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("dnd_user_session", JSON.stringify(updatedUser));
      }

      setCurrentUser(updatedUser);
      setProfileToast({ type: "success", msg: "Account and Firm profile updated successfully!" });
      setTimeout(() => setProfileToast(null), 4000);
    } catch (err: any) {
      setProfileToast({ type: "error", msg: err.message || "Failed saving changes." });
    } finally {
      setSavingProfile(false);
    }
  };

  const quotaLimit = 50;
  const quotaPercent = Math.min(100, Math.round((containerCount / quotaLimit) * 100));

  if (loading) {
    return (
      <div className="bg-[#0c1420] border border-[var(--border)] rounded-3xl p-16 text-center text-xs text-[var(--muted)] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
        <span className="font-mono-data font-bold">Loading Account Credentials...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono-data text-[10px] font-extrabold uppercase">
              Workspace Profile
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono-data font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Tenant
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-heading">
            Account & Firm Settings
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5 font-medium">
            Manage your registered firm coordinates, GSTIN, primary contacts, quota, and security credentials.
          </p>
        </div>

        {/* FIRM BADGE */}
        <div className="px-4 py-2.5 rounded-2xl bg-[#0f172a] border border-[var(--border)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xs">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block truncate max-w-[180px]">
              {firmName}
            </span>
            <span className="text-[10px] text-orange-400 font-mono-data font-semibold">
              {city} Port Hub
            </span>
          </div>
        </div>
      </div>

      {/* TOAST ALERTS */}
      {profileToast && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs font-bold shadow-lg animate-fade-in ${
            profileToast.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
              : "bg-red-500/15 border border-red-500/40 text-red-300"
          }`}
        >
          {profileToast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{profileToast.msg}</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: PROFILE FORM (2 COLUMNS SPAN) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0b121e] border border-[var(--border)] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white font-heading">
                    Registered Firm & Contact Information
                  </h3>
                  <p className="text-[11px] text-[var(--muted)]">
                    Official business coordinates used for shipping line alerts and invoice headers.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* FIRM NAME */}
              <div className="space-y-1.5">
                <label className="font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold block">
                  Firm / Company Name <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-3 text-[var(--muted)]" />
                  <input
                    type="text"
                    required
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="e.g. Fresh Cargo Logistics Ltd"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121c2c] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors"
                  />
                </div>
              </div>

              {/* CONTACT PERSON & EMAIL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold block">
                    Contact Person <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-[var(--muted)]" />
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Rohit Sharma"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#121c2c] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold block">
                    Account Email (Verified)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[var(--muted)]" />
                    <input
                      type="email"
                      disabled
                      value={currentUser?.email || "user@firm.com"}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0a101a] border border-[var(--border)]/60 rounded-2xl text-zinc-400 text-xs font-mono-data cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* MOBILE & GSTIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold block">
                    Mobile Number <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-[var(--border)] bg-[#0d1420] text-orange-400 font-mono-data font-bold text-xs">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full px-3 py-2.5 bg-[#121c2c] border border-[var(--border)] focus:border-orange-500 rounded-r-2xl text-white text-xs font-mono font-semibold outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold block">
                    GSTIN (15 Digits) <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="24AAECR5678P1Z3"
                      className="w-full px-3.5 py-2.5 bg-[#121c2c] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-white text-xs font-mono font-bold uppercase outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* PORT HUB & OPS PHONE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold block">
                    Primary Port Hub <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#121c2c] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-white text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="Gandhidham">Gandhidham (Deendayal Port / Kandla)</option>
                      <option value="Mundra">Mundra Port Hub</option>
                      <option value="Bhuj">Bhuj Logistics Zone</option>
                      <option value="Ahmedabad">Ahmedabad ICD Hub</option>
                      <option value="Mumbai">Mumbai / JNPT</option>
                      <option value="Other">Other Indian Port</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold block">
                    Ops Emergency Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[var(--muted)]" />
                    <input
                      type="tel"
                      value={opsPhone}
                      onChange={(e) => setOpsPhone(e.target.value)}
                      placeholder="For secondary dispatch alerts"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#121c2c] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: QUOTA & TENANT SECURITY (1 COLUMN SPAN) */}
        <div className="space-y-6">
          {/* SUBSCRIPTION & QUOTA CARD */}
          <div className="bg-[#0b121e] border border-[var(--border)] rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-mono-data uppercase text-white font-extrabold tracking-wider">
                  Subscription Tier
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono-data text-[10px] font-bold">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-white font-heading">
                  Trial Plan (50 Boxes)
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted)] font-medium leading-relaxed">
                Free multi-recipient WhatsApp alerts and live demurrage tracking for up to 50 active container shipments.
              </p>

              {/* USAGE PROGRESS BAR */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] font-mono-data">
                  <span className="text-[var(--muted)] font-bold">Active Boxes Ingested:</span>
                  <span className="font-extrabold text-orange-400">
                    {containerCount} / {quotaLimit}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#162030] overflow-hidden border border-[var(--border)]">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-[var(--dim)] font-mono-data block text-right">
                  {quotaLimit - containerCount} containers remaining
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                className="w-full py-2.5 px-3 bg-gradient-to-r from-orange-500/15 to-amber-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 text-orange-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span>Upgrade to Pro Firm (250 Boxes) →</span>
              </button>
            </div>
          </div>

          {/* TENANT SECURITY STATUS */}
          <div className="bg-[#0b121e] border border-[var(--border)] rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-mono-data uppercase text-white font-extrabold tracking-wider flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Tenant Data Isolation
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Postgres Row Level Security (RLS)</span>
                  <span className="text-[11px] text-[var(--muted)]">All containers and reports are isolated strictly to your firm.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Encrypted Supabase Auth</span>
                  <span className="text-[11px] text-[var(--muted)]">Verified via Resend SMTP OTP token exchange.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Auto WhatsApp Trigger Engine</span>
                  <span className="text-[11px] text-[var(--muted)]">08:00 AM IST daily countdown scans active.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
