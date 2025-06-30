
export interface Case {
  id: string;
  case_number: string;
  contact_id: string;
  company_id?: string;
  practice_area_id: string;
  proposal_id?: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'suspended' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
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
  proposal?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface CreateCaseData {
  contact_id: string;
  company_id?: string;
  practice_area_id: string;
  proposal_id?: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  assigned_to?: string;
}

export interface UpdateCaseData {
  title?: string;
  description?: string;
  status?: 'active' | 'completed' | 'suspended' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  assigned_to?: string;
}
