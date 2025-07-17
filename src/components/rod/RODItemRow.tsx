import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Building, TrendingUp, Clock, User, HandCoins, Target, Star } from 'lucide-react';
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
      case 'available': case 'qualified': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200';
      case 'pending_review': case 'contacted': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200';
      case 'approved': case 'nurturing': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
      case 'in_process': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200';
      case 'rejected': case 'disqualified': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = () => {
    return item.type === 'operation' ? (
      <HandCoins size={16} className="text-amber-600" />
    ) : (
      <Target size={16} className="text-emerald-600" />
    );
  };

  const getTypeLabel = () => {
    return item.type === 'operation' ? 'Mandato de Venta' : 'Lead Potencial';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-start gap-4 p-5 border rounded-2xl bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${
        item.highlighted 
          ? 'ring-2 ring-primary border-primary/50 shadow-lg bg-gradient-to-r from-primary/5 via-primary/3 to-primary/5' 
          : 'hover:border-primary/30 hover:bg-card/80'
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-primary transition-all duration-200 mt-1 p-1 rounded-lg hover:bg-primary/10"
      >
        <GripVertical size={18} />
      </div>

      {/* Enhanced Checkbox */}
      <div className="relative">
        <Checkbox
          checked={item.highlighted || false}
          onCheckedChange={(checked) => onHighlightToggle(item.id, item.type, !!checked)}
          className="shrink-0 mt-1 w-5 h-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        {item.highlighted && (
          <div className="absolute -inset-1 bg-primary/20 rounded-full animate-pulse"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Enhanced Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-background to-muted border">
                {getTypeIcon()}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg truncate text-foreground group-hover:text-primary transition-colors leading-tight">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <Building size={14} />
                  <span className="font-medium">{item.company_name}</span>
                </div>
              </div>
              {item.rod_order && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20">
                  #{item.rod_order}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 ${
                  item.type === 'operation' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {getTypeLabel()}
              </Badge>
              {item.sector && (
                <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                  {item.sector}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <Badge className={`text-xs px-3 py-1 font-medium ${getStatusColor(item.status)}`}>
              {item.status}
            </Badge>
            {item.type === 'lead' && item.lead_score && (
              <div className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded-full">
                <Star size={12} className="text-amber-500" />
                <span className="font-medium">{item.lead_score}</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="p-1 bg-emerald-500 rounded-lg">
              <TrendingUp size={12} className="text-white" />
            </div>
            <div>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium block">
                {item.type === 'operation' ? 'Importe' : 'Valor'}
              </span>
              <span className="font-bold text-emerald-800 dark:text-emerald-200">
                {formatCurrency(item.value || item.amount)}
              </span>
            </div>
          </div>
          {item.ebitda ? (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="p-1 bg-blue-500 rounded-lg">
                <TrendingUp size={12} className="text-white" />
              </div>
              <div>
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium block">EBITDA</span>
                <span className="font-bold text-blue-800 dark:text-blue-200">{formatCurrency(item.ebitda)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-3 bg-muted/30 rounded-xl border border-muted">
              <span className="text-xs text-muted-foreground">Sin datos EBITDA</span>
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
        
        {/* Enhanced Description */}
        {item.description && (
          <div className="bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 rounded-xl p-4 border border-muted/50">
            <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 mt-2 border-t border-gradient-to-r from-transparent via-muted/30 to-transparent">
          <div className="flex items-center gap-2 px-2 py-1 bg-muted/20 rounded-full">
            <Clock size={12} />
            <span className="font-medium">
              {new Date(item.created_at).toLocaleDateString('es-ES')}
            </span>
          </div>
          {item.updated_at !== item.created_at && (
            <div className="flex items-center gap-1 px-2 py-1 bg-muted/20 rounded-full">
              <span className="text-xs">Actualizado:</span>
              <span className="font-medium">
                {new Date(item.updated_at).toLocaleDateString('es-ES')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}