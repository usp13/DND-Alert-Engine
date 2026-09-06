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
 * Maritime standard: Discharge date is Day 1 of free time window.
 * Formula: LFD = Discharge Date + (Free Days - 1) days.
 */
export function calculateLFD(dischargeDateStr: string, lineName: string, customFreeDays?: number): Date {
  const lineRule = getShippingLineRule(lineName);
  const freeDays = customFreeDays !== undefined ? customFreeDays : lineRule.demurrageFree;
  const discharge = new Date(dischargeDateStr);
  const lfd = new Date(discharge);
  lfd.setDate(lfd.getDate() + Math.max(0, freeDays - 1));
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

/**
 * Builds the official WhatsApp Alert Template copy for a container given its status
 */
export function buildWhatsAppMessage(
  container: ContainerItem,
  calcResult: CalculationResult
): {
  alertType: '72h' | '48h' | '24h' | 'lfd_day' | string;
  messageText: string;
} {
  const { daysLeft, overdueDays, formattedLFD, dailyRate, accumulatedCost } = calcResult;
  let alertType = 'safe';
  let header = '';
  let urgencyNotice = '';

  if (overdueDays > 0) {
    alertType = `overdue_day${overdueDays}`;
    header = `💸 D&D CHARGES RUNNING — DAY ${overdueDays}`;
    urgencyNotice = `🔴 Overdue since: ${formattedLFD}\n🔴 D&D accumulated: ${formatINR(
      accumulatedCost
    )}\n🔴 Current rate: ${formatINR(dailyRate)}/day\n⚡ RETURN EMPTY CONTAINER IMMEDIATELY`;
  } else if (daysLeft === 0) {
    alertType = 'lfd_day';
    header = `⚠️ EXPIRES TODAY — FINAL FREE DAY`;
    urgencyNotice = `⏰ LAST FREE DAY IS TODAY (${formattedLFD})\n💰 Daily charge starting tomorrow: ${formatINR(
      dailyRate
    )}/day\n🚨 Urgent gate-out / pickup required today!`;
  } else if (daysLeft === 1) {
    alertType = '24h';
    header = `🔴 CRITICAL D&D ALERT — 24 HOURS LEFT`;
    urgencyNotice = `⏰ LAST FREE DAY: TOMORROW (${formattedLFD})\n💰 Charges after tomorrow: ${formatINR(
      dailyRate
    )}/day\n🚨 Last chance to avoid demurrage penalties!`;
  } else if (daysLeft === 2) {
    alertType = '48h';
    header = `⚠️ URGENT D&D ALERT — 2 DAYS LEFT`;
    urgencyNotice = `⏰ Last Free Day: ${formattedLFD} (Day After Tomorrow)\n💰 If missed: ${formatINR(
      dailyRate
    )}/day → ${formatINR(dailyRate * 7)}/week`;
  } else if (daysLeft === 3) {
    alertType = '72h';
    header = `📦 D&D ALERT — 3 DAYS REMAINING`;
    urgencyNotice = `⏰ Last Free Day: ${formattedLFD}\n📅 Days Remaining: 3 days\n💰 Daily tariff after LFD: ${formatINR(
      dailyRate
    )}/day`;
  } else {
    header = `✅ D&D SAFE STATUS`;
    urgencyNotice = `⏰ Last Free Day: ${formattedLFD}\n📅 Days Remaining: ${daysLeft} days`;
  }

  const messageText = `*${header}*
━━━━━━━━━━━━━━━━━━━━
*Container:* ${container.containerNo}
*Line:* ${container.line} (${container.type || '40ft'})
*Port:* ${container.port || 'Kandla / Mundra'}
*Importer:* ${container.importer || 'N/A'}

${urgencyNotice}

*Action Checklist:*
☐ Confirm Customs Clearance
☐ Dispatch Trucking Driver
☐ Verify Delivery Yard Readiness

— MAPS D&D Alert Engine (Kandla / Mundra)
📞 +91 8160024858`;

  return { alertType, messageText };
}
