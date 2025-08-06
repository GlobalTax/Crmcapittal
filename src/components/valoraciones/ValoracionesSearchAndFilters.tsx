import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';

interface ValoracionesSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const ValoracionesSearchAndFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  hasActiveFilters,
  onClearFilters
}: ValoracionesSearchAndFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por empresa, cliente, sector o analista..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(VALORACION_PHASES).map(([status, phase]) => (
              <SelectItem key={status} value={status}>
                <span className="flex items-center gap-2">
                  {phase.icon} {phase.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="urgent">🔴 Urgente</SelectItem>
            <SelectItem value="high">🟠 Alta</SelectItem>
            <SelectItem value="medium">🟡 Media</SelectItem>
            <SelectItem value="low">🟢 Baja</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentStatusFilter} onValueChange={onPaymentStatusFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="partial">Parcial</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: {searchTerm}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Estado: {VALORACION_PHASES[statusFilter as keyof typeof VALORACION_PHASES]?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onStatusFilterChange('all')}
              />
            </Badge>
          )}
          
          {priorityFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Prioridad: {priorityFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onPriorityFilterChange('all')}
              />
            </Badge>
          )}
          
          {paymentStatusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Pago: {paymentStatusFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onPaymentStatusFilterChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};