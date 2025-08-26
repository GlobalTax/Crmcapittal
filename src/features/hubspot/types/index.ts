export interface HubSpotCompany {
  id: string;
  hubspot_id: string;
  name: string;
  domain?: string;
  industry?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  description?: string;
  annual_revenue?: number;
  company_size: string;
  founded_year?: number;
  total_contacts: number;
  total_deals: number;
  created_at: string;
}

export interface HubSpotContact {
  id: string;
  hubspot_id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  company?: string;
  company_name?: string;
  company_domain?: string;
  company_industry?: string;
  lifecycle_stage?: string;
  contact_status?: string;
  is_active: boolean;
  last_interaction_date?: string;
  created_at: string;
}

export interface HubSpotDeal {
  id: string;
  hubspot_id: string;
  deal_name: string;
  deal_value?: number;
  deal_type: string;
  description?: string;
  contact_name?: string;
  contact_email?: string;
  company_name?: string;
  close_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface HubSpotData {
  companies: HubSpotCompany[];
  contacts: HubSpotContact[];
  deals: HubSpotDeal[];
}

export interface ImportResults {
  companies: number;
  contacts: number;
  deals: number;
  errors: string[];
}