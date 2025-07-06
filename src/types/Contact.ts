
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

export type ContactType = 'marketing' | 'sales' | 'franquicia' | 'cliente' | 'prospect' | 'other';
export type ContactPriority = 'low' | 'medium' | 'high';
export type ContactStatus = 'active' | 'inactive';
export type ContactSource = 'web' | 'referido' | 'cold_outreach' | 'networking' | 'franquicia' | 'marketing';

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
  roles?: string[];
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
  roles?: string[];
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string;
}
