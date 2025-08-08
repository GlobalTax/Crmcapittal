import React, { useState } from 'react';
import { ValoracionesKpiCards } from '@/components/valoraciones/ValoracionesKpiCards';
import { ValoracionesHeader } from '@/components/valoraciones/ValoracionesHeader';
import { ValoracionesSearchAndFilters } from '@/components/valoraciones/ValoracionesSearchAndFilters';
import { ValoracionesStats } from '@/components/valoraciones/ValoracionesStats';
import { ValoracionesGrid } from '@/components/valoraciones/ValoracionesGrid';
import { ValoracionesPagination } from '@/components/valoraciones/ValoracionesPagination';
import { ValoracionesKanban } from '@/components/valoraciones/ValoracionesKanban';
import { FloatingActionButton } from '@/components/valoraciones/FloatingActionButton';
import { useValoracionesData } from '@/hooks/useValoracionesData';
import { useValoracionesSearch } from '@/hooks/useValoracionesSearch';
import { useValoracionesPagination } from '@/hooks/useValoracionesPagination';
import { toast } from 'sonner';
import type { Valoracion, ValoracionStatus } from '@/types/Valoracion';

type ViewMode = 'list' | 'kanban';

export default function Valoraciones() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedValoracion, setSelectedValoracion] = useState<Valoracion | null>(null);

  // Datos principales
  const { 
    data: valoraciones = [], 
    isLoading, 
    refetch, 
    error 
  } = useValoracionesData();

  // Búsqueda y filtros
  const {
    filters,
    filteredValoraciones,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    totalCount,
    filteredCount
  } = useValoracionesSearch(valoraciones);

  // Paginación
  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination
  } = useValoracionesPagination(filteredValoraciones);

  // Handlers
  const handleViewValoracion = (valoracion: Valoracion) => {
    setSelectedValoracion(valoracion);
    console.log('Ver valoración:', valoracion);
  };

  const handleEditValoracion = (valoracion: Valoracion) => {
    setSelectedValoracion(valoracion);
    console.log('Editar valoración:', valoracion);
  };

  const handleUpdateStatus = async (valoracionId: string, newStatus: ValoracionStatus) => {
    try {
      // Aquí iría la lógica de actualización
      await refetch();
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleRefresh = () => {
    refetch();
    resetPagination();
  };

  const handleNewValoracionSuccess = () => {
    refetch();
    resetPagination();
    toast.success('Valoración creada exitosamente');
  };

  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key as any, value);
    resetPagination();
  };

  const handleClearFilters = () => {
    clearFilters();
    resetPagination();
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="mx-auto max-w-md">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Error al cargar valoraciones</h3>
            <p className="text-muted-foreground mb-4">
              Ha ocurrido un error al cargar los datos. Por favor, inténtalo de nuevo.
            </p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <ValoracionesHeader
        onRefresh={handleRefresh}
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewValoracionSuccess={handleNewValoracionSuccess}
      />

      {/* KPIs */}
      <ValoracionesKpiCards />

      {/* Búsqueda y filtros */}
      <ValoracionesSearchAndFilters
        searchTerm={filters.search}
        onSearchChange={(value) => handleFilterChange('search', value)}
        statusFilter={filters.status}
        onStatusFilterChange={(value) => handleFilterChange('status', value)}
        priorityFilter={filters.priority}
        onPriorityFilterChange={(value) => handleFilterChange('priority', value)}
        paymentStatusFilter={filters.paymentStatus}
        onPaymentStatusFilterChange={(value) => handleFilterChange('paymentStatus', value)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Estadísticas */}
      <ValoracionesStats
        totalCount={totalCount}
        filteredCount={filteredCount}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Contenido principal */}
      {viewMode === 'list' ? (
        <>
          <ValoracionesGrid
            valoraciones={paginatedData}
            isLoading={isLoading}
            onView={handleViewValoracion}
            onEdit={handleEditValoracion}
          />
          
          <ValoracionesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={goToPage}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
          />
        </>
      ) : (
        <ValoracionesKanban
          valoraciones={valoraciones}
          onEdit={handleEditValoracion}
          onView={handleViewValoracion}
          onUpdateStatus={handleUpdateStatus}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onSuccess={handleNewValoracionSuccess} />
    </div>
  );
}