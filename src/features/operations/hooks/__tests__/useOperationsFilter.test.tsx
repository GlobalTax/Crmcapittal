import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOperationsFilter } from '../useOperationsFilter';
import type { Operation, OperationFilters } from '../../types';

function makeOp(id: number, overrides: Partial<Operation> = {}): Operation {
  return {
    id: String(id),
    company_name: overrides.company_name ?? `Company ${id}`,
    sector: overrides.sector ?? (id % 2 === 0 ? 'Tech' : 'Finance'),
    operation_type: overrides.operation_type ?? 'sale',
    amount: overrides.amount ?? (id * 100),
    currency: 'EUR',
    date: new Date().toISOString(),
    status: 'available',
    description: overrides.description ?? 'Some description',
    location: overrides.location ?? 'ES',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Operation;
}

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

describe('useOperationsFilter', () => {
  const ops: Operation[] = [
    makeOp(1, { company_name: 'Acme Corp', sector: 'Tech', amount: 100 }),
    makeOp(2, { company_name: 'Beta Ltd', sector: 'Finance', amount: 200 }),
    makeOp(3, { company_name: 'Gamma SA', sector: 'Tech', amount: 300 }),
  ];

  it('filters by search term', () => {
    const { result, rerender } = renderHook(({ filters }) => useOperationsFilter(ops, filters), {
      initialProps: { filters: { ...baseFilters, search: 'acme' } },
    });

    expect(result.current.length).toBe(1);
    expect(result.current[0].company_name).toBe('Acme Corp');

    rerender({ filters: { ...baseFilters, search: 'gamma' } });
    expect(result.current.length).toBe(1);
    expect(result.current[0].company_name).toBe('Gamma SA');
  });

  it('filters by sector', () => {
    const { result } = renderHook(({ filters }) => useOperationsFilter(ops, filters), {
      initialProps: { filters: { ...baseFilters, sector: 'Tech' } },
    });

    expect(result.current.length).toBe(2);
    expect(result.current.every(op => op.sector === 'Tech')).toBe(true);
  });

  it('filters by amountRange relative to max amount', () => {
    // Max amount is 300, so [0, 50] keeps <= 150
    const { result } = renderHook(({ filters }) => useOperationsFilter(ops, filters), {
      initialProps: { filters: { ...baseFilters, amountRange: [0, 50] as [number, number] } },
    });

    expect(result.current.map(o => o.amount)).toEqual([100]);
  });
});
