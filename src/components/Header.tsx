import React, { useState, useEffect } from 'react';
import { Ship, Bell, ChevronDown, Building2, LogOut, UserCheck } from 'lucide-react';
import { UserSession } from './auth/AuthFlow';

interface HeaderProps {
  urgentCount: number;
  currentCompany: string;
  onCompanyChange: (company: string) => void;
  onOpenAlertsModal?: () => void;
  currentUser?: UserSession | null;
  onLogout?: () => void;
}

export const demoCompanies = [
  "Riddhi Siddhi Freight Forwarders",
  "Kutch Logistics & Clearing Pvt Ltd",
  "Apex Maritime India Agency"
];

export const Header: React.FC<HeaderProps> = ({
  urgentCount,
  currentCompany,
  onCompanyChange,
  onOpenAlertsModal,
  currentUser,
  onLogout,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
      setDateStr(
        now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#070b12]/90 backdrop-blur-xl border-b border-[var(--border)] px-4 lg:px-8 py-3">
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--orange)]/20 to-[var(--orange)]/5 border border-[var(--orange)]/30 flex items-center justify-center text-[var(--orange)] shadow-lg shadow-orange-500/10 shrink-0">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-white text-[1.15rem] tracking-tight block leading-none">
                  MAPS D&D Alert Engine
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-[10px] font-bold font-mono-data text-orange-400">
                  BENTO v1.0
                </span>
              </div>
              <span className="text-[10px] text-[var(--muted)] font-mono-data tracking-wider uppercase block mt-1">
                Container Detention & Demurrage Tracking
              </span>
            </div>
          </div>

          {/* Mobile Bell and Company Quick view */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAlertsModal}
              className="relative p-2.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--text)] hover:text-white"
              title="View Urgent Alerts"
            >
              <Bell className="w-4 h-4 text-[var(--orange)]" />
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--orange)] text-white text-[10px] font-bold font-mono-data w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#070b12] shadow-sm">
                  {urgentCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Center: Logged-in Company Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] hover:border-[var(--border-hover)] px-4 py-2 rounded-2xl text-xs font-medium text-white transition-all shadow-sm"
          >
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-[var(--orange)]" />
            </div>
            <span className="truncate max-w-[200px] sm:max-w-[280px] text-[var(--text)] font-semibold">
              {currentCompany}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden backdrop-blur-xl">
              <div className="px-3.5 py-2 text-[10px] font-mono-data text-[var(--dim)] uppercase tracking-wider border-b border-[var(--border)] font-bold">
                Switch Organization Workspace
              </div>
              {demoCompanies.map((comp) => (
                <button
                  key={comp}
                  onClick={() => {
                    onCompanyChange(comp);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center justify-between ${
                    comp === currentCompany
                      ? 'bg-[var(--orange)]/15 text-[var(--orange)] font-semibold'
                      : 'text-[var(--text)] hover:bg-[var(--panel)]'
                  }`}
                >
                  <span className="truncate">{comp}</span>
                  {comp === currentCompany && (
                    <span className="w-2 h-2 rounded-full bg-[var(--orange)] shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live Clock & Notification Bell & Brand Badge */}
        <div className="hidden md:flex items-center gap-3">
          {/* Live Clock */}
          <div className="bg-[var(--card)] border border-[var(--border)] px-3.5 py-1.5 rounded-2xl text-right hidden lg:block">
            <div className="text-[11px] font-mono-data text-white font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              {timeStr || '10:11:49 AM'}
            </div>
            <div className="text-[10px] text-[var(--muted)] font-mono-data">
              {dateStr || '04 Aug 2026'} (IST)
            </div>
          </div>

          {/* MAPS Tech & AI Badge */}
          <div className="flex items-center gap-2 bg-[var(--panel)] border border-[var(--border)] px-3 py-2 rounded-2xl">
            <span className="w-2 h-2 rounded-full bg-[var(--orange)] animate-ping"></span>
            <span className="text-[11px] font-mono-data font-bold text-white">
              MAPS Tech & AI
            </span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={onOpenAlertsModal}
            className="relative p-2.5 rounded-2xl bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-[var(--text)] hover:text-white transition-all cursor-pointer group shadow-sm"
            title="Urgent Alerts Watchlist"
          >
            <Bell className="w-4.5 h-4.5 text-[var(--orange)] group-hover:scale-110 transition-transform" />
            {urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--orange)] text-white text-[10px] font-extrabold font-mono-data w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#070b12] shadow-md">
                {urgentCount}
              </span>
            )}
          </button>

          {/* User Profile / Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-3 py-2 rounded-2xl text-xs font-mono-data font-bold transition-all cursor-pointer shadow-sm"
              title="Log out of session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Logout</span>
            </button>
          )}
        </div>

        {/* Mobile Quick Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="md:hidden flex items-center gap-1 text-[11px] text-rose-400 font-mono-data px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-xl"
          >
            <LogOut className="w-3 h-3" />
            <span>Exit</span>
          </button>
        )}
      </div>
    </header>
  );
};
