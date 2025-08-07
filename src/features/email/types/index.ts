export interface EmailAccount {
  id: string;
  user_id: string;
  email_address: string;
  display_name?: string;
  provider: 'smtp' | 'imap' | 'outlook' | 'gmail';
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  imap_host?: string;
  imap_port?: number;
  is_default: boolean;
  is_active: boolean;
  last_sync_at?: string;
  sync_status: 'pending' | 'syncing' | 'success' | 'error';
  sync_error?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  account_id: string;
  message_id: string;
  thread_id?: string;
  subject?: string;
  sender_email: string;
  sender_name?: string;
  recipient_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  body_text?: string;
  body_html?: string;
  direction: 'incoming' | 'outgoing';
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced';
  is_read: boolean;
  is_starred: boolean;
  has_attachments: boolean;
  email_date: string;
  
  // CRM Integration
  contact_id?: string;
  lead_id?: string;
  deal_id?: string;
  company_id?: string;
  
  // Tracking
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  tracking_pixel_url?: string;
  
  // Templates & Automation
  template_id?: string;
  sequence_id?: string;
  sequence_step?: number;
  
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  category: 'general' | 'follow_up' | 'proposal' | 'closing' | 'welcome';
  language: string;
  variables: string[];
  is_shared: boolean;
  usage_count: number;
  last_used_at?: string;
  created_by?: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailSequence {
  id: string;
  name: string;
  description?: string;
  trigger_type: 'manual' | 'lead_created' | 'deal_stage' | 'time_based';
  trigger_config: Record<string, any>;
  is_active: boolean;
  total_steps: number;
  success_rate: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailSequenceStep {
  id: string;
  sequence_id: string;
  step_number: number;
  template_id: string;
  delay_days: number;
  delay_hours: number;
  conditions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailTrackingEvent {
  id: string;
  email_id: string;
  event_type: 'opened' | 'clicked' | 'replied' | 'bounced' | 'unsubscribed';
  event_data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface EmailConversation {
  id: string;
  thread_id: string;
  subject?: string;
  participants: string[];
  last_email_at?: string;
  message_count: number;
  is_read: boolean;
  
  // CRM Links
  contact_id?: string;
  lead_id?: string;
  deal_id?: string;
  company_id?: string;
  
  created_at: string;
  updated_at: string;
}

export interface EmailSettings {
  id: string;
  user_id: string;
  signature_html?: string;
  signature_text?: string;
  auto_reply_enabled: boolean;
  auto_reply_message?: string;
  tracking_enabled: boolean;
  sync_frequency: number;
  notification_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EmailAnalytics {
  id: string;
  email_id?: string;
  template_id?: string;
  sequence_id?: string;
  user_id?: string;
  metric_type: 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced';
  metric_value: number;
  date_bucket: string;
  created_at: string;
}

export interface MergeField {
  key: string;
  label: string;
  description: string;
  example: string;
}

export interface EmailComposeData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body_html: string;
  body_text?: string;
  template_id?: string;
  contact_id?: string;
  lead_id?: string;
  deal_id?: string;
  company_id?: string;
  tracking_enabled?: boolean;
  scheduled_for?: string;
}

export interface EmailFilter {
  account_id?: string;
  direction?: 'incoming' | 'outgoing';
  is_read?: boolean;
  is_starred?: boolean;
  contact_id?: string;
  lead_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}