/**
 * Dashboard Filters Component
 * 
 * Filtering controls for executive dashboard
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Download, RefreshCw } from 'lucide-react';
import { DashboardFilters as DashboardFiltersType } from '../hooks/useExecutiveDashboard';

interface DashboardFiltersProps {
  filters: DashboardFiltersType;
  onFiltersChange: (filters: Partial<DashboardFiltersType>) => void;
  onReset: () => void;
  onExport: (format: 'pdf' | 'excel') => void;
  collaborators?: Array<{ id: string; name: string }>;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onExport,
  collaborators = []
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros del Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Filter */}
        <div className="space-y-2">
          <Label>Período de Análisis</Label>
          <Tabs 
            value={filters.period} 
            onValueChange={(value) => onFiltersChange({ period: value as 'week' | 'month' | 'quarter' | 'year' })}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mes</TabsTrigger>
              <TabsTrigger value="quarter">Trimestre</TabsTrigger>
              <TabsTrigger value="year">Año</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Collaborator Filter */}
          <div className="space-y-2">
            <Label>Colaborador</Label>
            <Select 
              value={filters.collaboratorId || ''} 
              onValueChange={(value) => onFiltersChange({ collaboratorId: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los colaboradores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los colaboradores</SelectItem>
                {collaborators.map(collaborator => (
                  <SelectItem key={collaborator.id} value={collaborator.id}>
                    {collaborator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select 
              value={filters.status || ''} 
              onValueChange={(value) => onFiltersChange({ status: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Filter */}
          <div className="space-y-2">
            <Label>Fuente</Label>
            <Select 
              value={filters.source || ''} 
              onValueChange={(value) => onFiltersChange({ source: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las fuentes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fuentes</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="deal">Deal</SelectItem>
                <SelectItem value="referral">Referencia</SelectItem>
                <SelectItem value="direct">Directo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onReset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Resetear Filtros
          </Button>
          
          <div className="flex gap-2 ml-auto">
            <Button 
              variant="outline" 
              onClick={() => onExport('excel')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onExport('pdf')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};