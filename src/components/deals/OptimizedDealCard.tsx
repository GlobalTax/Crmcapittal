import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '@/types/Deal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MoreHorizontal,
  Flame,
  Snowflake,
  Sun
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface OptimizedDealCardProps {
  deal: Deal;
  index: number;
  onClick?: (deal: Deal) => void;
  onEdit?: (deal: Deal) => void;
}

export const OptimizedDealCard = ({ deal, index, onClick, onEdit }: OptimizedDealCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const getOwnerInitials = (name?: string) => {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDealScoring = (deal: Deal): 'hot' | 'warm' | 'cold' => {
    // Simple scoring logic - in real app this would be more sophisticated
    if (deal.probability >= 70) return 'hot';
    if (deal.probability >= 40) return 'warm';
    return 'cold';
  };

  const getScoringIcon = (scoring: 'hot' | 'warm' | 'cold') => {
    switch (scoring) {
      case 'hot':
        return <Flame className="h-3 w-3 text-red-500" />;
      case 'warm':
        return <Sun className="h-3 w-3 text-orange-500" />;
      case 'cold':
        return <Snowflake className="h-3 w-3 text-blue-500" />;
    }
  };

  const getPriorityBorderColor = (probability: number) => {
    if (probability >= 70) return 'border-l-red-500';
    if (probability >= 40) return 'border-l-orange-500';
    return 'border-l-blue-500';
  };

  const getNextAction = (deal: Deal) => {
    // Mock next action logic
    const actions = [
      'Llamada de seguimiento',
      'Enviar propuesta',
      'Reunión demo',
      'Negociación precio',
      'Firma contrato'
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(deal);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(deal);
  };

  const scoring = getDealScoring(deal);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative bg-card rounded-lg border border-border cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:shadow-md hover:border-primary/30
        ${getPriorityBorderColor(deal.probability)} border-l-4
        ${isDragging ? 'shadow-lg opacity-50 rotate-2' : ''}
      `}
      tabIndex={0}
      role="button"
      aria-label={`Deal: ${deal.title}`}
    >
      <div className="p-4 space-y-3">
        {/* Header: Title + Value */}
        <div className="flex items-start justify-between gap-2">
          <h3 
            className="font-medium text-foreground text-sm leading-tight cursor-pointer hover:text-primary"
            onClick={handleCardClick}
          >
            {deal.title}
          </h3>
          <div className="flex items-center gap-1">
            {getScoringIcon(scoring)}
            <span className="font-semibold text-primary text-sm">
              {formatCurrency(deal.amount)}
            </span>
          </div>
        </div>

        {/* Body: Company + Owner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-xs truncate">
            <Building2 className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{deal.company?.name || 'Sin empresa'}</span>
          </div>
          
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage src={deal.owner?.email ? `https://api.dicebear.com/6.x/initials/svg?seed=${deal.owner.email}` : undefined} />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {getOwnerInitials(deal.owner?.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Footer: Next Action + Probability */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Next: {getNextAction(deal)}</span>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <Progress value={deal.probability} className="flex-1 h-2" />
            <span className="text-xs font-medium text-muted-foreground">
              {deal.probability}%
            </span>
          </div>
        </div>
      </div>

      {/* Hover Actions */}
      {isHovered && !isDragging && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-background border border-border rounded-md shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-green-50 hover:text-green-600"
            onClick={(e) => {
              e.stopPropagation();
              // Handle call action
            }}
          >
            <Phone className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              // Handle email action
            }}
          >
            <Mail className="h-3 w-3" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={handleCardClick}>
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditClick}>
                Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};