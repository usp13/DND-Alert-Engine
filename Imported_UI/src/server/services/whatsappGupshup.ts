import { alertLogsStore } from '../storage';

interface SendWhatsAppParams {
  containerId: string;
  recipientPhone: string;
  recipientName?: string;
  alertType: '72h' | '48h' | '24h' | 'lfd_day' | 'overdue' | string;
  messageContent: string;
}

interface SendWhatsAppResult {
  success: boolean;
  recipientPhone: string;
  alertLogId: string;
  messageId?: string;
  error?: string;
}

/**
 * Normalizes Indian Phone Number to standard E.164 without spaces/dashes (+91XXXXXXXXXX)
 */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return phone.trim();
}

/**
 * Validates whether a phone number is a valid 10-digit Indian Mobile Number
 */
export function isValidIndianMobile(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(digits);
  }
  return false;
}

/**
 * Dispatches a WhatsApp Message via Gupshup WhatsApp Cloud API and records entry in alert_logs
 */
export async function sendWhatsAppAlert({
  containerId,
  recipientPhone,
  alertType,
  messageContent,
}: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const cleanPhone = normalizePhoneNumber(recipientPhone);
  const logId = 'log-' + Math.random().toString(36).substring(2, 9);
  let status: 'sent' | 'failed' = 'sent';
  let errorMessage: string | null = null;
  let messageId: string = 'msg_' + Math.random().toString(36).substring(2, 12);

  try {
    const gupshupApiKey = process.env.GUPSHUP_API_KEY;
    const gupshupAppName = process.env.GUPSHUP_APP_NAME || 'maps_dnd_alert_engine';
    const gupshupSource = process.env.GUPSHUP_SOURCE_PHONE || '918160024858';

    if (gupshupApiKey && gupshupApiKey !== 'your-gupshup-api-key') {
      // Direct HTTP Post to Gupshup WhatsApp Cloud API Endpoint
      const response = await fetch('https://api.gupshup.io/wa/api/v1/msg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          apikey: gupshupApiKey,
        },
        body: new URLSearchParams({
          channel: 'whatsapp',
          source: gupshupSource.replace(/\D/g, ''),
          destination: cleanPhone.replace(/\D/g, ''),
          'src.name': gupshupAppName,
          message: JSON.stringify({
            type: 'text',
            text: messageContent,
          }),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gupshup HTTP ${response.status}: ${errorText}`);
      }

      const resData = (await response.json()) as { messageId?: string; status?: string };
      if (resData.messageId) {
        messageId = resData.messageId;
      }
    }
  } catch (err: unknown) {
    status = 'failed';
    errorMessage = err instanceof Error ? err.message : 'Unknown WhatsApp dispatch error';
  }

  // Record into alert_logs
  alertLogsStore.unshift({
    id: logId,
    container_id: containerId,
    recipient_phone: cleanPhone,
    alert_type: alertType,
    message_content: messageContent,
    sent_at: new Date().toISOString(),
    status,
    error_message: errorMessage,
  });

  return {
    success: status === 'sent',
    recipientPhone: cleanPhone,
    alertLogId: logId,
    messageId,
    error: errorMessage || undefined,
  };
}
