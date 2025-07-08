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

export interface MandateDocument {
  id: string;
  mandate_id: string;
  target_id?: string;
  document_name: string;
  document_type: 'nda' | 'loi' | 'info_sheet' | 'presentation' | 'general' | 'other';
  file_url: string;
  file_size?: number;
  content_type?: string;
  uploaded_by?: string;
  uploaded_at: string;
  notes?: string;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
}

export interface MandateClientAccess {
  id: string;
  mandate_id: string;
  access_token: string;
  client_email: string;
  expires_at: string;
  is_active: boolean;
  last_accessed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MandateComment {
  id: string;
  mandate_id: string;
  target_id?: string;
  comment_text: string;
  comment_type: 'client_feedback' | 'internal_note' | 'status_update';
  is_client_visible: boolean;
  created_by?: string;
  client_access_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMandateDocumentData {
  mandate_id: string;
  target_id?: string;
  document_name: string;
  document_type: MandateDocument['document_type'];
  file_url: string;
  file_size?: number;
  content_type?: string;
  notes?: string;
  is_confidential?: boolean;
}

export interface CreateClientAccessData {
  mandate_id: string;
  client_email: string;
  expires_at: string;
}

// Nuevas interfaces para el sistema de actividades y enriquecimientos
export interface MandateTargetActivity {
  id: string;
  target_id: string;
  activity_type: string;
  title: string;
  description?: string;
  activity_data: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MandateTargetEnrichment {
  id: string;
  target_id: string;
  enrichment_data: Record<string, any>;
  source: string;
  confidence_score?: number;
  enriched_at: string;
  created_at: string;
  updated_at: string;
}

export interface MandateTargetFollowup {
  id: string;
  target_id: string;
  followup_type: string;
  title: string;
  description?: string;
  scheduled_date: string;
  is_completed: boolean;
  completed_at?: string;
  priority: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTargetActivityData {
  target_id: string;
  activity_type: string;
  title: string;
  description?: string;
  activity_data?: Record<string, any>;
}

export interface CreateTargetFollowupData {
  target_id: string;
  followup_type: string;
  title: string;
  description?: string;
  scheduled_date: string;
  priority?: string;
}