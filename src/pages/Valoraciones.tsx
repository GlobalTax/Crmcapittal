import React, { useState } from 'react';
import { Calculator, Plus, FileText, TrendingUp, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useValoraciones } from '@/hooks/useValoraciones';
import { ValoracionCard } from '@/components/valoraciones/ValoracionCard';
import { ValoracionHeader } from '@/components/valoraciones/ValoracionHeader';
import { ValoracionTimelineBar } from '@/components/valoraciones/ValoracionTimelineBar';
import { ValoracionHistoryModal } from '@/components/valoraciones/ValoracionHistoryModal';
import { Valoracion, ValoracionStatus } from '@/types/Valoracion';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';

export default function Valoraciones() {
  const { valoraciones, loading, error, createValoracion, updateValoracion } = useValoraciones();
  const [selectedValoracion, setSelectedValoracion] = useState<Valoracion | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ValoracionStatus | 'all'>('all');

  // Convert database valoraciones to typed Valoracion objects
  const typedValoraciones: Valoracion[] = valoraciones.map(v => ({
    ...v,
    status: (v.status as ValoracionStatus) || 'requested',
    priority: undefined, // Add this when database is updated
    estimated_delivery: undefined, // Add this when database is updated
    assigned_to: undefined, // Add this when database is updated
    created_by: v.created_by || undefined
  }));

  // Filter valoraciones
  const filteredValoraciones = typedValoraciones.filter(valoracion => {
    const matchesSearch = valoracion.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         valoracion.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || valoracion.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateValoracion = async () => {
    try {
      await createValoracion({
        company_name: 'Nueva Empresa',
        client_name: 'Nuevo Cliente',
        status: 'requested'
      });
    } catch (error) {
      console.error('Error creating valoración:', error);
    }
  };

  const handleAdvancePhase = async (valoracion: Valoracion, nextPhase: ValoracionStatus) => {
    try {
      await updateValoracion(valoracion.id, { status: nextPhase });
      // Update selected valoracion if it's the same one
      if (selectedValoracion?.id === valoracion.id) {
        setSelectedValoracion({ ...selectedValoracion, status: nextPhase });
      }
    } catch (error) {
      console.error('Error advancing phase:', error);
    }
  };

  const handleViewValoracion = (valoracion: Valoracion) => {
    setSelectedValoracion(valoracion);
  };

  const handleShowHistory = (valoracion?: Valoracion) => {
    if (valoracion) {
      setSelectedValoracion(valoracion);
    }
    setShowHistory(true);
  };

  const getStatsForStatus = (status: ValoracionStatus) => {
    return filteredValoraciones.filter(v => v.status === status).length;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Valoraciones</h1>
          <p className="text-muted-foreground">
            Gestiona y crea valoraciones de empresas con seguimiento de fases
          </p>
        </div>
        <Button onClick={handleCreateValoracion}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Valoración
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Valoraciones</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredValoraciones.length}</div>
          </CardContent>
        </Card>
        
        {Object.entries(VALORACION_PHASES).map(([status, phase]) => (
          <Card key={status}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{phase.label}</CardTitle>
              <span className="text-lg">{phase.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getStatsForStatus(status as ValoracionStatus)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {phase.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ValoracionStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(VALORACION_PHASES).map(([status, phase]) => (
              <SelectItem key={status} value={status}>
                {phase.icon} {phase.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Valoracion Details */}
      {selectedValoracion && (
        <div className="space-y-4">
          <ValoracionHeader
            valoracion={selectedValoracion}
            onShowHistory={() => handleShowHistory(selectedValoracion)}
          />
          
          <ValoracionTimelineBar
            valoracion={selectedValoracion}
            onAdvancePhase={(nextPhase) => handleAdvancePhase(selectedValoracion, nextPhase)}
          />
        </div>
      )}

      {/* Valoraciones Grid */}
      <div className="space-y-4">
        {filteredValoraciones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No se encontraron valoraciones' : 'No hay valoraciones'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Prueba a cambiar los filtros de búsqueda'
                  : 'Comienza creando tu primera valoración de empresa'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={handleCreateValoracion}>
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

      {/* History Modal */}
      <ValoracionHistoryModal
        valoracion={selectedValoracion}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
}
