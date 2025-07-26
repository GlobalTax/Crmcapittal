import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Plus, Search } from 'lucide-react';

interface ReconversionEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
  onCreateNew?: () => void;
}

export function ReconversionEmptyState({ 
  hasFilters, 
  onClearFilters, 
  onCreateNew 
}: ReconversionEmptyStateProps) {
  if (hasFilters) {
    return (
      <Card className="col-span-full">
        <CardContent className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron reconversiones</h3>
          <p className="text-muted-foreground mb-4">
            No hay reconversiones que coincidan con los filtros aplicados.
          </p>
          {onClearFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardContent className="text-center py-16">
        <Building className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
        <h3 className="text-xl font-semibold mb-2">No hay reconversiones registradas</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Comienza creando tu primera reconversión. Podrás gestionar todas las oportunidades 
          de reconversión empresarial desde aquí.
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Crear primera reconversión
          </Button>
        )}
      </CardContent>
    </Card>
  );
}