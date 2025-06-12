
import { useMemo } from 'react';
import { Operation } from '@/types/Operation';
import { FilterState } from '@/components/OperationFilters';

export const useOperationsFilter = (operations: Operation[], filters: FilterState) => {
  return useMemo(() => {
    let filtered = [...operations];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(op => 
        op.company_name.toLowerCase().includes(searchTerm) ||
        op.sector.toLowerCase().includes(searchTerm) ||
        op.description.toLowerCase().includes(searchTerm) ||
        op.location.toLowerCase().includes(searchTerm)
      );
    }

    // Sector filter
    if (filters.sector) {
      filtered = filtered.filter(op => op.sector === filters.sector);
    }

    // Operation type filter
    if (filters.operationType) {
      filtered = filtered.filter(op => op.operation_type === filters.operationType);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(op => op.location === filters.location);
    }

    // Amount range filter
    if (filters.amountRange[0] > 0 || filters.amountRange[1] < 100) {
      const maxAmount = Math.max(...operations.map(op => op.amount || 0));
      const minRange = (filters.amountRange[0] / 100) * maxAmount;
      const maxRange = (filters.amountRange[1] / 100) * maxAmount;
      filtered = filtered.filter(op => 
        (op.amount || 0) >= minRange && (op.amount || 0) <= maxRange
      );
    }

    // Revenue range filter
    if (filters.revenueRange[0] > 0 || filters.revenueRange[1] < 100) {
      const maxRevenue = Math.max(...operations.map(op => op.revenue || 0));
      const minRange = (filters.revenueRange[0] / 100) * maxRevenue;
      const maxRange = (filters.revenueRange[1] / 100) * maxRevenue;
      filtered = filtered.filter(op => 
        (op.revenue || 0) >= minRange && (op.revenue || 0) <= maxRange
      );
    }

    // Growth rate filter
    if (filters.growthRate > 0) {
      filtered = filtered.filter(op => 
        (op.annual_growth_rate || 0) >= filters.growthRate
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(op => op.status === filters.status);
    }

    return filtered;
  }, [operations, filters]);
};
