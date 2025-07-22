
import React, { useMemo } from 'react';
import { useValoraciones } from '@/hooks/useValoraciones';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
import { useVirtualizedPagination } from '@/hooks/useVirtualizedPagination';
import { useOptimizedExport } from '@/hooks/useOptimizedExport';
import { VirtualizedList } from '@/components/ui/VirtualizedList';
import { ExportProgress } from '@/components/ui/ExportProgress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type Valoracion = Database['public']['Tables']['valoraciones']['Row'];

interface OptimizedValoracionesListProps {
  onEdit?: (valoracion: Valoracion) => void;
  onView?: (valoracion: Valoracion) => void;
}

export const OptimizedValoracionesList: React.FC<OptimizedValoracionesListProps> = ({
  onEdit,
  onView
}) => {
  const { valoraciones, loading } = useValoraciones();
  
  // Búsqueda optimizada
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
  } = useOptimizedSearch({
    data: valoraciones,
    searchFields: ['company_name', 'client_name', 'company_description'],
    debounceMs: 300,
    minSearchLength: 2
  });
  
  // Paginación virtualizada
  const {
    currentPageData,
    currentPage,
    totalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage
  } = useVirtualizedPagination(filteredData, {
    pageSize: 20,
    virtualPageSize: 40,
    maxCachedPages: 10
  });
  
  // Exportación optimizada
  const { isExporting, progress, startExport, cancelExport } = useOptimizedExport();
  
  // Renderizar item de valoración
  const renderValoracionItem = useMemo(() => (valoracion: Valoracion, index: number) => (
    <Card key={valoracion.id} className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{valoracion.company_name}</h3>
            <p className="text-muted-foreground">{valoracion.client_name}</p>
          </div>
          <Badge variant={valoracion.current_phase === 'completed' ? 'default' : 'secondary'}>
            {valoracion.current_phase || 'Pendiente'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Creado:</span>
            <p>{format(new Date(valoracion.created_at), 'dd/MM/yyyy', { locale: es })}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Actualizado:</span>
            <p>{format(new Date(valoracion.updated_at), 'dd/MM/yyyy', { locale: es })}</p>
          </div>
        </div>
        
        {valoracion.company_description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {valoracion.company_description}
          </p>
        )}
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => onView?.(valoracion)}>
            Ver Detalles
          </Button>
          <Button variant="default" size="sm" onClick={() => onEdit?.(valoracion)}>
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  ), [onView, onEdit]);
  
  // Manejo de exportación
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    const exportData = filteredData.map(v => ({
      'Empresa': v.company_name,
      'Cliente': v.client_name,
      'Fase': v.current_phase,
      'Descripción': v.company_description,
      'Creado': format === 'excel' ? new Date(v.created_at) : format(new Date(v.created_at), 'dd/MM/yyyy'),
      'Actualizado': format === 'excel' ? new Date(v.updated_at) : format(new Date(v.updated_at), 'dd/MM/yyyy')
    }));
    
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    const filename = `valoraciones_${timestamp}.${format === 'excel' ? 'xlsx' : format}`;
    
    await startExport({
      format,
      data: exportData,
      filename,
      includeHeaders: true
    });
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Controles de búsqueda y filtros */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar valoraciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={filters.current_phase || 'all'} onValueChange={(value) => updateFilter('current_phase', value)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por fase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fases</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>
      
      {/* Estadísticas */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Mostrando {resultCount} de {totalCount} valoraciones
          {isSearching && <span className="ml-2">🔍 Buscando...</span>}
        </span>
        <span>
          Página {currentPage} de {totalPages}
        </span>
      </div>
      
      {/* Lista virtualizada */}
      {currentPageData.length > 0 ? (
        <div className="space-y-4">
          {currentPageData.map((valoracion, index) => renderValoracionItem(valoracion, index))}
          
          {/* Controles de paginación */}
          <div className="flex justify-center gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={goToPreviousPage}
              disabled={!hasPreviousPage}
            >
              Anterior
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">Página</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-20 text-center"
              />
              <span className="text-sm">de {totalPages}</span>
            </div>
            
            <Button 
              variant="outline" 
              onClick={goToNextPage}
              disabled={!hasNextPage}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {hasActiveFilters 
              ? 'No se encontraron valoraciones con los filtros aplicados.'
              : 'No hay valoraciones disponibles.'
            }
          </p>
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
