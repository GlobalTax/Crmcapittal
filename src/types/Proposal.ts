
export interface Proposal {
  id: string;
  contact_id?: string;
  company_id?: string;
  practice_area_id?: string;
  title: string;
  description?: string;
  total_amount?: number;
  currency: string;
  proposal_type: 'punctual' | 'recurring';
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  valid_until?: string;
  terms_and_conditions?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
  // Relations
  contact?: {
    id: string;
    name: string;
    email?: string;
  };
  company?: {
    id: string;
    name: string;
  };
  practice_area?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface CreateProposalData {
  contact_id?: string;
  company_id?: string;
  practice_area_id?: string;
  title: string;
  description?: string;
  total_amount?: number;
  currency?: string;
  proposal_type: 'punctual' | 'recurring';
  valid_until?: string;
  terms_and_conditions?: string;
  notes?: string;
}

export interface UpdateProposalData {
  title?: string;
  description?: string;
  total_amount?: number;
  currency?: string;
  proposal_type?: 'punctual' | 'recurring';
  status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  valid_until?: string;
  terms_and_conditions?: string;
  notes?: string;
}
