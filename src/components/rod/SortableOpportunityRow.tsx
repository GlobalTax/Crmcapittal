import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { OpportunityWithContacts } from '@/types/Opportunity';

interface SortableOpportunityRowProps {
  opportunity: OpportunityWithContacts;
  onHighlightToggle: (id: string, highlighted: boolean) => void;
}

export function SortableOpportunityRow({ opportunity, onHighlightToggle }: SortableOpportunityRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return `${value.toLocaleString()} EUR`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors ${
        opportunity.highlighted ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical size={16} />
      </div>

      <Checkbox
        checked={opportunity.highlighted || false}
        onCheckedChange={(checked) => onHighlightToggle(opportunity.id, !!checked)}
        className="shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium truncate">{opportunity.title}</h4>
          {opportunity.sector && (
            <Badge variant="outline" className="text-xs">
              {opportunity.sector}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Ventas: {formatCurrency(opportunity.value)}</span>
          <span>EBITDA: {formatCurrency(opportunity.ebitda)}</span>
        </div>
        
        {opportunity.notes && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {opportunity.notes}
          </p>
        )}
      </div>

      {opportunity.rod_order && (
        <Badge variant="secondary" className="shrink-0">
          #{opportunity.rod_order}
        </Badge>
      )}
    </div>
  );
}