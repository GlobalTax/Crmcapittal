
import React, { useState } from 'react';
import { useFavoriteOperations } from '@/hooks/useFavoriteOperations';
import { useOperationsOptimized } from '@/hooks/operations/useOperationsOptimized';
import { OperationFilters, FilterState } from '@/components/OperationFilters';
import { OperationsGrid } from '@/components/OperationsGrid';
import { OperationsTable } from '@/components/OperationsTable';
import { OperationsViewToggle } from '@/components/OperationsViewToggle';
import { OperationsEmptyState } from '@/components/OperationsEmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { PaginationControls } from '@/components/PaginationControls';
import { OperationStats } from '@/components/OperationStats';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const initialFilters: FilterState = {
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

export const OperationsList = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  
  const {
    operations,
    allOperations,
    loading,
    error,
    stats,
    paginationConfig,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    hasActiveFilters
  } = useOperationsOptimized(filters, 12);
  
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoriteOperations();

  const clearFilters = () => {
    setFilters(initialFilters);
    resetPagination();
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    resetPagination(); // Resetear a página 1 cuando cambian filtros
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold">Operaciones Disponibles</h2>
          </div>
          <OperationsViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
        <LoadingSkeleton viewMode={viewMode} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar las operaciones: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">
            Operaciones Disponibles
          </h2>
        </div>
        <OperationsViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Stats */}
      <OperationStats stats={stats} isFiltered={hasActiveFilters} />

      {/* Filters */}
      <OperationFilters 
        onFiltersChange={handleFiltersChange} 
        operations={allOperations}
      />

      {/* Results */}
      {operations.length === 0 ? (
        <OperationsEmptyState 
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      ) : (
        <div className="space-y-6">
          <div className="animate-fade-in">
            {viewMode === 'grid' ? (
              <OperationsGrid 
                operations={operations}
                onToggleFavorite={(operationId) => {
                  if (isFavorite(operationId)) {
                    removeFromFavorites(operationId);
                  } else {
                    addToFavorites(operationId);
                  }
                }}
                isFavorite={isFavorite}
              />
            ) : (
              <OperationsTable 
                operations={operations}
                onToggleFavorite={(operationId) => {
                  if (isFavorite(operationId)) {
                    removeFromFavorites(operationId);
                  } else {
                    addToFavorites(operationId);
                  }
                }}
                isFavorite={isFavorite}
              />
            )}
          </div>
          
          {/* Pagination */}
          <PaginationControls
            config={paginationConfig}
            onPageChange={goToPage}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
          />
        </div>
      )}
    </div>
  );
};
