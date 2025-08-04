import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { OperationsStore } from './types';
import { Operation } from '@/types/Operation';

export const useOperationsStore = create<OperationsStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Base store
        loading: false,
        error: null,
        
        // Operations state
        operations: [],
        selectedOperations: new Set(),
        filters: {},
        searchTerm: '',
        pagination: {
          page: 1,
          pageSize: 20,
        },

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

        // Operations actions
        setOperations: (operations) => {
          set((state) => {
            state.operations = operations;
            state.selectedOperations.clear();
          });
        },

        addOperation: (operation) => {
          set((state) => {
            state.operations.unshift(operation);
          });
        },

        updateOperation: (id, updates) => {
          set((state) => {
            const index = state.operations.findIndex(op => op.id === id);
            if (index !== -1) {
              state.operations[index] = { ...state.operations[index], ...updates };
            }
          });
        },

        removeOperation: (id) => {
          set((state) => {
            state.operations = state.operations.filter(op => op.id !== id);
            state.selectedOperations.delete(id);
          });
        },

        setFilters: (filters) => {
          set((state) => {
            state.filters = { ...state.filters, ...filters };
            state.pagination.page = 1; // Reset pagination when filtering
          });
        },

        setSearchTerm: (term) => {
          set((state) => {
            state.searchTerm = term;
            state.pagination.page = 1; // Reset pagination when searching
          });
        },

        toggleSelection: (id) => {
          set((state) => {
            if (state.selectedOperations.has(id)) {
              state.selectedOperations.delete(id);
            } else {
              state.selectedOperations.add(id);
            }
          });
        },

        clearSelection: () => {
          set((state) => {
            state.selectedOperations.clear();
          });
        },

        selectAll: () => {
          set((state) => {
            state.selectedOperations.clear();
            state.operations.forEach(op => state.selectedOperations.add(op.id));
          });
        },

        setPagination: (pagination) => {
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination };
          });
        },
      }))
    ),
    {
      name: 'operations-store',
    }
  )
);

// Selectors for optimized subscriptions
export const useOperations = () => useOperationsStore((state) => state.operations);
export const useOperationsLoading = () => useOperationsStore((state) => state.loading);
export const useOperationsError = () => useOperationsStore((state) => state.error);
export const useSelectedOperations = () => useOperationsStore((state) => state.selectedOperations);
export const useOperationsFilters = () => useOperationsStore((state) => state.filters);
export const useOperationsSearch = () => useOperationsStore((state) => state.searchTerm);
export const useOperationsPagination = () => useOperationsStore((state) => state.pagination);