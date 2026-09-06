"use client";

import { AutoImportTab } from "@/components/AutoImportTab";
import { QuickImportModal } from "@/components/QuickImportModal";
import { useState } from "react";
import { ChevronLeft, MessageSquare, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ContainerItem } from "@/types";

export default function WhatsAppBotPage() {
  const router = useRouter();
  const [quickImportOpen, setQuickImportOpen] = useState(false);
  const [quickDocId, setQuickDocId] = useState("doc-1");

  const handleAddBulk = async (containers: ContainerItem[]) => {
    try {
      const res = await fetch("/api/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          containers: containers.map((c) => ({
            container_number: c.containerNo,
            shipping_line: c.line,
            shipping_line_code: (c.containerNo || "GEN").substring(0, 4),
            container_type: c.type || "40ft",
            port: c.port || "Kandla",
            vessel_name: c.vessel || "Cargo Vessel",
            importer_name: c.importer || "Direct Importer",
            importer_phone: c.opsPhone || "+919876543210",
            discharge_date: c.dischargeDate,
            demurrage_free_days: 14,
            bl_number: c.blNumber,
          })),
        }),
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Bulk save error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-xs text-[var(--muted)] hover:text-white transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-heading">
              WhatsApp Business Bot (+91 8160024858)
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] font-medium">
            Forward your Delivery Order or Discharge List PDFs on WhatsApp for automatic zero-click ingestion and automated LFD alerts.
          </p>
        </div>

        <Link
          href="/containers/bulk"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#161b22] hover:bg-[#1f2633] text-orange-400 border border-orange-500/30 text-xs font-bold transition-all shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Switch to Web PDF Upload</span>
        </Link>
      </div>

      {/* AUTO IMPORT / WHATSAPP BOT COMPONENT */}
      <AutoImportTab
        onAddBulkContainers={handleAddBulk}
        onOpenQuickModal={(docId) => {
          if (docId) setQuickDocId(docId);
          setQuickImportOpen(true);
        }}
      />

      {/* QUICK IMPORT MODAL */}
      <QuickImportModal
        isOpen={quickImportOpen}
        defaultDocId={quickDocId}
        onClose={() => setQuickImportOpen(false)}
        onImportContainers={(imported) => {
          handleAddBulk(imported);
        }}
      />
    </div>
  );
}
