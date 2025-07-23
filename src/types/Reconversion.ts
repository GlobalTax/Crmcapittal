
export type ReconversionStatus = 'active' | 'matching' | 'paused' | 'closed';

export type ReconversionPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Reconversion {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  rejection_reason: string;
  target_sectors?: string[];
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  geographic_preferences?: string[];
  business_model_preferences?: string[];
  priority?: ReconversionPriority;
  status?: ReconversionStatus;
  notes?: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ReconversionComment {
  id: string;
  reconversion_id: string;
  user_id: string;
  user_email?: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface ReconversionActivity {
  id: string;
  reconversion_id: string;
  action_type: string;
  action_title: string;
  action_description?: string;
  user_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ReconversionFilters {
  search: string;
  status: ReconversionStatus | 'all';
  priority: ReconversionPriority | 'all';
  assignedTo: string | 'all';
  sector: string | 'all';
  investmentRange: {
    min?: number;
    max?: number;
  };
  createdDateRange: {
    from?: Date;
    to?: Date;
  };
}
