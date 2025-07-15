import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Building, TrendingUp, Clock } from 'lucide-react';
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

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active': case 'activo': return 'bg-green-100 text-green-800';
      case 'pending': case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'closed': case 'cerrado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-start gap-3 p-4 border rounded-xl bg-card hover:shadow-md transition-all duration-200 ${
        opportunity.highlighted 
          ? 'ring-2 ring-primary border-primary/50 shadow-sm bg-primary/5' 
          : 'hover:border-muted-foreground/20'
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground transition-colors mt-1"
      >
        <GripVertical size={18} />
      </div>

      {/* Checkbox */}
      <Checkbox
        checked={opportunity.highlighted || false}
        onCheckedChange={(checked) => onHighlightToggle(opportunity.id, !!checked)}
        className="shrink-0 mt-1"
      />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-base truncate text-foreground group-hover:text-primary transition-colors">
                {opportunity.title}
              </h4>
              {opportunity.rod_order && (
                <Badge variant="secondary" className="text-xs px-2">
                  #{opportunity.rod_order}
                </Badge>
              )}
            </div>
            
            {opportunity.company?.name && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building size={14} />
                <span>{opportunity.company.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1 items-end">
            {opportunity.sector && (
              <Badge variant="outline" className="text-xs">
                {opportunity.sector}
              </Badge>
            )}
            {opportunity.status && (
              <Badge className={`text-xs ${getStatusColor(opportunity.status)}`}>
                {opportunity.status}
              </Badge>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-green-600" />
            <span className="text-muted-foreground">Ventas:</span>
            <span className="font-medium text-green-700">{formatCurrency(opportunity.value)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-blue-600" />
            <span className="text-muted-foreground">EBITDA:</span>
            <span className="font-medium text-blue-700">{formatCurrency(opportunity.ebitda)}</span>
          </div>
        </div>
        
        {/* Notes */}
        {opportunity.notes && (
          <div className="bg-muted/30 rounded-lg p-2 border-l-2 border-muted">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {opportunity.notes}
            </p>
          </div>
        )}

        {/* Footer with timestamps */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-muted/30">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>
              {new Date(opportunity.created_at || '').toLocaleDateString('es-ES')}
            </span>
          </div>
          {opportunity.updated_at !== opportunity.created_at && (
            <span>
              Actualizado: {new Date(opportunity.updated_at || '').toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}