import { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SortableOpportunityRow } from '@/components/rod/SortableOpportunityRow';
import { OpportunityWithContacts } from '@/types/Opportunity';
import { useOpportunities } from '@/hooks/useOpportunities';
import { Search, Filter, Calendar, TrendingUp, Building, Target } from 'lucide-react';

export default function RODBuilder() {
  const { opportunities, isLoading, refetch, updateOpportunity } = useOpportunities();
  const [sortedOpportunities, setSortedOpportunities] = useState<OpportunityWithContacts[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtered and sorted opportunities
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    
    return opportunities.filter((opp) => {
      const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           opp.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           opp.company?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSector = sectorFilter === 'all' || opp.sector === sectorFilter;
      const matchesStatus = statusFilter === 'all' || opp.status === statusFilter;
      
      return matchesSearch && matchesSector && matchesStatus;
    });
  }, [opportunities, searchQuery, sectorFilter, statusFilter]);

  useEffect(() => {
    if (filteredOpportunities) {
      // Sort by rod_order, putting null values at the end
      const sorted = [...filteredOpportunities].sort((a, b) => {
        if (a.rod_order === null && b.rod_order === null) return 0;
        if (a.rod_order === null) return 1;
        if (b.rod_order === null) return -1;
        return a.rod_order - b.rod_order;
      });
      setSortedOpportunities(sorted);
    }
  }, [filteredOpportunities]);

  // Get unique sectors and statuses for filters
  const uniqueSectors = useMemo(() => {
    if (!opportunities) return [];
    return [...new Set(opportunities.map(opp => opp.sector).filter(Boolean))];
  }, [opportunities]);

  const uniqueStatuses = useMemo(() => {
    if (!opportunities) return [];
    return [...new Set(opportunities.map(opp => opp.status).filter(Boolean))];
  }, [opportunities]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sortedOpportunities.findIndex(item => item.id === active.id);
      const newIndex = sortedOpportunities.findIndex(item => item.id === over.id);
      
      const newOrder = arrayMove(sortedOpportunities, oldIndex, newIndex);
      setSortedOpportunities(newOrder);

      // Update rod_order for all opportunities
      for (let i = 0; i < newOrder.length; i++) {
        const opportunity = newOrder[i];
        if (opportunity.rod_order !== i + 1) {
          await updateOpportunity({
            id: opportunity.id,
            rod_order: i + 1,
          });
        }
      }
      
      refetch();
    }
  };

  const handleHighlightToggle = async (opportunityId: string, highlighted: boolean) => {
    await updateOpportunity({
      id: opportunityId,
      highlighted,
    });
    refetch();
  };

  const generatePreview = () => {
    const highlightedOpportunities = sortedOpportunities.filter(opp => opp.highlighted);
    
    if (highlightedOpportunities.length === 0) {
      return '<div class="text-center text-gray-500 py-8"><p>No hay oportunidades seleccionadas para la ROD.</p></div>';
    }

    const opportunities = highlightedOpportunities
      .map((opp, index) => {
        const sales = opp.value ? `€${opp.value.toLocaleString()}` : 'N/A';
        const ebitda = opp.ebitda ? `€${opp.ebitda.toLocaleString()}` : 'N/A';
        const company = opp.company?.name || 'Empresa no especificada';
        const sector = opp.sector || 'Sector no especificado';
        const notes = opp.notes || 'Sin notas adicionales';
        
        return `
          <div style="margin-bottom: 24px; padding: 16px; border-left: 4px solid #3b82f6; background-color: #f8fafc; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">
                ${index + 1}. ${opp.title}
              </h3>
              <span style="background-color: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                ${sector}
              </span>
            </div>
            
            <div style="margin-bottom: 12px;">
              <p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px;">
                <strong>Empresa:</strong> ${company}
              </p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">
              <div>
                <span style="color: #059669; font-weight: 600; font-size: 14px;">Ventas:</span>
                <span style="margin-left: 8px; color: #065f46; font-weight: 500;">${sales}</span>
              </div>
              <div>
                <span style="color: #0284c7; font-weight: 600; font-size: 14px;">EBITDA:</span>
                <span style="margin-left: 8px; color: #0c4a6e; font-weight: 500;">${ebitda}</span>
              </div>
            </div>
            
            <div style="background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">
                <strong>Descripción:</strong> ${notes}
              </p>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <div style="margin-bottom: 24px; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">
          <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">
            Reporte de Oportunidades de Dealflow
          </h2>
          <p style="margin: 0; opacity: 0.9; font-size: 16px;">
            ${highlightedOpportunities.length} oportunidades seleccionadas • Valor total: €${totalValue.toLocaleString()}
          </p>
        </div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
            Resumen Ejecutivo
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
            <div style="text-align: center; padding: 16px; background-color: #f1f5f9; border-radius: 8px;">
              <div style="font-size: 28px; font-weight: 700; color: #3b82f6;">${highlightedOpportunities.length}</div>
              <div style="font-size: 14px; color: #64748b; font-weight: 500;">Oportunidades</div>
            </div>
            <div style="text-align: center; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: 700; color: #059669;">€${totalValue.toLocaleString()}</div>
              <div style="font-size: 14px; color: #64748b; font-weight: 500;">Valor Total</div>
            </div>
            <div style="text-align: center; padding: 16px; background-color: #eff6ff; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: 700; color: #0284c7;">€${totalEbitda.toLocaleString()}</div>
              <div style="font-size: 14px; color: #64748b; font-weight: 500;">EBITDA Total</div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
            Detalle de Oportunidades
          </h3>
          ${opportunities}
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
    return <div className="p-6">Cargando oportunidades...</div>;
  }

  const selectedCount = sortedOpportunities.filter(opp => opp.highlighted).length;
  const totalValue = sortedOpportunities
    .filter(opp => opp.highlighted)
    .reduce((sum, opp) => sum + (opp.value || 0), 0);
  const totalEbitda = sortedOpportunities
    .filter(opp => opp.highlighted)
    .reduce((sum, opp) => sum + (opp.ebitda || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ROD Builder</h1>
        <p className="text-muted-foreground text-lg">
          Selecciona y ordena las oportunidades para generar una ROD profesional
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Oportunidades</p>
                <p className="text-2xl font-bold">{filteredOpportunities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Seleccionadas</p>
                <p className="text-2xl font-bold text-green-600">{selectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Valor Total</p>
                <p className="text-lg font-bold text-blue-600">€{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">EBITDA Total</p>
                <p className="text-lg font-bold text-purple-600">€{totalEbitda.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Opportunities DataTable */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Gestión de Oportunidades
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Busca, filtra y organiza las oportunidades para tu ROD
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar oportunidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="flex-1">
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
                  <SelectTrigger className="flex-1">
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

              {(searchQuery || sectorFilter !== 'all' || statusFilter !== 'all') && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Mostrando {sortedOpportunities.length} de {opportunities?.length || 0} oportunidades</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSectorFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>

            {/* Opportunities List */}
            {sortedOpportunities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No se encontraron oportunidades</p>
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
                  items={sortedOpportunities.map(opp => opp.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {sortedOpportunities.map((opportunity) => (
                      <SortableOpportunityRow
                        key={opportunity.id}
                        opportunity={opportunity}
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