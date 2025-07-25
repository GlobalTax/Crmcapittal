
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { ValoracionStatus } from '@/types/Valoracion';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { Badge } from '@/components/ui/badge';

interface ValoracionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ValoracionStatus | 'all';
  onStatusFilterChange: (value: ValoracionStatus | 'all') => void;
  paymentStatusFilter: string;
  onPaymentStatusFilterChange: (value: string) => void;
  assignedToFilter: string;
  onAssignedToFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  dateRangeFilter: { from?: Date; to?: Date };
  onDateRangeFilterChange: (range: { from?: Date; to?: Date }) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const ValoracionFilters: React.FC<ValoracionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  assignedToFilter,
  onAssignedToFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dateRangeFilter,
  onDateRangeFilterChange,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa, cliente, analista o €EV..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(VALORACION_PHASES).map(([status, phase]) => (
              <SelectItem key={status} value={status}>
                {phase.icon} {phase.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            <SelectItem value="urgent">🔴 Urgente</SelectItem>
            <SelectItem value="high">🟠 Alta</SelectItem>
            <SelectItem value="medium">🟡 Media</SelectItem>
            <SelectItem value="low">🟢 Baja</SelectItem>
          </SelectContent>
        </Select>

        {/* Payment Status Filter */}
        <Select value={paymentStatusFilter} onValueChange={onPaymentStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los pagos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="partial">Parcial</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
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
              Estado: {VALORACION_PHASES[statusFilter as ValoracionStatus]?.label}
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
