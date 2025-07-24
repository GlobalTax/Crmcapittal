
import React, { useState } from 'react';
import { OptimizedValoracionesList } from '@/components/valoraciones/OptimizedValoracionesList';
import type { Database } from '@/integrations/supabase/types';

type Valoracion = Database['public']['Tables']['valoraciones']['Row'];

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
