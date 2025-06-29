
export type TargetStatus = 
  | 'IDENTIFIED'
  | 'RESEARCHING' 
  | 'OUTREACH_PLANNED'
  | 'CONTACTED'
  | 'IN_CONVERSATION'
  | 'ON_HOLD'
  | 'ARCHIVED'
  | 'CONVERTED_TO_DEAL';

export interface TargetCompany {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  investment_thesis?: string;
  fit_score?: number;
  status: TargetStatus;
  revenue?: number;
  ebitda?: number;
  source_notes?: string;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  contacts?: TargetContact[];
}

export interface TargetContact {
  id: string;
  name: string;
  title?: string;
  email?: string;
  linkedin_url?: string;
  target_company_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTargetCompanyData {
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  investment_thesis?: string;
  fit_score?: number;
  revenue?: number;
  ebitda?: number;
  source_notes?: string;
}

export interface CreateTargetContactData {
  name: string;
  title?: string;
  email?: string;
  linkedin_url?: string;
  target_company_id: string;
}
