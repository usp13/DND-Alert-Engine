import { AlertRecipient, AlertLog } from '../types';

const STORAGE_KEY = 'maps_dnd_recipients_cache';
const LOGS_STORAGE_KEY = 'maps_dnd_alert_logs_cache';

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

// Local storage helper
function getLocalRecipients(): AlertRecipient[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    // Ignore error
  }
  return [];
}

function saveLocalRecipients(recipients: AlertRecipient[]): void {
  if (typeof window === 'undefined') return;
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
  if (!isValidIndianMobile(payload.phoneNumber)) {
    return {
      success: false,
      error: 'Invalid phone number format. Must be a 10-digit Indian mobile number (e.g. 9876543210).',
    };
  }

  const cleanPhone = normalizePhoneNumber(payload.phoneNumber);
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

/**
 * Toggle active state or update name of a recipient
 */
export async function updateRecipient(
  containerId: string,
  recipientId: string,
  updates: { isActive?: boolean; recipientName?: string }
): Promise<{ success: boolean; recipient?: AlertRecipient; error?: string }> {
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
  const all = getLocalRecipients().filter((r) => r.id !== recipientId);
  saveLocalRecipients(all);
  return { success: true };
}

/**
 * Fetch alert logs for container
 */
export async function fetchContainerAlertLogs(containerId: string): Promise<AlertLog[]> {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOGS_STORAGE_KEY);
    if (data) {
      const logs: AlertLog[] = JSON.parse(data);
      if (containerId) return logs.filter((l: AlertLog) => l.containerId === containerId);
      return logs;
    }
  } catch (e) {
    // Ignore error
  }
  return [];
}
