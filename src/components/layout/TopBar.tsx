"use client";

import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";
import { 
  Building, 
  Upload, 
  LogOut, 
  Plus, 
  Sun, 
  Moon,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TopBar() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dnd_user_session");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          console.error("Failed parsing user session:", e);
        }
      }

      // Initialize theme from storage or preference
      const savedTheme = localStorage.getItem("dnd_theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } else {
        applyTheme("dark");
      }
    }
  }, []);

  const applyTheme = (t: "dark" | "light") => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (t === "light") {
        root.classList.remove("dark");
        root.classList.add("light");
        root.setAttribute("data-theme", "light");
      } else {
        root.classList.remove("light");
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("dnd_theme", nextTheme);
    }
  };

  const firmName = currentUser?.firmName || "My Freight Workspace";
  const contactPerson = currentUser?.contactPerson || "Logistics Lead";
  const userCity = currentUser?.city || "Gandhidham";

  const getInitials = (name: string) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

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
    <header className="h-16 border-b border-[#1b2537]/80 bg-[#070b12]/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl shadow-lg shadow-black/20 transition-colors">
      {/* LEFT: FIRM & TENANT IDENTITY */}
      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-2xl border border-orange-500/20 bg-[var(--card)] shadow-md shadow-orange-500/5 group hover:border-orange-500/40 transition-all">
          <div className="w-7 h-7 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Building className="h-3.5 w-3.5" />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-white text-xs sm:text-sm tracking-tight truncate max-w-[170px] sm:max-w-[240px]">
                {firmName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Database Connected" />
            </div>
            <span className="text-[10px] text-[var(--muted)] font-mono-data font-semibold flex items-center gap-1">
              Port Hub: <strong className="text-orange-400 font-bold">{userCity}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: ACTIONS, THEME TOGGLE & PROFILE */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* AUTO IMPORT BUTTON */}
        <Link
          href="/containers/bulk"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-500/15 to-amber-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-orange-500/30 hover:border-orange-500/60 text-orange-400 hover:text-orange-300 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden sm:inline">Auto-Import DO (PDF)</span>
          <span className="sm:hidden">Import</span>
        </Link>

        {/* QUICK ADD BUTTON */}
        <Link
          href="/containers/add"
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Box</span>
        </Link>

        {/* NOTIFICATION BELL */}
        <div className="border-l border-[var(--border)] pl-1.5 sm:pl-2">
          <NotificationBell />
        </div>

        {/* THEME SWITCHER BUTTON (LEFT OF ACCOUNT PROFILE) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 border border-[var(--border)] hover:border-amber-500/30 rounded-2xl transition-all cursor-pointer shadow-sm group"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* PROFILE BADGE */}
        <div className="flex items-center space-x-2.5 border-l border-[var(--border)] pl-2 sm:pl-3">
          <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-extrabold text-xs font-mono-data shadow-inner">
            {getInitials(contactPerson)}
          </div>
          
          <div className="hidden lg:block leading-none text-left">
            <span className="text-xs font-extrabold text-white block truncate max-w-[140px]">
              {contactPerson}
            </span>
            <span className="text-[10px] text-[var(--muted)] font-mono-data truncate max-w-[140px] block mt-0.5">
              {currentUser?.email || "Customs Partner"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 rounded-xl transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
