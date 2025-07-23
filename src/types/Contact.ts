
import { BaseEntity, ContactInfo, BusinessInfo, SocialLinks, EntityMetadata, ActivityTracking, ScoringInfo } from './Base';

// Unified contact types
export type ContactRole = 'owner' | 'buyer' | 'advisor' | 'investor' | 'target' | 'client' | 'prospect' | 'lead' | 'other' | 'decision_maker' | 'influencer' | 'gatekeeper' | 'champion' | 'ceo' | 'cfo' | 'board_member' | 'broker';
export type ContactType = 'marketing' | 'sales' | 'franquicia' | 'cliente' | 'prospect' | 'target' | 'lead' | 'other';
export type ContactPriority = 'low' | 'medium' | 'high';
export type ContactStatus = 'active' | 'blocked' | 'archived';
export type ContactSource = 'web' | 'referido' | 'cold_outreach' | 'networking' | 'franquicia' | 'marketing' | 'mandate_targets' | 'leads';
export type EcosystemRole = 'entrepreneur' | 'investor' | 'advisor' | 'broker' | 'lawyer' | 'banker';
export type ContactLifecycleStage = 'customer' | 'marketing_qualified_lead' | 'sales_qualified_lead' | 'opportunity' | 'evangelist';

export interface DealPreferences {
  preferred_sectors?: string[];
  investment_range_min?: number;
  investment_range_max?: number;
  deal_types?: string[];
  geographic_preferences?: string[];
  risk_tolerance?: 'low' | 'medium' | 'high';
  timeline_preference?: string;
  involvement_level?: 'passive' | 'active' | 'advisory';
  [key: string]: string | string[] | number | undefined;
}

export interface Contact extends BaseEntity, ContactInfo, BusinessInfo, SocialLinks, EntityMetadata, ActivityTracking, ScoringInfo {
  // Core contact info
  contact_type: ContactType;
  contact_priority?: ContactPriority;
  contact_status?: ContactStatus;
  contact_source?: string;
  is_active?: boolean;
  
  // Contact roles (unified from legacy roles field)
  contact_roles?: ContactRole[];
  roles?: string[]; // @deprecated - use contact_roles instead
  
  // Business context
  preferred_contact_method?: string;
  sectors_of_interest?: string[];
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  deal_preferences?: DealPreferences | null;
  time_zone?: string;
  language_preference?: string;
  lifecycle_stage?: ContactLifecycleStage;
  
  // Ecosystem segmentation
  ecosystem_role?: EcosystemRole;
  network_connections?: number;
  
  // Lead-specific fields (for contacts that originated from leads)
  lead_score?: number;
  lead_source?: string;
  lead_status?: string;
  lead_priority?: string;
  lead_quality?: string;
  assigned_to_id?: string;
  follow_up_count?: number;
  email_opens?: number;
  email_clicks?: number;
  website_visits?: number;
  content_downloads?: number;
  tags_array?: string[];
  conversion_date?: string;
  conversion_value?: number;
  external_lead_id?: string;
  external_source?: string;
  lead_origin?: string;
  lead_type?: string;
  stage_id?: string;
  collaborator_id?: string;
  converted_to_mandate_id?: string;
  
  // Relations
  assigned_to?: {
    id: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export interface CreateContactData extends Omit<Contact, keyof BaseEntity> {
  // Required fields
  name: string;
  contact_type: ContactType;
  
  // Make all other fields optional for creation
  email?: string;
  phone?: string;
  company?: string;
  company_id?: string;
  position?: string;
  contact_priority?: ContactPriority;
  contact_source?: string;
  contact_roles?: ContactRole[];
  contact_status?: ContactStatus;
  lifecycle_stage?: ContactLifecycleStage;
  ecosystem_role?: EcosystemRole;
  
  // All other fields from Contact interface are optional
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string;
}
