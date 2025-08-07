import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: 'status' | 'company' | 'tags';
}

interface ModernContactsHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCreateContact: () => void;
  activeFilters?: FilterChip[];
  onRemoveFilter?: (filterId: string) => void;
  onAddFilter?: (filter: FilterChip) => void;
  onClearAllFilters?: () => void;
  totalCount: number;
}

export const ModernContactsHeader = ({
  searchValue,
  onSearchChange,
  onCreateContact,
  activeFilters = [],
  onRemoveFilter,
  onAddFilter,
  onClearAllFilters,
  totalCount
}: ModernContactsHeaderProps) => {
  const [isAddingFilter, setIsAddingFilter] = useState(false);

  const handleAddStatusFilter = (status: string, label: string) => {
    onAddFilter?.({
      id: `status-${status}`,
      label: `Estado: ${label}`,
      value: status,
      type: 'status'
    });
    setIsAddingFilter(false);
  };

  const handleAddCompanyFilter = () => {
    // This would typically open a company selector
    // For now, we'll add a placeholder
    onAddFilter?.({
      id: `company-example`,
      label: `Empresa: Ejemplo Corp`,
      value: 'ejemplo-corp',
      type: 'company'
    });
    setIsAddingFilter(false);
  };

  return (
    <div className="space-y-6">
      {/* Title and Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu red de contactos profesionales
          </p>
        </div>
        <Button onClick={onCreateContact} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo contacto
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar contactos..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 border-border focus:border-primary"
        />
      </div>

      {/* Filters Section */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Active Filters */}
        {activeFilters.map((filter) => (
          <Badge
            key={filter.id}
            variant="secondary"
            className="px-3 py-1 flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20"
          >
            {filter.label}
            <button
              onClick={() => onRemoveFilter?.(filter.id)}
              className="hover:bg-primary/20 rounded p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Add Filter Dropdown */}
        <DropdownMenu open={isAddingFilter} onOpenChange={setIsAddingFilter}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-muted-foreground">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">ESTADO</div>
              <DropdownMenuItem onClick={() => handleAddStatusFilter('active', 'Activo')}>
                Activo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddStatusFilter('blocked', 'Bloqueado')}>
                Bloqueado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddStatusFilter('archived', 'Archivado')}>
                Archivado
              </DropdownMenuItem>
            </div>
            <div className="border-t px-2 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">EMPRESA</div>
              <DropdownMenuItem onClick={handleAddCompanyFilter}>
                Buscar empresa...
              </DropdownMenuItem>
            </div>
            <div className="border-t px-2 py-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">ETIQUETAS</div>
              <DropdownMenuItem onClick={() => console.log('Add tag filter')}>
                Buscar etiquetas...
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear All Filters */}
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpiar filtros
          </Button>
        )}

        {/* Results Count */}
        <div className="ml-auto text-sm text-muted-foreground">
          {totalCount} contacto{totalCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};