
import { BaseEntity, ContactInfo, BusinessInfo, EntityMetadata, ActivityTracking, ScoringInfo } from './Base';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED' | 'NURTURING' | 'CONVERTED' | 'LOST';
export type LeadSource = 'website_form' | 'lead_marker' | 'capittal_market' | 'linkedin' | 'referral' | 'email_campaign' | 'social_media' | 'cold_outreach' | 'event' | 'other';
export type LeadOrigin = 'manual' | 'webform' | 'import';
export type LeadServiceType = 'mandato_venta' | 'mandato_compra' | 'valoracion_empresa';
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type LeadQuality = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';

export interface Lead extends BaseEntity, ContactInfo, BusinessInfo, EntityMetadata, ActivityTracking, ScoringInfo {
  // Core lead info
  lead_name?: string; // Alternative name field
  message?: string;
  source: LeadSource;
  lead_origin?: LeadOrigin;
  service_type?: LeadServiceType;
  status: LeadStatus;
  priority?: LeadPriority;
  quality?: LeadQuality;
  assigned_to_id?: string;
  
  // Advanced form data and tracking
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
    [key: string]: unknown;
  };
  
  // Engagement metrics
  follow_up_count?: number;
  email_opens?: number;
  email_clicks?: number;
  website_visits?: number;
  content_downloads?: number;
  
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
  external_source?: string;
  
  // ROD fields
  highlighted?: boolean;
  rod_order?: number;
  
  // Pipeline fields
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
  
  // Relations
  assigned_to?: {
    id: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export interface CreateLeadData extends Omit<Lead, keyof BaseEntity> {
  // Required fields
  name: string;
  email: string;
  source: LeadSource;
  
  // Make all other fields optional for creation
  lead_name?: string;
  phone?: string;
  company?: string;
  company_id?: string;
  position?: string;
  message?: string;
  lead_origin?: LeadOrigin;
  service_type?: LeadServiceType;
  priority?: LeadPriority;
  quality?: LeadQuality;
  form_data?: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: LeadStatus;
  assigned_to_id?: string;
  first_contact_date?: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
}
