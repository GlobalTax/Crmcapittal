
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X, MapPin, TrendingUp, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Operation } from "@/types/Operation";

interface OperationFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  operations: Operation[];
}

export interface FilterState {
  search: string;
  sector: string;
  operationType: string;
  location: string;
  amountRange: [number, number];
  revenueRange: [number, number];
  growthRate: number;
  dateRange: string;
  status: string;
}

const initialFilters: FilterState = {
  search: '',
  sector: '',
  operationType: '',
  location: '',
  amountRange: [0, 100],
  revenueRange: [0, 100],
  growthRate: 0,
  dateRange: '',
  status: ''
};

export const OperationFilters = ({ onFiltersChange, operations }: OperationFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const sectors = [...new Set(operations.map(op => op.sector).filter(Boolean))];
  const locations = [...new Set(operations.map(op => op.location).filter(Boolean))];
  const maxAmount = Math.max(...operations.map(op => op.amount || 0));
  const maxRevenue = Math.max(...operations.map(op => op.revenue || 0));

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onFiltersChange(initialFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value !== '';
    if (key === 'amountRange') return value[0] !== 0 || value[1] !== 100;
    if (key === 'revenueRange') return value[0] !== 0 || value[1] !== 100;
    if (key === 'growthRate') return value !== 0;
    return value !== '';
  }).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por empresa, sector, descripción..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter Button and Quick Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filtros Avanzados</h3>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>

                {/* Sector Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sector</label>
                  <Select value={filters.sector} onValueChange={(value) => updateFilters({ sector: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los sectores</SelectItem>
                      {sectors.map(sector => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Operation Type Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Operación</label>
                  <Select value={filters.operationType} onValueChange={(value) => updateFilters({ operationType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los tipos</SelectItem>
                      <SelectItem value="merger">Fusión</SelectItem>
                      <SelectItem value="sale">Venta</SelectItem>
                      <SelectItem value="partial_sale">Venta Parcial</SelectItem>
                      <SelectItem value="buy_mandate">Mandato de Compra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Ubicación
                  </label>
                  <Select value={filters.location} onValueChange={(value) => updateFilters({ location: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las ubicaciones</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Rango de Inversión (€M)
                  </label>
                  <Slider
                    value={filters.amountRange}
                    onValueChange={(value) => updateFilters({ amountRange: value as [number, number] })}
                    max={maxAmount / 1000000}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>€{filters.amountRange[0]}M</span>
                    <span>€{filters.amountRange[1]}M</span>
                  </div>
                </div>

                {/* Growth Rate Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    Crecimiento Anual Mínimo (%)
                  </label>
                  <Slider
                    value={[filters.growthRate]}
                    onValueChange={(value) => updateFilters({ growthRate: value[0] })}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Mínimo: {filters.growthRate}%
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Estado</label>
                  <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los estados</SelectItem>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="in_process">En Proceso</SelectItem>
                      <SelectItem value="sold">Vendida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick filter badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.sector && (
                <Badge variant="secondary" className="text-xs">
                  {filters.sector}
                  <button 
                    className="ml-1 hover:bg-gray-300 rounded-full"
                    onClick={() => updateFilters({ sector: '' })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {filters.location}
                  <button 
                    className="ml-1 hover:bg-gray-300 rounded-full"
                    onClick={() => updateFilters({ location: '' })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.growthRate > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{filters.growthRate}%
                  <button 
                    className="ml-1 hover:bg-gray-300 rounded-full"
                    onClick={() => updateFilters({ growthRate: 0 })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Sort Options */}
        <Select onValueChange={(value) => console.log('Sort by:', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Más recientes</SelectItem>
            <SelectItem value="date-asc">Más antiguos</SelectItem>
            <SelectItem value="amount-desc">Mayor inversión</SelectItem>
            <SelectItem value="amount-asc">Menor inversión</SelectItem>
            <SelectItem value="growth-desc">Mayor crecimiento</SelectItem>
            <SelectItem value="company">Empresa A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
