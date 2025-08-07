import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Proposal } from '@/types/Proposal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Eye, 
  Edit, 
  Calendar, 
  Building2, 
  User, 
  Euro,
  Clock,
  Copy,
  Send,
  FileText
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProposalCardProps {
  proposal: Proposal;
  onView: () => void;
  onEdit: () => void;
  isDragging?: boolean;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onView,
  onEdit,
  isDragging = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver
  } = useSortable({
    id: proposal.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calcular días en estado actual
  const daysInState = React.useMemo(() => {
    const statusDate = proposal.updated_at || proposal.created_at;
    return formatDistanceToNow(new Date(statusDate), { 
      addSuffix: false, 
      locale: es 
    });
  }, [proposal.updated_at, proposal.created_at]);

  // Obtener color del tipo de propuesta
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'punctual':
        return 'bg-blue-100 text-blue-700';
      case 'recurring':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Obtener prioridad basada en valor y fecha
  const getPriority = () => {
    const amount = proposal.total_amount || 0;
    const validUntil = proposal.valid_until;
    
    if (validUntil) {
      const daysUntilExpiry = Math.ceil(
        (new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 3) return 'urgent';
      if (daysUntilExpiry <= 7) return 'high';
    }
    
    if (amount >= 50000) return 'high';
    if (amount >= 10000) return 'medium';
    return 'low';
  };

  const priority = getPriority();
  const priorityColors = {
    urgent: 'border-l-red-500 bg-red-50',
    high: 'border-l-orange-500 bg-orange-50',
    medium: 'border-l-yellow-500 bg-yellow-50',
    low: 'border-l-gray-300 bg-white'
  };

  const handleQuickAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implementar quick actions
    console.log(`Quick action: ${action} for proposal ${proposal.id}`);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md
        ${isDragging ? 'opacity-50 rotate-3 shadow-lg' : ''}
        ${isOver ? 'ring-2 ring-primary/50' : ''}
        border-l-4 ${priorityColors[priority]}
      `}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header con título y quick actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
              {proposal.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getTypeColor(proposal.proposal_type)}>
                {proposal.proposal_type === 'punctual' ? 'Puntual' : 'Recurrente'}
              </Badge>
              {priority === 'urgent' && (
                <Badge variant="destructive" className="text-xs">
                  Urgente
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <span className="text-xs">⋯</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleQuickAction('duplicate', e)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              {proposal.status === 'draft' && (
                <DropdownMenuItem onClick={(e) => handleQuickAction('send', e)}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => handleQuickAction('pdf', e)}>
                <FileText className="h-4 w-4 mr-2" />
                Ver PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Cliente y empresa */}
        <div className="space-y-2">
          {proposal.contact && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">{proposal.contact.name}</span>
            </div>
          )}
          
          {proposal.company && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{proposal.company.name}</span>
            </div>
          )}
        </div>

        {/* Valor y área de práctica */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <Euro className="h-3 w-3" />
            {proposal.total_amount 
              ? `€${proposal.total_amount.toLocaleString()}`
              : 'Sin valor'
            }
          </div>
          
          {proposal.practice_area && (
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ backgroundColor: `${proposal.practice_area.color}20` }}
            >
              {proposal.practice_area.name}
            </Badge>
          )}
        </div>

        {/* Footer con fecha y vencimiento */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{daysInState}</span>
          </div>
          
          {proposal.valid_until && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                Exp: {new Date(proposal.valid_until).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Engagement indicators */}
        {proposal.views_count && proposal.views_count > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{proposal.views_count} visualizaciones</span>
            {proposal.last_viewed_at && (
              <span>
                • Última: {formatDistanceToNow(new Date(proposal.last_viewed_at), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};