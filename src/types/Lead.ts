
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  message?: string;
  source: string;
  status: LeadStatus;
  assigned_to_id?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: {
    id: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  message?: string;
  source: string;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  message?: string;
  source?: string;
  status?: LeadStatus;
  assigned_to_id?: string;
}
