import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Building2, 
  User, 
  TrendingUp, 
  Calendar, 
  MoreVertical, 
  Eye, 
  Edit,
  Euro,
  Target
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReconversionKanbanCardProps {
  reconversion: any;
  index: number;
  onEdit: (reconversion: any) => void;
  onView?: (reconversion: any) => void;
}

const ReconversionKanbanCard = memo(({ 
  reconversion, 
  index, 
  onEdit, 
  onView 
}: ReconversionKanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: reconversion.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Helper functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: value > 999999 ? 'compact' : 'standard'
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin definir';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'initial': return 'secondary';
      case 'active': return 'default';
      case 'matching': return 'destructive';
      case 'negotiations': return 'default';
      case 'closed': return 'secondary';
      default: return 'outline';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on dropdown or other interactive elements
    if ((e.target as HTMLElement).closest('[role="menuitem"]') || 
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (onView) {
      onView(reconversion);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(reconversion);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onView) {
      onView(reconversion);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md
        ${isDragging ? 'shadow-lg scale-105' : ''}
        group
      `}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate">
                {reconversion.company_name || 'Empresa sin nombre'}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getPriorityColor(reconversion.priority)} className="text-xs">
                  {getPriorityLabel(reconversion.priority)}
                </Badge>
                <Badge variant={getStatusColor(reconversion.status)} className="text-xs">
                  {reconversion.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
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
        {/* Investment Capacity */}
        {reconversion.investment_capacity && (
          <div className="flex items-center gap-2 text-sm">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Inversión:</span>
            <span className="font-medium text-foreground">
              {formatCurrency(reconversion.investment_capacity)}
            </span>
          </div>
        )}

        {/* Target Sectors */}
        {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-muted-foreground">Sectores objetivo:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {reconversion.target_sectors.slice(0, 2).map((sector: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
                {reconversion.target_sectors.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{reconversion.target_sectors.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Target Closing Date */}
        {reconversion.target_closing_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Cierre objetivo:</span>
            <span className="font-medium text-foreground">
              {new Date(reconversion.target_closing_date).toLocaleDateString('es-ES')}
            </span>
          </div>
        )}

        {/* Created At */}
        {reconversion.created_at && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Calendar className="h-3 w-3" />
            <span>
              Creado {formatDistanceToNow(new Date(reconversion.created_at), { 
                addSuffix: true, 
                locale: es 
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ReconversionKanbanCard.displayName = 'ReconversionKanbanCard';

export { ReconversionKanbanCard };