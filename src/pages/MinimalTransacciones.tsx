import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useTransacciones } from "@/hooks/useTransacciones";
import { useStages } from "@/hooks/useStages";
import { Transaccion } from "@/types/Transaccion";
import { TransaccionesKanban } from "@/components/transacciones/TransaccionesKanban";
import { TransaccionFiltersComponent, TransaccionFilters } from "@/components/transacciones/TransaccionFilters";
import { User, Briefcase, Building2, Users, TrendingUp, LayoutGrid, List, Plus, RefreshCw } from "lucide-react";
import { StageManagement } from "@/components/transacciones/StageManagement";

export default function MinimalTransacciones() {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const navigate = useNavigate();
  const { transacciones, loading, error, updateTransaccionStage, refetch } = useTransacciones();
  const { stages } = useStages('DEAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TransaccionFilters>({
    search: '',
    tipo_transaccion: '',
    prioridad: '',
    sector: '',
    propietario: '',
    valor_min: '',
    valor_max: '',
    fecha_desde: undefined,
    fecha_hasta: undefined,
    stage_id: ''
  });

  // Search from topbar
  useEffect(() => {
    const handleSearch = (e: CustomEvent<{ query: string }>) => {
      setFilters(prev => ({ ...prev, search: e.detail.query }));
    };

    window.addEventListener('transaccionesSearch', handleSearch as EventListener);
    return () => window.removeEventListener('transaccionesSearch', handleSearch as EventListener);
  }, []);

  // Get unique values for filters
  const uniqueValues = useMemo(() => {
    const tipos = [...new Set(transacciones.map(t => t.tipo_transaccion).filter(Boolean))];
    const sectores = [...new Set(transacciones.map(t => t.sector).filter(Boolean))];
    const propietarios = [...new Set(transacciones.map(t => t.propietario_transaccion).filter(Boolean))];
    
    return { tipos, sectores, propietarios };
  }, [transacciones]);

  // Apply filtering
  const filteredTransacciones = useMemo(() => {
    return transacciones.filter(transaccion => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = (
          transaccion.nombre_transaccion?.toLowerCase().includes(searchLower) ||
          transaccion.company?.name?.toLowerCase().includes(searchLower) ||
          transaccion.contact?.name?.toLowerCase().includes(searchLower) ||
          transaccion.descripcion?.toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.tipo_transaccion && transaccion.tipo_transaccion !== filters.tipo_transaccion) {
        return false;
      }

      // Priority filter
      if (filters.prioridad && transaccion.prioridad !== filters.prioridad) {
        return false;
      }

      // Stage filter
      if (filters.stage_id && transaccion.stage_id !== filters.stage_id) {
        return false;
      }

      // Sector filter
      if (filters.sector && transaccion.sector !== filters.sector) {
        return false;
      }

      // Owner filter
      if (filters.propietario && transaccion.propietario_transaccion !== filters.propietario) {
        return false;
      }

      // Value range filter
      if (filters.valor_min || filters.valor_max) {
        const valor = transaccion.valor_transaccion || 0;
        if (filters.valor_min && valor < parseFloat(filters.valor_min)) return false;
        if (filters.valor_max && valor > parseFloat(filters.valor_max)) return false;
      }

      // Date range filter
      if (filters.fecha_desde || filters.fecha_hasta) {
        const fechaCreacion = new Date(transaccion.created_at);
        if (filters.fecha_desde && fechaCreacion < filters.fecha_desde) return false;
        if (filters.fecha_hasta && fechaCreacion > filters.fecha_hasta) return false;
      }

      return true;
    });
  }, [transacciones, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  const handleViewTransaccion = (transaccion: Transaccion) => {
    navigate(`/transacciones/${transaccion.id}`);
  };

  const handleEditTransaccion = (transaccion: Transaccion) => {
    navigate(`/transacciones/${transaccion.id}`);
  };

  const handleAddTransaccion = (stageId?: string) => {
    navigate('/transacciones/new', { 
      state: stageId ? { defaultStageId: stageId } : undefined 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transacciones M&A</h1>
          <p className="text-gray-600 mt-1">Gestiona tus transacciones de fusiones y adquisiciones</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            onClick={refetch}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          
          {viewMode === 'kanban' && (
            <StageManagement />
          )}
          
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              size="sm" 
              onClick={() => setViewMode('table')}
              className="rounded-r-none border-r-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="primary" 
            onClick={() => handleAddTransaccion()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TransaccionFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        stages={stages}
        uniqueValues={uniqueValues}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold">{filteredTransacciones.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Activas</p>
              <p className="text-lg font-semibold">{filteredTransacciones.filter(t => t.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En Progreso</p>
              <p className="text-lg font-semibold">{filteredTransacciones.filter(t => t.stage?.name === 'In Progress').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Valor Total</p>
              <p className="text-lg font-semibold">
                €{filteredTransacciones.reduce((sum, t) => sum + (t.valor_transaccion || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">{filteredTransacciones.length} transacciones</h3>
          </div>
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableHead>Transacción</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableHeader>
              <TableBody>
                {filteredTransacciones.map((transaccion) => (
                  <TableRow key={transaccion.id}>
                    <TableCell>
                      <div className="font-medium">{transaccion.nombre_transaccion}</div>
                    </TableCell>
                    <TableCell>
                      {transaccion.company?.name ? (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {transaccion.company.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaccion.contact?.name ? (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {transaccion.contact.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaccion.valor_transaccion ? `€${transaccion.valor_transaccion.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge color="blue">{transaccion.stage?.name || 'nueva'}</Badge>
                    </TableCell>
                    <TableCell>{transaccion.propietario_transaccion || 'Sin asignar'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleViewTransaccion(transaccion)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Ver
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-6">
          <TransaccionesKanban
            transacciones={filteredTransacciones}
            onUpdateStage={updateTransaccionStage}
            onEdit={handleEditTransaccion}
            onView={handleViewTransaccion}
            onAddTransaccion={handleAddTransaccion}
            isLoading={loading}
            onRefresh={refetch}
          />
        </div>
      )}
    </div>
  );
}