"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { RefreshCw } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("dnd_user_session");
      if (!session) {
        router.push("/login");
        return;
      }
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#060a10] flex items-center justify-center text-orange-400 font-mono-data text-xs gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Authenticating workspace session...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#060a10] text-[#dfe6f0]">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar />

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* HEADER TOPBAR */}
        <TopBar />

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1240px] mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
