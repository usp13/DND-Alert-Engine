import { AlertRecipient, AlertLog } from '../types';
import { alertRecipientsStore, alertLogsStore, StoredRecipient } from '../server/storage';
import { isValidIndianMobile, normalizePhoneNumber } from '../server/services/whatsappGupshup';

const STORAGE_KEY = 'maps_dnd_recipients_cache';

// Local storage helper
function getLocalRecipients(): AlertRecipient[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    // Ignore error
  }
  return alertRecipientsStore.map((r) => ({
    id: r.id,
    containerId: r.container_id,
    phoneNumber: r.phone_number,
    recipientName: r.recipient_name || undefined,
    isActive: r.is_active,
    isOwner: r.is_owner,
    createdAt: r.created_at,
  }));
}

function saveLocalRecipients(recipients: AlertRecipient[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipients));
  } catch (e) {
    // Ignore error
  }
}

/**
 * Fetch all alert recipients for a specific container
 */
export async function fetchRecipientsByContainer(containerId: string): Promise<AlertRecipient[]> {
  try {
    const res = await fetch(`/api/containers/${containerId}/recipients`);
    if (res.ok) {
      const json = await res.json();
      if (json.recipients) {
        return json.recipients.map((r: StoredRecipient) => ({
          id: r.id,
          containerId: r.container_id,
          phoneNumber: r.phone_number,
          recipientName: r.recipient_name || undefined,
          isActive: r.is_active,
          isOwner: r.is_owner,
          createdAt: r.created_at,
        }));
      }
    }
  } catch (e) {
    // Network fallback
  }

  const local = getLocalRecipients();
  return local.filter((r) => r.containerId === containerId);
}

/**
 * Add a new alert recipient to a container
 */
export async function addRecipientToContainer(
  containerId: string,
  payload: {
    phoneNumber: string;
    recipientName?: string;
    isOwner?: boolean;
  }
): Promise<{ success: boolean; recipient?: AlertRecipient; error?: string }> {
  // Input validations
  if (!isValidIndianMobile(payload.phoneNumber)) {
    return {
      success: false,
      error: 'Invalid phone number format. Must be a 10-digit Indian mobile number (e.g. 9876543210).',
    };
  }

  const cleanPhone = normalizePhoneNumber(payload.phoneNumber);

  try {
    const res = await fetch(`/api/containers/${containerId}/recipients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: cleanPhone,
        recipient_name: payload.recipientName?.trim(),
        is_owner: Boolean(payload.isOwner),
      }),
    });

    if (res.ok) {
      const json = await res.json();
      const raw = json.recipient;
      const created: AlertRecipient = {
        id: raw.id,
        containerId: raw.container_id,
        phoneNumber: raw.phone_number,
        recipientName: raw.recipient_name || undefined,
        isActive: raw.is_active,
        isOwner: raw.is_owner,
        createdAt: raw.created_at,
      };

      const all = getLocalRecipients();
      all.push(created);
      saveLocalRecipients(all);

      return { success: true, recipient: created };
    } else {
      const errJson = await res.json();
      return { success: false, error: errJson.error || 'Failed to add recipient' };
    }
  } catch (e) {
    // Local fallback
    const all = getLocalRecipients();
    const existing = all.filter((r) => r.containerId === containerId);

    if (existing.length >= 5) {
      return { success: false, error: 'Maximum limit of 5 recipients reached for this container.' };
    }

    if (existing.some((r) => normalizePhoneNumber(r.phoneNumber) === cleanPhone)) {
      return { success: false, error: 'This phone number is already added for this container.' };
    }

    const created: AlertRecipient = {
      id: 'rec-' + Math.random().toString(36).substring(2, 9),
      containerId,
      phoneNumber: cleanPhone,
      recipientName: payload.recipientName?.trim(),
      isActive: true,
      isOwner: Boolean(payload.isOwner),
      createdAt: new Date().toISOString(),
    };

    all.push(created);
    saveLocalRecipients(all);
    return { success: true, recipient: created };
  }
}

/**
 * Toggle active state or update name of a recipient
 */
export async function updateRecipient(
  containerId: string,
  recipientId: string,
  updates: { isActive?: boolean; recipientName?: string }
): Promise<{ success: boolean; recipient?: AlertRecipient; error?: string }> {
  try {
    const res = await fetch(`/api/containers/${containerId}/recipients/${recipientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_active: updates.isActive,
        recipient_name: updates.recipientName,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      const raw = json.recipient;
      const updated: AlertRecipient = {
        id: raw.id,
        containerId: raw.container_id,
        phoneNumber: raw.phone_number,
        recipientName: raw.recipient_name || undefined,
        isActive: raw.is_active,
        isOwner: raw.is_owner,
        createdAt: raw.created_at,
      };

      const all = getLocalRecipients().map((r) => (r.id === recipientId ? updated : r));
      saveLocalRecipients(all);
      return { success: true, recipient: updated };
    }
  } catch (e) {
    // Local fallback
  }

  const all = getLocalRecipients();
  const index = all.findIndex((r) => r.id === recipientId);
  if (index !== -1) {
    if (typeof updates.isActive === 'boolean') {
      all[index].isActive = updates.isActive;
    }
    if (updates.recipientName !== undefined) {
      all[index].recipientName = updates.recipientName.trim();
    }
    saveLocalRecipients(all);
    return { success: true, recipient: all[index] };
  }

  return { success: false, error: 'Recipient not found' };
}

/**
 * Delete a recipient from container
 */
export async function deleteRecipient(
  containerId: string,
  recipientId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/containers/${containerId}/recipients/${recipientId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const all = getLocalRecipients().filter((r) => r.id !== recipientId);
      saveLocalRecipients(all);
      return { success: true };
    }
  } catch (e) {
    // Local fallback
  }

  const all = getLocalRecipients().filter((r) => r.id !== recipientId);
  saveLocalRecipients(all);
  return { success: true };
}

/**
 * Fetch alert logs for container
 */
export async function fetchContainerAlertLogs(containerId: string): Promise<AlertLog[]> {
  try {
    const res = await fetch(`/api/containers/${containerId}/logs`);
    if (res.ok) {
      const json = await res.json();
      return json.logs || [];
    }
  } catch (e) {
    // Fallback
  }

  return alertLogsStore
    .filter((l) => l.container_id === containerId)
    .map((l) => ({
      id: l.id,
      containerId: l.container_id,
      recipientPhone: l.recipient_phone,
      alertType: l.alert_type,
      messageContent: l.message_content,
      sentAt: l.sent_at,
      status: l.status,
      errorMessage: l.error_message,
    }));
}
