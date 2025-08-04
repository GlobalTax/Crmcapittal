import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { BaseStore } from './types';

interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  // Add other company fields as needed
}

interface CompaniesState {
  companies: Company[];
  selectedCompanies: Set<string>;
  filters: Record<string, any>;
  searchTerm: string;
}

interface CompaniesActions {
  setCompanies: (companies: Company[]) => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  removeCompany: (id: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSearchTerm: (term: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
}

type CompaniesStore = BaseStore & CompaniesState & CompaniesActions;

export const useCompaniesStore = create<CompaniesStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Base store
        loading: false,
        error: null,
        
        // Companies state
        companies: [],
        selectedCompanies: new Set(),
        filters: {},
        searchTerm: '',

        // Base actions
        setLoading: (loading) => {
          set((state) => {
            state.loading = loading;
          });
        },

        setError: (error) => {
          set((state) => {
            state.error = error;
          });
        },

        // Companies actions
        setCompanies: (companies) => {
          set((state) => {
            state.companies = companies;
            state.selectedCompanies.clear();
          });
        },

        addCompany: (company) => {
          set((state) => {
            state.companies.unshift(company);
          });
        },

        updateCompany: (id, updates) => {
          set((state) => {
            const index = state.companies.findIndex(company => company.id === id);
            if (index !== -1) {
              state.companies[index] = { ...state.companies[index], ...updates };
            }
          });
        },

        removeCompany: (id) => {
          set((state) => {
            state.companies = state.companies.filter(company => company.id !== id);
            state.selectedCompanies.delete(id);
          });
        },

        setFilters: (filters) => {
          set((state) => {
            state.filters = { ...state.filters, ...filters };
          });
        },

        setSearchTerm: (term) => {
          set((state) => {
            state.searchTerm = term;
          });
        },

        toggleSelection: (id) => {
          set((state) => {
            if (state.selectedCompanies.has(id)) {
              state.selectedCompanies.delete(id);
            } else {
              state.selectedCompanies.add(id);
            }
          });
        },

        clearSelection: () => {
          set((state) => {
            state.selectedCompanies.clear();
          });
        },
      }))
    ),
    {
      name: 'companies-store',
    }
  )
);

// Selectors
export const useCompanies = () => useCompaniesStore((state) => state.companies);
export const useCompaniesLoading = () => useCompaniesStore((state) => state.loading);