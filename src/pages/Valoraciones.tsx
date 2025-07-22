
import React, { Suspense, useState } from 'react';
import { Card } from '@/components/ui/card';
import { OptimizedValoracionesList } from '@/components/valoraciones/OptimizedValoracionesList';
import type { Database } from '@/integrations/supabase/types';

type Valoracion = Database['public']['Tables']['valoraciones']['Row'];

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Valoraciones() {
  const [selectedValoracion, setSelectedValoracion] = useState<Valoracion | null>(null);
  
  const handleViewValoracion = (valoracion: Valoracion) => {
    setSelectedValoracion(valoracion);
    // Aquí podrías abrir un modal o redirigir a una página de detalle
    console.log('Ver valoración:', valoracion);
  };
  
  const handleEditValoracion = (valoracion: Valoracion) => {
    setSelectedValoracion(valoracion);
    // Aquí podrías abrir un formulario de edición
    console.log('Editar valoración:', valoracion);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Valoraciones</h1>
            <p className="text-muted-foreground">
              Gestiona y consulta las valoraciones de empresas de forma optimizada
            </p>
          </div>
        </div>

        <OptimizedValoracionesList
          onView={handleViewValoracion}
          onEdit={handleEditValoracion}
        />
      </div>
    </div>
  );
}
