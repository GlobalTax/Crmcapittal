import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SortableOpportunityRow } from '@/components/rod/SortableOpportunityRow';
import { OpportunityWithContacts } from '@/types/Opportunity';
import { useOpportunities } from '@/hooks/useOpportunities';

export default function RODBuilder() {
  const { opportunities, isLoading, refetch, updateOpportunity } = useOpportunities();
  const [sortedOpportunities, setSortedOpportunities] = useState<OpportunityWithContacts[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (opportunities) {
      // Sort by rod_order, putting null values at the end
      const sorted = [...opportunities].sort((a, b) => {
        if (a.rod_order === null && b.rod_order === null) return 0;
        if (a.rod_order === null) return 1;
        if (b.rod_order === null) return -1;
        return a.rod_order - b.rod_order;
      });
      setSortedOpportunities(sorted);
    }
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
      return '<p>No hay oportunidades seleccionadas para la ROD.</p>';
    }

    return highlightedOpportunities
      .map((opp) => {
        const sales = opp.value ? `${opp.value.toLocaleString()} EUR` : 'N/A';
        const ebitda = opp.ebitda ? `${opp.ebitda.toLocaleString()} EUR` : 'N/A';
        const notes = opp.notes || '';
        
        return `<p><b>${opp.title}</b> – ${sales} ventas / ${ebitda} EBITDA.<br>${notes}</p>`;
      })
      .join('\n');
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">ROD Builder</h1>
        <p className="text-muted-foreground">
          Selecciona y ordena las oportunidades para generar una ROD
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Opportunities DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Oportunidades</CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecciona las oportunidades y reordénalas arrastrando
            </p>
          </CardHeader>
          <CardContent>
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
                <div className="space-y-2">
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
          </CardContent>
        </Card>

        {/* Right Panel - Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa ROD</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {sortedOpportunities.filter(opp => opp.highlighted).length} seleccionadas
              </Badge>
              <Button
                onClick={handleGenerateROD}
                disabled={isGenerating || sortedOpportunities.filter(opp => opp.highlighted).length === 0}
                className="ml-auto"
              >
                {isGenerating ? 'Generando...' : 'Generar & Enviar ROD'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="border rounded-lg p-4 min-h-[400px] bg-background"
              dangerouslySetInnerHTML={{ __html: generatePreview() }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}