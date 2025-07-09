
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

// Nuevos tipos unificados para contactos
export type ContactRole = 'owner' | 'buyer' | 'advisor' | 'investor' | 'target' | 'client' | 'prospect' | 'lead' | 'other' | 'decision_maker' | 'influencer' | 'gatekeeper' | 'champion' | 'ceo' | 'cfo' | 'board_member' | 'broker';
export type ContactType = 'marketing' | 'sales' | 'franquicia' | 'cliente' | 'prospect' | 'target' | 'lead' | 'other';
export type ContactPriority = 'low' | 'medium' | 'high';
export type ContactStatus = 'active' | 'blocked' | 'archived';
export type ContactSource = 'web' | 'referido' | 'cold_outreach' | 'networking' | 'franquicia' | 'marketing' | 'mandate_targets' | 'leads';
export type EcosystemRole = 'entrepreneur' | 'investor' | 'advisor' | 'broker' | 'lawyer' | 'banker';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  contact_type: ContactType;
  contact_priority?: ContactPriority;
  contact_source?: string;
  created_by?: string;
  is_active?: boolean;
  linkedin_url?: string;
  website_url?: string;
  preferred_contact_method?: string;
  sectors_of_interest?: string[];
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  deal_preferences?: DealPreferences | null;
  last_interaction_date?: string;
  notes?: string;
  time_zone?: string;
  language_preference?: string;
  company_id?: string;
  lifecycle_stage?: 'lead' | 'cliente' | 'suscriptor' | 'proveedor';
  roles?: string[]; // Mantener compatibility con el campo legacy
  // Nuevos campos unificados
  contact_roles?: ContactRole[];
  contact_status?: ContactStatus;
  source_table?: string;
  external_id?: string;
  
  // Nuevos campos de segmentación del ecosistema
  ecosystem_role?: EcosystemRole;
  engagement_level?: number;
  network_connections?: number;
  
  created_at: string;
  updated_at: string;
}

export interface CreateContactData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  contact_type: ContactType;
  contact_priority?: ContactPriority;
  contact_source?: string;
  linkedin_url?: string;
  website_url?: string;
  preferred_contact_method?: string;
  sectors_of_interest?: string[];
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  deal_preferences?: DealPreferences | null;
  notes?: string;
  time_zone?: string;
  language_preference?: string;
  lifecycle_stage?: 'lead' | 'cliente' | 'suscriptor' | 'proveedor';
  roles?: string[]; // Mantener compatibility
  // Nuevos campos unificados
  contact_roles?: ContactRole[];
  contact_status?: ContactStatus;
  
  // Nuevos campos de segmentación del ecosistema
  ecosystem_role?: EcosystemRole;
  engagement_level?: number;
  network_connections?: number;
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string;
}
