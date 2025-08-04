/**
 * Companies Types
 * 
 * All types related to company management and CRM functionality
 */

// Core company types
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';
export type CompanyType = 'prospect' | 'cliente' | 'partner' | 'franquicia' | 'competidor' | 'target' | 'cliente_comprador' | 'cliente_vendedor';
export type CompanyStatus = 'activa' | 'inactiva' | 'prospecto' | 'cliente' | 'perdida';
export type CompanyLifecycleStage = 'lead' | 'marketing_qualified_lead' | 'sales_qualified_lead' | 'opportunity' | 'customer' | 'evangelist';
export type BusinessSegment = 'pyme' | 'mid_market' | 'enterprise' | 'family_office' | 'investment_fund';
export type TransactionInterest = 'compra' | 'venta' | 'ambos' | 'ninguno';
export type GeographicScope = 'local' | 'regional' | 'nacional' | 'internacional';

// Base interface for companies
export interface Company {
  id: string;
  name: string;
  domain?: string;
  website?: string;
  description?: string;
  phone?: string;
  industry?: string;
  company_size: CompanySize;
  company_type: CompanyType;
  company_status: CompanyStatus;
  lifecycle_stage: CompanyLifecycleStage;
  annual_revenue?: number;
  founded_year?: number;
  owner_id?: string;
  owner_name?: string;
  is_target_account: boolean;
  is_key_account: boolean;
  is_franquicia: boolean;
  business_segment?: BusinessSegment;
  transaction_interest?: TransactionInterest;
  geographic_scope?: GeographicScope;
  deal_readiness_score?: number;
  network_strength?: number;
  nif?: string;
  city?: string;
  country?: string;
  province?: string;
  postal_code?: string;
  address?: string;
  contacts_count?: number;
  deals_count?: number;
  total_deal_value?: number;
  profile_score?: number;
  profile_status?: string;
  sector?: string;
  enrichment_data?: any;
  opportunities_count?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Data interfaces for forms
export interface CreateCompanyData {
  name: string;
  company_size: CompanySize;
  company_type: CompanyType;
  company_status: CompanyStatus;
  lifecycle_stage: CompanyLifecycleStage;
  is_target_account: boolean;
  is_key_account: boolean;
  is_franquicia: boolean;
  domain?: string;
  website?: string;
  description?: string;
  phone?: string;
  industry?: string;
  annual_revenue?: number;
  founded_year?: number;
  business_segment?: BusinessSegment;
  transaction_interest?: TransactionInterest;
  geographic_scope?: GeographicScope;
  nif?: string;
  city?: string;
  country?: string;
  province?: string;
  postal_code?: string;
  address?: string;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  contacts_count?: number;
  deals_count?: number;
  total_deal_value?: number;
}

// Hook options
export interface UseCompaniesOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  statusFilter?: string;
  typeFilter?: string;
}

// Filter state for companies
export interface CompanyFilters {
  search: string;
  status: string;
  type: string;
  segment: string;
  transactionInterest: string;
  geographicScope: string;
  targetAccount: boolean | null;
  keyAccount: boolean | null;
}

// Legacy exports for backward compatibility
export * from '@/types/Company';