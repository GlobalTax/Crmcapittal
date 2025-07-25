
import React, { useState } from 'react';
import { OptimizedValoracionesList } from '@/components/valoraciones/OptimizedValoracionesList';
import { ValoracionesKanban } from '@/components/valoraciones/ValoracionesKanban';
import { ValoracionesKpiCards } from '@/components/valoraciones/ValoracionesKpiCards';
import { ValoracionesViewToggle } from '@/components/valoraciones/ValoracionesViewToggle';
import { FloatingActionButton } from '@/components/valoraciones/FloatingActionButton';
import { NewValoracionDialog } from '@/components/valoraciones/NewValoracionDialog';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useValoraciones } from '@/hooks/useValoraciones';
import type { Valoracion, ValoracionStatus } from '@/types/Valoracion';
type ViewMode = 'list' | 'kanban';

export default function Valoraciones() {
  const [selectedValoracion, setSelectedValoracion] = useState<Valoracion | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [refreshKey, setRefreshKey] = useState(0);
  const { valoraciones, loading, updateValoracion, refetch } = useValoraciones();
  
  const handleViewValoracion = (valoracion: any) => {
    setSelectedValoracion(valoracion);
    console.log('Ver valoración:', valoracion);
  };
  
  const handleEditValoracion = (valoracion: any) => {
    setSelectedValoracion(valoracion);
    console.log('Editar valoración:', valoracion);
  };

  const handleUpdateStatus = async (valoracionId: string, newStatus: ValoracionStatus) => {
    try {
      await updateValoracion(valoracionId, { status: newStatus });
      await refetch();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const handleNewValoracionSuccess = () => {
    handleRefresh();
  };
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Valoraciones</h1>
          <p className="text-muted-foreground">
            Gestiona y consulta las valoraciones de empresas de forma optimizada
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <NewValoracionDialog onSuccess={handleNewValoracionSuccess} />
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <ValoracionesViewToggle 
            viewMode={viewMode} 
            onViewModeChange={setViewMode} 
          />
        </div>
      </div>

      {/* KPIs */}
      <ValoracionesKpiCards />

      {/* Content */}
      {viewMode === 'list' ? (
        <OptimizedValoracionesList
          key={refreshKey}
          onView={handleViewValoracion}
          onEdit={handleEditValoracion}
        />
      ) : (
        <ValoracionesKanban
          key={refreshKey}
          valoraciones={valoraciones as Valoracion[]}
          onEdit={handleEditValoracion}
          onView={handleViewValoracion}
          onUpdateStatus={handleUpdateStatus}
          isLoading={loading}
          onRefresh={handleRefresh}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onSuccess={handleNewValoracionSuccess} />
    </div>
  );
}
