
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { logger } from '@/utils/logger';

interface UseOptimizedSearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterFn?: (item: T, searchTerm: string, filters: Record<string, any>) => boolean;
  debounceMs?: number;
  minSearchLength?: number;
}

export function useOptimizedSearch<T>({
  data,
  searchFields,
  filterFn,
  debounceMs = 300,
  minSearchLength = 2
}: UseOptimizedSearchOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  
  const filteredData = useMemo(() => {
    const startTime = performance.now();
    
    let result = data;
    
    // Aplicar búsqueda de texto
    if (debouncedSearchTerm && debouncedSearchTerm.length >= minSearchLength) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      
      if (filterFn) {
        result = result.filter(item => filterFn(item, searchLower, filters));
      } else {
        result = result.filter(item =>
          searchFields.some(field => {
            const value = item[field];
            return value && String(value).toLowerCase().includes(searchLower);
          })
        );
      }
    }
    
    // Aplicar filtros adicionales
    if (Object.keys(filters).length > 0) {
      result = result.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value || value === 'all') return true;
          const itemValue = (item as any)[key];
          return itemValue === value;
        });
      });
    }
    
    const endTime = performance.now();
    logger.debug(`Search completed in ${endTime - startTime}ms`, {
      searchTerm: debouncedSearchTerm,
      resultCount: result.length,
      totalItems: data.length
    });
    
    return result;
  }, [data, debouncedSearchTerm, filters, searchFields, filterFn, minSearchLength]);
  
  // Manejar el estado de búsqueda por separado
  const [searchingState, setSearchingState] = useState(false);
  
  // Efecto para manejar el estado de búsqueda
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setSearchingState(true);
    } else {
      setSearchingState(false);
    }
  }, [debouncedSearchTerm, searchTerm]);
  
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);
  
  const hasActiveFilters = useMemo(() => {
    return searchTerm.length > 0 || Object.values(filters).some(value => value && value !== 'all');
  }, [searchTerm, filters]);
  
  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    filteredData,
    isSearching: searchingState,
    hasActiveFilters,
    resultCount: filteredData.length,
    totalCount: data.length
  };
}
