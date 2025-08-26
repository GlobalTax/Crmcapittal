/**
 * Report Filters Component
 * 
 * Reusable component for commission report filtering
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { ReportFilters as ReportFiltersType } from '../services/CommissionReportService';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  collaborators?: Array<{ id: string; name: string }>;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  collaborators = []
}) => {
  const updateFilter = (key: keyof ReportFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Reporte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Fecha Inicio */}
          <div className="space-y-2">
            <Label>Fecha Inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.startDate || undefined}
                  onSelect={(date) => updateFilter('startDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha Fin */}
          <div className="space-y-2">
            <Label>Fecha Fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate || undefined}
                  onSelect={(date) => updateFilter('endDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Colaborador */}
          <div className="space-y-2">
            <Label>Colaborador</Label>
            <Select value={filters.collaboratorId || ''} onValueChange={(value) => updateFilter('collaboratorId', value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los colaboradores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los colaboradores</SelectItem>
                {collaborators.map(collaborator => (
                  <SelectItem key={collaborator.id} value={collaborator.id}>
                    {collaborator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={filters.status || ''} onValueChange={(value) => updateFilter('status', value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Cálculo */}
          <div className="space-y-2">
            <Label>Tipo de Cálculo</Label>
            <Select value={filters.calculationType || ''} onValueChange={(value) => updateFilter('calculationType', value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value="percentage">Porcentaje</SelectItem>
                <SelectItem value="fixed">Fijo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Destinatario */}
          <div className="space-y-2">
            <Label>Destinatario</Label>
            <Select value={filters.recipientType || ''} onValueChange={(value) => updateFilter('recipientType', value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value="internal">Interno</SelectItem>
                <SelectItem value="external">Externo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          <Button onClick={onApplyFilters}>
            Aplicar Filtros
          </Button>
          <Button variant="outline" onClick={onClearFilters}>
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};