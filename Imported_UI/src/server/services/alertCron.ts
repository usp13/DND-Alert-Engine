import { alertRecipientsStore } from '../storage';
import { sendWhatsAppAlert } from './whatsappGupshup';
import { calculateContainerStatus, formatINR } from '../../utils/dndCalculations';
import { initialContainers } from '../../data/initialContainers';
import { ContainerItem } from '../../types';

export interface CronBatchResult {
  timestamp: string;
  containersEvaluated: number;
  alertsTriggered: number;
  recipientsNotified: number;
  failuresCount: number;
  details: {
    containerId: string;
    containerNo: string;
    alertType: string;
    recipientsAttempted: number;
    results: {
      phone: string;
      name?: string;
      success: boolean;
      error?: string;
    }[];
  }[];
}

/**
 * Builds the official WhatsApp Alert Template copy for a container given its status
 */
export function buildWhatsAppMessage(
  container: ContainerItem,
  calcResult: ReturnType<typeof calculateContainerStatus>
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
  }

  const messageText = `*${header}*
━━━━━━━━━━━━━━━━━━━━
*Container:* ${container.containerNo}
*Line:* ${container.line} (${container.type})
*Port:* ${container.port}
*Importer:* ${container.importer}

${urgencyNotice}

*Action Checklist:*
☐ Confirm Customs Clearance
☐ Dispatch Trucking Driver
☐ Verify Delivery Yard Readiness

— MAPS D&D Alert Engine (Kandla / Mundra)
📞 +91 8160024858`;

  return { alertType, messageText };
}

/**
 * Executes the D&D Alert Sending Engine
 * Evaluates all tracked containers, finds active recipients per container,
 * and sends WhatsApp notifications to every active recipient.
 */
export async function runAlertCron(customContainersList?: ContainerItem[]): Promise<CronBatchResult> {
  const containers: ContainerItem[] = customContainersList || initialContainers;
  const batchDetails: CronBatchResult['details'] = [];
  let totalRecipientsNotified = 0;
  let totalFailures = 0;
  let alertsTriggeredCount = 0;

  for (const container of containers) {
    const calc = calculateContainerStatus(container);

    // Only containers in warning window (0-3 days) or critical/overdue (>0 overdue) receive alerts
    const needsAlert = calc.status === 'warning' || calc.status === 'critical' || calc.daysLeft <= 3;
    if (!needsAlert) continue;

    alertsTriggeredCount++;
    const { alertType, messageText } = buildWhatsAppMessage(container, calc);

    // Fetch active alert recipients for this container from storage
    const matchedRecs = alertRecipientsStore.filter(
      (r) => r.container_id === container.id && r.is_active
    );

    let activeRecipients: { phone: string; name?: string }[] = [];

    if (matchedRecs.length > 0) {
      activeRecipients = matchedRecs.map((r) => ({
        phone: r.phone_number,
        name: r.recipient_name || undefined,
      }));
    } else {
      // Default to container's opsPhone and ownerPhone
      activeRecipients = [
        { phone: container.ownerPhone || '+91 8160024858', name: 'Account Owner (You)' },
        container.opsPhone ? { phone: container.opsPhone, name: 'Operations Desk' } : null,
        container.importerPhone ? { phone: container.importerPhone, name: `${container.importer} Desk` } : null,
      ].filter(Boolean) as { phone: string; name?: string }[];
    }

    const containerResults: {
      phone: string;
      name?: string;
      success: boolean;
      error?: string;
    }[] = [];

    // Dispatch alert to EACH active recipient in parallel
    const sendPromises = activeRecipients.map(async (recipient) => {
      try {
        const result = await sendWhatsAppAlert({
          containerId: container.id,
          recipientPhone: recipient.phone,
          recipientName: recipient.name,
          alertType,
          messageContent: messageText,
        });

        if (result.success) {
          totalRecipientsNotified++;
          return {
            phone: recipient.phone,
            name: recipient.name,
            success: true,
          };
        } else {
          totalFailures++;
          return {
            phone: recipient.phone,
            name: recipient.name,
            success: false,
            error: result.error || 'Failed to dispatch',
          };
        }
      } catch (err: unknown) {
        totalFailures++;
        return {
          phone: recipient.phone,
          name: recipient.name,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown dispatch error',
        };
      }
    });

    const settledResults = await Promise.allSettled(sendPromises);
    settledResults.forEach((res) => {
      if (res.status === 'fulfilled') {
        containerResults.push(res.value);
      }
    });

    batchDetails.push({
      containerId: container.id,
      containerNo: container.containerNo,
      alertType,
      recipientsAttempted: activeRecipients.length,
      results: containerResults,
    });
  }

  return {
    timestamp: new Date().toISOString(),
    containersEvaluated: containers.length,
    alertsTriggered: alertsTriggeredCount,
    recipientsNotified: totalRecipientsNotified,
    failuresCount: totalFailures,
    details: batchDetails,
  };
}
