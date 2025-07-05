import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Euro, Calendar, Users, Building2, MapPin, Eye, Edit, MoreHorizontal, Grip } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Negocio } from '@/types/Negocio';

interface OptimizedKanbanTaskProps {
  negocio: Negocio;
  index: number;
  onEdit: (negocio: Negocio) => void;
  onView?: (negocio: Negocio) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelectItem?: (id: string) => void;
}

/**
 * OptimizedKanbanTask Component
 * 
 * Memoized version of KanbanTask with enhanced UX features:
 * - Better drag visual feedback
 * - Loading states
 * - Touch-friendly interface
 * - Keyboard accessibility
 * 
 * @param negocio - The business deal data
 * @param index - Position index for drag & drop
 * @param onEdit - Callback for edit action
 * @param onView - Optional callback for view action
 * @param isDragging - External dragging state
 */
const OptimizedKanbanTask = memo(({ 
  negocio, 
  index, 
  onEdit, 
  onView, 
  isDragging,
  isSelected = false,
  onSelectItem
}: OptimizedKanbanTaskProps) => {
  /**
   * Gets priority-based color classes for badge styling
   */
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300';
      case 'alta': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300';
      case 'media': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
      case 'baja': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300';
    }
  };

  /**
   * Format currency values
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  /**
   * Get owner initials for avatar
   */
  const getOwnerInitials = (name: string) => {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging
  } = useSortable({ id: negocio.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => onSelectItem?.(negocio.id)}
      className={`
        group relative bg-background border border-border rounded-lg p-4 
        transition-all duration-200 ease-in-out cursor-grab active:cursor-grabbing
        hover:shadow-md hover:border-primary/20
        focus-within:ring-2 focus-within:ring-primary/20
        ${isSelected ? 'ring-2 ring-primary/50 bg-primary/5' : ''}
        ${sortableIsDragging 
          ? 'shadow-2xl rotate-2 scale-105 ring-2 ring-primary/30 z-50 opacity-50' 
          : 'hover:scale-[1.02]'
        }
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      {/* Drag Handle */}
      <div 
        {...listeners}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        aria-label="Arrastrar negocio"
      >
        <Grip className="h-4 w-4 text-muted-foreground" />
      </div>

          {/* Header */}
          <div className="pl-6 pb-3">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-medium line-clamp-2 text-foreground pr-2">
                {negocio.nombre_negocio}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPriorityColor(negocio.prioridad)}`}
                >
                  {negocio.prioridad}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Más opciones"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border border-border shadow-md">
                    {onView && (
                      <DropdownMenuItem 
                        onClick={() => onView(negocio)}
                        className="flex items-center gap-2 hover:bg-muted"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalles
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onEdit(negocio)}
                      className="flex items-center gap-2 hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Company Info */}
            {negocio.company && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{negocio.company.name}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            {/* Value */}
            {negocio.valor_negocio && (
              <div className="flex items-center gap-2 text-xs">
                <Euro className="h-3 w-3 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-green-600">
                  {formatCurrency(negocio.valor_negocio)}
                </span>
              </div>
            )}
            
            {/* Contact */}
            {negocio.contact && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{negocio.contact.name}</span>
              </div>
            )}

            {/* Location */}
            {negocio.ubicacion && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{negocio.ubicacion}</span>
              </div>
            )}

            {/* Close Date */}
            {negocio.fecha_cierre && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>
                  {new Date(negocio.fecha_cierre).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Badge variant="outline" className="text-xs">
                {negocio.tipo_negocio}
              </Badge>
              
              {negocio.propietario_negocio && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                    {getOwnerInitials(negocio.propietario_negocio)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

      {/* Dragging Overlay */}
      {sortableIsDragging && (
        <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none" />
      )}
    </div>
  );
});

OptimizedKanbanTask.displayName = 'OptimizedKanbanTask';

export { OptimizedKanbanTask };