import React, { useMemo, useCallback } from 'react';
import { ValoracionesSearchBar } from './ValoracionesSearchBar';
import { ValoracionFilters } from './ValoracionFilters';
import { ValoracionesExportButtons } from './ValoracionesExportButtons';
import { ValoracionCard } from './ValoracionCard';
import { ValoracionesPagination } from './ValoracionesPagination';
import { ExportProgress } from '@/components/ui/ExportProgress';
import { useValoraciones } from '@/hooks/useValoraciones';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
import { useVirtualizedPagination } from '@/hooks/useVirtualizedPagination';
import { useOptimizedExport } from '@/hooks/useOptimizedExport';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Valoracion } from '@/types/Valoracion';

interface OptimizedValoracionesListProps {
  onEdit?: (valoracion: Valoracion) => void;
  onView?: (valoracion: Valoracion) => void;
}

export const OptimizedValoracionesList: React.FC<OptimizedValoracionesListProps> = ({
  onEdit,
  onView
}) => {
  const { valoraciones, loading, refetch } = useValoraciones();
  
  // Búsqueda optimizada - usando useMemo para evitar recreaciones
  const searchConfig = useMemo(() => ({
    data: valoraciones,
    searchFields: ['company_name', 'client_name', 'company_sector', 'company_description'] as (keyof Valoracion)[],
    debounceMs: 300,
    minSearchLength: 2
  }), [valoraciones]);

  const {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    filteredData,
    isSearching,
    hasActiveFilters,
    resultCount,
    totalCount
  } = useOptimizedSearch(searchConfig);
  
  // Paginación virtualizada - usando useMemo para la configuración
  const paginationConfig = useMemo(() => ({
    pageSize: 12,
    virtualPageSize: 24,
    maxCachedPages: 5
  }), []);

  const {
    currentPageData,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage
  } = useVirtualizedPagination(filteredData, paginationConfig);
  
  // Exportación optimizada
  const { isExporting, progress, startExport, cancelExport } = useOptimizedExport();
  
  // Manejo de exportación - usando useCallback para evitar recreaciones
  const handleExport = useCallback(async (exportFormat: 'pdf' | 'excel' | 'csv') => {
    try {
      const exportData = filteredData.map(v => ({
        'Empresa': v.company_name,
        'Cliente': v.client_name,
        'Sector': v.company_sector || '',
        'Estado': v.status,
        'Descripción': v.company_description || '',
        'Asignado a': v.assigned_to || 'Sin asignar',
        'Prioridad': v.priority || 'Sin prioridad',
        'Creado': exportFormat === 'excel' ? new Date(v.created_at) : format(new Date(v.created_at), 'dd/MM/yyyy'),
        'Actualizado': exportFormat === 'excel' ? new Date(v.updated_at) : format(new Date(v.updated_at), 'dd/MM/yyyy')
      }));
      
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const filename = `valoraciones_${timestamp}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`;
      
      await startExport({
        format: exportFormat,
        data: exportData,
        filename,
        includeHeaders: true
      });
      
      toast.success(`Exportación ${exportFormat.toUpperCase()} completada`);
    } catch (error) {
      toast.error(`Error al exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [filteredData, startExport]);
  
  // Renderizado optimizado del componente de búsqueda
  const SearchComponent = useMemo(() => (
    <ValoracionesSearchBar
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onClearSearch={clearFilters}
      placeholder="Buscar por empresa, cliente o sector..."
    />
  ), [searchTerm, setSearchTerm, clearFilters]);

  // Renderizado optimizado de botones de exportación
  const ExportButtons = useMemo(() => (
    <ValoracionesExportButtons
      onExport={handleExport}
      isExporting={isExporting}
    />
  ), [handleExport, isExporting]);

  // Renderizado optimizado de la paginación
  const PaginationComponent = useMemo(() => (
    <ValoracionesPagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={goToPage}
      onNextPage={goToNextPage}
      onPreviousPage={goToPreviousPage}
    />
  ), [currentPage, totalPages, totalItems, pageSize, goToPage, goToNextPage, goToPreviousPage]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Controles de búsqueda y filtros */}
        <ValoracionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={filters.status || 'all'}
          onStatusFilterChange={(value) => updateFilter('status', value)}
          priorityFilter={filters.priority || 'all'}
          onPriorityFilterChange={(value) => updateFilter('priority', value)}
          paymentStatusFilter={filters.payment_status || 'all'}
          onPaymentStatusFilterChange={(value) => updateFilter('payment_status', value)}
          assignedToFilter={filters.assigned_to || ''}
          onAssignedToFilterChange={(value) => updateFilter('assigned_to', value)}
          dateRangeFilter={{ from: undefined, to: undefined }}
          onDateRangeFilterChange={() => {}}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          {ExportButtons}
        </div>

        {/* Estadísticas */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            Mostrando {resultCount} de {totalCount} valoraciones
            {isSearching && <span className="ml-2 text-primary">🔍 Buscando...</span>}
          </span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Lista de valoraciones */}
        {currentPageData.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentPageData.map((valoracion) => (
                <ValoracionCard
                  key={valoracion.id}
                  valoracion={valoracion}
                  onView={onView}
                  onEdit={onEdit}
                />
              ))}
            </div>
            
            {PaginationComponent}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {hasActiveFilters 
                ? 'No se encontraron valoraciones con los filtros aplicados.'
                : 'No hay valoraciones disponibles.'
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Limpiar filtros
              </Button>
            )}
          </div>
        )}

        {/* Progreso de exportación */}
        <ExportProgress
          isVisible={isExporting}
          progress={progress}
          onCancel={cancelExport}
        />
    </div>
  );
};