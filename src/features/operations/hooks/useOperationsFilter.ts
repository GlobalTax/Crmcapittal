import { useMemo } from 'react';
import { Operation } from '../types/Operation';

export interface OperationsFilterState {
  search: string;
  sector: string;
  operationType: string;
  location: string;
  amountRange: [number, number];
  revenueRange: [number, number];
  growthRate: number;
  dateRange: string;
  status: string;
}

export const useOperationsFilter = (operations: Operation[], filters: OperationsFilterState) => {
  return useMemo(() => {
    let filtered = [...operations];

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(op =>
        op.company_name?.toLowerCase().includes(searchTerm) ||
        op.sector?.toLowerCase().includes(searchTerm) ||
        op.location?.toLowerCase().includes(searchTerm) ||
        op.description?.toLowerCase().includes(searchTerm)
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

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(op => op.status === filters.status);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(op => 
        op.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Amount range filter
    if (filters.amountRange[0] > 0 || filters.amountRange[1] < 100) {
      const maxAmount = Math.max(...operations.map(op => op.amount));
      const minValue = (filters.amountRange[0] / 100) * maxAmount;
      const maxValue = (filters.amountRange[1] / 100) * maxAmount;
      filtered = filtered.filter(op => op.amount >= minValue && op.amount <= maxValue);
    }

    // Revenue range filter
    if (filters.revenueRange[0] > 0 || filters.revenueRange[1] < 100) {
      const revenues = operations.map(op => op.revenue || 0).filter(r => r > 0);
      if (revenues.length > 0) {
        const maxRevenue = Math.max(...revenues);
        const minValue = (filters.revenueRange[0] / 100) * maxRevenue;
        const maxValue = (filters.revenueRange[1] / 100) * maxRevenue;
        filtered = filtered.filter(op => {
          const revenue = op.revenue || 0;
          return revenue >= minValue && revenue <= maxValue;
        });
      }
    }

    // Growth rate filter
    if (filters.growthRate > 0) {
      filtered = filtered.filter(op => (op.annual_growth_rate || 0) >= filters.growthRate);
    }

    // Date range filter
    if (filters.dateRange) {
      const today = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case '7d':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(op => {
        const operationDate = new Date(op.created_at);
        return operationDate >= startDate;
      });
    }

    return filtered;
  }, [operations, filters]);
};