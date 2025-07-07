export interface BuyingMandate {
  id: string;
  client_name: string;
  client_contact: string;
  client_email?: string;
  client_phone?: string;
  mandate_name: string;
  target_sectors: string[];
  target_locations: string[];
  min_revenue?: number;
  max_revenue?: number;
  min_ebitda?: number;
  max_ebitda?: number;
  other_criteria?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MandateTarget {
  id: string;
  mandate_id: string;
  company_name: string;
  sector?: string;
  location?: string;
  revenues?: number;
  ebitda?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contacted: boolean;
  contact_date?: string;
  contact_method?: string;
  status: 'pending' | 'contacted' | 'in_analysis' | 'interested' | 'nda_signed' | 'rejected' | 'closed';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBuyingMandateData {
  client_name: string;
  client_contact: string;
  client_email?: string;
  client_phone?: string;
  mandate_name: string;
  target_sectors: string[];
  target_locations?: string[];
  min_revenue?: number;
  max_revenue?: number;
  min_ebitda?: number;
  max_ebitda?: number;
  other_criteria?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreateMandateTargetData {
  mandate_id: string;
  company_name: string;
  sector?: string;
  location?: string;
  revenues?: number;
  ebitda?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_method?: string;
  notes?: string;
}