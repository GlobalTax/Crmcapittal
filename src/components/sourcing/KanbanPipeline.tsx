
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTargetCompanies } from "@/hooks/useTargetCompanies";
import { TargetCompany, TargetStatus } from "@/types/TargetCompany";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table } from "lucide-react";

const statusColumns: { id: TargetStatus; title: string; color: string }[] = [
  { id: 'IDENTIFIED', title: 'Identificado', color: 'bg-gray-100' },
  { id: 'RESEARCHING', title: 'Investigando', color: 'bg-blue-100' },
  { id: 'OUTREACH_PLANNED', title: 'Contacto Planificado', color: 'bg-yellow-100' },
  { id: 'CONTACTED', title: 'Contactado', color: 'bg-orange-100' },
  { id: 'IN_CONVERSATION', title: 'En Conversación', color: 'bg-green-100' },
  { id: 'ON_HOLD', title: 'En Pausa', color: 'bg-red-100' },
  { id: 'CONVERTED_TO_DEAL', title: 'Convertido', color: 'bg-purple-100' }
];

interface KanbanPipelineProps {
  onToggleView: () => void;
}

export const KanbanPipeline = ({ onToggleView }: KanbanPipelineProps) => {
  const { targetCompanies, loading, updateStatus } = useTargetCompanies();
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }
    })
  );

  // Group companies by status
  const companiesByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = targetCompanies.filter(company => company.status === column.id);
    return acc;
  }, {} as Record<TargetStatus, TargetCompany[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedCard(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggedCard(null);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination status
    let sourceStatus = '';
    let destinationStatus = overId as TargetStatus;

    // Find which status contains the dragged company
    for (const [status, companies] of Object.entries(companiesByStatus)) {
      if (companies.some((company: TargetCompany) => company.id === activeId)) {
        sourceStatus = status;
        break;
      }
    }

    if (sourceStatus === destinationStatus) return;

    const draggedCompany = companiesByStatus[sourceStatus as TargetStatus].find(
      (company: TargetCompany) => company.id === activeId
    );
    
    if (!draggedCompany) return;

    // Update status in backend
    await updateStatus(draggedCompany.id, destinationStatus);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pipeline de Empresas Objetivo</h3>
        <Button
          onClick={onToggleView}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Table className="h-4 w-4" />
          Vista Tabla
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              companies={companiesByStatus[column.id] || []}
              draggedCardId={draggedCard}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};
