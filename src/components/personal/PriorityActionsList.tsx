import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckSquare, Square, Phone, Mail, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriorityAction {
  id: string;
  title: string;
  dueDate?: Date;
  owner?: {
    name: string;
    avatar?: string;
  };
  completed: boolean;
  type: 'task' | 'call' | 'email' | 'meeting';
  urgent?: boolean;
}

interface PriorityActionsListProps {
  actions: PriorityAction[];
  onToggleComplete?: (id: string) => void;
  onQuickCall?: (id: string) => void;
  onQuickEmail?: (id: string) => void;
}

export const PriorityActionsList: React.FC<PriorityActionsListProps> = ({
  actions,
  onToggleComplete,
  onQuickCall,
  onQuickEmail
}) => {
  const topActions = actions.slice(0, 6);

  return (
    <div className="space-y-2">
      {topActions.map((action) => (
        <div
          key={action.id}
          className={cn(
            "group flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-all",
            action.urgent && "border-red-200 bg-red-50/50",
            action.completed && "opacity-60"
          )}
        >
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete?.(action.id)}
            className="flex-shrink-0"
          >
            {action.completed ? (
              <CheckSquare className="w-4 h-4 text-green-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-sm font-medium",
                action.completed ? "line-through text-slate-500" : "text-slate-900"
              )}>
                {action.title}
              </span>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {action.type === 'call' && (
                  <button
                    onClick={() => onQuickCall?.(action.id)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <Phone className="w-3 h-3 text-slate-600" />
                  </button>
                )}
                {(action.type === 'email' || action.type === 'task') && (
                  <button
                    onClick={() => onQuickEmail?.(action.id)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <Mail className="w-3 h-3 text-slate-600" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Meta info */}
            <div className="flex items-center gap-3 mt-1">
              {action.dueDate && (
                <span className={cn(
                  "text-xs",
                  action.urgent ? "text-red-600" : "text-slate-500"
                )}>
                  {format(action.dueDate, 'd MMM', { locale: es })}
                </span>
              )}
              
              {action.owner && (
                <div className="flex items-center gap-1">
                  {action.owner.avatar ? (
                    <img 
                      src={action.owner.avatar} 
                      alt={action.owner.name}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <User className="w-3 h-3 text-slate-400" />
                  )}
                  <span className="text-xs text-slate-500">
                    {action.owner.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};