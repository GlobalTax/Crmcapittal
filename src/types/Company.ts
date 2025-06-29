
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';
export type CompanyType = 'prospect' | 'cliente' | 'partner' | 'franquicia' | 'competidor';
export type CompanyStatus = 'activa' | 'inactiva' | 'prospecto' | 'cliente' | 'perdida';
export type LifecycleStage = 'lead' | 'marketing_qualified_lead' | 'sales_qualified_lead' | 'opportunity' | 'customer' | 'evangelist';

export interface Company {
  id: string;
  
  // Información básica
  name: string;
  domain?: string;
  website?: string;
  description?: string;
  
  // Información de contacto
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  
  // Clasificación
  industry?: string;
  company_size: CompanySize;
  company_type: CompanyType;
  company_status: CompanyStatus;
  lifecycle_stage: LifecycleStage;
  
  // Información financiera
  annual_revenue?: number;
  founded_year?: number;
  
  // Asignación y propietario
  owner_id?: string;
  owner_name?: string;
  
  // Segmentación (como en HubSpot)
  is_target_account: boolean;
  is_key_account: boolean;
  is_franquicia: boolean;
  
  // Información adicional
  notes?: string;
  tags?: string[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_activity_date?: string;
  
  // Relaciones
  contacts_count?: number;
  active_contacts?: string[]; // IDs de contactos
  deals_count?: number;
  active_deals?: string[]; // IDs de deals
  total_deal_value?: number;
  
  // Métricas
  lead_score?: number;
  engagement_score?: number;
  
  // Información de ciclo de vida
  first_contact_date?: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
  
  // Social media y enlaces
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
}

export interface CreateCompanyData {
  name: string;
  domain?: string;
  website?: string;
  description?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  industry?: string;
  company_size: CompanySize;
  company_type: CompanyType;
  company_status: CompanyStatus;
  lifecycle_stage: LifecycleStage;
  annual_revenue?: number;
  founded_year?: number;
  owner_id?: string;
  is_target_account: boolean;
  is_key_account: boolean;
  is_franquicia: boolean;
  notes?: string;
  tags?: string[];
  next_follow_up_date?: string;
  lead_score?: number;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  last_activity_date?: string;
  last_contact_date?: string;
  contacts_count?: number;
  deals_count?: number;
  total_deal_value?: number;
}
