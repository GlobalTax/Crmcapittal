import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useCompaniesService } from '@/hooks/domain';
import { CompaniesState, CompaniesAction, CompanyFilters } from './types';
import { Company } from '@/types/Company';

const initialCompaniesState: CompaniesState = {
  companies: [],
  filteredCompanies: [],
  selectedCompanies: new Set(),
  filters: {
    sector: '',
    location: '',
    revenueRange: [0, 100],
    employeeRange: [0, 1000],
    companyType: '',
    status: ''
  },
  pagination: {
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0
  },
  loading: false,
  error: null,
  searchTerm: '',
  selectedCompany: null
};

const companiesReducer = (state: CompaniesState, action: CompaniesAction): CompaniesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_COMPANIES':
      return { 
        ...state, 
        companies: action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_FILTERED_COMPANIES':
      return { 
        ...state, 
        filteredCompanies: action.payload,
        pagination: {
          ...state.pagination,
          totalItems: action.payload.length,
          totalPages: Math.ceil(action.payload.length / state.pagination.pageSize)
        }
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      };
    
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
        pagination: { ...state.pagination, page: 1 }
      };
    
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };
    
    case 'SELECT_COMPANY':
      return {
        ...state,
        selectedCompanies: new Set([...state.selectedCompanies, action.payload])
      };
    
    case 'DESELECT_COMPANY':
      const newSelection = new Set(state.selectedCompanies);
      newSelection.delete(action.payload);
      return {
        ...state,
        selectedCompanies: newSelection
      };
    
    case 'SELECT_ALL_COMPANIES':
      return {
        ...state,
        selectedCompanies: new Set(state.filteredCompanies.map(company => company.id))
      };
    
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedCompanies: new Set()
      };
    
    case 'SET_SELECTED_COMPANY':
      return {
        ...state,
        selectedCompany: action.payload
      };
    
    case 'ADD_COMPANY':
      return {
        ...state,
        companies: [...state.companies, action.payload]
      };
    
    case 'UPDATE_COMPANY':
      return {
        ...state,
        companies: state.companies.map(company =>
          company.id === action.payload.id ? { ...company, ...action.payload.data } : company
        )
      };
    
    case 'DELETE_COMPANY':
      return {
        ...state,
        companies: state.companies.filter(company => company.id !== action.payload),
        selectedCompanies: new Set([...state.selectedCompanies].filter(id => id !== action.payload))
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialCompaniesState.filters,
        searchTerm: '',
        pagination: { ...state.pagination, page: 1 }
      };
    
    default:
      return state;
  }
};

interface CompaniesContextType extends CompaniesState {
  // Actions
  setFilters: (filters: Partial<CompanyFilters>) => void;
  setSearchTerm: (term: string) => void;
  setPagination: (pagination: Partial<CompaniesState['pagination']>) => void;
  selectCompany: (id: string) => void;
  deselectCompany: (id: string) => void;
  selectAllCompanies: () => void;
  clearSelection: () => void;
  setSelectedCompany: (company: Company | null) => void;
  resetFilters: () => void;
  
  // Operations
  createCompany: (data: any) => Promise<void>;
  updateCompany: (id: string, data: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  refetch: () => void;
  
  // Computed values
  paginatedCompanies: Company[];
  selectedCount: number;
  stats: {
    total: number;
    filtered: number;
    active: number;
  };
}

const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined);

export const useCompaniesContext = () => {
  const context = useContext(CompaniesContext);
  if (!context) {
    throw new Error('useCompaniesContext must be used within a CompaniesProvider');
  }
  return context;
};

interface CompaniesProviderProps {
  children: React.ReactNode;
}

export const CompaniesProvider: React.FC<CompaniesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(companiesReducer, initialCompaniesState);
  const { companies, isLoading, error, refetch, createCompany: createComp } = useCompaniesService();

  // Sync external data with internal state
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Error al cargar empresas' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [error]);

  useEffect(() => {
    if (companies) {
      dispatch({ type: 'SET_COMPANIES', payload: companies });
    }
  }, [companies]);

  // Apply filters
  const filteredCompanies = useMemo(() => {
    return state.companies.filter(company => {
      // Search term filter
      if (state.searchTerm) {
        const searchLower = state.searchTerm.toLowerCase();
        if (!company.name?.toLowerCase().includes(searchLower) &&
            !company.industry?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Other filters
      if (state.filters.sector && company.industry !== state.filters.sector) return false;
      if (state.filters.location && company.address !== state.filters.location) return false;
      if (state.filters.companyType && company.company_type !== state.filters.companyType) return false;
      if (state.filters.status && company.company_status !== state.filters.status) return false;

      return true;
    });
  }, [state.companies, state.searchTerm, state.filters]);

  useEffect(() => {
    dispatch({ type: 'SET_FILTERED_COMPANIES', payload: filteredCompanies });
  }, [filteredCompanies]);

  // Actions
  const setFilters = useCallback((filters: Partial<CompanyFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  const setPagination = useCallback((pagination: Partial<CompaniesState['pagination']>) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  }, []);

  const selectCompany = useCallback((id: string) => {
    dispatch({ type: 'SELECT_COMPANY', payload: id });
  }, []);

  const deselectCompany = useCallback((id: string) => {
    dispatch({ type: 'DESELECT_COMPANY', payload: id });
  }, []);

  const selectAllCompanies = useCallback(() => {
    dispatch({ type: 'SELECT_ALL_COMPANIES' });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const setSelectedCompany = useCallback((company: Company | null) => {
    dispatch({ type: 'SET_SELECTED_COMPANY', payload: company });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Operations
  const createCompany = useCallback(async (data: any) => {
    try {
      await createComp(data);
      refetch();
    } catch (error) {
      console.error('Error creating company:', error);
    }
  }, [createComp, refetch]);

  const updateCompany = useCallback(async (id: string, data: Partial<Company>) => {
    dispatch({ type: 'UPDATE_COMPANY', payload: { id, data } });
    // TODO: Call actual update service
  }, []);

  const deleteCompany = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_COMPANY', payload: id });
    // TODO: Call actual delete service
  }, []);

  // Computed values
  const paginatedCompanies = useMemo(() => {
    const startIndex = (state.pagination.page - 1) * state.pagination.pageSize;
    const endIndex = startIndex + state.pagination.pageSize;
    return state.filteredCompanies.slice(startIndex, endIndex);
  }, [state.filteredCompanies, state.pagination.page, state.pagination.pageSize]);

  const selectedCount = useMemo(() => state.selectedCompanies.size, [state.selectedCompanies]);

  const stats = useMemo(() => {
    const total = state.companies.length;
    const active = state.companies.filter(company => company.company_status === 'activa').length;
    
    return {
      total,
      filtered: state.filteredCompanies.length,
      active
    };
  }, [state.companies, state.filteredCompanies.length]);

  const contextValue: CompaniesContextType = {
    ...state,
    setFilters,
    setSearchTerm,
    setPagination,
    selectCompany,
    deselectCompany,
    selectAllCompanies,
    clearSelection,
    setSelectedCompany,
    resetFilters,
    createCompany,
    updateCompany,
    deleteCompany,
    refetch,
    paginatedCompanies,
    selectedCount,
    stats
  };

  return (
    <CompaniesContext.Provider value={contextValue}>
      {children}
    </CompaniesContext.Provider>
  );
};
