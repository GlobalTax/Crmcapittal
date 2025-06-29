
import { Droppable, Draggable } from "react-beautiful-dnd";
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

export const KanbanColumn = ({ id, title, color, companies, draggedCardId }: KanbanColumnProps) => {
  const isDropDisabled = false; // You can add logic here to disable dropping in certain columns

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
        <Droppable droppableId={id} isDropDisabled={isDropDisabled}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-3 min-h-[500px] transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50 bg-opacity-50' : ''
              }`}
            >
              {companies.map((company, index) => (
                <Draggable
                  key={company.id}
                  draggableId={company.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-transform ${
                        snapshot.isDragging ? 'rotate-3 scale-105' : ''
                      } ${
                        draggedCardId === company.id ? 'opacity-50' : ''
                      }`}
                    >
                      <KanbanCard company={company} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* Empty state */}
              {companies.length === 0 && (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  No hay empresas en esta etapa
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};
