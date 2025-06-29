
import { Droppable, Draggable } from "react-beautiful-dnd";
import { TargetCompany } from "@/types/TargetCompany";
import { Deal } from "@/types/Deal";
import { Stage } from "@/types/Pipeline";
import { KanbanCard } from "./KanbanCard";
import { DealCard } from "@/components/deals/DealCard";

interface KanbanStageProps {
  stage: Stage;
  items: (Deal | TargetCompany)[];
  draggedCardId: string | null;
  pipelineType: 'DEAL' | 'TARGET_COMPANY' | 'LEAD' | 'OPERACION' | 'PROYECTO';
}

export const KanbanStage = ({ stage, items, draggedCardId, pipelineType }: KanbanStageProps) => {
  const renderCard = (item: Deal | TargetCompany, index: number) => {
    const isDragging = draggedCardId === item.id;
    
    if (pipelineType === 'DEAL' && 'deal_name' in item) {
      return (
        <Draggable key={item.id} draggableId={item.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <DealCard deal={item} isDragging={isDragging} />
            </div>
          )}
        </Draggable>
      );
    } else if ('name' in item) {
      return (
        <Draggable key={item.id} draggableId={item.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <KanbanCard company={item} />
            </div>
          )}
        </Draggable>
      );
    }
    return null;
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">{stage.name}</h4>
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
        </div>
        
        <Droppable droppableId={stage.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[200px] ${
                snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''
              }`}
            >
              {items.map((item, index) => renderCard(item, index))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};
