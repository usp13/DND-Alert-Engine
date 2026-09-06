import { Container, ContainerStatus, Firm } from "@/types";
import { getRemainingFreeDays } from "./lfd-calculator";

export interface AlertEvaluation {
  status: ContainerStatus;
  shouldNotify: boolean;
  alertType?: "72h" | "48h" | "24h" | "lfd_day" | "overdue";
}

/**
 * Evaluates the container's status based on remaining free days.
 */
export function evaluateContainerAlert(
  lfdStr: string,
  emptyReturnDateStr?: string
): AlertEvaluation {
  if (emptyReturnDateStr) {
    return {
      status: "cleared",
      shouldNotify: false,
    };
  }

  const remainingDays = getRemainingFreeDays(lfdStr);

  if (remainingDays < 0) {
    return {
      status: "overdue",
      shouldNotify: true,
      alertType: "overdue",
    };
  } else if (remainingDays === 0) {
    return {
      status: "critical",
      shouldNotify: true,
      alertType: "lfd_day",
    };
  } else if (remainingDays <= 1) {
    return {
      status: "critical",
      shouldNotify: true,
      alertType: "24h",
    };
  } else if (remainingDays <= 2) {
    return {
      status: "warning",
      shouldNotify: true,
      alertType: "48h",
    };
  } else if (remainingDays <= 3) {
    return {
      status: "warning",
      shouldNotify: true,
      alertType: "72h",
    };
  }

  return {
    status: "active",
    shouldNotify: false,
  };
}

/**
 * Generates alert message content for WhatsApp templates based on container state.
 */
export function generateWhatsAppMessage(container: Container, remainingDays: number): string {
  const line = container.shipping_line;
  const num = container.container_number;
  const lfd = container.demurrage_lfd;

  if (remainingDays < 0) {
    const cost = container.total_dd_charges || 0;
    return `⚠️ *DND OVERDUE ALERT* ⚠️\n\nContainer *${num}* (${line}) has passed its Last Free Day (*${lfd}*).\nOverdue by: *${Math.abs(remainingDays)} day(s)*.\nAccumulated Charges: *INR ${cost.toLocaleString("en-IN")}*.\n\nPlease return the container immediately to stop charges.`;
  } else if (remainingDays === 0) {
    return `🚨 *DND URGENT NOTICE* 🚨\n\nContainer *${num}* (${line}) Last Free Day is *TODAY* (*${lfd}*).\nEnsure cargo is gated out and empty container is returned before midnight to avoid heavy demurrage slabs.`;
  } else {
    return `🔔 *DND Reminder* 🔔\n\nContainer *${num}* (${line}) free period is ending soon.\nLast Free Day: *${lfd}*.\nDays remaining: *${remainingDays} day(s)*.\n\nPlan transport return schedules accordingly.`;
  }
}
