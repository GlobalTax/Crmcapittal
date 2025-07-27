import React from 'react';
import { ReconversionCard } from './ReconversionCard';
import { ReconversionStats } from './ReconversionStats';
import { ReconversionFilters } from './ReconversionFilters';
import { ReconversionViewToggle } from './ReconversionViewToggle';
import { ReconversionEmptyState } from './ReconversionEmptyState';
import { ReconversionKanbanView } from './ReconversionKanbanView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Download } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import type { ReconversionFilters as FilterType } from '@/types/Reconversion';

type Reconversion = Database['public']['Tables']['reconversiones_new']['Row'];

interface ReconversionsListProps {
  reconversiones: Reconversion[];
  loading: boolean;
  error: Error | null;
  viewMode: 'grid' | 'list' | 'kanban';
  filters: FilterType;
  filteredReconversiones: Reconversion[];
  hasActiveFilters: boolean;
  onViewModeChange: (mode: 'grid' | 'list' | 'kanban') => void;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  onClearFilters: () => void;
  onView: (reconversion: Reconversion) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
  onUpdateStatus?: (reconversionId: string, status: string) => Promise<any>;
}

export function ReconversionsList({
  reconversiones,
  loading,
  error,
  viewMode,
  filters,
  filteredReconversiones,
  hasActiveFilters,
  onViewModeChange,
  onFiltersChange,
  onClearFilters,
  onView,
  onCreateNew,
  onRefresh,
  onUpdateStatus
}: ReconversionsListProps) {
  if (loading || error) {
    return null; // Parent component handles these states
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Reconversiones
          </h1>
          <p className="text-muted-foreground">
            Gestiona las oportunidades de reconversión empresarial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button 
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button 
            onClick={onCreateNew} 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Reconversión
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ReconversionStats reconversiones={reconversiones} />

      {/* Filters */}
      <ReconversionFilters 
        filters={filters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {filteredReconversiones.length} {filteredReconversiones.length === 1 ? 'reconversión encontrada' : 'reconversiones encontradas'}
          </p>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              Filtros activos
            </Badge>
          )}
        </div>
        
        <ReconversionViewToggle 
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <ReconversionKanbanView
          reconversiones={filteredReconversiones}
          onView={onView}
          onEdit={() => {}} // TODO: Implement edit
          onUpdateStatus={onUpdateStatus || (() => Promise.resolve())}
          isLoading={false}
          onRefresh={onRefresh}
        />
      ) : filteredReconversiones.length === 0 ? (
        <ReconversionEmptyState 
          hasFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
          onCreateNew={onCreateNew}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReconversiones.map((reconversion) => (
            <ReconversionCard
              key={reconversion.id}
              reconversion={reconversion}
              onSelect={() => onView(reconversion)}
            />
          ))}
        </div>
      )}
    </div>
  );
}