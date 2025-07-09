import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon,
  Filter,
  X,
  Search,
} from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface MandateFilters {
  search: string;
  mandate_type: string;
  status: string;
  client_name: string;
  assigned_user: string;
  target_sectors: string;
  fecha_desde: Date | undefined;
  fecha_hasta: Date | undefined;
}

interface MandateFiltersProps {
  filters: MandateFilters;
  onFiltersChange: (filters: MandateFilters) => void;
  uniqueValues?: {
    clientNames: string[];
    assignedUsers: string[];
    targetSectors: string[];
  };
}

export const MandateFiltersComponent = ({
  filters,
  onFiltersChange,
  uniqueValues = { clientNames: [], assignedUsers: [], targetSectors: [] }
}: MandateFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState<'desde' | 'hasta' | null>(null);

  const updateFilter = (key: keyof MandateFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      mandate_type: '',
      status: '',
      client_name: '',
      assigned_user: '',
      target_sectors: '',
      fecha_desde: undefined,
      fecha_hasta: undefined,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.mandate_type) count++;
    if (filters.status) count++;
    if (filters.client_name) count++;
    if (filters.assigned_user) count++;
    if (filters.target_sectors) count++;
    if (filters.fecha_desde) count++;
    if (filters.fecha_hasta) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar mandatos..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros Avanzados</h4>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Mandate Type Filter */}
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Mandato</Label>
                  <Select
                    value={filters.mandate_type}
                    onValueChange={(value) => updateFilter('mandate_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los tipos</SelectItem>
                      <SelectItem value="compra">Compra</SelectItem>
                      <SelectItem value="venta">Venta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => updateFilter('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los estados</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Client Name Filter */}
                {uniqueValues.clientNames.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select
                      value={filters.client_name}
                      onValueChange={(value) => updateFilter('client_name', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los clientes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los clientes</SelectItem>
                        {uniqueValues.clientNames.map((client) => (
                          <SelectItem key={client} value={client}>
                            {client}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Assigned User Filter */}
                {uniqueValues.assignedUsers.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="assigned">Asignado a</Label>
                    <Select
                      value={filters.assigned_user}
                      onValueChange={(value) => updateFilter('assigned_user', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los usuarios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los usuarios</SelectItem>
                        {uniqueValues.assignedUsers.map((user) => (
                          <SelectItem key={user} value={user}>
                            {user}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Target Sectors Filter */}
                {uniqueValues.targetSectors.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="sectors">Sectores Objetivo</Label>
                    <Select
                      value={filters.target_sectors}
                      onValueChange={(value) => updateFilter('target_sectors', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los sectores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los sectores</SelectItem>
                        {uniqueValues.targetSectors.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Rango de Fechas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover 
                      open={datePickerOpen === 'desde'} 
                      onOpenChange={(open) => setDatePickerOpen(open ? 'desde' : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.fecha_desde ? format(filters.fecha_desde, "PPP", { locale: es }) : "Desde"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={filters.fecha_desde}
                          onSelect={(date) => {
                            updateFilter('fecha_desde', date);
                            setDatePickerOpen(null);
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover 
                      open={datePickerOpen === 'hasta'} 
                      onOpenChange={(open) => setDatePickerOpen(open ? 'hasta' : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.fecha_hasta ? format(filters.fecha_hasta, "PPP", { locale: es }) : "Hasta"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={filters.fecha_hasta}
                          onSelect={(date) => {
                            updateFilter('fecha_hasta', date);
                            setDatePickerOpen(null);
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.mandate_type && (
              <Badge variant="secondary" className="gap-1">
                Tipo: {filters.mandate_type}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('mandate_type', '')}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                Estado: {filters.status}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('status', '')}
                />
              </Badge>
            )}
            {filters.client_name && (
              <Badge variant="secondary" className="gap-1">
                Cliente: {filters.client_name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('client_name', '')}
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};