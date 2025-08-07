import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Proposal } from '@/types/Proposal';
import { ProposalTemplate } from '@/types/ProposalTemplate';
import { ProposalKanbanColumn } from './ProposalKanbanColumn';
import { ProposalCard } from './ProposalCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, Sparkles } from 'lucide-react';
import { TemplateSelector } from '../templates/TemplateSelector';

interface ProposalKanbanBoardProps {
  proposals: Proposal[];
  onUpdateStatus: (proposalId: string, newStatus: string) => Promise<void>;
  onCreateProposal: () => void;
  onCreateFromTemplate: (template: ProposalTemplate, clientData?: any) => void;
  onViewProposal: (proposal: Proposal) => void;
  onEditProposal: (proposal: Proposal) => void;
  isLoading?: boolean;
  contacts?: any[];
  companies?: any[];
}

const PROPOSAL_STATUSES = [
  { id: 'draft', label: 'Borrador', color: 'bg-gray-100 text-gray-700', count: 0 },
  { id: 'sent', label: 'Enviada', color: 'bg-blue-100 text-blue-700', count: 0 },
  { id: 'in_review', label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700', count: 0 },
  { id: 'approved', label: 'Aprobada', color: 'bg-green-100 text-green-700', count: 0 },
  { id: 'rejected', label: 'Rechazada', color: 'bg-red-100 text-red-700', count: 0 }
];

export const ProposalKanbanBoard: React.FC<ProposalKanbanBoardProps> = ({
  proposals,
  onUpdateStatus,
  onCreateProposal,
  onCreateFromTemplate,
  onViewProposal,
  onEditProposal,
  isLoading = false,
  contacts = [],
  companies = []
}) => {
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<string>('all');
  const [valueFilter, setValueFilter] = useState<string>('all');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Filtrar propuestas
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.contact?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.company?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPracticeArea = 
      practiceAreaFilter === 'all' || 
      proposal.practice_area_id === practiceAreaFilter;

    const matchesValue = (() => {
      if (valueFilter === 'all') return true;
      const amount = proposal.total_amount || 0;
      switch (valueFilter) {
        case 'low': return amount < 10000;
        case 'medium': return amount >= 10000 && amount < 50000;
        case 'high': return amount >= 50000;
        default: return true;
      }
    })();

    return matchesSearch && matchesPracticeArea && matchesValue;
  });

  // Agrupar propuestas por estado
  const proposalsByStatus = React.useMemo(() => {
    const grouped = PROPOSAL_STATUSES.reduce((acc, status) => {
      acc[status.id] = filteredProposals.filter(proposal => proposal.status === status.id);
      return acc;
    }, {} as Record<string, Proposal[]>);
    return grouped;
  }, [filteredProposals]);

  // Calcular conteos para cada estado
  const statusesWithCounts = PROPOSAL_STATUSES.map(status => ({
    ...status,
    count: proposalsByStatus[status.id]?.length || 0
  }));

  const handleDragStart = (event: DragStartEvent) => {
    const proposalId = event.active.id as string;
    const proposal = filteredProposals.find(p => p.id === proposalId);
    setActiveProposal(proposal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveProposal(null);
      return;
    }

    const proposalId = active.id as string;
    const newStatus = over.id as string;
    
    // Verificar que el nuevo estado es válido
    if (!PROPOSAL_STATUSES.some(s => s.id === newStatus)) {
      setActiveProposal(null);
      return;
    }

    try {
      await onUpdateStatus(proposalId, newStatus);
    } catch (error) {
      console.error('Error updating proposal status:', error);
    }
    
    setActiveProposal(null);
  };

  // Obtener áreas de práctica únicas
  const practiceAreas = Array.from(
    new Set(proposals.map(p => p.practice_area).filter(Boolean))
  );

  const totalValue = filteredProposals.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const approvedValue = filteredProposals
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + (p.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pipeline de Propuestas</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>{filteredProposals.length} propuestas</span>
            <span>•</span>
            <span>€{totalValue.toLocaleString()} valor total</span>
            <span>•</span>
            <span>€{approvedValue.toLocaleString()} aprobado</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowTemplateSelector(true)} 
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Desde Template
          </Button>
          <Button onClick={onCreateProposal} variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Desde Cero
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, cliente o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            
            <Select value={practiceAreaFilter} onValueChange={setPracticeAreaFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Área práctica" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {practiceAreas.map((area) => (
                  <SelectItem key={area?.id} value={area?.id || ''}>
                    {area?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={valueFilter} onValueChange={setValueFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Valor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="low">&lt; €10K</SelectItem>
                <SelectItem value="medium">€10K - €50K</SelectItem>
                <SelectItem value="high">&gt; €50K</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          <SortableContext items={statusesWithCounts.map(s => s.id)} strategy={horizontalListSortingStrategy}>
            {statusesWithCounts.map((status) => (
              <ProposalKanbanColumn
                key={status.id}
                id={status.id}
                title={status.label}
                count={status.count}
                color={status.color}
                proposals={proposalsByStatus[status.id] || []}
                onViewProposal={onViewProposal}
                onEditProposal={onEditProposal}
                isLoading={isLoading}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeProposal ? (
            <div className="rotate-3 scale-105">
              <ProposalCard
                proposal={activeProposal}
                onView={() => {}}
                onEdit={() => {}}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Estado vacío */}
      {filteredProposals.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery || practiceAreaFilter !== 'all' || valueFilter !== 'all' 
              ? 'No hay propuestas que coincidan con los filtros aplicados.'
              : 'No hay propuestas creadas aún.'
            }
          </div>
          {(!searchQuery && practiceAreaFilter === 'all' && valueFilter === 'all') && (
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={() => setShowTemplateSelector(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Crear desde Template
              </Button>
              <Button onClick={onCreateProposal} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear desde Cero
              </Button>
            </div>
          )}
        </div>
      )}

      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        onSelectTemplate={onCreateFromTemplate}
        contacts={contacts}
        companies={companies}
      />
    </div>
  );
};