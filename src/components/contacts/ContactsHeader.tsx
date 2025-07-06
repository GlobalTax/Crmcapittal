import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';

interface ContactsHeaderProps {
  title?: string;
  description?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (filter: string) => void;
  onNewContact?: () => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  totalCount?: number;
}

export const ContactsHeader = React.memo(({
  title = "Contactos",
  description = "Gestiona tu red de contactos",
  searchValue = "",
  onSearchChange,
  onFilterChange,
  onNewContact,
  viewMode = 'grid',
  onViewModeChange,
  totalCount
}: ContactsHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
          {totalCount !== undefined && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalCount} contacto{totalCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {/* New Contact Button */}
          {onNewContact && (
            <Button onClick={onNewContact}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contacto
            </Button>
          )}
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar contactos..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        
        {/* Filter Select */}
        {onFilterChange && (
          <Select onValueChange={onFilterChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="client">Clientes</SelectItem>
              <SelectItem value="prospect">Prospectos</SelectItem>
              <SelectItem value="partner">Socios</SelectItem>
              <SelectItem value="supplier">Proveedores</SelectItem>
              <SelectItem value="other">Otros</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
});