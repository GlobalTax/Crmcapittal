
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransacciones } from '@/hooks/useTransacciones';
import { useStages } from '@/hooks/useStages';
import { TransaccionesKanban } from '@/components/transacciones/TransaccionesKanban';
import { TransaccionForm } from '@/components/transacciones/TransaccionForm';
import { TransaccionesTable } from '@/components/transacciones/TransaccionesTable';
import { TransaccionDetailsSidebar } from '@/components/transacciones/TransaccionDetailsSidebar';
import { StageManagement } from '@/components/transacciones/StageManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/hooks/use-toast';
import { Transaccion } from '@/types/Transaccion';
import { 
  Plus, 
  LayoutGrid, 
  Table, 
  Settings, 
  TrendingUp, 
  Euro, 
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MinimalTransaccionesProps {
  title?: string;
  description?: string;
}

export default function MinimalTransacciones({ 
  title = "Transacciones", 
  description = "Gestiona todas las transacciones de M&A" 
}: MinimalTransaccionesProps) {
  const [activeTab, setActiveTab] = useState('kanban');
  const [showTransaccionForm, setShowTransaccionForm] = useState(false);
  const [editingTransaccion, setEditingTransaccion] = useState<Transaccion | null>(null);
  const [selectedTransaccion, setSelectedTransaccion] = useState<Transaccion | null>(null);
  const [selectedStageForNew, setSelectedStageForNew] = useState<string | undefined>();
  const [showStageManagement, setShowStageManagement] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { toast } = useToast();

  const {
    transacciones,
    loading,
    error,
    createTransaccion,
    updateTransaccion,
    updateTransaccionStage,
    deleteTransaccion,
    refetch
  } = useTransacciones();

  const { stages, loading: stagesLoading } = useStages('DEAL');

  // Filter transacciones based on search and filters
  const filteredTransacciones = useMemo(() => {
    return transacciones.filter(transaccion => {
      const matchesSearch = searchTerm === '' || 
        transaccion.nombre_transaccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaccion.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaccion.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStage = filterStage === 'all' || transaccion.stage?.id === filterStage;
      const matchesType = filterType === 'all' || transaccion.tipo_transaccion === filterType;
      const matchesPriority = filterPriority === 'all' || transaccion.prioridad === filterPriority;

      return matchesSearch && matchesStage && matchesType && matchesPriority;
    });
  }, [transacciones, searchTerm, filterStage, filterType, filterPriority]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalValue = filteredTransacciones.reduce((sum, t) => sum + (t.valor_transaccion || 0), 0);
    const totalCount = filteredTransacciones.length;
    const highPriorityCount = filteredTransacciones.filter(t => t.prioridad === 'alta' || t.prioridad === 'urgente').length;
    const recentCount = filteredTransacciones.filter(t => {
      const updatedDate = new Date(t.updated_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updatedDate > weekAgo;
    }).length;

    return {
      totalCount,
      totalValue,
      highPriorityCount,
      recentCount
    };
  }, [filteredTransacciones]);

  // Get unique values for filters
  const uniqueStages = useMemo(() => {
    const stageMap = new Map();
    transacciones.forEach(t => {
      if (t.stage) {
        stageMap.set(t.stage.id, t.stage);
      }
    });
    return Array.from(stageMap.values());
  }, [transacciones]);

  const uniqueTypes = useMemo(() => {
    return [...new Set(transacciones.map(t => t.tipo_transaccion))];
  }, [transacciones]);

  const uniquePriorities = useMemo(() => {
    return [...new Set(transacciones.map(t => t.prioridad))];
  }, [transacciones]);

  const handleCreateTransaccion = useCallback(async (transaccionData: Omit<Transaccion, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createTransaccion(transaccionData);
      setShowTransaccionForm(false);
      setSelectedStageForNew(undefined);
      toast({
        title: "Transacción creada",
        description: "La transacción ha sido creada exitosamente.",
      });
    } catch (error) {
      console.error('Error creating transaccion:', error);
    }
  }, [createTransaccion, toast]);

  const handleUpdateTransaccion = useCallback(async (id: string, updates: Partial<Transaccion>) => {
    try {
      await updateTransaccion(id, updates);
      setShowTransaccionForm(false);
      setEditingTransaccion(null);
      toast({
        title: "Transacción actualizada",
        description: "Los cambios han sido guardados exitosamente.",
      });
    } catch (error) {
      console.error('Error updating transaccion:', error);
    }
  }, [updateTransaccion, toast]);

  const handleDeleteTransaccion = useCallback(async (id: string) => {
    try {
      await deleteTransaccion(id);
      toast({
        title: "Transacción eliminada",
        description: "La transacción ha sido eliminada exitosamente.",
      });
    } catch (error) {
      console.error('Error deleting transaccion:', error);
    }
  }, [deleteTransaccion, toast]);

  const handleEditTransaccion = useCallback((transaccion: Transaccion) => {
    setEditingTransaccion(transaccion);
    setShowTransaccionForm(true);
  }, []);

  const handleViewTransaccion = useCallback((transaccion: Transaccion) => {
    setSelectedTransaccion(transaccion);
  }, []);

  const handleAddTransaccion = useCallback((stageId?: string) => {
    setSelectedStageForNew(stageId);
    setShowTransaccionForm(true);
  }, []);

  const handleStageUpdate = useCallback(async (transaccionId: string, stageId: string) => {
    return updateTransaccionStage(transaccionId, stageId);
  }, [updateTransaccionStage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStage('all');
    setFilterType('all');
    setFilterPriority('all');
  };

  if (loading || stagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refetch}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStageManagement(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Gestionar Etapas
          </Button>
          <Button onClick={() => handleAddTransaccion()}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transacciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentCount} actualizadas esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              En {stats.totalCount} transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Prioridad</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Transacción</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCount > 0 ? formatCurrency(stats.totalValue / stats.totalCount) : '€0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor medio de transacciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etapas</SelectItem>
                {uniqueStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {uniquePriorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm || filterStage !== 'all' || filterType !== 'all' || filterPriority !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="kanban" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="table" className="gap-2">
            <Table className="h-4 w-4" />
            Tabla
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          <TransaccionesKanban
            transacciones={filteredTransacciones}
            onUpdateStage={handleStageUpdate}
            onEdit={handleEditTransaccion}
            onView={handleViewTransaccion}
            onAddTransaccion={handleAddTransaccion}
            isLoading={loading}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <TransaccionesTable
            transacciones={filteredTransacciones}
            onEdit={handleEditTransaccion}
            onView={handleViewTransaccion}
            onDelete={handleDeleteTransaccion}
            onRefresh={refetch}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs and Drawers */}
      <Dialog open={showTransaccionForm} onOpenChange={setShowTransaccionForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransaccion ? 'Editar Transacción' : 'Nueva Transacción'}
            </DialogTitle>
          </DialogHeader>
          <TransaccionForm
            transaccion={editingTransaccion}
            onSubmit={editingTransaccion ? 
              (data) => handleUpdateTransaccion(editingTransaccion.id, data) : 
              handleCreateTransaccion
            }
            onCancel={() => {
              setShowTransaccionForm(false);
              setEditingTransaccion(null);
              setSelectedStageForNew(undefined);
            }}
            initialStageId={selectedStageForNew}
          />
        </DialogContent>
      </Dialog>

      {/* Transaccion Details Sidebar/Drawer */}
      {selectedTransaccion && (
        <>
          {isDesktop ? (
            <Dialog open={!!selectedTransaccion} onOpenChange={() => setSelectedTransaccion(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedTransaccion.nombre_transaccion}</DialogTitle>
                </DialogHeader>
                <TransaccionDetailsSidebar
                  transaccion={selectedTransaccion}
                  onUpdate={(id, updates) => handleUpdateTransaccion(id, updates)}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <Drawer open={!!selectedTransaccion} onOpenChange={() => setSelectedTransaccion(null)}>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{selectedTransaccion.nombre_transaccion}</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4">
                  <TransaccionDetailsSidebar
                    transaccion={selectedTransaccion}
                    onUpdate={(id, updates) => handleUpdateTransaccion(id, updates)}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </>
      )}

      {/* Stage Management Dialog */}
      <Dialog open={showStageManagement} onOpenChange={setShowStageManagement}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gestión de Etapas</DialogTitle>
          </DialogHeader>
          <StageManagement pipelineType="DEAL" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
