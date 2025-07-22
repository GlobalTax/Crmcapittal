
import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Valoracion } from '@/types/Valoracion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Calendar, 
  Euro, 
  MoreVertical,
  Eye,
  Edit,
  CreditCard
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/utils/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ValoracionKanbanCardProps {
  valoracion: Valoracion;
  index: number;
  onEdit: (valoracion: Valoracion) => void;
  onView?: (valoracion: Valoracion) => void;
  isSelected?: boolean;
  onSelectItem?: (id: string) => void;
}

const ValoracionKanbanCard = memo(({ 
  valoracion, 
  index,
  onEdit, 
  onView,
  isSelected = false,
  onSelectItem
}: ValoracionKanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: valoracion.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'partial': return 'Parcial';
      case 'overdue': return 'Vencido';
      default: return 'Pendiente';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSelectItem) {
      onSelectItem(valoracion.id);
    } else if (onView) {
      onView(valoracion);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(valoracion);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onView) {
      onView(valoracion);
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
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            
            {/* Company Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate">
                {valoracion.company_name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {valoracion.client_name}
              </p>
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
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalles
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Financial Info */}
        {(valoracion.fee_quoted || valoracion.fee_charged) && (
          <div className="space-y-2">
            {valoracion.fee_quoted && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cotizado</span>
                <span className="text-sm font-medium">
                  {formatCurrency(valoracion.fee_quoted, valoracion.fee_currency)}
                </span>
              </div>
            )}
            
            {valoracion.fee_charged && valoracion.fee_charged > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cobrado</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(valoracion.fee_charged, valoracion.fee_currency)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Payment Status */}
        {valoracion.payment_status && (
          <div className="flex items-center gap-2">
            <CreditCard className="h-3 w-3 text-muted-foreground" />
            <Badge className={`text-xs ${getPaymentStatusColor(valoracion.payment_status)}`}>
              {getPaymentStatusText(valoracion.payment_status)}
            </Badge>
          </div>
        )}

        {/* Creation Date */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(valoracion.created_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

ValoracionKanbanCard.displayName = 'ValoracionKanbanCard';

export { ValoracionKanbanCard };
