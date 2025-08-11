import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOperationsOptimized } from '../useOperationsOptimized';
import type { Operation, OperationFilters } from '../../types';

function makeOp(id: number, overrides: Partial<Operation> = {}): Operation {
  return {
    id: String(id),
    company_name: overrides.company_name ?? `Company ${id}`,
    sector: overrides.sector ?? (id % 2 === 0 ? 'Tech' : 'Finance'),
    operation_type: overrides.operation_type ?? 'sale',
    amount: overrides.amount ?? id * 100,
    currency: 'EUR',
    date: new Date().toISOString(),
    status: overrides.status ?? (id % 2 === 0 ? 'available' : 'archived'),
    description: overrides.description ?? 'Some description',
    location: overrides.location ?? 'ES',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Operation;
}

const mockOps: Operation[] = Array.from({ length: 25 }, (_, i) => makeOp(i + 1));

// Mock del hook base para evitar dependencias externas
vi.mock('../useOperations', () => ({
  useOperations: () => ({
    operations: mockOps,
    loading: false,
    error: null,
  }),
}));

const baseFilters: OperationFilters = {
  search: '',
  sector: '',
  operationType: '',
  location: '',
  amountRange: [0, 100],
  revenueRange: [0, 100],
  growthRate: 0,
  dateRange: '',
  status: '',
};

describe('useOperationsOptimized', () => {
  it('calcula estadísticas y pagina correctamente', () => {
    const { result } = renderHook(() => useOperationsOptimized(baseFilters, 10));

    expect(result.current.paginationConfig.page).toBe(1);
    expect(result.current.operations.length).toBe(10);

    // Stats
    expect(result.current.stats.total).toBe(25);
    const availableCount = mockOps.filter(o => o.status === 'available').length;
    expect(result.current.stats.available).toBe(availableCount);

    const totalValue = mockOps.reduce((sum, o) => sum + (o.amount || 0), 0);
    expect(result.current.stats.totalValue).toBe(totalValue);
    expect(result.current.stats.avgValue).toBeCloseTo(totalValue / 25);

    // Filtradas debe coincidir inicialmente con total
    expect(result.current.stats.filtered).toBe(25);
  });

  it('resetea la paginación al cambiar filtros', () => {
    const { result, rerender } = renderHook(
      ({ filters, size }) => useOperationsOptimized(filters, size),
      { initialProps: { filters: baseFilters, size: 10 } }
    );

    act(() => {
      result.current.goToNextPage(); // page 2
      result.current.goToNextPage(); // page 3
    });
    expect(result.current.paginationConfig.page).toBe(3);

    // Cambiamos filtro de búsqueda que activa hasActiveFilters
    const newFilters: OperationFilters = { ...baseFilters, search: 'Company 12' };
    rerender({ filters: newFilters, size: 10 });

    // Debe resetear a página 1
    expect(result.current.paginationConfig.page).toBe(1);

    // Y filtrar a un único resultado
    expect(result.current.filteredOperations.length).toBe(1);
    expect(result.current.filteredOperations[0].company_name).toBe('Company 12');
  });
});
