"use client";

import { useState } from "react";
import { Bell, AlertTriangle, ShieldCheck, Info } from "lucide-react";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "LFD Warning",
      message: "Container MSKU8976543 Last Free Day is today!",
      type: "red",
      time: "10m ago",
    },
    {
      id: 2,
      title: "PDF Import Success",
      message: "Extracted 2 containers from MSC_DO_9901.pdf",
      type: "green",
      time: "1h ago",
    },
    {
      id: 3,
      title: "WhatsApp Dispatch Alert",
      message: "Overdue alert sent to driver for MSKU2345678",
      type: "yellow",
      time: "3h ago",
    },
  ]);

  const unreadCount = notifications.length;

  const clearNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-800 bg-neutral-950 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-3">
            <h4 className="text-sm font-semibold text-white">Notifications</h4>
            {unreadCount > 0 && (
              <span className="text-xs bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-500">
              No new notifications
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start space-x-3 p-2 rounded-lg bg-neutral-900/50 border border-neutral-900 relative group"
                >
                  <div className="mt-0.5">
                    {n.type === "red" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {n.type === "green" && <ShieldCheck className="h-4 w-4 text-green-500" />}
                    {n.type === "yellow" && <Info className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                    <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">{n.message}</p>
                    <span className="text-[9px] text-neutral-500 mt-1 block">{n.time}</span>
                  </div>
                  <button
                    onClick={() => clearNotification(n.id)}
                    className="absolute top-2 right-2 text-neutral-600 hover:text-neutral-300 opacity-0 group-hover:opacity-100 text-[10px] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
