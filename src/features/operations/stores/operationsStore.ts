import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Operation } from '../types/Operation';
import { OperationFilters } from '../types/OperationFilters';
import { PaginationConfig } from '@/shared/types/common';

interface OperationsState {
  // Data
  operations: Operation[];
  filteredOperations: Operation[];
  selectedOperations: Set<string>;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Filters & Search
  filters: OperationFilters;
  searchTerm: string;
  
  // Pagination
  pagination: PaginationConfig;
}

interface OperationsActions {
  // Data Actions
  setOperations: (operations: Operation[]) => void;
  addOperation: (operation: Operation) => void;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  removeOperation: (id: string) => void;
  
  // Selection Actions
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Filter Actions
  setFilters: (filters: Partial<OperationFilters>) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Pagination Actions
  setPagination: (pagination: Partial<PaginationConfig>) => void;
  goToPage: (page: number) => void;
  
  // Computed Actions
  applyFilters: () => void;
}

type OperationsStore = OperationsState & OperationsActions;

const initialState: OperationsState = {
  operations: [],
  filteredOperations: [],
  selectedOperations: new Set(),
  loading: false,
  error: null,
  filters: {},
  searchTerm: '',
  pagination: {
    page: 1,
    pageSize: 12,
    totalItems: 0,
    totalPages: 0
  }
};

export const useOperationsStore = create<OperationsStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,
        
        // Data Actions
        setOperations: (operations) => set((state) => {
          state.operations = operations;
          state.filteredOperations = operations;
          state.pagination.totalItems = operations.length;
          state.pagination.totalPages = Math.ceil(operations.length / state.pagination.pageSize);
        }),
        
        addOperation: (operation) => set((state) => {
          state.operations.unshift(operation);
          get().applyFilters();
        }),
        
        updateOperation: (id, updates) => set((state) => {
          const index = state.operations.findIndex(op => op.id === id);
          if (index !== -1) {
            state.operations[index] = { ...state.operations[index], ...updates };
            get().applyFilters();
          }
        }),
        
        removeOperation: (id) => set((state) => {
          state.operations = state.operations.filter(op => op.id !== id);
          state.selectedOperations.delete(id);
          get().applyFilters();
        }),
        
        // Selection Actions
        toggleSelection: (id) => set((state) => {
          if (state.selectedOperations.has(id)) {
            state.selectedOperations.delete(id);
          } else {
            state.selectedOperations.add(id);
          }
        }),
        
        clearSelection: () => set((state) => {
          state.selectedOperations.clear();
        }),
        
        selectAll: () => set((state) => {
          state.selectedOperations = new Set(state.filteredOperations.map(op => op.id));
        }),
        
        // Filter Actions
        setFilters: (filters) => set((state) => {
          state.filters = { ...state.filters, ...filters };
          get().applyFilters();
        }),
        
        setSearchTerm: (term) => set((state) => {
          state.searchTerm = term;
          get().applyFilters();
        }),
        
        clearFilters: () => set((state) => {
          state.filters = {};
          state.searchTerm = '';
          get().applyFilters();
        }),
        
        // UI Actions
        setLoading: (loading) => set((state) => {
          state.loading = loading;
        }),
        
        setError: (error) => set((state) => {
          state.error = error;
        }),
        
        // Pagination Actions
        setPagination: (pagination) => set((state) => {
          state.pagination = { ...state.pagination, ...pagination };
        }),
        
        goToPage: (page) => set((state) => {
          state.pagination.page = Math.max(1, Math.min(page, state.pagination.totalPages));
        }),
        
        // Computed Actions
        applyFilters: () => set((state) => {
          let filtered = [...state.operations];
          
          // Apply search
          if (state.searchTerm) {
            const search = state.searchTerm.toLowerCase();
            filtered = filtered.filter(op =>
              op.company_name.toLowerCase().includes(search) ||
              op.sector.toLowerCase().includes(search) ||
              op.location.toLowerCase().includes(search) ||
              op.description.toLowerCase().includes(search)
            );
          }
          
          // Apply filters
          if (state.filters.sector) {
            filtered = filtered.filter(op => op.sector === state.filters.sector);
          }
          
          if (state.filters.status) {
            filtered = filtered.filter(op => op.status === state.filters.status);
          }
          
          if (state.filters.location) {
            filtered = filtered.filter(op => op.location === state.filters.location);
          }
          
          if (state.filters.min_amount) {
            filtered = filtered.filter(op => op.amount >= state.filters.min_amount!);
          }
          
          if (state.filters.max_amount) {
            filtered = filtered.filter(op => op.amount <= state.filters.max_amount!);
          }
          
          state.filteredOperations = filtered;
          state.pagination.totalItems = filtered.length;
          state.pagination.totalPages = Math.ceil(filtered.length / state.pagination.pageSize);
          
          // Reset to page 1 if current page is out of bounds
          if (state.pagination.page > state.pagination.totalPages && state.pagination.totalPages > 0) {
            state.pagination.page = 1;
          }
        })
      }))
    ),
    { name: 'operations-store' }
  )
);

// Selectors for optimized subscriptions
export const useOperations = () => useOperationsStore(state => state.operations);
export const useFilteredOperations = () => useOperationsStore(state => state.filteredOperations);
export const useOperationsLoading = () => useOperationsStore(state => state.loading);
export const useOperationsError = () => useOperationsStore(state => state.error);
export const useSelectedOperations = () => useOperationsStore(state => state.selectedOperations);
export const useOperationsFilters = () => useOperationsStore(state => state.filters);
export const useOperationsSearch = () => useOperationsStore(state => state.searchTerm);
export const useOperationsPagination = () => useOperationsStore(state => state.pagination);