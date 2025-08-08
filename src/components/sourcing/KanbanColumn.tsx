
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TargetCompany, TargetStatus } from "@/types/TargetCompany";
import { KanbanCard } from "./KanbanCard";
import { Badge } from "@/components/ui/badge";

interface KanbanColumnProps {
  id: TargetStatus;
  title: string;
  color: string;
  companies: TargetCompany[];
  draggedCardId?: string | null;
}

// Draggable Company Card Component
const DraggableKanbanCard = ({ company, draggedCardId }: { company: TargetCompany; draggedCardId?: string | null }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: company.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`transition-transform ${
        isDragging ? 'opacity-50' : ''
      } ${
        draggedCardId === company.id ? 'opacity-50' : ''
      }`}
    >
      <KanbanCard company={company} />
    </div>
  );
};

export const KanbanColumn = ({ id, title, color, companies, draggedCardId }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const companyIds = companies.map(company => company.id);

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`rounded-lg border-2 border-dashed border-gray-200 ${color} p-4 min-h-[600px]`}>
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <Badge variant="secondary" className="bg-white">
            {companies.length}
          </Badge>
        </div>

        {/* Droppable Area */}
        <div
          ref={setNodeRef}
          className={`space-y-3 min-h-[500px] transition-colors ${
            isOver ? 'bg-blue-50 bg-opacity-50' : ''
          }`}
        >
          <SortableContext items={companyIds} strategy={verticalListSortingStrategy}>
            {companies.map((company, index) => (
              <DraggableKanbanCard
                key={company.id}
                company={company}
                draggedCardId={draggedCardId}
              />
            ))}
          </SortableContext>
          
          {/* Empty state */}
          {companies.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No hay empresas en esta etapa
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
