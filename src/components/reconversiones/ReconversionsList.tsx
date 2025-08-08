import React, { lazy, Suspense } from 'react';
import { ReconversionCard } from './ReconversionCard';
import { MobileReconversionCard } from './MobileReconversionCard';
import { ReconversionStats } from './ReconversionStats';
import { ReconversionFilters } from './ReconversionFilters';
import { ReconversionViewToggle } from './ReconversionViewToggle';
import { ReconversionEmptyState } from './ReconversionEmptyState';
const ReconversionKanbanView = lazy(() => import('./ReconversionKanbanView'));
import { LoadingButton } from '@/components/ui/loading-button';
import { SkeletonGrid } from '@/components/ui/skeleton-card';
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
  isRefreshing?: boolean;
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
  onUpdateStatus,
  isRefreshing = false
}: ReconversionsListProps) {
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-5 w-96 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg bg-card animate-pulse">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-8 w-12 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-32 bg-muted rounded animate-pulse" />
          ))}
        </div>

        {/* Cards Skeleton */}
        <SkeletonGrid count={6} className="animate-fade-in" />
      </div>
    );
  }

  if (error) {
    return null; // Parent component handles error state
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Reconversiones</h1>
        <div className="flex items-center gap-2">
          <LoadingButton 
            variant="outline" 
            onClick={onRefresh}
            loading={isRefreshing}
            loadingText="Actualizando..."
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </LoadingButton>
          <LoadingButton 
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </LoadingButton>
          <LoadingButton 
            onClick={onCreateNew} 
            className="gap-2 animate-pulse"
          >
            <Plus className="h-4 w-4" />
            Nueva Reconversión
          </LoadingButton>
        </div>
      </div>

      {/* Stats */}
      <ReconversionStats reconversiones={reconversiones as any} />

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
        <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
          <ReconversionKanbanView
            reconversiones={filteredReconversiones}
            onView={onView}
            onEdit={() => {}} // TODO: Implement edit
            onUpdateStatus={onUpdateStatus || (() => Promise.resolve())}
            isLoading={false}
            onRefresh={onRefresh}
          />
        </Suspense>
      ) : filteredReconversiones.length === 0 ? (
        <ReconversionEmptyState 
          hasFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
          onCreateNew={onCreateNew}
        />
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredReconversiones.map((reconversion, index) => (
              <div
                key={reconversion.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MobileReconversionCard
                  reconversion={reconversion as any}
                  onSelect={() => onView(reconversion)}
                />
              </div>
            ))}
          </div>
          
          {/* Desktop Grid */}
          <div className="hidden md:grid gap-6 grid-cols-2 lg:grid-cols-3">
            {filteredReconversiones.map((reconversion, index) => (
              <div
                key={reconversion.id}
                className="animate-fade-in hover:scale-105 transition-transform duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ReconversionCard
                  reconversion={reconversion as any}
                  onSelect={() => onView(reconversion)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}