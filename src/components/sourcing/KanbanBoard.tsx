
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { TargetCompany, TargetStatus } from "@/types/TargetCompany";
import { Deal } from "@/types/Deal";
import { Stage, PipelineType } from "@/types/Pipeline";
import { KanbanStage } from "./KanbanStage";

interface KanbanBoardProps {
  stages: Stage[];
  itemsByStage: Record<string, (Deal | TargetCompany)[]>;
  draggedCardId: string | null;
  pipelineType: PipelineType;
  onDragEnd: (result: DropResult) => Promise<void>;
  onDragStart: (start: any) => void;
}

export const KanbanBoard = ({ 
  stages, 
  itemsByStage, 
  draggedCardId, 
  pipelineType, 
  onDragEnd, 
  onDragStart 
}: KanbanBoardProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanStage
            key={stage.id}
            stage={stage}
            items={itemsByStage[stage.id] || []}
            draggedCardId={draggedCardId}
            pipelineType={pipelineType}
          />
        ))}
      </div>
    </DragDropContext>
  );
};
