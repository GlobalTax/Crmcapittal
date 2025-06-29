
export type EmailStatus = 'SENT' | 'OPENED' | 'CLICKED';

export interface TrackedEmail {
  id: string;
  tracking_id: string;
  recipient_email: string;
  subject?: string;
  content?: string;
  lead_id?: string;
  contact_id?: string;
  target_company_id?: string;
  operation_id?: string;
  status: EmailStatus;
  opened_at?: string;
  open_count: number;
  user_agent?: string;
  ip_address?: string | null; // Changed from string to string | null to handle INET type
  sent_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTrackedEmailData {
  recipient_email: string;
  subject?: string;
  content: string;
  lead_id?: string;
  contact_id?: string;
  target_company_id?: string;
  operation_id?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables?: string[];
}
