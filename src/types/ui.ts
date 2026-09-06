export type ContainerType = '20ft' | '40ft';

export type StatusCategory = 'safe' | 'warning' | 'critical';

export interface TariffSlab {
  from: number;
  to: number;
  rate: number;
  label: string;
}

export interface ShippingLineRule {
  name: string;
  prefix: string;
  demurrageFree: number;
  detentionFree: number;
  model: 'Split' | 'Merged';
  calendarBasis: 'Calendar Days';
  slabs: {
    '20ft': TariffSlab[];
    '40ft': TariffSlab[];
  };
}

export interface AlertRecipient {
  id: string;
  containerId: string;
  phoneNumber: string; // e.g. "+919876543210" or "9876543210"
  recipientName?: string; // e.g. "Ramesh — Ops Manager"
  isActive: boolean;
  isOwner?: boolean; // true for logged-in owner "You"
  createdAt?: string;
}

export interface AlertLog {
  id: string;
  containerId: string;
  recipientPhone: string;
  alertType: '72h' | '48h' | '24h' | 'lfd_day' | 'overdue_day1' | 'overdue_day2' | string;
  messageContent: string;
  sentAt: string;
  status: 'sent' | 'failed';
  errorMessage?: string | null;
}

export interface ContainerItem {
  id: string;
  containerNo: string;
  line: string;
  type: ContainerType;
  port: string;
  dischargeDate: string; // ISO date string YYYY-MM-DD
  importer: string;
  vessel: string;
  voyage?: string;
  blNumber: string;
  chaFirm: string;
  opsPhone?: string;
  ownerPhone?: string;
  importerPhone?: string;
  gateOutDate?: string;
  notes?: string;
  customsCleared?: boolean;
  truckArranged?: boolean;
  warehouseReady?: boolean;
  recipients?: AlertRecipient[];
}

export type SortOption = 'urgency' | 'shippingLine' | 'dischargeDate' | 'type';
export type FilterOption = 'all' | 'safe' | 'warning' | 'critical';

