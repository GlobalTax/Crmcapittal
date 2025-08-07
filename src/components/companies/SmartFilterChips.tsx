import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface SmartFilterChipsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  activeChips?: string[];
  onRemoveChip?: (chip: string) => void;
}

export const SmartFilterChips = ({ 
  activeFilter, 
  onFilterChange, 
  activeChips = [], 
  onRemoveChip 
}: SmartFilterChipsProps) => {
  const filters = [
    { id: 'all', label: 'Todas' },
    { id: 'with_deals', label: 'Con deals' },
    { id: 'no_activity', label: 'Sin actividad' },
    { id: 'tech', label: 'Sector: Tech' },
    { id: 'large', label: 'Tamaño: Grande' }
  ];

  return (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeFilter === filter.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          {activeChips.map((chip) => (
            <Badge
              key={chip}
              variant="secondary"
              className="flex items-center gap-1 pl-2 pr-1"
            >
              <span className="text-xs">{chip}</span>
              <button
                onClick={() => onRemoveChip?.(chip)}
                className="ml-1 hover:bg-muted/80 rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};