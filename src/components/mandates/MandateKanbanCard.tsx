import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BuyingMandate } from '@/types/BuyingMandate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Building2, 
  User, 
  Calendar, 
  MapPin, 
  Euro, 
  MoreVertical,
  Eye,
  Edit,
  Target
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MandateKanbanCardProps {
  mandate: BuyingMandate;
  onEdit: (mandate: BuyingMandate) => void;
  onView?: (mandate: BuyingMandate) => void;
  isSelected?: boolean;
  onSelectItem?: (id: string) => void;
}

const MandateKanbanCard = memo(({ 
  mandate, 
  onEdit, 
  onView,
  isSelected = false,
  onSelectItem
}: MandateKanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mandate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getMandateTypeColor = (type: string) => {
    switch (type) {
      case 'compra': return 'bg-blue-100 text-blue-800';
      case 'venta': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMandateTypeText = (type: string) => {
    switch (type) {
      case 'compra': return 'Compra';
      case 'venta': return 'Venta';
      default: return type;
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: value > 999999 ? 'compact' : 'standard'
    }).format(value);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSelectItem) {
      onSelectItem(mandate.id);
    } else if (onView) {
      onView(mandate);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(mandate);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onView) {
      onView(mandate);
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
            {/* Mandate Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            
            {/* Mandate Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate">
                {mandate.mandate_name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {mandate.client_name}
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
        {/* Mandate Type */}
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${getMandateTypeColor(mandate.mandate_type)}`}>
            {getMandateTypeText(mandate.mandate_type)}
          </Badge>
        </div>

        {/* Target Sectors */}
        {mandate.target_sectors && mandate.target_sectors.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sectores:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {mandate.target_sectors.slice(0, 2).map((sector, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {sector}
                </Badge>
              ))}
              {mandate.target_sectors.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{mandate.target_sectors.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Revenue Range */}
        {(mandate.min_revenue || mandate.max_revenue) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Euro className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Facturación:</span>
            </div>
            <div className="text-xs font-medium">
              {formatCurrency(mandate.min_revenue)} - {formatCurrency(mandate.max_revenue)}
            </div>
          </div>
        )}

        {/* Target Locations */}
        {mandate.target_locations && mandate.target_locations.length > 0 && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {mandate.target_locations.slice(0, 2).join(', ')}
              {mandate.target_locations.length > 2 && ` +${mandate.target_locations.length - 2}`}
            </span>
          </div>
        )}

        {/* Assigned User */}
        {mandate.assigned_user_name && (
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {mandate.assigned_user_name}
            </span>
          </div>
        )}

        {/* Creation Date */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(mandate.created_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

MandateKanbanCard.displayName = 'MandateKanbanCard';

export { MandateKanbanCard };