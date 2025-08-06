import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ValoracionesStatsProps {
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
}

export const ValoracionesStats = ({
  totalCount,
  filteredCount,
  hasActiveFilters
}: ValoracionesStatsProps) => {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <span>
        {hasActiveFilters ? (
          <>
            Mostrando <Badge variant="outline">{filteredCount}</Badge> de <Badge variant="outline">{totalCount}</Badge> valoraciones
          </>
        ) : (
          <>
            Total: <Badge variant="outline">{totalCount}</Badge> valoraciones
          </>
        )}
      </span>
    </div>
  );
};