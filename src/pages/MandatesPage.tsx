import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { useBuyingMandates } from "@/hooks/useBuyingMandates";
import { BuyingMandate } from "@/types/BuyingMandate";
import { MandatesKanban } from "@/components/mandates/MandatesKanban";
import { MandateFiltersComponent, MandateFilters } from "@/components/mandates/MandateFilters";
import { CreateMandateDialog } from "@/components/mandates/CreateMandateDialog";
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { User, Briefcase, Building2, Target, TrendingUp, LayoutGrid, List, Plus, RefreshCw, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MandatesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const navigate = useNavigate();
  const { mandates, isLoading, updateMandateStatus, fetchMandates } = useBuyingMandates();
  const [filters, setFilters] = useState<MandateFilters>({
    search: '',
    mandate_type: '',
    status: '',
    client_name: '',
    assigned_user: '',
    target_sectors: '',
    fecha_desde: undefined,
    fecha_hasta: undefined,
  });

  // Get unique values for filters
  const uniqueValues = useMemo(() => {
    const clientNames = [...new Set(mandates.map(m => m.client_name).filter(Boolean))];
    const assignedUsers = [...new Set(mandates.map(m => m.assigned_user_name).filter(Boolean))];
    const targetSectors = [...new Set(mandates.flatMap(m => m.target_sectors || []).filter(Boolean))];
    
    return { clientNames, assignedUsers, targetSectors };
  }, [mandates]);

  // Apply filtering
  const filteredMandates = useMemo(() => {
    return mandates.filter(mandate => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = (
          mandate.mandate_name?.toLowerCase().includes(searchLower) ||
          mandate.client_name?.toLowerCase().includes(searchLower) ||
          mandate.assigned_user_name?.toLowerCase().includes(searchLower) ||
          mandate.target_sectors?.some(sector => sector.toLowerCase().includes(searchLower))
        );
        if (!matchesSearch) return false;
      }

      // Mandate type filter
      if (filters.mandate_type && mandate.mandate_type !== filters.mandate_type) {
        return false;
      }

      // Status filter
      if (filters.status && mandate.status !== filters.status) {
        return false;
      }

      // Client name filter
      if (filters.client_name && mandate.client_name !== filters.client_name) {
        return false;
      }

      // Assigned user filter
      if (filters.assigned_user && mandate.assigned_user_name !== filters.assigned_user) {
        return false;
      }

      // Target sectors filter
      if (filters.target_sectors && !mandate.target_sectors?.includes(filters.target_sectors)) {
        return false;
      }

      // Date range filter
      if (filters.fecha_desde || filters.fecha_hasta) {
        const fechaCreacion = new Date(mandate.created_at);
        if (filters.fecha_desde && fechaCreacion < filters.fecha_desde) return false;
        if (filters.fecha_hasta && fechaCreacion > filters.fecha_hasta) return false;
      }

      return true;
    });
  }, [mandates, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando mandatos...</p>
        </div>
      </div>
    );
  }

  const handleViewMandate = (mandate: BuyingMandate) => {
    navigate(`/mandatos/${mandate.id}`);
  };

  const handleEditMandate = (mandate: BuyingMandate) => {
    navigate(`/mandatos/${mandate.id}`);
  };

  const handleMandateCreated = () => {
    fetchMandates();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'paused':
        return 'Pausado';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mandatos de Compra</h1>
            <p className="text-gray-600 mt-1">Gestiona los mandatos de búsqueda de empresas para adquisición</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              onClick={fetchMandates}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
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
            <CreateMandateDialog 
              onSuccess={handleMandateCreated}
              trigger={
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Mandato
                </Button>
              }
            />
          </div>
        </div>

        {/* Filters */}
        <MandateFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          uniqueValues={uniqueValues}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-lg font-semibold">{filteredMandates.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Activos</p>
                <p className="text-lg font-semibold">{filteredMandates.filter(m => m.status === 'active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">En Progreso</p>
                <p className="text-lg font-semibold">{filteredMandates.filter(m => m.status === 'active' || m.status === 'paused').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Sectores</p>
                <p className="text-lg font-semibold">{uniqueValues.targetSectors.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-semibold">{filteredMandates.length} mandatos</h3>
            </div>
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableHead>Mandato</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Asignado</TableHead>
                  <TableHead>Sectores</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableHeader>
                <TableBody>
                  {filteredMandates.map((mandate) => (
                    <TableRow key={mandate.id}>
                      <TableCell>
                        <div className="font-medium">{mandate.mandate_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {mandate.client_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge color={mandate.mandate_type === 'compra' ? 'blue' : 'green'}>
                          {mandate.mandate_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge color={mandate.status === 'active' ? 'green' : mandate.status === 'paused' ? 'yellow' : mandate.status === 'completed' ? 'blue' : 'red'}>
                          {getStatusText(mandate.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {mandate.assigned_user_name ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {mandate.assigned_user_name}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {mandate.target_sectors?.slice(0, 2).map((sector, idx) => (
                            <Badge key={idx} color="gray">
                              {sector}
                            </Badge>
                          ))}
                          {mandate.target_sectors && mandate.target_sectors.length > 2 && (
                            <Badge color="gray">
                              +{mandate.target_sectors.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(mandate.created_at), 'dd/MM/yyyy', { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => handleViewMandate(mandate)}
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
            <MandatesKanban
              mandates={filteredMandates}
              onUpdateStatus={updateMandateStatus}
              onEdit={handleEditMandate}
              onView={handleViewMandate}
              onAddMandate={() => {}}
              isLoading={isLoading}
              onRefresh={fetchMandates}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}