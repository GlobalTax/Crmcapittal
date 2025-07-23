
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { ReconversionFilters as FilterType } from '@/types/Reconversion';
import { RECONVERSION_PHASES, RECONVERSION_PRIORITIES } from '@/utils/reconversionPhases';

interface ReconversionFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function ReconversionFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  hasActiveFilters 
}: ReconversionFiltersProps) {
  
  const handleSearchChange = (search: string) => {
    onFiltersChange({ search });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({ status: status as FilterType['status'] });
  };

  const handlePriorityChange = (priority: string) => {
    onFiltersChange({ priority: priority as FilterType['priority'] });
  };

  const handleAssignedToChange = (assignedTo: string) => {
    onFiltersChange({ assignedTo });
  };

  const removeFilter = (filterKey: keyof FilterType) => {
    switch (filterKey) {
      case 'search':
        onFiltersChange({ search: '' });
        break;
      case 'status':
        onFiltersChange({ status: 'all' });
        break;
      case 'priority':
        onFiltersChange({ priority: 'all' });
        break;
      case 'assignedTo':
        onFiltersChange({ assignedTo: 'all' });
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa, cliente o notas..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(RECONVERSION_PHASES).map(([status, phase]) => (
              <SelectItem key={status} value={status}>
                {phase.icon} {phase.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={filters.priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            {Object.entries(RECONVERSION_PRIORITIES).map(([priority, phase]) => (
              <SelectItem key={priority} value={priority}>
                {phase.icon} {phase.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assigned To Filter */}
        <Select value={filters.assignedTo} onValueChange={handleAssignedToChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Responsable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los responsables</SelectItem>
            <SelectItem value="me">Asignadas a mí</SelectItem>
            <SelectItem value="unassigned">Sin asignar</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: {filters.search}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFilter('search')}
              />
            </Badge>
          )}
          
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Estado: {RECONVERSION_PHASES[filters.status]?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFilter('status')}
              />
            </Badge>
          )}
          
          {filters.priority !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Prioridad: {RECONVERSION_PRIORITIES[filters.priority]?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFilter('priority')}
              />
            </Badge>
          )}

          {filters.assignedTo !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Responsable: {filters.assignedTo === 'me' ? 'Asignadas a mí' : 
                          filters.assignedTo === 'unassigned' ? 'Sin asignar' : 
                          filters.assignedTo}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFilter('assignedTo')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
