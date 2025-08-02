import { Operation } from '@/types/Operation';

export interface OperationsState {
  operations: Operation[];
  filteredOperations: Operation[];
  selectedOperations: Set<string>;
  filters: OperationFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

export interface OperationFilters {
  sector: string;
  operationType: string;
  location: string;
  amountRange: [number, number];
  revenueRange: [number, number];
  growthRate: number;
  dateRange: string;
  status: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type OperationsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_OPERATIONS'; payload: Operation[] }
  | { type: 'SET_FILTERED_OPERATIONS'; payload: Operation[] }
  | { type: 'SET_FILTERS'; payload: Partial<OperationFilters> }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_PAGINATION'; payload: Partial<PaginationState> }
  | { type: 'SELECT_OPERATION'; payload: string }
  | { type: 'DESELECT_OPERATION'; payload: string }
  | { type: 'SELECT_ALL_OPERATIONS' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ADD_OPERATION'; payload: Operation }
  | { type: 'UPDATE_OPERATION'; payload: { id: string; data: Partial<Operation> } }
  | { type: 'DELETE_OPERATION'; payload: string }
  | { type: 'RESET_FILTERS' };