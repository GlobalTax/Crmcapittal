import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Building, TrendingUp, Clock, User, HandCoins, Target } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RODItem } from '@/types/RODItem';

interface RODItemRowProps {
  item: RODItem;
  onHighlightToggle: (id: string, type: 'operation' | 'lead', highlighted: boolean) => void;
}

export function RODItemRow({ item, onHighlightToggle }: RODItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return `€${value.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': case 'qualified': return 'bg-green-100 text-green-800';
      case 'pending_review': case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'approved': case 'nurturing': return 'bg-blue-100 text-blue-800';
      case 'in_process': return 'bg-purple-100 text-purple-800';
      case 'rejected': case 'disqualified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = () => {
    return item.type === 'operation' ? (
      <HandCoins size={16} className="text-blue-600" />
    ) : (
      <Target size={16} className="text-green-600" />
    );
  };

  const getTypeLabel = () => {
    return item.type === 'operation' ? 'Mandato de Venta' : 'Lead Potencial';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-start gap-3 p-4 border rounded-xl bg-card hover:shadow-md transition-all duration-200 ${
        item.highlighted 
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
        checked={item.highlighted || false}
        onCheckedChange={(checked) => onHighlightToggle(item.id, item.type, !!checked)}
        className="shrink-0 mt-1"
      />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getTypeIcon()}
              <h4 className="font-semibold text-base truncate text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              {item.rod_order && (
                <Badge variant="secondary" className="text-xs px-2">
                  #{item.rod_order}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Building size={14} />
              <span>{item.company_name}</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getTypeLabel()}
              </Badge>
              {item.sector && (
                <Badge variant="outline" className="text-xs">
                  {item.sector}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1 items-end">
            <Badge className={`text-xs ${getStatusColor(item.status)}`}>
              {item.status}
            </Badge>
            {item.type === 'lead' && item.lead_score && (
              <div className="text-xs text-muted-foreground">
                Score: {item.lead_score}
              </div>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-green-600" />
            <span className="text-muted-foreground">
              {item.type === 'operation' ? 'Importe:' : 'Valor:'}
            </span>
            <span className="font-medium text-green-700">
              {formatCurrency(item.value || item.amount)}
            </span>
          </div>
          {item.ebitda && (
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-blue-600" />
              <span className="text-muted-foreground">EBITDA:</span>
              <span className="font-medium text-blue-700">{formatCurrency(item.ebitda)}</span>
            </div>
          )}
        </div>

        {/* Additional info for leads */}
        {item.type === 'lead' && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {item.email && (
              <span>✉ {item.email}</span>
            )}
            {item.assigned_to && (
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>{item.assigned_to.first_name} {item.assigned_to.last_name}</span>
              </div>
            )}
          </div>
        )}

        {/* Additional info for operations */}
        {item.type === 'operation' && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {item.location && (
              <span>📍 {item.location}</span>
            )}
            {item.contact_email && (
              <span>✉ {item.contact_email}</span>
            )}
          </div>
        )}
        
        {/* Description */}
        {item.description && (
          <div className="bg-muted/30 rounded-lg p-2 border-l-2 border-muted">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </div>
        )}

        {/* Footer with timestamps */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-muted/30">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>
              {new Date(item.created_at).toLocaleDateString('es-ES')}
            </span>
          </div>
          {item.updated_at !== item.created_at && (
            <span>
              Actualizado: {new Date(item.updated_at).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}