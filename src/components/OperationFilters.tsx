
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Operation } from '@/types/Operation';

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

interface OperationFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  operations: Operation[];
}

export const OperationFilters = ({ onFiltersChange, operations }: OperationFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sector: '',
    operationType: '',
    location: '',
    amountRange: [0, 100],
    revenueRange: [0, 100],
    growthRate: 0,
    dateRange: '',
    status: ''
  });

  // Extract unique values from operations
  const uniqueSectors = [...new Set(operations.map(op => op.sector).filter(Boolean))];
  const uniqueLocations = [...new Set(operations.map(op => op.location).filter(Boolean))];
  const operationTypes = [
    { value: 'acquisition', label: 'Adquisición' },
    { value: 'merger', label: 'Fusión' },
    { value: 'sale', label: 'Venta' },
    { value: 'ipo', label: 'IPO' }
  ];

  const updateFilter = (key: keyof FilterState, value: string | number | number[]) => {
    // Convert "all" back to empty string for the filter logic
    const filterValue = value === 'all' ? '' : value;
    const newFilters = { ...filters, [key]: filterValue };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
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
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const maxAmount = Math.max(...operations.map(op => op.amount || 0));
  const maxRevenue = Math.max(...operations.map(op => op.revenue || 0));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar por empresa, sector o descripción..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Filters Toggle */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="border-black text-black hover:bg-gray-100">
              Filtros Avanzados
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 space-y-4">
            {/* Sector Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sector</label>
              <Select value={filters.sector || 'all'} onValueChange={(value) => updateFilter('sector', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los sectores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  {uniqueSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operation Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Operación</label>
              <Select value={filters.operationType || 'all'} onValueChange={(value) => updateFilter('operationType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {operationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ubicación</label>
              <Select value={filters.location || 'all'} onValueChange={(value) => updateFilter('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ubicaciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rango de Inversión: €{((filters.amountRange[0] / 100) * maxAmount / 1000000).toFixed(1)}M - €{((filters.amountRange[1] / 100) * maxAmount / 1000000).toFixed(1)}M
              </label>
              <Slider
                value={filters.amountRange}
                onValueChange={(value) => updateFilter('amountRange', value)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Revenue Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rango de Facturación: €{((filters.revenueRange[0] / 100) * maxRevenue / 1000000).toFixed(1)}M - €{((filters.revenueRange[1] / 100) * maxRevenue / 1000000).toFixed(1)}M
              </label>
              <Slider
                value={filters.revenueRange}
                onValueChange={(value) => updateFilter('revenueRange', value)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Growth Rate */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Crecimiento Mínimo: {filters.growthRate}%
              </label>
              <Slider
                value={[filters.growthRate]}
                onValueChange={(value) => updateFilter('growthRate', value[0])}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full border-black text-black hover:bg-gray-100"
            >
              Limpiar Filtros
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
