import { FilterParams } from '@/shared/types/common';
import { ContactType, ContactStatus, ContactLifecycleStage, ContactPriority, ContactRole } from './Contact';

export interface ContactFilters extends FilterParams {
  companyId?: string;
  contact_type?: ContactType;
  contact_status?: ContactStatus;
  lifecycle_stage?: ContactLifecycleStage;
  contact_priority?: ContactPriority;
  contact_roles?: ContactRole[];
  company_name?: string;
  position?: string;
  department?: string;
  location?: string;
  created_by?: string;
  lead_score_min?: number;
  lead_score_max?: number;
  last_interaction_days?: number;
  has_email?: boolean;
  has_phone?: boolean;
  is_primary_contact?: boolean;
}

export interface ContactSortOptions {
  field: 'name' | 'company_name' | 'position' | 'created_at' | 'last_interaction_date' | 'lead_score';
  direction: 'asc' | 'desc';
}

export interface ContactSearchOptions {
  query?: string;
  includeInactive?: boolean;
  limit?: number;
  offset?: number;
}