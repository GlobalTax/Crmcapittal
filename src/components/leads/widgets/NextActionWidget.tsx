import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format, differenceInDays, isToday, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

interface NextActionWidgetProps {
  nextActionDate?: string;
  className?: string;
}

export const NextActionWidget = ({ nextActionDate, className = "" }: NextActionWidgetProps) => {
  if (!nextActionDate) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Próxima Acción</span>
          </div>
          
          <div className="text-center py-4">
            <div className="text-muted-foreground text-sm">
              No programada
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const actionDate = new Date(nextActionDate);
  const today = new Date();
  const daysDiff = differenceInDays(actionDate, today);
  
  const getStatusInfo = () => {
    if (isToday(actionDate)) {
      return {
        text: 'Hoy',
        icon: Clock,
        color: 'hsl(42, 100%, 50%)', // Amarillo
        bgColor: 'hsl(42, 100%, 96%)'
      };
    }
    
    if (isPast(actionDate)) {
      const daysLate = Math.abs(daysDiff);
      return {
        text: `${daysLate} día${daysLate !== 1 ? 's' : ''} atrasada`,
        icon: AlertTriangle,
        color: 'hsl(4, 86%, 63%)', // Rojo
        bgColor: 'hsl(4, 86%, 96%)'
      };
    }
    
    return {
      text: `En ${daysDiff} día${daysDiff !== 1 ? 's' : ''}`,
      icon: Calendar,
      color: 'hsl(158, 100%, 38%)', // Verde
      bgColor: 'hsl(158, 100%, 96%)'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Próxima Acción</span>
        </div>
        
        <div className="space-y-3">
          <div 
            className="flex items-center gap-2 p-2 rounded-lg"
            style={{ backgroundColor: statusInfo.bgColor }}
          >
            <StatusIcon 
              className="h-4 w-4" 
              style={{ color: statusInfo.color }}
            />
            <span 
              className="text-sm font-medium"
              style={{ color: statusInfo.color }}
            >
              {statusInfo.text}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {format(actionDate, 'PPP', { locale: es })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};