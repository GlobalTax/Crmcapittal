import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { OptimizedStageColumn } from '@/components/deals/OptimizedStageColumn';
import { Deal } from '@/types/Deal';

const makeDeal = (overrides: Partial<Deal>): Deal => ({
  id: overrides.id || Math.random().toString(36).slice(2),
  title: overrides.title || 'Test Deal',
  amount: overrides.amount ?? 1000000,
  stage: overrides.stage || 'Lead',
  probability: overrides.probability ?? 25,
  companyId: overrides.companyId,
  ownerId: overrides.ownerId,
  createdAt: overrides.createdAt || new Date().toISOString(),
  updatedAt: overrides.updatedAt || new Date().toISOString(),
  company: overrides.company || { id: 'c1', name: 'Acme Corp' },
  owner: overrides.owner || { id: 'u1', name: 'User One', email: 'u1@example.com' },
});

const stage = { id: 'stage-1', name: 'Lead', color: '#888' };

describe('OptimizedStageColumn accessibility', () => {
  it('renders a list with listitems matching deals count', () => {
    const deals: Deal[] = [
      makeDeal({ id: 'd1', title: 'Deal 1', probability: 10 }),
      makeDeal({ id: 'd2', title: 'Deal 2', probability: 50 }),
      makeDeal({ id: 'd3', title: 'Deal 3', probability: 80 }),
    ];

    render(
      <DndContext>
        <OptimizedStageColumn 
          stage={stage}
          deals={deals}
          onNewDeal={() => {}}
        />
      </DndContext>
    );

    const list = screen.getByRole('list', { name: /lead - deals/i });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(deals.length);
  });

  it('updates order when deals prop changes', () => {
    const dealsA: Deal[] = [
      makeDeal({ id: 'd1', title: 'A' }),
      makeDeal({ id: 'd2', title: 'B' }),
    ];

    const { rerender } = render(
      <DndContext>
        <OptimizedStageColumn 
          stage={stage}
          deals={dealsA}
          onNewDeal={() => {}}
        />
      </DndContext>
    );

    const list = screen.getByRole('list', { name: /lead - deals/i });
    let items = within(list).getAllByRole('listitem');
    expect(items[0]).toHaveAccessibleName(/A/i);
    expect(items[1]).toHaveAccessibleName(/B/i);

    const dealsB: Deal[] = [dealsA[1], dealsA[0]];

    rerender(
      <DndContext>
        <OptimizedStageColumn 
          stage={stage}
          deals={dealsB}
          onNewDeal={() => {}}
        />
      </DndContext>
    );

    items = within(list).getAllByRole('listitem');
    expect(items[0]).toHaveAccessibleName(/B/i);
    expect(items[1]).toHaveAccessibleName(/A/i);
  });
});
