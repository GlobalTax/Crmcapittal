
import React, { useState } from 'react';
import { Calculator, Plus, LayoutGrid, Table, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useValoraciones } from '@/hooks/useValoraciones';
import { ValoracionCard } from '@/components/valoraciones/ValoracionCard';
import { ValoracionesKanban } from '@/components/valoraciones/ValoracionesKanban';
import { ValoracionDetailPanel } from '@/components/valoraciones/ValoracionDetailPanel';
import { ValoracionFilters } from '@/components/valoraciones/ValoracionFilters';
import { CreateValoracionForm } from '@/components/valoraciones/CreateValoracionForm';
import { ValoracionDocumentUploader } from '@/components/valoraciones/ValoracionDocumentUploader';
import { Valoracion, ValoracionStatus } from '@/types/Valoracion';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { useValoracionSecurity } from '@/hooks/useValoracionSecurity';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';

export default function Valoraciones() {
  const { valoraciones, loading, error, createValoracion, updateValoracion } = useValoraciones();
  const { logPhaseChange, generateClientAccessToken } = useValoracionSecurity();
  const { toast } = useToast();
  
  // View state
  const [viewMode, setViewMode] = useState<'kanban' | 'cards'>('kanban');
  const [selectedValoracion, setSelectedValoracion] = useState<Valoracion | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ValoracionStatus | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from?: Date; to?: Date }>({});

  const typedValoraciones: Valoracion[] = valoraciones.map(v => ({
    ...v,
    status: (v.status as ValoracionStatus) || 'requested',
    priority: undefined,
    estimated_delivery: undefined,
    assigned_to: undefined,
    created_by: v.created_by || undefined,
    payment_status: (v.payment_status as any) || 'pending'
  }));

  // Apply filters
  const filteredValoraciones = typedValoraciones.filter(valoracion => {
    const matchesSearch = valoracion.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         valoracion.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (valoracion.company_description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = statusFilter === 'all' || valoracion.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || valoracion.payment_status === paymentStatusFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || paymentStatusFilter !== 'all';

  const handleCreateValoracion = async (data: any) => {
    try {
      await createValoracion(data);
      setShowCreateForm(false);
      toast({
        title: "Valoración creada",
        description: "La valoración ha sido creada exitosamente"
      });
    } catch (error) {
      console.error('Error creating valoración:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la valoración",
        variant: "destructive"
      });
    }
  };

  const handleAdvancePhase = async (valoracion: Valoracion, nextPhase: ValoracionStatus) => {
    try {
      const previousPhase = valoracion.status;
      await updateValoracion(valoracion.id, { status: nextPhase });
      
      // Log del cambio de fase
      await logPhaseChange(valoracion.id, previousPhase, nextPhase);
      
      if (selectedValoracion?.id === valoracion.id) {
        setSelectedValoracion({ ...selectedValoracion, status: nextPhase });
      }
      
      toast({
        title: "Fase actualizada",
        description: `Valoración movida a ${VALORACION_PHASES[nextPhase].label}`
      });
    } catch (error) {
      console.error('Error advancing phase:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la fase",
        variant: "destructive"
      });
    }
  };

  const handleGenerateClientLink = async (valoracion: Valoracion) => {
    if (valoracion.status !== 'delivered') {
      toast({
        title: 'Acción no disponible',
        description: 'Solo se puede generar enlace para valoraciones entregadas',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = await generateClientAccessToken(valoracion.id);
      const clientUrl = `${window.location.origin}/client/valoracion/${token}`;
      
      await navigator.clipboard.writeText(clientUrl);
      
      toast({
        title: 'Enlace generado',
        description: 'El enlace del cliente se ha copiado al portapapeles'
      });
    } catch (error) {
      console.error('Error generating client link:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el enlace del cliente',
        variant: 'destructive'
      });
    }
  };

  const handleViewValoracion = (valoracion: Valoracion) => {
    setSelectedValoracion(valoracion);
    setShowDetailPanel(true);
  };

  const handleEditValoracion = (valoracion: Valoracion) => {
    setSelectedValoracion(valoracion);
    // TODO: Open edit form
    toast({
      title: "Función en desarrollo",
      description: "La edición de valoraciones estará disponible pronto"
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setAssignedToFilter('all');
    setDateRangeFilter({});
  };

  const getStatsForStatus = (status: ValoracionStatus) => {
    return filteredValoraciones.filter(v => v.status === status).length;
  };

  const getTotalQuoted = () => {
    return filteredValoraciones.reduce((total, v) => total + (v.fee_quoted || 0), 0);
  };

  const getTotalCharged = () => {
    return filteredValoraciones.reduce((total, v) => total + (v.fee_charged || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Error al cargar valoraciones</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Valoraciones</h1>
          <p className="text-muted-foreground">
            Gestiona y crea valoraciones de empresas con seguimiento de fases
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="gap-2"
            >
              <Table className="w-4 h-4" />
              Tarjetas
            </Button>
          </div>
          
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Valoración
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{filteredValoraciones.length}</p>
              </div>
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        {Object.entries(VALORACION_PHASES).map(([status, phase]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{phase.label}</p>
                  <p className="text-2xl font-bold">{getStatsForStatus(status as ValoracionStatus)}</p>
                </div>
                <span className="text-2xl">{phase.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Cotizado</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(getTotalQuoted())}
              </p>
              <p className="text-sm font-medium text-muted-foreground mt-1">Total Cobrado</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(getTotalCharged())}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ValoracionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={setPaymentStatusFilter}
        assignedToFilter={assignedToFilter}
        onAssignedToFilterChange={setAssignedToFilter}
        dateRangeFilter={dateRangeFilter}
        onDateRangeFilterChange={setDateRangeFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Content */}
      <div className="flex gap-6 h-full">
        {/* Left Panel - Kanban or Cards */}
        <div className={`transition-all duration-300 ${showDetailPanel ? 'w-1/2' : 'w-full'}`}>
          {viewMode === 'kanban' ? (
            <ValoracionesKanban
              valoraciones={filteredValoraciones}
              onUpdateStatus={handleAdvancePhase}
              onEdit={handleEditValoracion}
              onView={handleViewValoracion}
              onAddValoracion={(status) => {
                // TODO: Pre-select status in form
                setShowCreateForm(true);
              }}
              isLoading={loading}
            />
          ) : (
            <div className="space-y-4">
              {filteredValoraciones.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {hasActiveFilters ? 'No se encontraron valoraciones' : 'No hay valoraciones'}
                    </h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {hasActiveFilters 
                        ? 'Prueba a cambiar los filtros de búsqueda'
                        : 'Comienza creando tu primera valoración de empresa'
                      }
                    </p>
                    {!hasActiveFilters && (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Primera Valoración
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredValoraciones.map((valoracion) => (
                    <ValoracionCard
                      key={valoracion.id}
                      valoracion={valoracion}
                      onView={handleViewValoracion}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Detail */}
        {showDetailPanel && selectedValoracion && (
          <div className="w-1/2 border-l border-border">
            <ValoracionDetailPanel
              valoracion={selectedValoracion}
              onClose={() => setShowDetailPanel(false)}
              onEdit={handleEditValoracion}
              onGenerateClientLink={handleGenerateClientLink}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateValoracionForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateValoracion}
      />

      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subir Documentos</DialogTitle>
          </DialogHeader>
          {selectedValoracion && (
            <ValoracionDocumentUploader
              valoracion={selectedValoracion}
              onUploadComplete={() => {
                setShowUploader(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
