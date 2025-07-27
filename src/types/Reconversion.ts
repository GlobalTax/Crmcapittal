import type { Database } from '@/integrations/supabase/types';

export type ReconversionStatus = 'active' | 'matching' | 'paused' | 'closed';

export type ReconversionPriority = 'low' | 'medium' | 'high' | 'urgent' | 'baja' | 'media' | 'alta' | 'critica';

// Use the database type directly for consistency - using 'reconversiones' table (the one with data)
export type Reconversion = Database['public']['Tables']['reconversiones']['Row'];
export type CreateReconversionData = Database['public']['Tables']['reconversiones']['Insert'];
export type UpdateReconversionData = Database['public']['Tables']['reconversiones']['Update'];

// Legacy interface for backward compatibility
export interface ReconversionLegacy {
  id: string;
  company_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  rejection_reason?: string;
  target_sectors?: string[] | null;
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  geographic_preferences?: string[] | null;
  business_model_preferences?: string[] | null;
  priority?: ReconversionPriority;
  status?: ReconversionStatus;
  notes?: string;
  assigned_to?: string;
  created_by?: string;
  original_lead_id?: string;
  original_mandate_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ReconversionFormData {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  rejection_reason: string;
  target_sectors: string[];
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  geographic_preferences: string[];
  business_model_preferences: string[];
  priority: ReconversionPriority;
  status: ReconversionStatus;
  notes?: string;
  assigned_to?: string;
  original_lead_id?: string;
  original_mandate_id?: string;
}

export interface ReconversionWithRelations extends Reconversion {
  original_lead_name?: string;
  original_lead_email?: string;
  original_lead_company?: string;
  original_lead_status?: string;
  original_mandate_name?: string;
  original_mandate_client?: string;
  original_mandate_status?: string;
  original_mandate_sectors?: string[];
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

export interface ReconversionStatusHistory {
  id: string;
  reconversion_id: string;
  previous_status?: string;
  new_status: string;
  changed_by?: string;
  change_reason?: string;
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