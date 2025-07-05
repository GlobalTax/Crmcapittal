import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Deal } from '@/types/Deal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, User } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
  index: number;
  onClick?: (deal: Deal) => void;
}

export const DealCard = ({ deal, index, onClick }: DealCardProps) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick?.(deal)}
          className={`
            bg-background rounded-lg shadow-sm p-4 flex flex-col gap-3 cursor-pointer
            border border-border
            hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            ${snapshot.isDragging ? 'rotate-2 shadow-lg' : ''}
          `}
          tabIndex={0}
          role="button"
          aria-label={`Deal: ${deal.title}`}
        >
          {/* Title */}
          <h3 className="font-medium text-foreground truncate text-sm">
            {deal.title}
          </h3>
          
          {/* Amount */}
          {deal.amount && (
            <div className="text-right">
              <span className="text-success font-semibold text-sm">
                {formatCurrency(deal.amount)}
              </span>
            </div>
          )}
          
          {/* Company and Owner */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {deal.company && (
              <div className="flex items-center gap-1 truncate">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{deal.company.name}</span>
              </div>
            )}
            
            <Avatar className="h-5 w-5 flex-shrink-0">
              <AvatarFallback className="bg-muted text-muted-foreground">
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}
    </Draggable>
  );
};