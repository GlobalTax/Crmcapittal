
import React from 'react';
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

interface OperationsEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const OperationsEmptyState = ({ hasFilters, onClearFilters }: OperationsEmptyStateProps) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="text-gray-400 text-lg">🔍</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron operaciones
        </h3>
        <p className="text-gray-500 mb-4">
          No hay operaciones que coincidan con los filtros aplicados.
        </p>
        <Button variant="outline" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <TrendingUp className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay operaciones disponibles
      </h3>
      <p className="text-gray-500">
        Aún no se han publicado operaciones. Vuelve pronto para ver las últimas oportunidades.
      </p>
    </div>
  );
};
