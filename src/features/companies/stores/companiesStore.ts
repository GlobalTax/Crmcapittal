import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Company } from '../types/Company';
import { CompanyFilters, CompanyFilterState } from '../types/CompanyFilters';
import { PaginationConfig } from '@/shared/types/common';

interface CompaniesState {
  // Data
  companies: Company[];
  selectedCompanies: Set<string>;
  selectedCompany: Company | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Filters
  filters: CompanyFilterState;
  searchTerm: string;
  
  // Pagination
  pagination: PaginationConfig;
}

interface CompaniesActions {
  // Data actions
  setCompanies: (companies: Company[]) => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  removeCompany: (id: string) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Selection actions
  toggleSelection: (id: string) => void;
  selectAll: (companyIds: string[]) => void;
  clearSelection: () => void;
  setSelectedCompany: (company: Company | null) => void;
  
  // Filter actions
  setFilters: (filters: Partial<CompanyFilterState>) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
  
  // Pagination actions
  setPagination: (pagination: Partial<PaginationConfig>) => void;
}

type CompaniesStore = CompaniesState & CompaniesActions;

const initialState: CompaniesState = {
  companies: [],
  selectedCompanies: new Set(),
  selectedCompany: null,
  loading: false,
  error: null,
  filters: {
    sector: '',
    location: '',
    revenueRange: [0, 100],
    employeeRange: [0, 1000],
    companyType: '',
    status: ''
  },
  searchTerm: '',
  pagination: {
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0
  }
};

export const useCompaniesStore = create<CompaniesStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,
        
        // Data actions
        setCompanies: (companies) => 
          set((state) => {
            state.companies = companies;
            state.loading = false;
            state.error = null;
          }),
        
        addCompany: (company) =>
          set((state) => {
            state.companies.push(company);
          }),
        
        updateCompany: (id, updates) =>
          set((state) => {
            const index = state.companies.findIndex(c => c.id === id);
            if (index !== -1) {
              state.companies[index] = { ...state.companies[index], ...updates };
            }
          }),
        
        removeCompany: (id) =>
          set((state) => {
            state.companies = state.companies.filter(c => c.id !== id);
            state.selectedCompanies.delete(id);
          }),
        
        // UI actions
        setLoading: (loading) =>
          set((state) => {
            state.loading = loading;
          }),
        
        setError: (error) =>
          set((state) => {
            state.error = error;
            state.loading = false;
          }),
        
        // Selection actions
        toggleSelection: (id) =>
          set((state) => {
            if (state.selectedCompanies.has(id)) {
              state.selectedCompanies.delete(id);
            } else {
              state.selectedCompanies.add(id);
            }
          }),
        
        selectAll: (companyIds) =>
          set((state) => {
            state.selectedCompanies = new Set(companyIds);
          }),
        
        clearSelection: () =>
          set((state) => {
            state.selectedCompanies.clear();
          }),
        
        setSelectedCompany: (company) =>
          set((state) => {
            state.selectedCompany = company;
          }),
        
        // Filter actions
        setFilters: (filters) =>
          set((state) => {
            state.filters = { ...state.filters, ...filters };
            state.pagination.page = 1; // Reset to first page
          }),
        
        setSearchTerm: (term) =>
          set((state) => {
            state.searchTerm = term;
            state.pagination.page = 1; // Reset to first page
          }),
        
        resetFilters: () =>
          set((state) => {
            state.filters = initialState.filters;
            state.searchTerm = '';
            state.pagination.page = 1;
          }),
        
        // Pagination actions
        setPagination: (pagination) =>
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination };
          }),
      }))
    ),
    { name: 'companies-store' }
  )
);

// Selectors
export const useCompanies = () => useCompaniesStore((state) => state.companies);
export const useCompaniesLoading = () => useCompaniesStore((state) => state.loading);
export const useCompaniesError = () => useCompaniesStore((state) => state.error);
export const useSelectedCompanies = () => useCompaniesStore((state) => state.selectedCompanies);
export const useSelectedCompany = () => useCompaniesStore((state) => state.selectedCompany);
export const useCompaniesFilters = () => useCompaniesStore((state) => state.filters);
export const useCompaniesSearch = () => useCompaniesStore((state) => state.searchTerm);
export const useCompaniesPagination = () => useCompaniesStore((state) => state.pagination);

// Computed selectors
export const useFilteredCompanies = () => {
  return useCompaniesStore((state) => {
    const { companies, filters, searchTerm } = state;
    
    return companies.filter(company => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!company.name?.toLowerCase().includes(searchLower) &&
            !company.industry?.toLowerCase().includes(searchLower) &&
            !company.city?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filters
      if (filters.sector && company.industry !== filters.sector) return false;
      if (filters.location && company.city !== filters.location) return false;
      if (filters.companyType && company.company_type !== filters.companyType) return false;
      if (filters.status && company.company_status !== filters.status) return false;

      // Revenue range
      if (company.annual_revenue !== undefined) {
        const revenue = company.annual_revenue / 1000000; // Convert to millions
        if (revenue < filters.revenueRange[0] || revenue > filters.revenueRange[1]) {
          return false;
        }
      }

      // Employee range
      if (company.employee_count !== undefined) {
        if (company.employee_count < filters.employeeRange[0] || 
            company.employee_count > filters.employeeRange[1]) {
          return false;
        }
      }

      return true;
    });
  });
};