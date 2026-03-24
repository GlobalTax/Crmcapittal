import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OperationsGrid } from '../OperationsGrid';
import { BrowserRouter } from 'react-router-dom';
import type { Operation } from '@/types/Operation';

function makeOp(id: number, overrides: Partial<Operation> = {}): Operation {
  return {
    id: String(id),
    company_name: overrides.company_name ?? `Company ${id}`,
    sector: overrides.sector ?? (id % 2 === 0 ? 'Tech' : 'Finance'),
    operation_type: overrides.operation_type ?? 'sale',
    amount: overrides.amount ?? id * 100,
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

describe('OperationsGrid (UI smoke)', () => {
  it('renderiza el grid y los items básicos', () => {
    const ops: Operation[] = [makeOp(1), makeOp(2), makeOp(3)];

    render(
      <BrowserRouter>
        <OperationsGrid 
          operations={ops} 
          onToggleFavorite={() => {}}
          isFavorite={() => false}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('operations-grid')).toBeInTheDocument();

    // Debe mostrar los nombres de compañía de cada tarjeta
    expect(screen.getByText('Company 1')).toBeInTheDocument();
    expect(screen.getByText('Company 2')).toBeInTheDocument();
    expect(screen.getByText('Company 3')).toBeInTheDocument();
  });
});
