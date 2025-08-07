import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickFilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function QuickFilterTabs({ 
  activeFilter, 
  onFilterChange, 
  sortBy, 
  onSortChange 
}: QuickFilterTabsProps) {
  const filters = [
    { key: 'all', label: 'Todas' },
    { key: 'closing_soon', label: 'Por cerrar' },
    { key: 'at_risk', label: 'En riesgo' },
    { key: 'completed', label: 'Completadas' },
    { key: 'mine', label: 'Míos' },
  ];

  const sorts = [
    { key: 'value_desc', label: 'Valor ↓' },
    { key: 'date_asc', label: 'Fecha ↑' },
    { key: 'stage', label: 'Etapa' },
  ];

  return (
    <div className="flex items-center justify-between mb-4 border-b border-border">
      <div className="flex space-x-1">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeFilter === filter.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      <div className="flex space-x-2">
        {sorts.map((sort) => (
          <Button
            key={sort.key}
            variant={sortBy === sort.key ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onSortChange(sort.key)}
          >
            {sort.label}
          </Button>
        ))}
      </div>
    </div>
  );
}