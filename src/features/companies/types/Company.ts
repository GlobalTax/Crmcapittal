export interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  nif?: string;
  annual_revenue?: number;
  employee_count?: number;
  company_type?: CompanyType;
  company_status?: CompanyStatus;
  is_target_account?: boolean;
  owner_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/enriched fields
  enrichment_data?: any;
  contacts_count?: number;
  opportunities_count?: number;
  profile_score?: number;
  profile_status?: 'low' | 'medium' | 'high';
  sector?: string;
  
  // Relations
  contacts?: any[];
  deals?: any[];
  opportunities?: any[];
}

export type CompanyType = 
  | 'prospect'
  | 'cliente'
  | 'partner'
  | 'franquicia'
  | 'competidor'
  | 'target'
  | 'cliente_comprador'
  | 'cliente_vendedor';

export type CompanyStatus = 
  | 'activa'
  | 'inactiva'
  | 'prospecto'
  | 'cliente'
  | 'perdida';

export interface CreateCompanyData {
  name: string;
  domain?: string;
  industry?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  nif?: string;
  annual_revenue?: number;
  employee_count?: number;
  company_type?: CompanyType;
  company_status?: CompanyStatus;
  is_target_account?: boolean;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  id: string;
}

export interface CompanyActivity {
  id: string;
  company_id: string;
  activity_type: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyNote {
  id: string;
  company_id: string;
  note: string;
  note_type?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyFile {
  id: string;
  company_id: string;
  file_name: string;
  file_url: string;
  content_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}