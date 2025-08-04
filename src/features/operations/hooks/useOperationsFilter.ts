/**
 * Operations Filter Hook
 * 
 * Hook for filtering operations based on various criteria
 */

import { useMemo } from 'react';
import { Operation, OperationFilters } from '../types';

export const useOperationsFilter = (operations: Operation[], filters: OperationFilters) => {
  const filteredOperations = useMemo(() => {
    let filtered = [...operations];

    // Búsqueda por texto
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(op =>
        op.company_name.toLowerCase().includes(searchTerm) ||
        op.project_name?.toLowerCase().includes(searchTerm) ||
        op.description?.toLowerCase().includes(searchTerm) ||
        op.sector.toLowerCase().includes(searchTerm) ||
        op.location?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por sector
    if (filters.sector && filters.sector !== '') {
      filtered = filtered.filter(op => op.sector === filters.sector);
    }

    // Filtro por tipo de operación
    if (filters.operationType && filters.operationType !== '') {
      filtered = filtered.filter(op => op.operation_type === filters.operationType);
    }

    // Filtro por ubicación
    if (filters.location && filters.location !== '') {
      filtered = filtered.filter(op => op.location === filters.location);
    }

    // Filtro por rango de monto
    if (filters.amountRange[0] !== 0 || filters.amountRange[1] !== 100) {
      const maxAmount = Math.max(...operations.map(op => op.amount));
      const minRange = (filters.amountRange[0] / 100) * maxAmount;
      const maxRange = (filters.amountRange[1] / 100) * maxAmount;
      filtered = filtered.filter(op => op.amount >= minRange && op.amount <= maxRange);
    }

    // Filtro por rango de ingresos
    if (filters.revenueRange[0] !== 0 || filters.revenueRange[1] !== 100) {
      const operationsWithRevenue = operations.filter(op => op.revenue);
      if (operationsWithRevenue.length > 0) {
        const maxRevenue = Math.max(...operationsWithRevenue.map(op => op.revenue || 0));
        const minRange = (filters.revenueRange[0] / 100) * maxRevenue;
        const maxRange = (filters.revenueRange[1] / 100) * maxRevenue;
        filtered = filtered.filter(op => {
          if (!op.revenue) return filters.revenueRange[0] === 0;
          return op.revenue >= minRange && op.revenue <= maxRange;
        });
      }
    }

    // Filtro por tasa de crecimiento
    if (filters.growthRate !== 0) {
      filtered = filtered.filter(op => {
        if (!op.annual_growth_rate) return false;
        return op.annual_growth_rate >= filters.growthRate;
      });
    }

    // Filtro por estado
    if (filters.status && filters.status !== '') {
      filtered = filtered.filter(op => op.status === filters.status);
    }

    // Filtro por rango de fechas
    if (filters.dateRange && filters.dateRange !== '') {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case 'last-week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last-month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last-3-months':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'last-year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(op => new Date(op.created_at) >= startDate);
    }

    return filtered;
  }, [operations, filters]);

  return filteredOperations;
};