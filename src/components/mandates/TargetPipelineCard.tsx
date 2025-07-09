import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, User, MapPin, Euro } from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';

interface TargetPipelineCardProps {
  target: MandateTarget;
  onClick: () => void;
}

export const TargetPipelineCard = ({ target, onClick }: TargetPipelineCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: target.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 flex-1">
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm truncate">{target.company_name}</h4>
              {target.sector && (
                <Badge variant="outline" className="text-xs mt-1">
                  {target.sector}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {target.contact_name && (
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {target.contact_name}
            </span>
          </div>
        )}

        {target.contacted && (
          <Badge variant="secondary" className="text-xs">
            ✓ Contactado
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};