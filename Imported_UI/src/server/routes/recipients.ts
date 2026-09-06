import { Router, Request, Response } from 'express';
import { alertRecipientsStore, alertLogsStore, StoredRecipient } from '../storage';
import { isValidIndianMobile, normalizePhoneNumber, sendWhatsAppAlert } from '../services/whatsappGupshup';
import { runAlertCron, buildWhatsAppMessage } from '../services/alertCron';
import { initialContainers } from '../../data/initialContainers';
import { calculateContainerStatus } from '../../utils/dndCalculations';

export const recipientsRouter = Router();

/**
 * GET /api/containers/:containerId/recipients
 * Retrieves all alert recipients configured for a given container
 */
recipientsRouter.get('/containers/:containerId/recipients', (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    if (!containerId) {
      return res.status(400).json({ error: 'Missing containerId parameter' });
    }

    const matched = alertRecipientsStore.filter((r) => r.container_id === containerId);
    return res.status(200).json({
      containerId,
      count: matched.length,
      recipients: matched,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: 'Failed to retrieve recipients', details: message });
  }
});

/**
 * POST /api/containers/:containerId/recipients
 * Adds a new WhatsApp alert recipient to a container
 */
recipientsRouter.post('/containers/:containerId/recipients', (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const { phone_number, recipient_name, is_owner } = req.body;

    if (!containerId) {
      return res.status(400).json({ error: 'Missing containerId parameter' });
    }

    if (!phone_number || typeof phone_number !== 'string') {
      return res.status(400).json({ error: 'phone_number is required' });
    }

    // 1. Phone number validation (10-digit Indian Mobile)
    if (!isValidIndianMobile(phone_number)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Must be a valid 10-digit Indian mobile number (e.g. 9876543210 or +919876543210).',
      });
    }

    const normalizedPhone = normalizePhoneNumber(phone_number);

    // 2. Fetch existing recipients to check limits & duplicates
    const existingRecipients = alertRecipientsStore.filter((r) => r.container_id === containerId);

    // 3. Max 5 recipients validation
    if (existingRecipients.length >= 5) {
      return res.status(400).json({
        error: 'Recipient limit reached. Maximum of 5 alert recipients allowed per container.',
      });
    }

    // 4. Duplicate phone number check
    const isDuplicate = existingRecipients.some(
      (r) => normalizePhoneNumber(r.phone_number) === normalizedPhone
    );

    if (isDuplicate) {
      return res.status(409).json({
        error: 'This phone number is already registered as an alert recipient for this container.',
      });
    }

    // 5. Insert new recipient
    const newRecipientId = 'rec-' + Math.random().toString(36).substring(2, 9);
    const trimmedName = recipient_name ? recipient_name.trim() : null;

    const memoryRecord: StoredRecipient = {
      id: newRecipientId,
      container_id: containerId,
      phone_number: normalizedPhone,
      recipient_name: trimmedName,
      is_active: true,
      is_owner: Boolean(is_owner),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    alertRecipientsStore.push(memoryRecord);

    return res.status(201).json({
      message: 'Recipient added successfully',
      recipient: memoryRecord,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: 'Failed to add recipient', details: message });
  }
});

/**
 * PATCH /api/containers/:containerId/recipients/:recipientId
 * Updates is_active toggle or recipient_name for a recipient
 */
recipientsRouter.patch('/containers/:containerId/recipients/:recipientId', (req: Request, res: Response) => {
  try {
    const { containerId, recipientId } = req.params;
    const { is_active, recipient_name } = req.body;

    if (!containerId || !recipientId) {
      return res.status(400).json({ error: 'Missing containerId or recipientId' });
    }

    const index = alertRecipientsStore.findIndex(
      (r) => r.id === recipientId && r.container_id === containerId
    );
    if (index === -1) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (typeof is_active === 'boolean') {
      alertRecipientsStore[index].is_active = is_active;
    }
    if (recipient_name !== undefined) {
      alertRecipientsStore[index].recipient_name = recipient_name ? recipient_name.trim() : null;
    }
    alertRecipientsStore[index].updated_at = new Date().toISOString();

    return res.status(200).json({
      message: 'Recipient updated successfully',
      recipient: alertRecipientsStore[index],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: 'Failed to update recipient', details: message });
  }
});

/**
 * DELETE /api/containers/:containerId/recipients/:recipientId
 * Removes an alert recipient from a container
 */
recipientsRouter.delete('/containers/:containerId/recipients/:recipientId', (req: Request, res: Response) => {
  try {
    const { containerId, recipientId } = req.params;

    if (!containerId || !recipientId) {
      return res.status(400).json({ error: 'Missing containerId or recipientId' });
    }

    const initialLen = alertRecipientsStore.length;
    const filtered = alertRecipientsStore.filter(
      (r) => !(r.id === recipientId && r.container_id === containerId)
    );

    if (filtered.length === initialLen) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    alertRecipientsStore.length = 0;
    alertRecipientsStore.push(...filtered);

    return res.status(200).json({ message: 'Recipient deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: 'Failed to delete recipient', details: message });
  }
});

/**
 * GET /api/containers/:containerId/logs
 * Retrieves sent WhatsApp alert logs for a container
 */
recipientsRouter.get('/containers/:containerId/logs', (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    if (!containerId) {
      return res.status(400).json({ error: 'Missing containerId' });
    }

    const logs = alertLogsStore.filter((l) => l.container_id === containerId);
    return res.status(200).json({ logs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: 'Failed to retrieve logs', details: message });
  }
});

/**
 * POST /api/containers/:containerId/send-alert
 * Dispatches an instant WhatsApp alert to all active recipients of a container
 */
recipientsRouter.post('/containers/:containerId/send-alert', async (req: Request, res: Response) => {
  try {
    const { containerId } = req.params;
    const container = initialContainers.find((c) => c.id === containerId);

    if (!container) {
      return res.status(404).json({ error: 'Container not found' });
    }

    const calc = calculateContainerStatus(container);
    const { alertType, messageText } = buildWhatsAppMessage(container, calc);

    // Get active recipients
    const matched = alertRecipientsStore.filter(
      (r) => r.container_id === containerId && r.is_active
    );

    let activeRecipients: { phone: string; name?: string }[] = [];

    if (matched.length > 0) {
      activeRecipients = matched.map((m) => ({
        phone: m.phone_number,
        name: m.recipient_name || undefined,
      }));
    } else {
      activeRecipients = [
        { phone: container.ownerPhone || '+91 8160024858', name: 'You (Owner)' },
        container.opsPhone ? { phone: container.opsPhone, name: 'Ops Desk' } : null,
      ].filter(Boolean) as { phone: string; name?: string }[];
    }

    const results = await Promise.allSettled(
      activeRecipients.map((rec) =>
        sendWhatsAppAlert({
          containerId,
          recipientPhone: rec.phone,
          recipientName: rec.name,
          alertType,
          messageContent: messageText,
        })
      )
    );

    const dispatches = results.map((r, i) => ({
      recipient: activeRecipients[i],
      status: r.status === 'fulfilled' && r.value.success ? 'sent' : 'failed',
      details: r.status === 'fulfilled' ? r.value : { error: 'Dispatch error' },
    }));

    return res.status(200).json({
      message: `Alert dispatched to ${activeRecipients.length} recipients`,
      containerId,
      dispatches,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: 'Dispatch failed', details: message });
  }
});

/**
 * POST /api/cron/send-alerts
 * Scheduled/Triggered endpoint to run the automated D&D alert cycle
 */
recipientsRouter.post('/cron/send-alerts', async (_req: Request, res: Response) => {
  try {
    const batchResult = await runAlertCron();
    return res.status(200).json({
      success: true,
      summary: batchResult,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: 'Cron execution failed', details: message });
  }
});
