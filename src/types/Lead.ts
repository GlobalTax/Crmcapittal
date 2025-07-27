
import { BaseEntity, ContactInfo, BusinessInfo, EntityMetadata, ActivityTracking, ScoringInfo } from './Base';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED' | 'NURTURING' | 'CONVERTED' | 'LOST';
export type LeadSource = 'website_form' | 'lead_marker' | 'capittal_market' | 'linkedin' | 'referral' | 'email_campaign' | 'social_media' | 'cold_outreach' | 'event' | 'other';
export type LeadOrigin = 'manual' | 'webform' | 'import';
export type LeadServiceType = 'mandato_venta' | 'mandato_compra' | 'valoracion_empresa';
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type LeadQuality = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';

// New enum for lead stages based on database
export type LeadStage = 'pipeline' | 'cualificado' | 'propuesta' | 'negociacion' | 'ganado' | 'perdido';

export interface Lead extends BaseEntity, ContactInfo, BusinessInfo, EntityMetadata, ActivityTracking, ScoringInfo {
  // Core lead info
  lead_name?: string;
  message?: string;
  source: LeadSource;
  lead_origin?: LeadOrigin;
  service_type?: LeadServiceType;
  status: LeadStatus;
  priority?: LeadPriority;
  quality?: LeadQuality;
  assigned_to_id?: string;
  
  // New database fields
  valor_estimado?: number;
  stage: LeadStage;
  prob_conversion?: number; // 0-100
  source_detail?: string;
  sector_id?: string;
  owner_id?: string;
  last_contacted?: string;
  next_action_date?: string;
  lost_reason?: string;
  aipersona?: Record<string, any>;
  extra?: Record<string, any>;
  
  // Temporary compatibility - support both old and new field names
  company_name?: string; // Legacy field, use company instead
  job_title?: string;    // Legacy field, use position instead
  
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
  won_date?: string;
  lost_date?: string;
  
  // Relations
  assigned_to?: {
    id: string;
    first_name?: string;
    last_name?: string;
  } | null;
  
  // New relations
  sector?: {
    id: string;
    nombre: string;
    descripcion?: string;
  } | null;
  
  owner?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
}

export interface CreateLeadData {
  // Required fields
  name: string;
  email: string;
  source: LeadSource;
  status?: LeadStatus;
  
  // Optional fields
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
  lead_score?: number;
  
  // New fields
  valor_estimado?: number;
  stage?: LeadStage;
  prob_conversion?: number;
  source_detail?: string;
  sector_id?: string;
  owner_id?: string;
  last_contacted?: string;
  next_action_date?: string;
  aipersona?: Record<string, any>;
  extra?: Record<string, any>;
  
  // Temporary compatibility - support both old and new field names
  company_name?: string; // Legacy field, use company instead
  job_title?: string;    // Legacy field, use position instead
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: LeadStatus;
  stage?: LeadStage;
  assigned_to_id?: string;
  first_contact_date?: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
  converted_to_contact_id?: string;
  converted_to_deal_id?: string;
  conversion_date?: string;
  lost_reason?: string;
}
