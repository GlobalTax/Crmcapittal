export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';
export type CompanyType = 'prospect' | 'cliente' | 'partner' | 'franquicia' | 'competidor' | 'target' | 'cliente_comprador' | 'cliente_vendedor';
export type CompanyStatus = 'activa' | 'inactiva' | 'prospecto' | 'cliente' | 'perdida';
export type LifecycleStage = 'lead' | 'marketing_qualified_lead' | 'sales_qualified_lead' | 'opportunity' | 'customer' | 'evangelist';

// Nuevos tipos para segmentación
export type BusinessSegment = 'pyme' | 'mid_market' | 'enterprise' | 'family_office' | 'investment_fund';
export type TransactionInterest = 'compra' | 'venta' | 'ambos' | 'ninguno';
export type GeographicScope = 'local' | 'regional' | 'nacional' | 'internacional';
export type MandateRelationshipType = 'target' | 'buyer' | 'seller' | 'advisor';
export type MandateRelationshipStatus = 'potential' | 'active' | 'completed' | 'discarded';

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
  
  // Nuevos campos de segmentación
  business_segment?: BusinessSegment;
  transaction_interest?: TransactionInterest;
  geographic_scope?: GeographicScope;
  engagement_level?: number;
  deal_readiness_score?: number;
  network_strength?: number;
  
  // Información adicional
  notes?: string;
  tags?: string[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_activity_date?: string;
  
  // Relaciones - CAMPOS AGREGADOS para corregir el error
  contacts_count?: number;
  active_contacts?: string[]; // IDs de contactos
  deals_count?: number;
  active_deals?: string[]; // IDs de deals
  total_deal_value?: number;
  opportunities_count?: number; // NUEVO: agregado para RecordTable
  
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
  
  // Identificación fiscal
  nif?: string;
  
  // Datos de enriquecimiento - NUEVO: agregado para el hook useCompany
  enrichment_data?: any;
}

// Interface para la tabla de relaciones empresa-mandato
export interface CompanyMandate {
  id: string;
  company_id: string;
  mandate_id: string;
  relationship_type: MandateRelationshipType;
  status: MandateRelationshipStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
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
  nif?: string;
  
  // Nuevos campos de segmentación
  business_segment?: BusinessSegment;
  transaction_interest?: TransactionInterest;
  geographic_scope?: GeographicScope;
  engagement_level?: number;
  deal_readiness_score?: number;
  network_strength?: number;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  last_activity_date?: string;
  last_contact_date?: string;
  contacts_count?: number;
  deals_count?: number;
  total_deal_value?: number;
}
