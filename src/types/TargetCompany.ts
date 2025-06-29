
export type TargetStatus = 
  | 'IDENTIFIED'
  | 'RESEARCHING' 
  | 'CONTACTED'
  | 'IN_CONVERSATION'
  | 'ON_HOLD'
  | 'CONVERTED_TO_DEAL'
  | 'ARCHIVED';

export interface TargetContact {
  id: string;
  name: string;
  title?: string;
  email?: string;
  linkedin_url?: string;
}

export interface TargetCompany {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  revenue?: number;
  ebitda?: number;
  fit_score?: number;
  status: TargetStatus;
  stage_id?: string;
  investment_thesis?: string;
  source_notes?: string;
  created_at: string;
  updated_at: string;
  created_by_user_id: string;
  contacts: TargetContact[];
  stage?: {
    id: string;
    name: string;
    color: string;
    order_index: number;
  };
}
