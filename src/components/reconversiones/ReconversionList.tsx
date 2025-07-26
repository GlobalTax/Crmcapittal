import React from 'react';
import { ReconversionCard } from './ReconversionCard';
import { ReconversionEmptyState } from './ReconversionEmptyState';
import type { Database } from '@/integrations/supabase/types';

type Reconversion = Database['public']['Tables']['reconversiones']['Row'];

interface ReconversionListProps {
  reconversiones: Reconversion[];
  onView: (reconversion: Reconversion) => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onCreateNew?: () => void;
}

export function ReconversionList({ 
  reconversiones, 
  onView,
  hasFilters = false,
  onClearFilters,
  onCreateNew
}: ReconversionListProps) {
  if (reconversiones.length === 0) {
    return (
      <ReconversionEmptyState 
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
        onCreateNew={onCreateNew}
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reconversiones.map((reconversion) => (
        <ReconversionCard
          key={reconversion.id}
          reconversion={reconversion}
          onSelect={() => onView(reconversion)}
        />
      ))}
    </div>
  );
}