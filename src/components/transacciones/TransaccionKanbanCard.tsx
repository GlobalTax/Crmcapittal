import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Transaccion } from '@/types/Transaccion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Calendar, 
  Euro, 
  MoreVertical,
  Star,
  AlertCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransaccionKanbanCardProps {
  transaccion: Transaccion;
  index: number;
  onEdit: (transaccion: Transaccion) => void;
  onView?: (transaccion: Transaccion) => void;
  isSelected?: boolean;
  onSelectItem?: (id: string) => void;
}

const TransaccionKanbanCard = memo(({ 
  transaccion, 
  index,
  onEdit, 
  onView,
  isSelected = false,
  onSelectItem
}: TransaccionKanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: transaccion.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Sin valor';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: transaccion.moneda || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const formatMillions = (amount?: number) => {
    if (!amount) return '---';
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} M€`;
    } else if (amount >= 1000) {
      return `${Math.round(amount / 1000)} K€`;
    }
    return `${amount} €`;
  };

  const getCompanyInitials = (companyName?: string) => {
    if (!companyName) return '?';
    return companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (prioridad?: string) => {
    const colors: Record<string, string> = {
      'urgente': 'bg-red-500',
      'alta': 'bg-orange-500',
      'media': 'bg-blue-500',
      'baja': 'bg-green-500'
    };
    return colors[prioridad || 'media'] || 'bg-blue-500';
  };

  const getPriorityIcon = (prioridad?: string) => {
    if (prioridad === 'urgente' || prioridad === 'alta') {
      return <AlertCircle className="h-3 w-3" />;
    }
    return null;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSelectItem) {
      onSelectItem(transaccion.id);
    } else if (onView) {
      onView(transaccion);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(transaccion);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onView) {
      onView(transaccion);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md
        ${isDragging ? 'opacity-50 scale-105 shadow-lg' : ''}
        ${isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''}
        bg-card border-border hover:border-primary/20
      `}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Company Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-primary">
                {getCompanyInitials(transaccion.company?.name || transaccion.nombre_transaccion)}
              </span>
            </div>
            
            {/* Company Name */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate">
                {transaccion.company?.name || transaccion.nombre_transaccion}
              </h4>
            </div>
          </div>
          
          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={handleViewClick}>
                  Ver detalles
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleEditClick}>
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Financial Metrics */}
        <div className="space-y-2">
          {/* Facturación */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Facturación</span>
            <span className="text-sm font-medium">
              {formatMillions(transaccion.ingresos)}
            </span>
          </div>
          
          {/* EBITDA */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">EBITDA</span>
            <span className="text-sm font-medium">
              {formatMillions(transaccion.ebitda)}
            </span>
          </div>
        </div>

        {/* Priority */}
        {transaccion.prioridad && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(transaccion.prioridad)}`} />
            <span className="text-xs text-muted-foreground capitalize">
              Prioridad {transaccion.prioridad}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TransaccionKanbanCard.displayName = 'TransaccionKanbanCard';

export { TransaccionKanbanCard };