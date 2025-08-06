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
  Calendar,
  CalendarIcon,
  Filter,
  X,
  Search,
  Building2,
  Users,
  TrendingUp
} from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface TransaccionFilters {
  search: string;
  tipo_transaccion: string;
  prioridad: string;
  sector: string;
  propietario: string;
  valor_min: string;
  valor_max: string;
  fecha_desde: Date | undefined;
  fecha_hasta: Date | undefined;
  stage_id: string;
}

interface TransaccionFiltersProps {
  filters: TransaccionFilters;
  onFiltersChange: (filters: TransaccionFilters) => void;
  stages?: Array<{ id: string; name: string; color: string }>;
  uniqueValues?: {
    tipos: string[];
    sectores: string[];
    propietarios: string[];
  };
}

export const TransaccionFiltersComponent = ({
  filters,
  onFiltersChange,
  stages = [],
  uniqueValues = { tipos: [], sectores: [], propietarios: [] }
}: TransaccionFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState<'desde' | 'hasta' | null>(null);

  const updateFilter = (key: keyof TransaccionFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      tipo_transaccion: 'all',
      prioridad: 'all',
      sector: 'all',
      propietario: 'all',
      valor_min: '',
      valor_max: '',
      fecha_desde: undefined,
      fecha_hasta: undefined,
      stage_id: 'all'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.tipo_transaccion) count++;
    if (filters.prioridad) count++;
    if (filters.sector) count++;
    if (filters.propietario) count++;
    if (filters.valor_min) count++;
    if (filters.valor_max) count++;
    if (filters.fecha_desde) count++;
    if (filters.fecha_hasta) count++;
    if (filters.stage_id) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar transacciones..."
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
                {/* Type Filter */}
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Transacción</Label>
                  <Select
                    value={filters.tipo_transaccion}
                    onValueChange={(value) => updateFilter('tipo_transaccion', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {uniqueValues.tipos.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <Label htmlFor="prioridad">Prioridad</Label>
                  <Select
                    value={filters.prioridad}
                    onValueChange={(value) => updateFilter('prioridad', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las prioridades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las prioridades</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Stage Filter */}
                {stages.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="stage">Etapa</Label>
                    <Select
                      value={filters.stage_id}
                      onValueChange={(value) => updateFilter('stage_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las etapas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las etapas</SelectItem>
                        {stages.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: stage.color }}
                              />
                              {stage.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sector Filter */}
                {uniqueValues.sectores.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Select
                      value={filters.sector}
                      onValueChange={(value) => updateFilter('sector', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los sectores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los sectores</SelectItem>
                        {uniqueValues.sectores.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Owner Filter */}
                {uniqueValues.propietarios.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="propietario">Propietario</Label>
                    <Select
                      value={filters.propietario}
                      onValueChange={(value) => updateFilter('propietario', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los propietarios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los propietarios</SelectItem>
                        {uniqueValues.propietarios.map((propietario) => (
                          <SelectItem key={propietario} value={propietario}>
                            {propietario}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Value Range */}
                <div className="space-y-2">
                  <Label>Rango de Valor (€)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Mínimo"
                      type="number"
                      value={filters.valor_min}
                      onChange={(e) => updateFilter('valor_min', e.target.value)}
                    />
                    <Input
                      placeholder="Máximo"
                      type="number"
                      value={filters.valor_max}
                      onChange={(e) => updateFilter('valor_max', e.target.value)}
                    />
                  </div>
                </div>

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
            {filters.tipo_transaccion && (
              <Badge variant="secondary" className="gap-1">
                Tipo: {filters.tipo_transaccion}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('tipo_transaccion', '')}
                />
              </Badge>
            )}
            {filters.prioridad && (
              <Badge variant="secondary" className="gap-1">
                Prioridad: {filters.prioridad}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('prioridad', '')}
                />
              </Badge>
            )}
            {filters.sector && (
              <Badge variant="secondary" className="gap-1">
                Sector: {filters.sector}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('sector', '')}
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};