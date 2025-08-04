/**
 * Contacts Types
 * 
 * All types related to contact management and CRM functionality
 */

// Contact classification types
export type ContactRole = 'owner' | 'buyer' | 'advisor' | 'investor' | 'target' | 'client' | 'prospect' | 'lead' | 'other' | 'decision_maker' | 'influencer' | 'gatekeeper' | 'champion' | 'ceo' | 'cfo' | 'board_member' | 'broker';
export type ContactType = 'marketing' | 'sales' | 'franquicia' | 'cliente' | 'prospect' | 'target' | 'lead' | 'other';
export type ContactPriority = 'low' | 'medium' | 'high';
export type ContactStatus = 'active' | 'blocked' | 'archived';
export type ContactSource = 'web' | 'referido' | 'cold_outreach' | 'networking' | 'franquicia' | 'marketing' | 'mandate_targets' | 'leads';
export type EcosystemRole = 'entrepreneur' | 'investor' | 'advisor' | 'broker' | 'lawyer' | 'banker';
export type ContactLifecycleStage = 'customer' | 'marketing_qualified_lead' | 'sales_qualified_lead' | 'opportunity' | 'evangelist';

// Deal preferences interface
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

// Main contact interface
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  company?: string;
  company_id?: string;
  
  // Contact classification
  contact_type: ContactType;
  contact_priority?: ContactPriority;
  contact_status?: ContactStatus;
  contact_source?: string;
  is_active?: boolean;
  
  // Contact roles
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
  
  // Location
  city?: string;
  country?: string;
  address?: string;
  
  // Social & web presence
  linkedin_url?: string;
  website?: string;
  
  // Metadata
  notes?: string;
  tags?: string[];
  referral_source?: string;
  last_contact_date?: string;
  next_contact_date?: string;
  interaction_frequency?: string;
  
  // Scoring and metrics
  lead_score?: number;
  engagement_level?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Data interfaces for forms
export interface CreateContactData {
  name: string;
  contact_type: ContactType;
  email?: string;
  phone?: string;
  position?: string;
  company?: string;
  company_id?: string;
  contact_priority?: ContactPriority;
  contact_status?: ContactStatus;
  contact_source?: string;
  contact_roles?: ContactRole[];
  preferred_contact_method?: string;
  sectors_of_interest?: string[];
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  deal_preferences?: DealPreferences | null;
  time_zone?: string;
  language_preference?: string;
  lifecycle_stage?: ContactLifecycleStage;
  ecosystem_role?: EcosystemRole;
  city?: string;
  country?: string;
  address?: string;
  linkedin_url?: string;
  website?: string;
  notes?: string;
  tags?: string[];
  referral_source?: string;
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string;
}

// Hook options
export interface UseContactsOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  companyId?: string;
  statusFilter?: string;
  typeFilter?: string;
}

// Filter state for contacts
export interface ContactFilters {
  search: string;
  status: string;
  type: string;
  priority: string;
  source: string;
  company: string;
  lifecycleStage: string;
  ecosystemRole: string;
}

// Legacy exports for backward compatibility
export * from '@/types/Contact';