import { useState, useEffect, useMemo } from 'react';
import { Negocio } from '@/types/Negocio';

export interface FilterState {
  search: string;
  owner: string;
  priority: string;
  sector: string;
  location: string;
  valueRange: {
    min: number | null;
    max: number | null;
  };
  dateRange: {
    start: string;
    end: string;
  };
  stage: string;
}

export interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
  isDefault: boolean;
  createdAt: string;
}

const defaultFilters: FilterState = {
  search: '',
  owner: 'all',
  priority: 'all',
  sector: 'all',
  location: 'all',
  valueRange: { min: null, max: null },
  dateRange: { start: '', end: '' },
  stage: 'all'
};

/**
 * useAdvancedFilters Hook
 * 
 * Advanced filtering system with URL state sync, saved views, and comprehensive search.
 * Provides powerful filtering capabilities similar to professional CRM systems.
 * 
 * @param negocios - Array of business deals to filter
 * @returns Filtered data, filter controls, and saved views management
 */
export const useAdvancedFilters = (negocios: Negocio[]) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  /**
   * Updates URL parameters when filters change (simplified for now)
   */
  useEffect(() => {
    // URL sync functionality could be added here if needed
    // For now, we'll focus on the filtering functionality
  }, [filters]);

  /**
   * Load saved views from localStorage
   */
  useEffect(() => {
    const saved = localStorage.getItem('negocios-saved-views');
    if (saved) {
      try {
        setSavedViews(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved views:', error);
      }
    }
  }, []);

  /**
   * Save views to localStorage when changed
   */
  useEffect(() => {
    localStorage.setItem('negocios-saved-views', JSON.stringify(savedViews));
  }, [savedViews]);

  /**
   * Updates a specific filter
   * @param key - Filter key to update
   * @param value - New filter value
   */
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Resets all filters to default values
   */
  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  /**
   * Checks if a negocio matches the text search
   * @param negocio - Business deal to check
   * @param searchTerm - Search term to match against
   * @returns Boolean indicating if it matches
   */
  const matchesSearch = (negocio: Negocio, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    const searchFields = [
      negocio.nombre_negocio,
      negocio.descripcion,
      negocio.company?.name,
      negocio.contact?.name,
      negocio.contact?.email,
      negocio.propietario_negocio,
      negocio.sector,
      negocio.ubicacion,
      negocio.fuente_lead,
      negocio.notas
    ];

    return searchFields.some(field => 
      field?.toLowerCase().includes(term)
    );
  };

  /**
   * Checks if a negocio matches the date range filter
   * @param negocio - Business deal to check
   * @returns Boolean indicating if it matches date range
   */
  const matchesDateRange = (negocio: Negocio): boolean => {
    if (!filters.dateRange.start && !filters.dateRange.end) return true;
    
    const negocioDate = new Date(negocio.created_at);
    const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
    const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
    
    if (startDate && negocioDate < startDate) return false;
    if (endDate && negocioDate > endDate) return false;
    
    return true;
  };

  /**
   * Checks if a negocio matches the value range filter
   * @param negocio - Business deal to check
   * @returns Boolean indicating if it matches value range
   */
  const matchesValueRange = (negocio: Negocio): boolean => {
    const { min, max } = filters.valueRange;
    const value = negocio.valor_negocio || 0;
    
    if (min !== null && value < min) return false;
    if (max !== null && value > max) return false;
    
    return true;
  };

  /**
   * Filtered negocios based on all active filters
   */
  const filteredNegocios = useMemo(() => {
    return negocios.filter(negocio => {
      // Text search
      if (!matchesSearch(negocio, filters.search)) return false;
      
      // Owner filter
      if (filters.owner && filters.owner !== 'all' && negocio.propietario_negocio !== filters.owner) return false;
      
      // Priority filter
      if (filters.priority && filters.priority !== 'all' && negocio.prioridad !== filters.priority) return false;
      
      // Sector filter
      if (filters.sector && filters.sector !== 'all' && negocio.sector !== filters.sector) return false;
      
      // Location filter
      if (filters.location && filters.location !== 'all' && negocio.ubicacion !== filters.location) return false;
      
      // Stage filter
      if (filters.stage && filters.stage !== 'all' && negocio.stage_id !== filters.stage) return false;
      
      // Value range filter
      if (!matchesValueRange(negocio)) return false;
      
      // Date range filter
      if (!matchesDateRange(negocio)) return false;
      
      return true;
    });
  }, [negocios, filters]);

  /**
   * Gets unique values for select filters
   */
  const filterOptions = useMemo(() => {
    const unique = (arr: (string | undefined)[]) => 
      Array.from(new Set(arr.filter(Boolean))).sort();

    return {
      owners: unique(negocios.map(n => n.propietario_negocio)),
      priorities: unique(negocios.map(n => n.prioridad)),
      sectors: unique(negocios.map(n => n.sector)),
      locations: unique(negocios.map(n => n.ubicacion)),
      stages: unique(negocios.map(n => n.stage?.name))
    };
  }, [negocios]);

  /**
   * Saves current filter state as a new view
   * @param name - Name for the saved view
   * @param isDefault - Whether this should be the default view
   */
  const saveView = (name: string, isDefault: boolean = false) => {
    const newView: SavedView = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      isDefault,
      createdAt: new Date().toISOString()
    };

    setSavedViews(prev => {
      // If this is default, remove default from others
      const updated = isDefault 
        ? prev.map(v => ({ ...v, isDefault: false }))
        : prev;
      return [...updated, newView];
    });
  };

  /**
   * Loads a saved view
   * @param viewId - ID of the view to load
   */
  const loadView = (viewId: string) => {
    const view = savedViews.find(v => v.id === viewId);
    if (view) {
      setFilters(view.filters);
    }
  };

  /**
   * Deletes a saved view
   * @param viewId - ID of the view to delete
   */
  const deleteView = (viewId: string) => {
    setSavedViews(prev => prev.filter(v => v.id !== viewId));
  };

  /**
   * Checks if any filters are currently active
   */
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'valueRange') {
        return value.min !== null || value.max !== null;
      }
      if (key === 'dateRange') {
        return value.start !== '' || value.end !== '';
      }
      return value !== '' && value !== defaultFilters[key as keyof FilterState];
    });
  }, [filters]);

  /**
   * Gets count of active filters
   */
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'valueRange') {
        if (value.min !== null) count++;
        if (value.max !== null) count++;
      } else if (key === 'dateRange') {
        if (value.start) count++;
        if (value.end) count++;
      } else if (value !== '' && value !== defaultFilters[key as keyof FilterState]) {
        count++;
      }
    });
    return count;
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredNegocios,
    filterOptions,
    savedViews,
    saveView,
    loadView,
    deleteView,
    hasActiveFilters,
    activeFiltersCount,
    isFiltersOpen,
    setIsFiltersOpen
  };
};