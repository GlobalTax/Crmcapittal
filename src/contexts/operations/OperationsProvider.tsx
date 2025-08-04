import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useOperationsService } from '@/hooks/domain';
import { useOperationsFilter } from '@/hooks/useOperationsFilter';
import { operationsReducer, initialOperationsState } from './reducer';
import { OperationsState, OperationsAction, OperationFilters } from './types';
import { Operation } from '@/types/Operation';

interface OperationsContextType extends OperationsState {
  // Actions
  setFilters: (filters: Partial<OperationFilters>) => void;
  setSearchTerm: (term: string) => void;
  setPagination: (pagination: Partial<OperationsState['pagination']>) => void;
  selectOperation: (id: string) => void;
  deselectOperation: (id: string) => void;
  selectAllOperations: () => void;
  clearSelection: () => void;
  resetFilters: () => void;
  
  // Operations
  createOperation: (data: any) => Promise<void>;
  updateOperation: (id: string, data: Partial<Operation>) => Promise<void>;
  deleteOperation: (id: string) => Promise<void>;
  refetch: () => void;
  
  // Computed values
  paginatedOperations: Operation[];
  selectedCount: number;
  stats: {
    total: number;
    available: number;
    filtered: number;
    totalValue: number;
    avgValue: number;
  };
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const useOperationsContext = () => {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperationsContext must be used within an OperationsProvider');
  }
  return context;
};

interface OperationsProviderProps {
  children: React.ReactNode;
}

export const OperationsProvider: React.FC<OperationsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(operationsReducer, initialOperationsState);
  const { operations, isLoading, error, refetch, createOperation: createOp } = useOperationsService();

  // Sync external data with internal state
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Error al cargar operaciones' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [error]);

  useEffect(() => {
    if (operations) {
      dispatch({ type: 'SET_OPERATIONS', payload: operations as any });
    }
  }, [operations]);

  // Apply filters using existing hook with proper memoization
  const filtersForQuery = useMemo(() => ({
    search: state.searchTerm,
    ...state.filters
  }), [state.searchTerm, state.filters]);

  const filteredOperations = useOperationsFilter(state.operations, filtersForQuery);

  useEffect(() => {
    dispatch({ type: 'SET_FILTERED_OPERATIONS', payload: filteredOperations });
  }, [filteredOperations]);

  // Actions
  const setFilters = useCallback((filters: Partial<OperationFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  const setPagination = useCallback((pagination: Partial<OperationsState['pagination']>) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  }, []);

  const selectOperation = useCallback((id: string) => {
    dispatch({ type: 'SELECT_OPERATION', payload: id });
  }, []);

  const deselectOperation = useCallback((id: string) => {
    dispatch({ type: 'DESELECT_OPERATION', payload: id });
  }, []);

  const selectAllOperations = useCallback(() => {
    dispatch({ type: 'SELECT_ALL_OPERATIONS' });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Operations
  const createOperation = useCallback(async (data: any) => {
    try {
      await createOp(data);
      refetch();
    } catch (error) {
      console.error('Error creating operation:', error);
    }
  }, [createOp, refetch]);

  const updateOperation = useCallback(async (id: string, data: Partial<Operation>) => {
    dispatch({ type: 'UPDATE_OPERATION', payload: { id, data } });
    // TODO: Call actual update service
  }, []);

  const deleteOperation = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_OPERATION', payload: id });
    // TODO: Call actual delete service
  }, []);

  // Computed values
  const paginatedOperations = useMemo(() => {
    const startIndex = (state.pagination.page - 1) * state.pagination.pageSize;
    const endIndex = startIndex + state.pagination.pageSize;
    return state.filteredOperations.slice(startIndex, endIndex);
  }, [state.filteredOperations, state.pagination.page, state.pagination.pageSize]);

  const selectedCount = useMemo(() => state.selectedOperations.size, [state.selectedOperations]);

  const stats = useMemo(() => {
    const total = state.operations.length;
    const available = state.operations.filter(op => op.status === 'available').length;
    const totalValue = state.operations.reduce((sum, op) => sum + op.amount, 0);
    const avgValue = total > 0 ? totalValue / total : 0;
    
    return {
      total,
      available,
      filtered: state.filteredOperations.length,
      totalValue,
      avgValue
    };
  }, [state.operations, state.filteredOperations.length]);

  const contextValue: OperationsContextType = {
    ...state,
    setFilters,
    setSearchTerm,
    setPagination,
    selectOperation,
    deselectOperation,
    selectAllOperations,
    clearSelection,
    resetFilters,
    createOperation,
    updateOperation,
    deleteOperation,
    refetch,
    paginatedOperations,
    selectedCount,
    stats
  };

  return (
    <OperationsContext.Provider value={contextValue}>
      {children}
    </OperationsContext.Provider>
  );
};