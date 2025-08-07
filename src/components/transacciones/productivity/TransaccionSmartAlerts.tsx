import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Clock, CheckCircle, Bell } from 'lucide-react';
import { Transaccion } from '@/types/Transaccion';

interface TransaccionSmartAlertsProps {
  transaccion: Transaccion;
}

type AlertType = 'inactive' | 'milestone' | 'normal' | 'action_required' | 'deadline_near';

interface Alert {
  type: AlertType;
  label: string;
  icon: React.ReactNode;
  variant: 'destructive' | 'outline' | 'default' | 'secondary';
  tooltip: string;
}

export const TransaccionSmartAlerts: React.FC<TransaccionSmartAlertsProps> = ({ transaccion }) => {
  const calculateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    const now = new Date();
    const updatedAt = new Date(transaccion.updated_at);
    const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

    // Sin actividad > 21 días
    if (daysSinceUpdate > 21) {
      alerts.push({
        type: 'inactive',
        label: 'Sin actividad',
        icon: <AlertTriangle className="h-3 w-3" />,
        variant: 'destructive',
        tooltip: `Sin actividad desde hace ${daysSinceUpdate} días`
      });
    }

    // Fecha de cierre próxima
    if (transaccion.fecha_cierre) {
      const fechaCierre = new Date(transaccion.fecha_cierre);
      const daysToClose = Math.floor((fechaCierre.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToClose <= 7 && daysToClose >= 0) {
        alerts.push({
          type: 'deadline_near',
          label: `Cierre en ${daysToClose}d`,
          icon: <Clock className="h-3 w-3" />,
          variant: 'outline',
          tooltip: `Fecha de cierre: ${fechaCierre.toLocaleDateString('es-ES')}`
        });
      }
    }

    // Próxima actividad vencida
    if (transaccion.proxima_actividad) {
      // En implementación real, parseariamos la fecha de la próxima actividad
      // Por ahora, simulamos que hay una actividad pendiente
      const hasOverdueActivity = daysSinceUpdate > 7;
      if (hasOverdueActivity) {
        alerts.push({
          type: 'action_required',
          label: 'Acción requerida',
          icon: <Bell className="h-3 w-3" />,
          variant: 'default',
          tooltip: 'Hay una actividad pendiente'
        });
      }
    }

    // Progreso normal (si no hay alertas críticas)
    if (alerts.length === 0 && daysSinceUpdate <= 7) {
      alerts.push({
        type: 'normal',
        label: 'En progreso',
        icon: <CheckCircle className="h-3 w-3" />,
        variant: 'secondary',
        tooltip: 'Transacción en progreso normal'
      });
    }

    return alerts;
  };

  const alerts = calculateAlerts();

  if (alerts.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {alerts.map((alert, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Badge 
                variant={alert.variant}
                className="text-xs h-5 px-1.5 cursor-help"
              >
                {alert.icon}
                <span className="ml-1 hidden sm:inline">{alert.label}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{alert.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};