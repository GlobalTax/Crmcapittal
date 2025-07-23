
import { useState, useMemo } from 'react';
import { ReconversionFilters, Reconversion } from '@/types/Reconversion';

const defaultFilters: ReconversionFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  assignedTo: 'all',
  sector: 'all',
  investmentRange: {},
  createdDateRange: {}
};

export function useReconversionFilters(reconversiones: Reconversion[]) {
  const [filters, setFilters] = useState<ReconversionFilters>(defaultFilters);

  const updateFilters = (newFilters: Partial<ReconversionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' ||
           filters.status !== 'all' ||
           filters.priority !== 'all' ||
           filters.assignedTo !== 'all' ||
           filters.sector !== 'all' ||
           filters.investmentRange.min !== undefined ||
           filters.investmentRange.max !== undefined ||
           filters.createdDateRange.from !== undefined ||
           filters.createdDateRange.to !== undefined;
  }, [filters]);

  const filteredReconversiones = useMemo(() => {
    return reconversiones.filter(reconversion => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          reconversion.company_name,
          reconversion.contact_name,
          reconversion.rejection_reason,
          reconversion.notes,
          ...(reconversion.target_sectors || [])
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && reconversion.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && reconversion.priority !== filters.priority) {
        return false;
      }

      // Assigned to filter
      if (filters.assignedTo !== 'all') {
        if (filters.assignedTo === 'unassigned' && reconversion.assigned_to) {
          return false;
        }
        if (filters.assignedTo === 'me') {
          // This would need to be compared with current user ID
          // For now, we'll skip this logic
        }
        if (filters.assignedTo !== 'me' && 
            filters.assignedTo !== 'unassigned' && 
            reconversion.assigned_to !== filters.assignedTo) {
          return false;
        }
      }

      // Investment range filter
      if (filters.investmentRange.min && reconversion.investment_capacity_max) {
        if (reconversion.investment_capacity_max < filters.investmentRange.min) {
          return false;
        }
      }
      if (filters.investmentRange.max && reconversion.investment_capacity_min) {
        if (reconversion.investment_capacity_min > filters.investmentRange.max) {
          return false;
        }
      }

      // Date range filter
      if (filters.createdDateRange.from || filters.createdDateRange.to) {
        const createdDate = new Date(reconversion.created_at);
        if (filters.createdDateRange.from && createdDate < filters.createdDateRange.from) {
          return false;
        }
        if (filters.createdDateRange.to && createdDate > filters.createdDateRange.to) {
          return false;
        }
      }

      return true;
    });
  }, [reconversiones, filters]);

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    filteredReconversiones
  };
}
