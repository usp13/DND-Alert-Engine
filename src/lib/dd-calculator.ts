import { ShippingLineRules } from "@/types";
import { parseISO, differenceInCalendarDays, isValid } from "date-fns";

/**
 * Calculates accumulated charges based on overdue days and rules.
 * Slabs model:
 * - Days 1 to slab1_days: slab1_rate
 * - Days (slab1_days + 1) to (slab1_days + slab2_days): slab2_rate
 * - Beyond that: slab3_rate
 */
export function calculateSlabCharges(overdueDays: number, rules: ShippingLineRules): number {
  if (overdueDays <= 0 || !rules) return 0;

  let totalCharge = 0;
  const s1_days = rules.slab1_days ?? 7;
  const s1_rate = rules.slab1_rate ?? 0;
  const s2_days = rules.slab2_days ?? 7;
  const s2_rate = rules.slab2_rate ?? 0;
  const s3_rate = rules.slab3_rate ?? 0;

  for (let day = 1; day <= overdueDays; day++) {
    if (day <= s1_days) {
      totalCharge += s1_rate;
    } else if (day <= s1_days + s2_days) {
      totalCharge += s2_rate;
    } else {
      totalCharge += s3_rate;
    }
  }

  return totalCharge;
}

/**
 * Computes container charges from LFD to empty return date (or current date if still active).
 */
export function calculateContainerCharges(
  lfdStr: string,
  emptyReturnDateStr?: string,
  rules?: ShippingLineRules
): { demurrageCharges: number; overdueDays: number } {
  if (!lfdStr || !rules) return { demurrageCharges: 0, overdueDays: 0 };

  const lfd = parseISO(lfdStr);
  if (!isValid(lfd)) return { demurrageCharges: 0, overdueDays: 0 };

  const endDate = emptyReturnDateStr ? parseISO(emptyReturnDateStr) : new Date();
  if (!isValid(endDate)) return { demurrageCharges: 0, overdueDays: 0 };

  const overdueDays = differenceInCalendarDays(endDate, lfd);
  if (overdueDays <= 0) return { demurrageCharges: 0, overdueDays: 0 };

  const demurrageCharges = calculateSlabCharges(overdueDays, rules);

  return {
    demurrageCharges,
    overdueDays,
  };
}
