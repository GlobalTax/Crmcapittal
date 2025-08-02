import { Company } from '@/types/Company';

export interface CompaniesState {
  companies: Company[];
  filteredCompanies: Company[];
  selectedCompanies: Set<string>;
  filters: CompanyFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCompany: Company | null;
}

export interface CompanyFilters {
  sector: string;
  location: string;
  revenueRange: [number, number];
  employeeRange: [number, number];
  companyType: string;
  status: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type CompaniesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COMPANIES'; payload: Company[] }
  | { type: 'SET_FILTERED_COMPANIES'; payload: Company[] }
  | { type: 'SET_FILTERS'; payload: Partial<CompanyFilters> }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_PAGINATION'; payload: Partial<PaginationState> }
  | { type: 'SELECT_COMPANY'; payload: string }
  | { type: 'DESELECT_COMPANY'; payload: string }
  | { type: 'SELECT_ALL_COMPANIES' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SELECTED_COMPANY'; payload: Company | null }
  | { type: 'ADD_COMPANY'; payload: Company }
  | { type: 'UPDATE_COMPANY'; payload: { id: string; data: Partial<Company> } }
  | { type: 'DELETE_COMPANY'; payload: string }
  | { type: 'RESET_FILTERS' };