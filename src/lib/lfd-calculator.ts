import { addDays, parseISO, format, isValid } from "date-fns";

/**
 * Calculates the Last Free Day (LFD) for a container.
 * Typically, the discharge date counts as Day 1 of free time.
 * So LFD = Discharge Date + (Free Days - 1) days.
 */
export function calculateLFD(dischargeDateStr: string, freeDays: number): string {
  if (!dischargeDateStr) return "";
  
  const dischargeDate = parseISO(dischargeDateStr);
  if (!isValid(dischargeDate)) return "";

  // The discharge day is Day 1. So we add (freeDays - 1)
  const lfdDate = addDays(dischargeDate, Math.max(0, freeDays - 1));
  return format(lfdDate, "yyyy-MM-dd");
}

/**
 * Calculates how many free days remain relative to a target date (defaults to today).
 * Returns a negative value if the LFD has passed.
 */
export function getRemainingFreeDays(lfdStr: string, targetDate: Date = new Date()): number {
  if (!lfdStr) return 0;
  const lfd = parseISO(lfdStr);
  if (!isValid(lfd)) return 0;

  // Reset time portions for pure day comparisons
  const lfdMidnight = new Date(lfd.getFullYear(), lfd.getMonth(), lfd.getDate());
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  const diffTime = lfdMidnight.getTime() - targetMidnight.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
