import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X, Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { ReconversionFilters as FilterType } from '@/types/Reconversion';
import { RECONVERSION_PHASES, RECONVERSION_PRIORITIES } from '@/utils/reconversionPhases';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdvancedReconversionFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const SECTOR_OPTIONS = [
  'Tecnología',
  'Finanzas',
  'Salud',
  'Educación',
  'Comercio',
  'Industria',
  'Servicios',
  'Inmobiliario',
  'Energía',
  'Turismo'
];

export function AdvancedReconversionFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  hasActiveFilters 
}: AdvancedReconversionFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [investmentRange, setInvestmentRange] = useState([
    filters.investmentRange.min || 0,
    filters.investmentRange.max || 5000000
  ]);
  
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

  const handleSectorChange = (sector: string) => {
    onFiltersChange({ sector });
  };

  const handleDateRangeChange = (field: 'from' | 'to', date: Date | undefined) => {
    onFiltersChange({
      createdDateRange: {
        ...filters.createdDateRange,
        [field]: date
      }
    });
  };

  const handleInvestmentRangeChange = (values: number[]) => {
    setInvestmentRange(values);
    onFiltersChange({
      investmentRange: {
        min: values[0],
        max: values[1]
      }
    });
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
      case 'sector':
        onFiltersChange({ sector: 'all' });
        break;
      case 'investmentRange':
        onFiltersChange({ investmentRange: {} });
        setInvestmentRange([0, 5000000]);
        break;
      case 'createdDateRange':
        onFiltersChange({ createdDateRange: {} });
        break;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative lg:col-span-2">
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
          <SelectTrigger>
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
          <SelectTrigger>
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
      </div>

      {/* Advanced Filters Collapsible */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avanzados
            </span>
            {isAdvancedOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Assigned To Filter */}
            <Select value={filters.assignedTo} onValueChange={handleAssignedToChange}>
              <SelectTrigger>
                <SelectValue placeholder="Responsable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los responsables</SelectItem>
                <SelectItem value="me">Asignadas a mí</SelectItem>
                <SelectItem value="unassigned">Sin asignar</SelectItem>
              </SelectContent>
            </Select>

            {/* Sector Filter */}
            <Select value={filters.sector} onValueChange={handleSectorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sectores</SelectItem>
                {SECTOR_OPTIONS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range */}
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal flex-1",
                      !filters.createdDateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.createdDateRange.from ? (
                      format(filters.createdDateRange.from, "dd/MM/yyyy", { locale: es })
                    ) : (
                      "Desde"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.createdDateRange.from}
                    onSelect={(date) => handleDateRangeChange('from', date)}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal flex-1",
                      !filters.createdDateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.createdDateRange.to ? (
                      format(filters.createdDateRange.to, "dd/MM/yyyy", { locale: es })
                    ) : (
                      "Hasta"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.createdDateRange.to}
                    onSelect={(date) => handleDateRangeChange('to', date)}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Investment Range Slider */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Rango de Inversión</label>
            <div className="px-2">
              <Slider
                value={investmentRange}
                onValueChange={handleInvestmentRangeChange}
                max={10000000}
                min={0}
                step={50000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatCurrency(investmentRange[0])}</span>
                <span>{formatCurrency(investmentRange[1])}</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Limpiar Filtros
          </Button>
        </div>
      )}

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

          {filters.sector !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Sector: {filters.sector}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFilter('sector')}
              />
            </Badge>
          )}

          {(filters.investmentRange.min !== undefined || filters.investmentRange.max !== undefined) && (
            <Badge variant="secondary" className="gap-1">
              Inversión: {formatCurrency(filters.investmentRange.min || 0)} - {formatCurrency(filters.investmentRange.max || 5000000)}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFilter('investmentRange')}
              />
            </Badge>
          )}

          {(filters.createdDateRange.from || filters.createdDateRange.to) && (
            <Badge variant="secondary" className="gap-1">
              Fechas: {filters.createdDateRange.from ? format(filters.createdDateRange.from, "dd/MM", { locale: es }) : '∞'} - {filters.createdDateRange.to ? format(filters.createdDateRange.to, "dd/MM", { locale: es }) : '∞'}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeFilter('createdDateRange')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}