import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOperationsPagination } from '../useOperationsPagination';
import type { Operation } from '../../types';

function makeOp(id: number, overrides: Partial<Operation> = {}): Operation {
  return {
    id: String(id),
    company_name: `Company ${id}`,
    sector: 'Tech',
    operation_type: 'sale',
    amount: id * 10,
    currency: 'EUR',
    date: new Date().toISOString(),
    status: 'available',
    description: 'Desc',
    location: 'ES',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as Operation;
}

describe('useOperationsPagination', () => {
  it('paginates correctly and navigates between pages', () => {
    const operations = Array.from({ length: 25 }, (_, i) => makeOp(i + 1));

    const { result, rerender } = renderHook(({ ops, size }) => useOperationsPagination(ops, size), {
      initialProps: { ops: operations, size: 10 },
    });

    expect(result.current.paginationConfig.page).toBe(1);
    expect(result.current.paginationConfig.totalItems).toBe(25);
    expect(result.current.paginationConfig.totalPages).toBe(3);
    expect(result.current.paginatedOperations.length).toBe(10);

    act(() => {
      result.current.goToNextPage();
      result.current.goToNextPage();
    });

    expect(result.current.paginationConfig.page).toBe(3);
    expect(result.current.paginatedOperations.length).toBe(5);

    act(() => {
      result.current.goToPreviousPage();
    });
    expect(result.current.paginationConfig.page).toBe(2);

    act(() => {
      result.current.goToPage(100);
    });
    expect(result.current.paginationConfig.page).toBe(3);

    // Rerender with different page size
    rerender({ ops: operations, size: 20 });
    expect(result.current.paginationConfig.totalPages).toBe(2);
  });
});
