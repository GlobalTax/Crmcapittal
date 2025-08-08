
import { BaseEntity, ContactInfo, BusinessInfo, AddressInfo, SocialLinks, EntityMetadata, ActivityTracking, ScoringInfo } from './Base';

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';
export type CompanyType = 'prospect' | 'cliente' | 'partner' | 'franquicia' | 'competidor' | 'target' | 'cliente_comprador' | 'cliente_vendedor';
export type CompanyStatus = 'activa' | 'inactiva' | 'prospecto' | 'cliente' | 'perdida';
export type CompanyLifecycleStage = 'lead' | 'marketing_qualified_lead' | 'sales_qualified_lead' | 'opportunity' | 'customer' | 'evangelist';
export type BusinessSegment = 'pyme' | 'mid_market' | 'enterprise' | 'family_office' | 'investment_fund';
export type TransactionInterest = 'compra' | 'venta' | 'ambos' | 'ninguno';
export type GeographicScope = 'local' | 'regional' | 'nacional' | 'internacional';
export type MandateRelationshipType = 'target' | 'buyer' | 'seller' | 'advisor';
export type MandateRelationshipStatus = 'potential' | 'active' | 'completed' | 'discarded';

export interface Company extends BaseEntity, AddressInfo, SocialLinks, EntityMetadata, ActivityTracking, ScoringInfo {
  // Core company info
  name: string;
  domain?: string;
  website?: string;
  description?: string;
  phone?: string;
  
  // Classification
  industry?: string;
  company_size: CompanySize;
  company_type: CompanyType;
  company_status: CompanyStatus;
  lifecycle_stage: CompanyLifecycleStage;
  
  // Financial information
  annual_revenue?: number;
  founded_year?: number;
  
  // Ownership and assignment
  owner_id?: string;
  owner_name?: string;
  
  // Segmentation flags
  is_target_account: boolean;
  is_key_account: boolean;
  is_franquicia: boolean;
  
  // Advanced segmentation
  business_segment?: BusinessSegment;
  transaction_interest?: TransactionInterest;
  geographic_scope?: GeographicScope;
  deal_readiness_score?: number;
  network_strength?: number;
  
  // Business identification
  nif?: string;
  
  // Controlled taxonomy (empresa)
  industry_tax?: string;
  subindustry_tax?: string;
  country_code?: string;
  region?: string;
  city?: string;
  revenue_band?: string;
  employees_band?: string;
  ebitda_band?: string;
  margin_band?: string;
  leverage_band?: string;
  seller_ready?: boolean;
  buyer_active?: boolean;
  investor_type?: string;
  strategic_fit?: string;
  prefers_email?: boolean;
  prefers_phone?: boolean;
  prefers_whatsapp?: boolean;
  
  // Relationship metrics
  contacts_count?: number;
  active_contacts?: string[];
  deals_count?: number;
  active_deals?: string[];
  total_deal_value?: number;
}

export interface CompanyMandate extends BaseEntity {
  company_id: string;
  mandate_id: string;
  relationship_type: MandateRelationshipType;
  status: MandateRelationshipStatus;
  notes?: string;
}

export interface CreateCompanyData extends Omit<Company, keyof BaseEntity> {
  // Required fields
  name: string;
  company_size: CompanySize;
  company_type: CompanyType;
  company_status: CompanyStatus;
  lifecycle_stage: CompanyLifecycleStage;
  is_target_account: boolean;
  is_key_account: boolean;
  is_franquicia: boolean;
  
  // All other fields are optional
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  // Additional fields that can be updated but not set during creation
  last_activity_date?: string;
  last_contact_date?: string;
  contacts_count?: number;
  deals_count?: number;
  total_deal_value?: number;
}
