
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calculator, Euro, TrendingUp, FileText } from 'lucide-react';
import { OptimizedValoracionesList } from '@/components/valoraciones/OptimizedValoracionesList';
import { ValoracionDetailPanel } from '@/components/valoraciones/ValoracionDetailPanel';
import { CreateValoracionForm } from '@/components/valoraciones/CreateValoracionForm';
import { useValoraciones } from '@/hooks/useValoraciones';
import { formatCurrency } from '@/utils/format';
import type { Database } from '@/integrations/supabase/types';

type Valoracion = Database['public']['Tables']['valoraciones']['Row'];

export default function Valoraciones() {
  const { valoraciones } = useValoraciones();
  const [selectedValoracion, setSelectedValoracion] = useState<Valoracion | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleEditValoracion = (valoracion: Valoracion) => {
    setSelectedValoracion(valoracion);
    setDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setDetailPanelOpen(false);
    setSelectedValoracion(null);
  };

  const handleCreateValoracion = () => {
    setShowCreateForm(true);
  };

  // Calcular métricas
  const totalValoraciones = valoraciones.length;
  const valoracionesEnProceso = valoraciones.filter(v => v.status === 'in_process').length;
  const valoracionesCompletadas = valoraciones.filter(v => v.status === 'completed' || v.status === 'delivered').length;
  const totalHonorarios = valoraciones.reduce((sum, v) => sum + (v.fee_quoted || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Valoraciones</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y consulta las valoraciones de empresas de forma optimizada
            </p>
          </div>
          <Button onClick={handleCreateValoracion}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Valoración
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Valoraciones</p>
                <p className="text-2xl font-bold text-foreground">{totalValoraciones}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                <p className="text-2xl font-bold text-foreground">{valoracionesEnProceso}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-foreground">{valoracionesCompletadas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Euro className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Honorarios</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalHonorarios)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de valoraciones */}
        <OptimizedValoracionesList onEdit={handleEditValoracion} />

        {/* Panel de detalle para edición */}
        <ValoracionDetailPanel
          valoracion={selectedValoracion}
          open={detailPanelOpen}
          onOpenChange={setDetailPanelOpen}
          onClose={handleCloseDetailPanel}
        />

        {/* Formulario de creación */}
        <CreateValoracionForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSubmit={async (data) => {
            // La lógica de creación se manejará en el componente
            setShowCreateForm(false);
          }}
        />
      </div>
    </div>
  );
}
