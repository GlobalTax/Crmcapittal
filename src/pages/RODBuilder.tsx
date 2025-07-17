import { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RODItemRow } from '@/components/rod/RODItemRow';
import { RODItem, RODItemType } from '@/types/RODItem';
import { useRODItems } from '@/hooks/useRODItems';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Building, 
  Target, 
  HandCoins, 
  Users, 
  Play,
  Download,
  Eye,
  Star,
  BarChart3,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  Sparkles,
  FileText,
  Send
} from 'lucide-react';
import { RODPreviewPanel } from '@/components/rod/RODPreviewPanel';
import { RODStatsDisplay } from '@/components/rod/RODStatsDisplay';
import { RODEmptyState } from '@/components/rod/RODEmptyState';
import { RODFloatingToolbar } from '@/components/rod/RODFloatingToolbar';

export default function RODBuilder() {
  const { items, isLoading, refetch, updateItem } = useRODItems();
  const [sortedItems, setSortedItems] = useState<RODItem[]>([]);
  const [optimisticHighlights, setOptimisticHighlights] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    if (!items) return [];
    
    return items.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSector = sectorFilter === 'all' || item.sector === sectorFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      
      return matchesSearch && matchesSector && matchesStatus && matchesType;
    });
  }, [items, searchQuery, sectorFilter, statusFilter, typeFilter]);

  useEffect(() => {
    if (filteredItems) {
      // Apply optimistic highlights to items
      const itemsWithOptimisticHighlights = filteredItems.map(item => ({
        ...item,
        highlighted: optimisticHighlights[item.id] !== undefined 
          ? optimisticHighlights[item.id] 
          : item.highlighted
      }));
      
      // Sort by rod_order, putting null values at the end
      const sorted = [...itemsWithOptimisticHighlights].sort((a, b) => {
        if (a.rod_order === null && b.rod_order === null) return 0;
        if (a.rod_order === null) return 1;
        if (b.rod_order === null) return -1;
        return a.rod_order - b.rod_order;
      });
      setSortedItems(sorted);
    }
  }, [filteredItems, optimisticHighlights]);

  // Get unique sectors, statuses, and types for filters
  const uniqueSectors = useMemo(() => {
    if (!items) return [];
    return [...new Set(items.map(item => item.sector).filter(Boolean))];
  }, [items]);

  const uniqueStatuses = useMemo(() => {
    if (!items) return [];
    return [...new Set(items.map(item => item.status).filter(Boolean))];
  }, [items]);

  const uniqueTypes = [
    { value: 'operation', label: 'Mandatos de Venta' },
    { value: 'lead', label: 'Leads Potenciales' }
  ];

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sortedItems.findIndex(item => item.id === active.id);
      const newIndex = sortedItems.findIndex(item => item.id === over.id);
      
      const newOrder = arrayMove(sortedItems, oldIndex, newIndex);
      setSortedItems(newOrder);

      // Update rod_order for all items
      for (let i = 0; i < newOrder.length; i++) {
        const item = newOrder[i];
        if (item.rod_order !== i + 1) {
          await updateItem(item.id, item.type, { rod_order: i + 1 });
        }
      }
      
      refetch();
    }
  };

  const handleHighlightToggle = async (itemId: string, type: RODItemType, highlighted: boolean) => {
    // Optimistic update for immediate UI feedback
    setOptimisticHighlights(prev => ({
      ...prev,
      [itemId]: highlighted
    }));

    try {
      await updateItem(itemId, type, { highlighted });
      // Clear optimistic state after successful update
      setOptimisticHighlights(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      refetch();
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticHighlights(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      toast.error('Error al actualizar selección');
    }
  };

  const handleGenerateROD = async () => {
    try {
      setIsGenerating(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');

      const { data, error } = await supabase.functions.invoke('generate_rod', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast.success('ROD enviada');
      refetch();
    } catch (error) {
      console.error('Error generating ROD:', error);
      toast.error('Error al generar ROD');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAll = () => {
    const allVisible = filteredItems.every(item => item.highlighted);
    filteredItems.forEach(item => {
      handleHighlightToggle(item.id, item.type, !allVisible);
    });
  };

  const handleClearSelection = () => {
    const selectedItems = sortedItems.filter(item => item.highlighted);
    selectedItems.forEach(item => {
      handleHighlightToggle(item.id, item.type, false);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const selectedCount = sortedItems.filter(item => item.highlighted).length;
  const selectedOperations = sortedItems.filter(item => item.highlighted && item.type === 'operation').length;
  const selectedLeads = sortedItems.filter(item => item.highlighted && item.type === 'lead').length;
  const totalValue = sortedItems
    .filter(item => item.highlighted)
    .reduce((sum, item) => sum + (item.value || item.amount || 0), 0);
  const totalEbitda = sortedItems
    .filter(item => item.highlighted)
    .reduce((sum, item) => sum + (item.ebitda || 0), 0);

  if (filteredItems.length === 0) {
    return <RODEmptyState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djEwaDEwVjM0SDM2ek0yMCAyMHYxMGgxMFYyMEgyMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-foreground/20 rounded-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">ROD Builder Premium</h1>
                <p className="text-primary-foreground/80 text-lg">
                  Herramienta avanzada para crear Reports de Oportunidades de Dealflow profesionales
                </p>
              </div>
            </div>
            
            <RODStatsDisplay 
              totalItems={filteredItems.length}
              selectedCount={selectedCount}
              selectedOperations={selectedOperations}
              selectedLeads={selectedLeads}
              totalValue={totalValue}
              totalEbitda={totalEbitda}
            />
          </div>
        </div>

        {/* Control Panel */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Panel de Control</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Ocultar' : 'Vista'} Previa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Seleccionar Todo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                  className="gap-2"
                  disabled={selectedCount === 0}
                >
                  <Target className="h-4 w-4" />
                  Limpiar Selección
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Advanced Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en título, empresa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  {uniqueSectors.map(sector => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>{filteredItems.length} elementos encontrados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{selectedCount} seleccionados</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>€{totalValue.toLocaleString()} valor total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          {/* ROD Items List */}
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Elementos de ROD
                </CardTitle>
                <Badge variant="secondary" className="px-3 py-1">
                  {filteredItems.length} elementos
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={sortedItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {sortedItems.map((item) => (
                      <RODItemRow
                        key={item.id}
                        item={item}
                        onHighlightToggle={handleHighlightToggle}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          {showPreview && (
            <RODPreviewPanel
              selectedItems={sortedItems.filter(item => item.highlighted)}
              onGenerate={handleGenerateROD}
              isGenerating={isGenerating}
            />
          )}
        </div>

        {/* Floating Toolbar */}
        <RODFloatingToolbar
          selectedCount={selectedCount}
          onGenerate={handleGenerateROD}
          onPreview={() => setShowPreview(!showPreview)}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          isGenerating={isGenerating}
          showPreview={showPreview}
        />
      </div>
    </div>
  );
}