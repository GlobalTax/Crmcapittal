/**
 * Email Integration Types
 * 
 * Type definitions for email functionality including Nylas integration
 */

export interface NylasAccount {
  id: string;
  user_id: string;
  email_address: string;
  provider: string;
  grant_id: string | null;
  access_token: string | null;
  connector_id: string | null;
  account_status: string;
  settings: any;
  created_at: string;
  updated_at: string;
  last_sync_at: string | null;
}

export interface EmailSetupData {
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
}

export interface SendEmailData {
  accountId: string;
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  replyToMessageId?: string;
}

export interface EmailFilter {
  provider?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  account_id?: string;
  direction?: 'sent' | 'received' | 'all' | 'incoming' | 'outgoing';
  is_read?: boolean;
  is_starred?: boolean;
  contact_id?: string;
  lead_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface EmailComposeData {
  to: string[];
  subject: string;
  body?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: File[];
  body_html?: string;
  body_text?: string;
  tracking_enabled?: boolean;
  contact_id?: string;
  lead_id?: string;
  deal_id?: string;
  company_id?: string;
  template_id?: string;
}

export interface EmailStats {
  totalAccounts: number;
  activeAccounts: number;
  totalEmails: number;
  syncedToday: number;
}

export interface EmailAccount {
  id: string;
  user_id: string;
  email: string;
  email_address?: string;
  display_name?: string;
  provider: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  imap_host?: string;
  imap_port?: number;
  is_default?: boolean;
  settings: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  account_id: string;
  thread_id: string;
  subject: string;
  body: string;
  body_html?: string;
  body_text?: string;
  sender_email: string;
  sender_name?: string;
  recipients: string[];
  cc?: string[];
  bcc?: string[];
  is_read: boolean;
  is_starred: boolean;
  direction: 'sent' | 'received';
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  variables: string[];
  category?: string;
  language?: string;
  is_shared?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailSequence {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  templates: EmailTemplate[];
  created_at: string;
  updated_at: string;
}

export interface EmailConversation {
  id: string;
  contact_id?: string;
  lead_id?: string;
  subject: string;
  emails: Email[];
  last_activity: string;
  is_archived: boolean;
}

export interface EmailSettings {
  signature: string;
  auto_reply_enabled: boolean;
  auto_reply_message?: string;
  tracking_enabled: boolean;
  send_notifications: boolean;
}