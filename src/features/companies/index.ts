// Companies Feature - Barrel Export

// Types
export type { 
  Company, 
  CompanyType, 
  CompanyStatus,
  CreateCompanyData, 
  UpdateCompanyData,
  CompanyActivity,
  CompanyNote,
  CompanyFile
} from './types/Company';

export type { 
  CompanyFilters as CompanyFiltersType, 
  CompanyFilterState 
} from './types/CompanyFilters';

// Services  
export * from './services';

// Store
export { 
  useCompaniesStore,
  useCompanies,
  useCompaniesLoading,
  useCompaniesError,
  useSelectedCompanies,
  useSelectedCompany,
  useCompaniesFilters,
  useCompaniesSearch,
  useCompaniesPagination as useCompaniesPaginationStore,
  useFilteredCompanies
} from './stores';
// Will be populated as we migrate components