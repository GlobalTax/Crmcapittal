export type RODItemType = 'operation' | 'lead';

export interface RODItem {
  id: string;
  type: RODItemType;
  title: string;
  company_name: string;
  sector: string;
  value?: number;
  ebitda?: number;
  description?: string;
  status: string;
  highlighted: boolean;
  rod_order?: number;
  created_at: string;
  updated_at: string;
  
  // Operation specific fields
  operation_type?: string;
  amount?: number;
  currency?: string;
  date?: string;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  revenue?: number;
  annual_growth_rate?: number;
  
  // Lead specific fields
  lead_score?: number;
  lead_source?: string;
  lead_quality?: string;
  priority?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  message?: string;
  assigned_to?: {
    id: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export interface CreateRODItemData {
  title: string;
  company_name: string;
  sector: string;
  value?: number;
  ebitda?: number;
  description?: string;
  highlighted?: boolean;
  rod_order?: number;
}

export interface UpdateRODItemData {
  highlighted?: boolean;
  rod_order?: number;
  description?: string;
}