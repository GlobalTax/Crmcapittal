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
    <div className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="space-y-4">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h1>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            {totalCount !== undefined && (
              <p className="text-sm text-gray-500 mt-1">
                {totalCount} contacto{totalCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            {onViewModeChange && (
              <div className="flex items-center border border-gray-200 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                  className="h-8 rounded-r-none border-0"
                >
                  <Grid className="w-3 h-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  className="h-8 rounded-l-none border-0"
                >
                  <List className="w-3 h-3" />
                </Button>
              </div>
            )}
            
            {/* New Contact Button */}
            {onNewContact && (
              <Button onClick={onNewContact} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Contacto
              </Button>
            )}
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          {onSearchChange && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar contactos..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
              />
            </div>
          )}
          
          {/* Filter Select */}
          {onFilterChange && (
            <Select onValueChange={onFilterChange}>
              <SelectTrigger className="w-full sm:w-[200px] border-gray-200">
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
    </div>
  );
});