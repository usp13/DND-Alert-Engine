export * from "./ui";

export interface Firm {
  id: string;
  auth_user_id?: string;
  firm_name: string;
  owner_name: string;
  owner_phone: string;
  ops_phone?: string;
  gstin?: string;
  city?: string;
  plan_type?: 'trial' | 'starter' | 'pro';
  containers_limit?: number;
  subscription_start?: string;
  subscription_end?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ShippingLineRules {
  id: string;
  line_name: string;
  line_code: string;
  port?: string;
  container_type?: '20ft' | '40ft';
  model?: 'split' | 'merged';
  dem_free_days: number;
  det_free_days?: number;
  combined_free_days?: number;
  slab1_days?: number;
  slab1_rate: number;
  slab2_days?: number;
  slab2_rate: number;
  slab3_rate: number;
  calendar_basis?: string;
  is_custom?: boolean;
  firm_id?: string;
  last_updated?: string;
  created_at?: string;
}

export interface ContainerPrefix {
  prefix: string;
  line_name: string;
  line_code: string;
}

export type ContainerStatus = 'active' | 'warning' | 'critical' | 'overdue' | 'cleared' | 'closed';

export interface Container {
  id: string;
  firm_id: string;
  container_number: string;
  shipping_line: string;
  shipping_line_code: string;
  container_type?: string;
  bl_number?: string;
  bl_date?: string;
  vessel_name?: string;
  port?: string;
  importer_name?: string;
  importer_phone?: string;
  discharge_date: string;
  gate_out_date?: string;
  empty_return_date?: string;
  demurrage_free_days: number;
  detention_free_days?: number;
  demurrage_lfd: string;
  detention_lfd?: string;
  model?: string;
  combined_lfd?: string;
  status?: ContainerStatus;
  demurrage_status?: string;
  detention_status?: string;
  demurrage_charges?: number;
  detention_charges?: number;
  total_dd_charges?: number;
  alert_72h_sent?: boolean;
  alert_48h_sent?: boolean;
  alert_24h_sent?: boolean;
  alert_lfd_sent?: boolean;
  alert_overdue_count?: number;
  last_alert_sent_at?: string;
  notes?: string;
  import_source?: 'manual' | 'whatsapp' | 'web_upload' | 'bulk_excel';
  import_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Alert {
  id: string;
  container_id: string;
  firm_id: string;
  alert_type: '72h' | '48h' | '24h' | 'lfd_day' | 'overdue' | 'cleared';
  sent_to: string;
  sent_to_role?: string;
  message_text?: string;
  delivery_status?: string;
  gupshup_message_id?: string;
  sent_at?: string;
  created_at?: string;
}

export interface MonthlyReport {
  id: string;
  firm_id: string;
  report_month: string;
  containers_tracked?: number;
  alerts_sent?: number;
  containers_saved?: number;
  containers_overdue?: number;
  dd_avoided_amount?: number;
  dd_incurred_amount?: number;
  report_url?: string;
  sent_to_owner?: boolean;
  sent_at?: string;
  created_at?: string;
}

export interface PDFImport {
  id: string;
  firm_id: string;
  file_name: string;
  sender_phone: string;
  containers_found?: number;
  containers_added?: number;
  containers_skipped?: number;
  vessel_name?: string;
  port?: string;
  discharge_date?: string;
  raw_extraction?: any;
  source?: 'whatsapp' | 'web_upload';
  status?: 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at?: string;
}
