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
    resetPagination();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-gray-900">Operaciones Disponibles</h2>
            </div>
            <OperationsViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
          <LoadingSkeleton type={viewMode === 'table' ? 'table-row' : 'operation-card'} count={12} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar las operaciones: {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Operaciones Disponibles
            </h1>
          </div>
          <OperationsViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-6">
          <OperationStats stats={stats} isFiltered={hasActiveFilters} />
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <OperationFilters 
            onFiltersChange={handleFiltersChange} 
            operations={allOperations}
          />
        </div>

        {/* Results */}
        {operations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12">
            <OperationsEmptyState 
              hasFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          </div>
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
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
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
                </div>
              )}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-center">
              <PaginationControls
                config={paginationConfig}
                onPageChange={goToPage}
                onNextPage={goToNextPage}
                onPreviousPage={goToPreviousPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
