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
import { Search, Filter, Calendar, TrendingUp, Building, Target, HandCoins, Users } from 'lucide-react';

export default function RODBuilder() {
  const { items, isLoading, refetch, updateItem } = useRODItems();
  const [sortedItems, setSortedItems] = useState<RODItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

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
      // Sort by rod_order, putting null values at the end
      const sorted = [...filteredItems].sort((a, b) => {
        if (a.rod_order === null && b.rod_order === null) return 0;
        if (a.rod_order === null) return 1;
        if (b.rod_order === null) return -1;
        return a.rod_order - b.rod_order;
      });
      setSortedItems(sorted);
    }
  }, [filteredItems]);

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
    await updateItem(itemId, type, { highlighted });
    refetch();
  };

  const generatePreview = () => {
    const highlightedItems = sortedItems.filter(item => item.highlighted);
    
    if (highlightedItems.length === 0) {
      return '<div class="text-center text-gray-500 py-8"><p>No hay elementos seleccionados para la ROD.</p></div>';
    }

    // Separate by type
    const operations = highlightedItems.filter(item => item.type === 'operation');
    const leads = highlightedItems.filter(item => item.type === 'lead');

    const renderItems = (items: RODItem[], title: string, color: string) => {
      if (items.length === 0) return '';
      
      const itemsHtml = items.map((item, index) => {
        const value = item.value || item.amount;
        const sales = value ? `€${value.toLocaleString()}` : 'N/A';
        const ebitda = item.ebitda ? `€${item.ebitda.toLocaleString()}` : 'N/A';
        const description = item.description || item.message || 'Sin descripción adicional';
        
        return `
          <div style="margin-bottom: 24px; padding: 16px; border-left: 4px solid ${color}; background-color: #f8fafc; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">
                ${index + 1}. ${item.title}
              </h3>
              <span style="background-color: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                ${item.sector}
              </span>
            </div>
            
            <div style="margin-bottom: 12px;">
              <p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px;">
                <strong>Empresa:</strong> ${item.company_name}
              </p>
              ${item.type === 'operation' && item.location ? `
                <p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px;">
                  <strong>Ubicación:</strong> ${item.location}
                </p>
              ` : ''}
              ${item.type === 'lead' && item.lead_score ? `
                <p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px;">
                  <strong>Lead Score:</strong> ${item.lead_score}
                </p>
              ` : ''}
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">
              <div>
                <span style="color: #059669; font-weight: 600; font-size: 14px;">
                  ${item.type === 'operation' ? 'Importe:' : 'Valor:'}
                </span>
                <span style="margin-left: 8px; color: #065f46; font-weight: 500;">${sales}</span>
              </div>
              ${item.ebitda ? `
                <div>
                  <span style="color: #0284c7; font-weight: 600; font-size: 14px;">EBITDA:</span>
                  <span style="margin-left: 8px; color: #0c4a6e; font-weight: 500;">${ebitda}</span>
                </div>
              ` : ''}
            </div>
            
            <div style="background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">
                <strong>Descripción:</strong> ${description}
              </p>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div style="margin-bottom: 32px;">
          <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1e293b; border-bottom: 2px solid ${color}; padding-bottom: 8px;">
            ${title} (${items.length})
          </h3>
          ${itemsHtml}
        </div>
      `;
    };

    const totalValue = highlightedItems.reduce((sum, item) => sum + (item.value || item.amount || 0), 0);
    const totalEbitda = highlightedItems.reduce((sum, item) => sum + (item.ebitda || 0), 0);

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <div style="margin-bottom: 24px; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">
          <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">
            Reporte de Oportunidades de Dealflow (ROD)
          </h2>
          <p style="margin: 0; opacity: 0.9; font-size: 16px;">
            ${highlightedItems.length} oportunidades seleccionadas • Valor total: €${totalValue.toLocaleString()}
          </p>
        </div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
            Resumen Ejecutivo
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 20px;">
            <div style="text-align: center; padding: 16px; background-color: #f1f5f9; border-radius: 8px;">
              <div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${highlightedItems.length}</div>
              <div style="font-size: 14px; color: #64748b; font-weight: 500;">Total Elementos</div>
            </div>
            <div style="text-align: center; padding: 16px; background-color: #fef3c7; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: 700; color: #d97706;">${operations.length}</div>
              <div style="font-size: 14px; color: #64748b; font-weight: 500;">Mandatos de Venta</div>
            </div>
            <div style="text-align: center; padding: 16px; background-color: #d1fae5; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: 700; color: #059669;">${leads.length}</div>
              <div style="font-size: 14px; color: #64748b; font-weight: 500;">Leads Potenciales</div>
            </div>
            <div style="text-align: center; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: 700; color: #059669;">€${totalValue.toLocaleString()}</div>
              <div style="font-size: 14px; color: #64748b; font-weight: 500;">Valor Total</div>
            </div>
            ${totalEbitda > 0 ? `
              <div style="text-align: center; padding: 16px; background-color: #eff6ff; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: 700; color: #0284c7;">€${totalEbitda.toLocaleString()}</div>
                <div style="font-size: 14px; color: #64748b; font-weight: 500;">EBITDA Total</div>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div>
          ${renderItems(operations, 'Mandatos de Venta', '#d97706')}
          ${renderItems(leads, 'Leads Potenciales', '#059669')}
        </div>
        
        <div style="margin-top: 32px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; text-align: center; color: #64748b; font-size: 12px;">
            Reporte generado automáticamente el ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    `;
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

  if (isLoading) {
    return <div className="p-6">Cargando operaciones y leads...</div>;
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ROD Builder</h1>
        <p className="text-muted-foreground text-lg">
          Selecciona y ordena mandatos de venta y leads potenciales para generar una ROD profesional
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Elementos</p>
                <p className="text-2xl font-bold">{filteredItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <HandCoins className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Mandatos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredItems.filter(item => item.type === 'operation').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Leads</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredItems.filter(item => item.type === 'lead').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Seleccionadas</p>
                <p className="text-2xl font-bold text-blue-600">{selectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium">Valor Total</p>
                <p className="text-lg font-bold text-emerald-600">€{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - ROD Items DataTable */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Gestión de ROD
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Busca, filtra y organiza mandatos de venta y leads para tu ROD
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar mandatos y leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los sectores</SelectItem>
                    {uniqueSectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || sectorFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all') && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Mostrando {sortedItems.length} de {items?.length || 0} elementos</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSectorFilter('all');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>

            {/* ROD Items List */}
            {sortedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No se encontraron elementos</p>
                <p className="text-sm">Ajusta los filtros para ver más resultados</p>
              </div>
            ) : (
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
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
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
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Live Preview */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vista Previa ROD
            </CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={selectedCount > 0 ? "default" : "secondary"}>
                  {selectedCount} seleccionadas
                </Badge>
                {selectedCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    €{totalValue.toLocaleString()} total
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleGenerateROD}
                disabled={isGenerating || selectedCount === 0}
                size="sm"
                className="shrink-0"
              >
                {isGenerating ? 'Generando...' : 'Generar & Enviar ROD'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedCount === 0 ? (
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Vista Previa ROD</p>
                  <p className="text-sm">Selecciona oportunidades para ver la vista previa</p>
                </div>
              ) : (
                <div className="border rounded-lg bg-gradient-to-br from-background to-muted/20">
                  <div className="p-4 border-b bg-primary/5">
                    <h3 className="font-semibold text-lg">Reporte de Oportunidades de Dealflow</h3>
                    <p className="text-sm text-muted-foreground">
                      Generado el {new Date().toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div 
                    className="p-4 max-h-[400px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: generatePreview() }}
                  />
                  <div className="p-4 border-t bg-muted/30 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total oportunidades: {selectedCount}</span>
                      <span>Valor total: €{totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}