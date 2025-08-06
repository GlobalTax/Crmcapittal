import React from 'react';
import { ValoracionCard } from './ValoracionCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Valoracion } from '@/types/Valoracion';

interface ValoracionesGridProps {
  valoraciones: Valoracion[];
  isLoading: boolean;
  onView?: (valoracion: Valoracion) => void;
  onEdit?: (valoracion: Valoracion) => void;
}

export const ValoracionesGrid = ({
  valoraciones,
  isLoading,
  onView,
  onEdit
}: ValoracionesGridProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (valoraciones.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">No hay valoraciones</h3>
          <p className="text-muted-foreground">
            Cuando se creen valoraciones, aparecerán aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {valoraciones.map((valoracion) => (
        <ValoracionCard
          key={valoracion.id}
          valoracion={valoracion}
          onView={onView}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};