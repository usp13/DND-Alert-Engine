import React from 'react';
import { LayoutDashboard, PlusCircle, TrendingUp, BookOpen, MessageSquare, FileSpreadsheet } from 'lucide-react';

export type TabType = 'dashboard' | 'bulk-import' | 'whatsapp-bot' | 'add' | 'report' | 'rules' | 'whatsapp';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  urgentBadgeCount?: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  urgentBadgeCount = 7
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: urgentBadgeCount > 0 ? urgentBadgeCount : undefined
    },
    {
      id: 'bulk-import' as TabType,
      label: 'Bulk Import (PDF/DO)',
      icon: FileSpreadsheet,
      highlightBadge: 'PDF'
    },
    {
      id: 'whatsapp-bot' as TabType,
      label: 'WhatsApp Bot Dispatch',
      icon: MessageSquare,
      highlightBadge: 'Bot'
    },
    {
      id: 'add' as TabType,
      label: 'Add Container',
      icon: PlusCircle
    },
    {
      id: 'rules' as TabType,
      label: 'Line Rules',
      icon: BookOpen
    },
    {
      id: 'whatsapp' as TabType,
      label: 'WhatsApp Alerts',
      icon: MessageSquare
    },
    {
      id: 'report' as TabType,
      label: 'Savings Report',
      icon: TrendingUp
    },
  ];

  return (
    <nav className="bg-[#0a0e17]/80 backdrop-blur-md border-b border-[var(--border)] px-4 lg:px-8 py-2">
      <div className="max-w-[1240px] mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-[var(--card)]/60 hover:bg-[var(--card)] text-[var(--muted)] hover:text-white border border-[var(--border)]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.id === 'bulk-import' ? 'text-orange-400' : 'text-[var(--muted)]'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] font-mono-data px-2 py-0.5 rounded-full font-extrabold ${
                  isActive
                    ? 'bg-white text-orange-600'
                    : 'bg-orange-500/15 border border-orange-500/30 text-orange-400'
                }`}>
                  {tab.badge}
                </span>
              )}
              {tab.highlightBadge && (
                <span className={`text-[9px] font-mono-data px-1.5 py-0.2 rounded-full font-black uppercase ${
                  isActive
                    ? 'bg-white text-orange-600'
                    : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                }`}>
                  {tab.highlightBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
