import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Euro, Calendar, Users, Building2, MapPin, Eye, Edit, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Negocio } from '@/types/Negocio';

interface KanbanTaskProps {
  negocio: Negocio;
  index: number;
  onEdit: (negocio: Negocio) => void;
  onView?: (negocio: Negocio) => void;
}

/**
 * KanbanTask Component
 * 
 * Renders a draggable task card within a Kanban column.
 * Contains negocio information, priority badge, and action menu.
 * 
 * @param negocio - The business deal data
 * @param index - Position index for drag & drop
 * @param onEdit - Callback for edit action
 * @param onView - Optional callback for view action
 */
export const KanbanTask = ({ negocio, index, onEdit, onView }: KanbanTaskProps) => {
  /**
   * Gets priority-based color classes for badge styling
   * @param prioridad - Priority level string
   * @returns Tailwind classes for priority colors
   */
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'baja': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
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
      {...listeners}
      className={`bg-background border border-border rounded-lg p-4 transition-all hover:shadow-md cursor-grab active:cursor-grabbing ${
        isDragging ? 'shadow-lg rotate-2 opacity-50' : ''
      }`}
    >
          {/* Header */}
          <div className="pb-3">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-medium line-clamp-2 text-foreground">
                {negocio.nombre_negocio}
              </h4>
              <div className="flex items-center gap-2">
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
                      className="h-6 w-6 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(negocio)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(negocio)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {negocio.company && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{negocio.company.name}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            {negocio.valor_negocio && (
              <div className="flex items-center gap-2 text-xs">
                <Euro className="h-3 w-3 text-green-600" />
                <span className="font-medium text-green-600">
                  {new Intl.NumberFormat('es-ES', { 
                    style: 'currency', 
                    currency: 'EUR',
                    minimumFractionDigits: 0 
                  }).format(negocio.valor_negocio)}
                </span>
              </div>
            )}
            
            {negocio.contact && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span className="truncate">{negocio.contact.name}</span>
              </div>
            )}

            {negocio.ubicacion && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{negocio.ubicacion}</span>
              </div>
            )}

            {negocio.fecha_cierre && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(negocio.fecha_cierre).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Badge variant="outline" className="text-xs">
                {negocio.tipo_negocio}
              </Badge>
              
              {negocio.propietario_negocio && (
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {negocio.propietario_negocio.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
        </div>
    </div>
  );
};