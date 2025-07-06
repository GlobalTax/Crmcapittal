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

  const getPriorityColor = (prioridad?: string) => {
    const colors: Record<string, string> = {
      'urgente': 'destructive',
      'alta': 'destructive',
      'media': 'default',
      'baja': 'secondary'
    };
    return colors[prioridad || 'media'] || 'default';
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
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground truncate pr-2">
              {transaccion.nombre_transaccion}
            </h4>
            
            {/* Priority Badge */}
            {transaccion.prioridad && transaccion.prioridad !== 'media' && (
              <div className="flex items-center gap-1 mt-1">
                {getPriorityIcon(transaccion.prioridad)}
                <Badge 
                  variant={getPriorityColor(transaccion.prioridad) as any}
                  className="text-xs"
                >
                  {transaccion.prioridad}
                </Badge>
              </div>
            )}
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
        {/* Value */}
        {transaccion.valor_transaccion && (
          <div className="flex items-center gap-2 text-sm">
            <Euro className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">
              {formatCurrency(transaccion.valor_transaccion)}
            </span>
          </div>
        )}

        {/* Company */}
        {transaccion.company?.name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span className="truncate">{transaccion.company.name}</span>
          </div>
        )}

        {/* Contact */}
        {transaccion.contact?.name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            <span className="truncate">{transaccion.contact.name}</span>
          </div>
        )}

        {/* Close Date */}
        {transaccion.fecha_cierre && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">
              Cierre: {formatDistanceToNow(new Date(transaccion.fecha_cierre), { 
                addSuffix: true, 
                locale: es 
              })}
            </span>
          </div>
        )}

        {/* Owner */}
        {transaccion.propietario_transaccion && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
            <span className="truncate text-xs">{transaccion.propietario_transaccion}</span>
          </div>
        )}

        {/* Type & Sector */}
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {transaccion.tipo_transaccion}
          </Badge>
          {transaccion.sector && (
            <Badge variant="secondary" className="text-xs">
              {transaccion.sector}
            </Badge>
          )}
        </div>

        {/* Last Activity */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-2">
          <Clock className="h-3 w-3" />
          <span>
            Actualizada {formatDistanceToNow(new Date(transaccion.updated_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

TransaccionKanbanCard.displayName = 'TransaccionKanbanCard';

export { TransaccionKanbanCard };