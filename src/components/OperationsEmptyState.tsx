
import React from 'react';
import { Search, Filter, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OperationsEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const OperationsEmptyState = ({ hasFilters, onClearFilters }: OperationsEmptyStateProps) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron operaciones
        </h3>
        <p className="text-gray-500 mb-4">
          No hay operaciones que coincidan con los filtros aplicados.
        </p>
        <Button variant="outline" onClick={onClearFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay operaciones disponibles
      </h3>
      <p className="text-gray-500">
        Aún no se han publicado operaciones. Vuelve pronto para ver las últimas oportunidades.
      </p>
    </div>
  );
};
