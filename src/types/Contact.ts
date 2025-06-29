
export type ContactType = 'marketing' | 'sales' | 'franquicia' | 'cliente' | 'prospect' | 'other';
export type ContactPriority = 'low' | 'medium' | 'high';
export type ContactStatus = 'active' | 'inactive';
export type ContactSource = 'web' | 'referido' | 'cold_outreach' | 'networking' | 'franquicia' | 'marketing';

export interface Contact {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  position?: string;
  job_title?: string;
  company_size?: string;
  address?: string;
  city?: string;
  country?: string;
  contact_type: ContactType;
  contact_priority?: ContactPriority;
  contact_source?: ContactSource;
  owner_id?: string;
  created_by?: string;
  is_active?: boolean;
  linkedin_url?: string;
  website_url?: string;
  preferred_contact_method?: string;
  sectors_of_interest?: string[];
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  deal_preferences?: any;
  last_interaction_date?: string;
  notes?: string;
  lead_score?: number;
  deal_value?: number;
  deals_count?: number;
  next_follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContactData {
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  position?: string;
  job_title?: string;
  company_size?: string;
  address?: string;
  city?: string;
  country?: string;
  contact_type: ContactType;
  contact_priority?: ContactPriority;
  contact_source?: ContactSource;
  linkedin_url?: string;
  website_url?: string;
  preferred_contact_method?: string;
  sectors_of_interest?: string[];
  notes?: string;
  lead_score?: number;
  next_follow_up_date?: string;
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string;
}
