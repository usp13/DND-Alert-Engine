import { ContainerItem, ContainerType, ShippingLineRule, StatusCategory } from '../types';
import { shippingLineRules } from '../data/shippingLines';

export function getShippingLineRule(lineName: string): ShippingLineRule {
  const found = shippingLineRules.find(
    (r) => r.name.toLowerCase() === lineName.toLowerCase()
  );
  if (found) return found;
  // Default fallback if unknown
  return shippingLineRules[0];
}

/**
 * Calculates Last Free Day (LFD) based on discharge date and shipping line rules.
 */
export function calculateLFD(dischargeDateStr: string, lineName: string): Date {
  const lineRule = getShippingLineRule(lineName);
  const discharge = new Date(dischargeDateStr);
  const lfd = new Date(discharge);
  lfd.setDate(lfd.getDate() + lineRule.demurrageFree);
  return lfd;
}

/**
 * Formats a Date object to DD MMM format, e.g. "08 Aug"
 */
export function formatDateDDMMM(date: Date): string {
  if (isNaN(date.getTime())) return '-';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  return `${day} ${month}`;
}

/**
 * Formats ISO string YYYY-MM-DD to DD MMM YYYY
 */
export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export interface CalculationResult {
  lfd: Date;
  daysLeft: number; // Positive = days remaining, 0 = expires today, negative = days overdue
  hoursLeft: number;
  status: StatusCategory;
  isExpiresToday: boolean;
  overdueDays: number;
  dailyRate: number;
  accumulatedCost: number;
  formattedLFD: string;
}

export function calculateContainerStatus(
  container: ContainerItem,
  referenceDate: Date = new Date()
): CalculationResult {
  const rule = getShippingLineRule(container.line);
  const discharge = new Date(container.dischargeDate);
  discharge.setHours(0, 0, 0, 0);

  const lfd = calculateLFD(container.dischargeDate, container.line);
  lfd.setHours(23, 59, 59, 999);

  const now = new Date(referenceDate);

  // Time diff in milliseconds
  const diffTime = lfd.getTime() - now.getTime();
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  
  // Day diff starting midnight to midnight
  const refMidnight = new Date(referenceDate);
  refMidnight.setHours(0, 0, 0, 0);

  const lfdMidnight = new Date(lfd);
  lfdMidnight.setHours(0, 0, 0, 0);

  const diffDays = Math.round((lfdMidnight.getTime() - refMidnight.getTime()) / (1000 * 60 * 60 * 24));

  let status: StatusCategory = 'safe';
  let isExpiresToday = false;
  let overdueDays = 0;

  if (diffDays < 0) {
    status = 'critical';
    overdueDays = Math.abs(diffDays);
  } else if (diffDays === 0) {
    status = 'warning';
    isExpiresToday = true;
  } else if (diffDays <= 3) {
    status = 'warning';
  } else {
    status = 'safe';
  }

  // Get daily charge rate & calculate accumulated costs
  const containerType: ContainerType = container.type || '20ft';
  const slabs = rule.slabs[containerType] || rule.slabs['20ft'];
  
  // Daily charge rate for current/next slab
  let dailyRate = slabs[0].rate;
  if (overdueDays > 0) {
    const currentSlab = slabs.find(s => overdueDays >= s.from && overdueDays <= s.to) || slabs[slabs.length - 1];
    dailyRate = currentSlab.rate;
  }

  // Calculate accumulated cost
  let accumulatedCost = 0;
  if (overdueDays > 0) {
    for (let day = 1; day <= overdueDays; day++) {
      const slab = slabs.find(s => day >= s.from && day <= s.to) || slabs[slabs.length - 1];
      accumulatedCost += slab.rate;
    }
  }

  const hoursRemainingInDay = Math.max(0, diffHours % 24);

  return {
    lfd,
    daysLeft: diffDays,
    hoursLeft: hoursRemainingInDay,
    status,
    isExpiresToday,
    overdueDays,
    dailyRate,
    accumulatedCost,
    formattedLFD: formatDateDDMMM(lfd)
  };
}

/**
 * Formats Indian Currency (INR) with ₹ symbol, e.g. ₹3,28,000
 */
export function formatINR(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);
  return `₹${formatted}`;
}

/**
 * Calculates multi-slab cost for the D&D calculator in Line Rules
 */
export function calculateCalculatorCost(
  lineName: string,
  type: ContainerType,
  overdueDays: number
): { total: number; breakdown: { label: string; days: number; rate: number; amount: number }[] } {
  const rule = getShippingLineRule(lineName);
  const slabs = rule.slabs[type] || rule.slabs['20ft'];

  let total = 0;
  const breakdownMap = new Map<string, { days: number; rate: number; amount: number }>();

  for (let day = 1; day <= overdueDays; day++) {
    const slab = slabs.find(s => day >= s.from && day <= s.to) || slabs[slabs.length - 1];
    total += slab.rate;

    const existing = breakdownMap.get(slab.label);
    if (existing) {
      existing.days += 1;
      existing.amount += slab.rate;
    } else {
      breakdownMap.set(slab.label, {
        days: 1,
        rate: slab.rate,
        amount: slab.rate
      });
    }
  }

  const breakdown = Array.from(breakdownMap.entries()).map(([label, val]) => ({
    label,
    days: val.days,
    rate: val.rate,
    amount: val.amount
  }));

  return { total, breakdown };
}
