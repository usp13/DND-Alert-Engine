"use client";

import { SavingsReportTab } from "@/components/SavingsReportTab";
import { TrendingUp, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
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
          <TrendingUp className="h-6 w-6 text-orange-400" />
          D&D Savings & Financial ROI Reports
        </h1>
        <p className="text-xs text-[var(--muted)] font-medium">
          Detailed breakdown of avoided demurrage penalties, carrier cost split, and WhatsApp reminder performance.
        </p>
      </div>

      {/* SAVINGS REPORT TAB */}
      <SavingsReportTab />
    </div>
  );
}
