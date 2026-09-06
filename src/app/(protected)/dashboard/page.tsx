"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ContainerItem } from "@/types";
import { DashboardTab } from "@/components/DashboardTab";
import { AlertModal } from "@/components/AlertModal";
import { calculateContainerStatus } from "@/utils/dndCalculations";
import { Activity, RefreshCw, Plus, Upload, Container } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedAlertContainer, setSelectedAlertContainer] = useState<ContainerItem | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchContainers = async () => {
    try {
      let sessionUser: any = null;
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("dnd_user_session");
        if (!stored) {
          window.location.href = "/login";
          return;
        }
        sessionUser = JSON.parse(stored);
        setCurrentUser(sessionUser);
      }

      const userEmail = sessionUser?.email || "";
      const firmName = sessionUser?.firmName || "";
      const ownerPhone = sessionUser?.mobile || "";

      const queryParams = new URLSearchParams({
        ...(userEmail ? { user_email: userEmail } : {}),
        ...(firmName ? { firm_name: firmName } : {}),
        ...(ownerPhone ? { phone: ownerPhone } : {}),
      });

      const res = await fetch(`/api/containers?${queryParams.toString()}`);
      const data = await res.json();

      let supabaseContainers: ContainerItem[] = [];
      if (res.ok && data.success && Array.isArray(data.containers)) {
        supabaseContainers = data.containers.map((c: any) => ({
          id: c.id,
          containerNo: c.container_number,
          line: c.shipping_line || "Maersk",
          type: (c.container_type || "40ft") as any,
          port: c.port || sessionUser?.city || "Kandla",
          dischargeDate: c.discharge_date || new Date().toISOString().split("T")[0],
          importer: c.importer_name || "Importer",
          vessel: c.vessel_name || "Vessel",
          blNumber: c.bl_number || `BL-${c.id?.slice(0, 6)}`,
          chaFirm: firmName || "My Freight CHA",
          opsPhone: c.importer_phone || sessionUser?.opsPhone || "+91 98765 43210",
          ownerPhone: ownerPhone || "+91 8160024858",
          customsCleared: c.status === "cleared",
          truckArranged: false,
          warehouseReady: false,
        }));
      }

      // Check local isolated containers for this specific user
      let localUserContainers: ContainerItem[] = [];
      if (typeof window !== "undefined" && userEmail) {
        try {
          const raw = localStorage.getItem(`dnd_containers_${userEmail}`);
          if (raw) localUserContainers = JSON.parse(raw);
        } catch (_) {}
      }

      // Combine and deduplicate
      const combined = [...localUserContainers, ...supabaseContainers];
      const seen = new Set<string>();
      const unique = combined.filter((c) => {
        if (seen.has(c.containerNo)) return false;
        seen.add(c.containerNo);
        return true;
      });

      setContainers(unique);
    } catch (err) {
      console.error("Failed fetching Supabase containers:", err);
      setContainers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetch("/api/alerts/check").catch(() => {});
    await fetchContainers();
    setRefreshing(false);
  };

  const handleOpenAlert = (container: ContainerItem) => {
    setSelectedAlertContainer(container);
    setAlertModalOpen(true);
  };

  const urgentContainers = useMemo(() => {
    return containers.filter((c) => {
      const calc = calculateContainerStatus(c);
      return calc.status === "warning" || calc.status === "critical";
    });
  }, [containers]);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-heading flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-orange-400" />
            Operations Dashboard
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1 font-medium">
            Live demurrage monitoring, last free day countdowns, and automated WhatsApp alert triggers directly from your database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-white hover:border-[var(--border-hover)] text-xs font-bold cursor-pointer transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-orange-400" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Sync Status"}</span>
          </button>

          <Link
            href="/containers/bulk"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-xs font-bold transition-all"
          >
            <Upload className="h-3.5 w-3.5 text-orange-400" />
            <span>Auto-Import</span>
          </Link>

          <Link
            href="/containers/add"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Container</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-16 text-center text-xs text-[var(--muted)] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
          <span className="font-mono-data font-bold">Querying live containers from Supabase...</span>
        </div>
      ) : containers.length === 0 ? (
        <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
            <Container className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-white font-heading">
              No Containers in Database Yet
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">
              Your Supabase <code className="text-orange-400 font-mono-data">public.containers</code> table is currently empty. Insert your containers via Postman, Excel/PDF Auto-Import, or Manual Registration to view live countdowns and demurrage calculations!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/containers/add"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-orange-500/20"
            >
              + Add First Container
            </Link>
            <Link
              href="/containers/bulk"
              className="px-4 py-2 bg-[var(--panel)] border border-[var(--border)] text-white text-xs font-bold rounded-2xl hover:border-orange-500/40"
            >
              Auto-Import DO (PDF)
            </Link>
          </div>
        </div>
      ) : (
        <DashboardTab
          containers={containers}
          onSendAlert={handleOpenAlert}
        />
      )}

      {/* ALERT DISPATCH MODAL */}
      {alertModalOpen && (
        <AlertModal
          container={selectedAlertContainer}
          urgentContainers={urgentContainers}
          onClose={() => setAlertModalOpen(false)}
          onSelectContainer={(c) => setSelectedAlertContainer(c)}
        />
      )}
    </div>
  );
}
