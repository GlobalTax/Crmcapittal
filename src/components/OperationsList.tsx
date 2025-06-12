
import React, { useState } from 'react';
import { useOperations } from '@/hooks/useOperations';
import { useFavoriteOperations } from '@/hooks/useFavoriteOperations';
import { useOperationsFilter } from '@/hooks/useOperationsFilter';
import { OperationFilters, FilterState } from '@/components/OperationFilters';
import { OperationsGrid } from '@/components/OperationsGrid';
import { OperationsTable } from '@/components/OperationsTable';
import { OperationsViewToggle } from '@/components/OperationsViewToggle';
import { OperationsEmptyState } from '@/components/OperationsEmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
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
  
  const { operations, loading, error } = useOperations();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoriteOperations();
  
  const filteredOperations = useOperationsFilter(operations, filters);
  
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search') return value !== '';
    if (key === 'amountRange') return value[0] !== 0 || value[1] !== 100;
    if (key === 'revenueRange') return value[0] !== 0 || value[1] !== 100;
    if (key === 'growthRate') return value !== 0;
    return value !== '';
  });

  const clearFilters = () => {
    setFilters(initialFilters);
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
            <span className="text-sm text-gray-500 ml-2">
              ({filteredOperations.length} {filteredOperations.length === 1 ? 'operación' : 'operaciones'})
            </span>
          </h2>
        </div>
        <OperationsViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Filters */}
      <OperationFilters 
        onFiltersChange={setFilters} 
        operations={operations}
      />

      {/* Results */}
      {filteredOperations.length === 0 ? (
        <OperationsEmptyState 
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      ) : (
        <div className="animate-fade-in">
          {viewMode === 'grid' ? (
            <OperationsGrid 
              operations={filteredOperations}
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
              operations={filteredOperations}
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
      )}
    </div>
  );
};
