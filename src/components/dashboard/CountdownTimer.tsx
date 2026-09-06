"use client";

import { useEffect, useState } from "react";
import { getRemainingFreeDays } from "@/lib/lfd-calculator";
import { Clock, AlertCircle } from "lucide-react";

interface CountdownTimerProps {
  lfd: string;
  isReturned: boolean;
}

export default function CountdownTimer({ lfd, isReturned }: CountdownTimerProps) {
  const [remainingDays, setRemainingDays] = useState<number>(0);

  useEffect(() => {
    setRemainingDays(getRemainingFreeDays(lfd));
  }, [lfd]);

  if (isReturned) {
    return (
      <div className="flex items-center text-xs text-neutral-500 font-medium">
        <span>Returned</span>
      </div>
    );
  }

  if (remainingDays < 0) {
    return (
      <div className="flex items-center space-x-1 text-xs text-red-400 font-semibold bg-red-950/20 border border-red-900/40 px-2 py-1 rounded-lg">
        <AlertCircle className="h-3 w-3" />
        <span>Overdue by {Math.abs(remainingDays)}d</span>
      </div>
    );
  }

  if (remainingDays === 0) {
    return (
      <div className="flex items-center space-x-1 text-xs text-red-500 font-bold bg-red-900/10 border border-red-500/30 px-2 py-1 rounded-lg animate-pulse">
        <Clock className="h-3 w-3 text-red-500" />
        <span>LFD Today!</span>
      </div>
    );
  }

  if (remainingDays === 1) {
    return (
      <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold bg-amber-900/10 border border-amber-500/30 px-2 py-1 rounded-lg">
        <Clock className="h-3 w-3" />
        <span>1 day left</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 text-xs text-neutral-300 font-medium">
      <Clock className="h-3 w-3 text-neutral-500" />
      <span>{remainingDays} days left</span>
    </div>
  );
}
