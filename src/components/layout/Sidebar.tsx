"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Container, 
  Upload, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  LogOut,
  BookOpen,
  Calculator,
  MessageSquare,
  Building
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dnd_user_session");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (_) {}
      }
    }
  }, []);

  const navigation = [
    { name: "Live Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Savings Reports", href: "/reports", icon: BarChart3 },
    { name: "Add Container", href: "/containers/add", icon: Container },
    { name: "Bulk Import (PDF/DO)", href: "/containers/bulk", icon: Upload },
    { name: "WhatsApp Bot Dispatch", href: "/containers/whatsapp", icon: MessageSquare },
    { name: "Tariff Database", href: "/tariffs", icon: BookOpen },
    { name: "D&D Cost Calculator", href: "/calculator", icon: Calculator },
    { name: "WhatsApp Alert Engine", href: "/rules", icon: ShieldCheck },
    { name: "Account Settings", href: "/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}

    if (typeof window !== "undefined") {
      localStorage.removeItem("dnd_user_session");
      document.cookie = "dnd_user_email=; path=/; max-age=0";
      sessionStorage.clear();
    }
    router.push("/login");
  };

  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[#070b12] flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30">
      <div className="flex flex-col flex-1 py-6 px-4">
        {/* LOGO */}
        <Link href="/dashboard" className="flex items-center space-x-3 px-2 mb-8 group cursor-pointer">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#121c2c] to-[#0c1420] border border-[var(--border)] flex items-center justify-center p-1.5 shadow-lg shadow-orange-500/5 group-hover:border-orange-500/40 transition-all shrink-0">
            <img
              src="/dnd-logo-nobg.png"
              alt="D&D Engine Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <span className="text-base font-black text-white block leading-tight font-heading tracking-tight group-hover:text-orange-400 transition-colors">
              D&D Engine
            </span>
            <span className="text-[10px] text-orange-400 font-mono-data font-bold">
              {currentUser?.city ? `${currentUser.city} Port Hub` : "Kandla & Mundra Port"}
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="space-y-1.5 flex-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-md shadow-orange-500/5"
                    : "text-[var(--muted)] hover:text-white hover:bg-[var(--card)] border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 transition-colors duration-200 ${
                  isActive ? "text-orange-400" : "text-[var(--dim)] group-hover:text-white"
                }`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="bg-[#0f172a]/60 border border-[var(--border)] rounded-2xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold text-white truncate block">
              {currentUser?.firmName ? currentUser.firmName : "Active Workspace"}
            </span>
          </div>
          <p className="text-[10px] text-[var(--muted)] font-medium">Auto WhatsApp alerts active</p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[var(--muted)] hover:text-red-400 hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-[var(--dim)] hover:text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
