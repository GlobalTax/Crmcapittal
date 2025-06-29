
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED' | 'NURTURING' | 'CONVERTED' | 'LOST';

export type LeadSource = 'website_form' | 'lead_marker' | 'capittal_market' | 'linkedin' | 'referral' | 'email_campaign' | 'social_media' | 'cold_outreach' | 'event' | 'other';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LeadQuality = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  job_title?: string;
  message?: string;
  source: LeadSource;
  status: LeadStatus;
  priority?: LeadPriority;
  quality?: LeadQuality;
  lead_score: number;
  assigned_to_id?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: {
    id: string;
    first_name?: string;
    last_name?: string;
  } | null;
  
  // Advanced nurturing fields
  form_data?: {
    form_type?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    landing_page?: string;
    referrer_url?: string;
    external_source?: string;
  };
  first_contact_date?: string;
  last_contact_date?: string;
  last_activity_date?: string;
  next_follow_up_date?: string;
  follow_up_count?: number;
  email_opens?: number;
  email_clicks?: number;
  website_visits?: number;
  content_downloads?: number;
  tags?: string[];
  
  // Conversion tracking
  conversion_date?: string;
  converted_to_contact_id?: string;
  converted_to_deal_id?: string;
  conversion_value?: number;

  // Lead nurturing data
  lead_nurturing?: Array<{
    lead_score: number;
    engagement_score: number;
    stage: string;
    last_activity_date: string;
  }>;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  job_title?: string;
  message?: string;
  source: LeadSource;
  priority?: LeadPriority;
  quality?: LeadQuality;
  lead_score?: number;
  form_data?: Record<string, any>;
  tags?: string[];
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  job_title?: string;
  message?: string;
  source?: LeadSource;
  status?: LeadStatus;
  priority?: LeadPriority;
  quality?: LeadQuality;
  lead_score?: number;
  assigned_to_id?: string;
  form_data?: Record<string, any>;
  first_contact_date?: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
  tags?: string[];
}
