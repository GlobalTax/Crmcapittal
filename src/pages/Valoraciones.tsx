
import React, { useState } from 'react';
import { OptimizedValoracionesList } from '@/components/valoraciones/OptimizedValoracionesList';
import { ValoracionDetailPanel } from '@/components/valoraciones/ValoracionDetailPanel';
import type { Database } from '@/integrations/supabase/types';

type Valoracion = Database['public']['Tables']['valoraciones']['Row'];

export default function Valoraciones() {
  const [selectedValoracion, setSelectedValoracion] = useState<Valoracion | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  
  const handleViewValoracion = (valoracion: Valoracion) => {
    setSelectedValoracion(valoracion);
    setDetailPanelOpen(true);
  };
  
  const handleEditValoracion = (valoracion: Valoracion) => {
    setSelectedValoracion(valoracion);
    setDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setDetailPanelOpen(false);
    setSelectedValoracion(null);
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

        <ValoracionDetailPanel
          valoracion={selectedValoracion}
          open={detailPanelOpen}
          onOpenChange={setDetailPanelOpen}
          onClose={handleCloseDetailPanel}
        />
      </div>
    </div>
  );
}
