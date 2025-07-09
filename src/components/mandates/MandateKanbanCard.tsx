import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BuyingMandate } from '@/types/BuyingMandate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Calendar, 
  User, 
  Eye, 
  Edit,
  Target,
  Euro
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MandateKanbanCardProps {
  mandate: BuyingMandate;
  onEdit: (mandate: BuyingMandate) => void;
  onView?: (mandate: BuyingMandate) => void;
  isLoading?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const MandateKanbanCard: React.FC<MandateKanbanCardProps> = ({
  mandate,
  onEdit,
  onView,
  isLoading = false,
  isSelected = false,
  onSelect
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: mandate.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(mandate.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(mandate);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(mandate);
    }
  };

  const getMandateTypeColor = (type: string) => {
    switch (type) {
      case 'compra':
        return 'bg-blue-100 text-blue-800';
      case 'venta':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`
        bg-white rounded-lg p-4 shadow-sm border cursor-pointer transition-all
        hover:shadow-md hover:border-gray-300
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200'}
        ${isLoading ? 'pointer-events-none' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">
            {mandate.mandate_name}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {mandate.client_name}
          </p>
        </div>
        
        <Badge className={`ml-2 ${getMandateTypeColor(mandate.mandate_type)}`}>
          {mandate.mandate_type}
        </Badge>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-3">
        {/* Assigned User */}
        {mandate.assigned_user_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-3 w-3" />
            <span className="truncate">{mandate.assigned_user_name}</span>
          </div>
        )}

        {/* Target Sectors */}
        {mandate.target_sectors && mandate.target_sectors.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target className="h-3 w-3" />
            <span className="truncate">
              {mandate.target_sectors.slice(0, 2).join(', ')}
              {mandate.target_sectors.length > 2 && ` +${mandate.target_sectors.length - 2}`}
            </span>
          </div>
        )}

        {/* Revenue Range */}
        {(mandate.min_revenue || mandate.max_revenue) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Euro className="h-3 w-3" />
            <span className="truncate">
              {mandate.min_revenue ? `${(mandate.min_revenue / 1000000).toFixed(1)}M` : '0'}
              {' - '}
              {mandate.max_revenue ? `${(mandate.max_revenue / 1000000).toFixed(1)}M` : '∞'}
            </span>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>{format(new Date(mandate.created_at), 'dd MMM yyyy', { locale: es })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100">
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="h-8 px-2"
            title="Ver detalles"
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="h-8 px-2"
          title="Editar mandato"
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};