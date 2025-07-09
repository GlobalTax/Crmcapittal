import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { MandateTarget } from '@/types/BuyingMandate';
import { TargetPipelineCard } from './TargetPipelineCard';

interface TargetPipelineColumnProps {
  id: string;
  title: string;
  targets: MandateTarget[];
  onTargetClick: (target: MandateTarget) => void;
}

export const TargetPipelineColumn = ({
  id,
  title,
  targets,
  onTargetClick,
}: TargetPipelineColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 bg-muted/30 rounded-lg p-4 ${
        isOver ? 'bg-muted/50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {targets.length}
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {targets.map((target) => (
          <TargetPipelineCard
            key={target.id}
            target={target}
            onClick={() => onTargetClick(target)}
          />
        ))}
        
        {targets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Sin targets en esta etapa
          </div>
        )}
      </div>
    </div>
  );
};