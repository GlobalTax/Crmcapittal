
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED' | 'NURTURING' | 'CONVERTED' | 'LOST';

export type LeadSource = 'website_form' | 'lead_marker' | 'capittal_market' | 'linkedin' | 'referral' | 'email_campaign' | 'social_media' | 'cold_outreach' | 'event' | 'other';

export type LeadOrigin = 'manual' | 'webform' | 'import';

export type LeadServiceType = 'mandato_venta' | 'mandato_compra' | 'valoracion_empresa';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type LeadQuality = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';

export interface Lead {
  id: string;
  name: string;
  lead_name?: string;
  email: string;
  phone?: string;
  company_name?: string;
  company_id?: string;
  job_title?: string;
  message?: string;
  source: LeadSource;
  lead_origin?: LeadOrigin;
  service_type?: LeadServiceType;
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
      automation_triggered?: boolean;
      import_date?: string;
      automation_sequence?: string;
      [key: string]: unknown; // Allow additional properties
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
  
  // External source tracking
  external_id?: string;
  external_source?: string;
  
  // ROD fields
  highlighted?: boolean;
  rod_order?: number;
  
  // Pipeline fields added from migration
  deal_value?: number;
  estimated_close_date?: string;
  probability?: number;
  pipeline_stage_id?: string;
  is_followed?: boolean;
  last_activity_type?: string;
  next_activity_date?: string;
  won_date?: string;
  lost_date?: string;
  lost_reason?: string;
}

export interface CreateLeadData {
  name: string;
  lead_name?: string;
  email: string;
  phone?: string;
  company_name?: string;
  company_id?: string;
  job_title?: string;
  message?: string;
  source: LeadSource;
  lead_origin?: LeadOrigin;
  service_type?: LeadServiceType;
  priority?: LeadPriority;
  quality?: LeadQuality;
  lead_score?: number;
  form_data?: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateLeadData {
  name?: string;
  lead_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  company_id?: string;
  job_title?: string;
  message?: string;
  source?: LeadSource;
  service_type?: LeadServiceType;
  status?: LeadStatus;
  priority?: LeadPriority;
  quality?: LeadQuality;
  lead_score?: number;
  assigned_to_id?: string;
  form_data?: Record<string, unknown>;
  first_contact_date?: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
  tags?: string[];
}
