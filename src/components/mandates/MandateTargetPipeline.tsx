import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Target, TrendingUp } from 'lucide-react';
import { MandateTarget, MandateDocument } from '@/types/BuyingMandate';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { TargetPipelineColumn } from './TargetPipelineColumn';
import { TargetPipelineCard } from './TargetPipelineCard';
import { logger } from '@/utils/productionLogger';

interface MandateTargetPipelineProps {
  targets: MandateTarget[];
  documents: MandateDocument[];
  onTargetClick: (target: MandateTarget) => void;
}

const PIPELINE_COLUMNS = [
  { id: 'pending', title: 'Pendiente', status: 'pending' },
  { id: 'contacted', title: 'Contactado', status: 'contacted' },
  { id: 'interested', title: 'Interesado', status: 'interested' },
  { id: 'nda_signed', title: 'NDA Firmado', status: 'nda_signed' },
  { id: 'rejected', title: 'Descartado', status: 'rejected' },
] as const;

export const MandateTargetPipeline = ({
  targets,
  documents,
  onTargetClick,
}: MandateTargetPipelineProps) => {
  const { updateTarget } = useBuyingMandates();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter targets based on search and sector
  const filteredTargets = useMemo(() => {
    return targets.filter((target) => {
      const matchesSearch = 
        target.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.sector?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSector = 
        sectorFilter === 'all' || target.sector === sectorFilter;

      return matchesSearch && matchesSector;
    });
  }, [targets, searchTerm, sectorFilter]);

  // Group targets by status
  const groupedTargets = useMemo(() => {
    const groups: Record<string, MandateTarget[]> = {};
    
    PIPELINE_COLUMNS.forEach(column => {
      groups[column.id] = filteredTargets.filter(
        target => target.status === column.status
      );
    });
    
    return groups;
  }, [filteredTargets]);

  // Get unique sectors for filter
  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(
      new Set(targets.map(target => target.sector).filter(Boolean))
    );
    return uniqueSectors;
  }, [targets]);

  // Calculate pipeline metrics
  const pipelineMetrics = useMemo(() => {
    const totalTargets = filteredTargets.length;
    const contactedTargets = filteredTargets.filter(t => t.contacted).length;
    const totalValue = filteredTargets.reduce((sum, target) => {
      return sum + (target.revenues || target.ebitda || 0);
    }, 0);

    return {
      totalTargets,
      contactedTargets,
      contactRate: totalTargets > 0 ? Math.round((contactedTargets / totalTargets) * 100) : 0,
      totalValue,
    };
  }, [filteredTargets]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(amount);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropped on the same position, do nothing
    if (activeId === overId) return;

    // Find the target being moved
    const activeTarget = targets.find(t => t.id === activeId);
    if (!activeTarget) return;

    // Determine the new status based on the drop zone
    const targetColumn = PIPELINE_COLUMNS.find(col => col.id === overId);
    if (!targetColumn) return;

    // Only update if status actually changes
    if (activeTarget.status === targetColumn.status) return;

    // Update target status
    try {
      await updateTarget(activeId, { 
        status: targetColumn.status as MandateTarget['status'] 
      });
    } catch (error) {
      logger.error('Error updating target status in pipeline', { 
        error, 
        targetId: activeId, 
        newStatus: targetColumn.status 
      }, 'MandateTargetPipeline');
    }
  };

  const activeTarget = activeId ? targets.find(t => t.id === activeId) : null;

  return (
    <div className="space-y-6">
      {/* Pipeline Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Total Targets</span>
          </div>
          <p className="text-2xl font-bold mt-1">{pipelineMetrics.totalTargets}</p>
        </div>
        
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Contactados</span>
          </div>
          <p className="text-2xl font-bold mt-1">{pipelineMetrics.contactedTargets}</p>
          <p className="text-xs text-muted-foreground">
            {pipelineMetrics.contactRate}% del total
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Valor Pipeline</span>
          </div>
          <p className="text-2xl font-bold mt-1">
            {pipelineMetrics.totalValue > 0 ? formatCurrency(pipelineMetrics.totalValue) : '-'}
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Interesados</span>
          </div>
          <p className="text-2xl font-bold mt-1">
            {groupedTargets.interested?.length || 0}
          </p>
          <p className="text-xs text-muted-foreground">
            + {groupedTargets.nda_signed?.length || 0} con NDA
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa, contacto o sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los sectores</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector} value={sector!}>
                {sector}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline Kanban */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((column) => (
            <TargetPipelineColumn
              key={column.id}
              id={column.id}
              title={column.title}
              targets={groupedTargets[column.id] || []}
              onTargetClick={onTargetClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTarget ? (
            <TargetPipelineCard
              target={activeTarget}
              onClick={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};