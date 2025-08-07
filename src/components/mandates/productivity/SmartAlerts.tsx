import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BuyingMandate } from '@/types/BuyingMandate';
import { AlertTriangle, Clock, CheckCircle, Target } from 'lucide-react';

interface SmartAlertsProps {
  mandate: BuyingMandate;
}

export function SmartAlerts({ mandate }: SmartAlertsProps) {
  const alerts = [];

  // Calculate days to deadline
  const daysToDeadline = mandate.end_date ? 
    Math.ceil((new Date(mandate.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
    null;

  // Calculate days since last update
  const daysSinceUpdate = Math.ceil((new Date().getTime() - new Date(mandate.updated_at).getTime()) / (1000 * 60 * 60 * 24));

  // Vence en <7 días
  if (daysToDeadline !== null && daysToDeadline <= 7 && daysToDeadline > 0) {
    alerts.push({
      type: 'danger',
      icon: AlertTriangle,
      message: `Vence en ${daysToDeadline} día${daysToDeadline > 1 ? 's' : ''}`,
      priority: 3
    });
  }

  // Vencido
  if (daysToDeadline !== null && daysToDeadline < 0) {
    alerts.push({
      type: 'danger',
      icon: AlertTriangle,
      message: 'Vencido',
      priority: 4
    });
  }

  // Sin actividad >14 días
  if (daysSinceUpdate > 14) {
    alerts.push({
      type: 'warning',
      icon: Clock,
      message: `Sin actividad ${daysSinceUpdate} días`,
      priority: 2
    });
  }

  // Sin actividad >7 días
  else if (daysSinceUpdate > 7) {
    alerts.push({
      type: 'warning',
      icon: Clock,
      message: `Sin actividad ${daysSinceUpdate} días`,
      priority: 1
    });
  }

  // En progreso normal
  if (mandate.status === 'active' && alerts.length === 0) {
    alerts.push({
      type: 'success',
      icon: CheckCircle,
      message: 'En progreso',
      priority: 0
    });
  }

  // Acción requerida (mock logic)
  const needsAction = mandate.status === 'active' && daysSinceUpdate > 3;
  if (needsAction && !alerts.some(a => a.priority >= 2)) {
    alerts.push({
      type: 'info',
      icon: Target,
      message: 'Acción requerida',
      priority: 1
    });
  }

  // Sort by priority (highest first)
  alerts.sort((a, b) => b.priority - a.priority);

  // Show only the most important alert
  const mainAlert = alerts[0];

  if (!mainAlert) return null;

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'danger': return 'destructive';
      case 'warning': return 'secondary';
      case 'success': return 'default';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'danger': return 'text-destructive';
      case 'warning': return 'text-warning';
      case 'success': return 'text-success';
      case 'info': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Badge 
              variant={getAlertVariant(mainAlert.type)}
              className="gap-1 cursor-help"
            >
              <mainAlert.icon className={`h-3 w-3 ${getAlertColor(mainAlert.type)}`} />
              <span className="sr-only">{mainAlert.message}</span>
            </Badge>
            {alerts.length > 1 && (
              <Badge variant="outline" className="h-5 w-5 rounded-full p-0 text-xs">
                +{alerts.length - 1}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <alert.icon className={`h-3 w-3 ${getAlertColor(alert.type)}`} />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}