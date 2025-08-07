import React, { useMemo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { Deal } from '@/types/Deal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, User } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
  index: number;
  onClick?: (deal: Deal) => void;
}

const DealCardComponent = ({ deal, index, onClick }: DealCardProps) => {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id });

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/deals/${deal.id}`);
  }, [deal.id, navigate]);

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
  }), [transform, transition]);

  const formattedAmount = useMemo(() => {
    if (!deal.amount) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: deal.amount > 999999 ? 'compact' : 'standard'
    }).format(deal.amount);
  }, [deal.amount]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`
        bg-white rounded-lg p-6 flex flex-col gap-4 cursor-grab active:cursor-grabbing
        border border-gray-100
        hover:shadow-sm transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${isDragging ? 'shadow-md opacity-60' : ''}
      `}
      tabIndex={0}
      role="button"
      aria-label={`Deal: ${deal.title}`}
    >
          {/* Title */}
          <h3 className="font-semibold text-gray-900 truncate text-sm leading-tight">
            {deal.title}
          </h3>
          
          {/* Amount */}
          {deal.amount && (
            <div className="text-right">
              <span className="font-semibold text-sm" style={{ color: '#059669' }}>
                {formattedAmount}
              </span>
            </div>
          )}
          
          {/* Company and Owner */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            {deal.company && (
              <div className="flex items-center gap-1 truncate">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{deal.company.name}</span>
              </div>
            )}
            
            <Avatar className="h-5 w-5 flex-shrink-0">
              <AvatarFallback className="bg-gray-100 text-gray-500">
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
        </div>
    </div>
  );
};

export const DealCard = React.memo(DealCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.deal.id === nextProps.deal.id &&
    prevProps.deal.title === nextProps.deal.title &&
    prevProps.deal.amount === nextProps.deal.amount &&
    prevProps.deal.updatedAt === nextProps.deal.updatedAt &&
    prevProps.index === nextProps.index
  );
});