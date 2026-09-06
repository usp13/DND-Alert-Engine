"use client";

import { AddContainerTab } from "@/components/AddContainerTab";
import { QuickImportModal } from "@/components/QuickImportModal";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddContainerPage() {
  const router = useRouter();
  const [quickImportOpen, setQuickImportOpen] = useState(false);

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
        <h1 className="text-2xl font-extrabold tracking-tight text-white font-heading">
          Manual Add Container
        </h1>
        <p className="text-xs text-[var(--muted)] font-medium">
          Register outstanding shipments manually to begin tracking free periods and multi-recipient WhatsApp alert schedules.
        </p>
      </div>

      {/* ADD CONTAINER FORM & RULES PREVIEW */}
      <AddContainerTab
        onAddContainer={() => {
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }}
        onOpenQuickImport={() => setQuickImportOpen(true)}
      />

      {/* QUICK IMPORT MODAL */}
      <QuickImportModal
        isOpen={quickImportOpen}
        onClose={() => setQuickImportOpen(false)}
        onImportContainers={() => {
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
