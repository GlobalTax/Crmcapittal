
import React, { useState, useMemo, useCallback } from 'react';
import { useTransacciones } from '@/hooks/useTransacciones';
import { useStages } from '@/hooks/useStages';
import { TransaccionesKanban } from '@/components/transacciones/TransaccionesKanban';
// Removed non-existent components for now
import { TransaccionDetailsSidebar } from '@/components/transacciones/TransaccionDetailsSidebar';
import { StageManagement } from '@/components/transacciones/StageManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaccion } from '@/types/Transaccion';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table, 
  Settings,
  RefreshCw,
  Download,
  FileText,
  TrendingUp
} from 'lucide-react';

interface MinimalTransaccionesProps {
  title?: string;
  description?: string;
}

const MinimalTransacciones = ({ 
  title = "Transacciones M&A",
  description = "Gestiona las transacciones de fusiones y adquisiciones"
}: MinimalTransaccionesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'kanban' | 'table'>('kanban');
  const [showTransaccionForm, setShowTransaccionForm] = useState(false);
  const [selectedTransaccion, setSelectedTransaccion] = useState<Transaccion | null>(null);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
  const [editingTransaccion, setEditingTransaccion] = useState<Transaccion | null>(null);
  const [selectedStageForNew, setSelectedStageForNew] = useState<string>();

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

  const { stages } = useStages('DEAL');

  // Filter transacciones based on search and filters
  const filteredTransacciones = useMemo(() => {
    if (!transacciones) return [];

    return transacciones.filter((transaccion) => {
      const searchMatch = !searchTerm || 
        transaccion.nombre_transaccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaccion.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaccion.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const stageMatch = selectedStage === 'all' || transaccion.stage_id === selectedStage;
      const priorityMatch = selectedPriority === 'all' || transaccion.prioridad === selectedPriority;
      const typeMatch = selectedType === 'all' || transaccion.tipo_transaccion === selectedType;

      return searchMatch && stageMatch && priorityMatch && typeMatch;
    });
  }, [transacciones, searchTerm, selectedStage, selectedPriority, selectedType]);

  // Statistics
  const stats = useMemo(() => {
    if (!transacciones) return { total: 0, totalValue: 0, highPriority: 0 };

    const total = transacciones.length;
    const totalValue = transacciones.reduce((sum, t) => sum + (t.valor_transaccion || 0), 0);
    const highPriority = transacciones.filter(t => t.prioridad === 'alta' || t.prioridad === 'urgente').length;

    return { total, totalValue, highPriority };
  }, [transacciones]);

  const handleCreateTransaccion = useCallback(async (data: any) => {
    try {
      await createTransaccion({
        ...data,
        stage_id: selectedStageForNew || undefined
      });
      setShowTransaccionForm(false);
      setSelectedStageForNew(undefined);
      toast({
        title: "Transacción creada",
        description: "La transacción ha sido creada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al crear transacción",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  }, [createTransaccion, selectedStageForNew, toast]);

  const handleUpdateTransaccion = useCallback(async (id: string, updates: Partial<Transaccion>) => {
    try {
      await updateTransaccion(id, updates);
      setEditingTransaccion(null);
      setShowDetailsSidebar(false);
      toast({
        title: "Transacción actualizada",
        description: "La transacción ha sido actualizada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al actualizar transacción",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  }, [updateTransaccion, toast]);

  const handleViewTransaccion = useCallback((transaccion: Transaccion) => {
    setSelectedTransaccion(transaccion);
    setShowDetailsSidebar(true);
  }, []);

  const handleEditTransaccion = useCallback((transaccion: Transaccion) => {
    setEditingTransaccion(transaccion);
    setShowTransaccionForm(true);
  }, []);

  const handleAddTransaccion = useCallback((stageId?: string) => {
    setSelectedStageForNew(stageId);
    setEditingTransaccion(null);
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
    setSelectedStage('all');
    setSelectedPriority('all');
    setSelectedType('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => handleAddTransaccion()} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Transacción
          </Button>
          <StageManagement />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Total Transacciones</span>
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-muted-foreground">Valor Total</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</div>
        </div>
        
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-muted-foreground">Alta Prioridad</span>
          </div>
          <div className="text-2xl font-bold">{stats.highPriority}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar transacciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las etapas</SelectItem>
              {stages?.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="venta">Venta</SelectItem>
              <SelectItem value="compra">Compra</SelectItem>
              <SelectItem value="fusion">Fusión</SelectItem>
              <SelectItem value="valoracion">Valoración</SelectItem>
              <SelectItem value="consultoria">Consultoría</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || selectedStage !== 'all' || selectedPriority !== 'all' || selectedType !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'kanban' | 'table')}>
        <TabsList className="grid w-fit grid-cols-2">
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
          <div className="text-center py-8 text-muted-foreground">
            Vista de tabla próximamente disponible
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showTransaccionForm} onOpenChange={setShowTransaccionForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransaccion ? 'Editar Transacción' : 'Nueva Transacción'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            Formulario de transacciones próximamente disponible
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Sidebar */}
      <Sheet open={showDetailsSidebar} onOpenChange={setShowDetailsSidebar}>
        <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalles de la Transacción</SheetTitle>
          </SheetHeader>
          {selectedTransaccion && (
            <TransaccionDetailsSidebar
              transaccion={selectedTransaccion}
              onUpdate={handleUpdateTransaccion}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MinimalTransacciones;
