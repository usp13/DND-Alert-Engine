// In-Memory & File/Session Storage for Alert Recipients and Logs

export interface StoredRecipient {
  id: string;
  container_id: string;
  phone_number: string;
  recipient_name: string | null;
  is_active: boolean;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoredAlertLog {
  id: string;
  container_id: string;
  recipient_phone: string;
  alert_type: string;
  message_content: string;
  sent_at: string;
  status: 'sent' | 'failed';
  error_message: string | null;
}

// Initial recipient seeds
export const alertRecipientsStore: StoredRecipient[] = [
  // Container 1 (MSKU7234561)
  {
    id: 'rec-1',
    container_id: 'cont-1',
    phone_number: '+91 8160024858',
    recipient_name: 'Aman Dana (Owner)',
    is_active: true,
    is_owner: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec-2',
    container_id: 'cont-1',
    phone_number: '+91 98765 43210',
    recipient_name: 'Ramesh — Ops Manager (Kandla)',
    is_active: true,
    is_owner: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec-3',
    container_id: 'cont-1',
    phone_number: '+91 94262 33445',
    recipient_name: 'Agarwalla Importer Logistics Desk',
    is_active: true,
    is_owner: false,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Container 2 (MSKU2198745)
  {
    id: 'rec-4',
    container_id: 'cont-2',
    phone_number: '+91 8160024858',
    recipient_name: 'You (Owner)',
    is_active: true,
    is_owner: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec-5',
    container_id: 'cont-2',
    phone_number: '+91 98765 11223',
    recipient_name: 'Sunil — Shree CHA Agent',
    is_active: true,
    is_owner: false,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Container 13 (ONEY7654321 - Overdue)
  {
    id: 'rec-6',
    container_id: 'cont-13',
    phone_number: '+91 8160024858',
    recipient_name: 'You (Owner)',
    is_active: true,
    is_owner: true,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec-7',
    container_id: 'cont-13',
    phone_number: '+91 97243 55667',
    recipient_name: 'Pravin — National Brokers',
    is_active: true,
    is_owner: false,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec-8',
    container_id: 'cont-13',
    phone_number: '+91 98980 99887',
    recipient_name: 'Gujarat Minerals Transport Head',
    is_active: false,
    is_owner: false,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const alertLogsStore: StoredAlertLog[] = [
  {
    id: 'log-1',
    container_id: 'cont-1',
    recipient_phone: '+91 8160024858',
    alert_type: '72h',
    message_content: '📦 D&D ALERT — 3 DAYS LEFT for MSKU7234561 (Maersk)',
    sent_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'sent',
    error_message: null,
  },
  {
    id: 'log-2',
    container_id: 'cont-1',
    recipient_phone: '+91 98765 43210',
    alert_type: '72h',
    message_content: '📦 D&D ALERT — 3 DAYS LEFT for MSKU7234561 (Maersk)',
    sent_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'sent',
    error_message: null,
  },
  {
    id: 'log-3',
    container_id: 'cont-13',
    recipient_phone: '+91 8160024858',
    alert_type: 'overdue_day3',
    message_content: '💸 D&D CHARGES RUNNING — DAY 3 for ONEY7654321 (ONE)',
    sent_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'sent',
    error_message: null,
  },
];
