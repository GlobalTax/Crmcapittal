import { BaseEntity, ContactInfo, BusinessInfo, AddressInfo, SocialLinks, EntityMetadata, ActivityTracking, ScoringInfo } from '@/shared/types/Base';

// Contact specific types
export type ContactRole = 'ceo' | 'cfo' | 'cto' | 'coo' | 'sales_director' | 'marketing_director' | 'investor_relations' | 'board_member' | 'founder' | 'partner' | 'manager' | 'employee' | 'consultant' | 'advisor' | 'other';
export type ContactType = 'client' | 'prospect' | 'partner' | 'investor' | 'advisor' | 'vendor' | 'lead' | 'candidate' | 'referral';
export type ContactPriority = 'low' | 'medium' | 'high' | 'critical';
export type ContactStatus = 'active' | 'inactive' | 'prospect' | 'qualified' | 'lost' | 'on_hold';
export type ContactSource = 'website' | 'referral' | 'cold_outreach' | 'networking' | 'social_media' | 'event' | 'partner' | 'advertisement' | 'other';
export type EcosystemRole = 'key_decision_maker' | 'influencer' | 'champion' | 'gatekeeper' | 'evaluator' | 'end_user' | 'sponsor';
export type ContactLifecycleStage = 'lead' | 'marketing_qualified_lead' | 'sales_qualified_lead' | 'opportunity' | 'client' | 'advocate';

// Deal preferences
export interface DealPreferences {
  preferred_sectors?: string[];
  min_investment_amount?: number;
  max_investment_amount?: number;
  preferred_deal_types?: string[];
  geographic_preferences?: string[];
  risk_tolerance?: 'low' | 'medium' | 'high';
  investment_timeline?: string;
  decision_making_process?: string;
}

// Main Contact interface
export interface Contact extends BaseEntity, ContactInfo, BusinessInfo, AddressInfo, SocialLinks, EntityMetadata, ActivityTracking, ScoringInfo {
  // Core contact information
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  
  // Professional information
  position?: string;
  department?: string;
  
  // Contact classification
  contact_type: ContactType;
  contact_roles?: ContactRole[];
  contact_priority: ContactPriority;
  contact_status: ContactStatus;
  lifecycle_stage: ContactLifecycleStage;
  contact_source?: ContactSource;
  
  // Business context
  company_id?: string;
  company_name?: string;
  
  // Ecosystem and influence
  ecosystem_role?: EcosystemRole;
  influence_score?: number;
  relationship_strength?: number;
  
  // Deal-specific information
  deal_preferences?: DealPreferences;
  
  // Lead-specific fields
  lead_score?: number;
  qualification_notes?: string;
  next_followup_date?: string;
  
  // Relationships and interactions
  primary_contact?: boolean;
  reports_to?: string;
  assistant_name?: string;
  assistant_email?: string;
  assistant_phone?: string;
  
  // Communication preferences
  preferred_communication_method?: 'email' | 'phone' | 'meeting' | 'linkedin';
  communication_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  opt_out_marketing?: boolean;
  
  // System fields
  created_by?: string;
  updated_by?: string;
  last_interaction_date?: string;
  last_interaction_type?: string;
}

// Create and Update types
export interface CreateContactData extends Omit<Contact, keyof BaseEntity> {
  // Required fields
  name: string;
  contact_type: ContactType;
  
  // All other fields are optional
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string;
}