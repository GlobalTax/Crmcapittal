import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '@/types/Deal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, MoreHorizontal } from 'lucide-react';

interface UltraCompactDealCardProps {
  deal: Deal;
  onClick?: (deal: Deal) => void;
  onEdit?: (deal: Deal) => void;
}

export const UltraCompactDealCard = ({ deal, onClick, onEdit }: UltraCompactDealCardProps) => {
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

  const getPriorityBorderColor = (probability: number) => {
    if (probability >= 70) return 'border-l-green-500';
    if (probability >= 40) return 'border-l-yellow-500';
    return 'border-l-red-500';
  };

  const getTimeInStage = () => {
    // Mock time calculation - in real app this would be calculated from data
    const days = Math.floor(Math.random() * 20) + 1;
    return `${days}d in stage`;
  };

  const getNextAction = () => {
    // Mock next action
    const actions = ['Call 15 Feb', 'Send proposal', 'Demo meeting', 'Follow up'];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative bg-white hover:bg-slate-50 rounded-lg border border-slate-200 
        cursor-grab active:cursor-grabbing p-4 min-h-[90px]
        transition-all duration-200 hover:shadow-md
        ${getPriorityBorderColor(deal.probability)} border-l-4
        ${isDragging ? 'opacity-50 rotate-2' : ''}
      `}
      onClick={() => onClick?.(deal)}
    >
      {/* Line 1: Title + Value */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-slate-900 text-sm leading-tight flex-1 pr-2">
          {deal.title}
        </h4>
        <span className="font-bold text-sm text-slate-900 whitespace-nowrap">
          {formatCurrency(deal.amount)}
        </span>
      </div>

      {/* Line 2: Company + Owner */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500 truncate">
          {deal.company?.name || 'Sin empresa'}
        </span>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
              {getOwnerInitials(deal.owner?.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-slate-500 max-w-[80px] truncate">
            {deal.owner?.name || 'Unassigned'}
          </span>
        </div>
      </div>

      {/* Line 3: Next Action + Time in Stage */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Next: {getNextAction()}</span>
        <span>{getTimeInStage()}</span>
      </div>

      {/* Quick Actions on Hover */}
      {isHovered && !isDragging && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white border border-slate-200 rounded shadow-sm">
          <button
            className="h-4 w-4 flex items-center justify-center text-slate-400 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              // Handle phone action
            }}
          >
            <Phone className="h-3 w-3" />
          </button>
          <button
            className="h-4 w-4 flex items-center justify-center text-slate-400 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              // Handle email action
            }}
          >
            <Mail className="h-3 w-3" />
          </button>
          <button
            className="h-4 w-4 flex items-center justify-center text-slate-400 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(deal);
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};