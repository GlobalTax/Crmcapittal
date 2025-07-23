import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface ReconversionAlertBadgeProps {
  alerts: ValidationError[];
  className?: string;
  showTooltip?: boolean;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'error':
      return <AlertCircle className="h-3 w-3" />;
    case 'warning':
      return <AlertTriangle className="h-3 w-3" />;
    case 'info':
      return <Info className="h-3 w-3" />;
    default:
      return <CheckCircle className="h-3 w-3" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'error':
      return 'destructive';
    case 'warning':
      return 'secondary';
    case 'info':
      return 'outline';
    default:
      return 'default';
  }
};

export const ReconversionAlertBadge: React.FC<ReconversionAlertBadgeProps> = ({
  alerts,
  className,
  showTooltip = true
}) => {
  if (alerts.length === 0) {
    return showTooltip ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="default" className={cn("gap-1", className)}>
              <CheckCircle className="h-3 w-3" />
              Validado
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Todos los datos están correctos</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      <Badge variant="default" className={cn("gap-1", className)}>
        <CheckCircle className="h-3 w-3" />
        Validado
      </Badge>
    );
  }

  const errorCount = alerts.filter(a => a.severity === 'error').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const infoCount = alerts.filter(a => a.severity === 'info').length;

  const highestSeverity = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'info';
  const totalCount = alerts.length;

  const badge = (
    <Badge 
      variant={getSeverityColor(highestSeverity) as any} 
      className={cn("gap-1", className)}
    >
      {getSeverityIcon(highestSeverity)}
      {totalCount} {totalCount === 1 ? 'alerta' : 'alertas'}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <p className="font-medium">Alertas de validación:</p>
            {errorCount > 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>{errorCount} error(es)</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                <span>{warningCount} advertencia(s)</span>
              </div>
            )}
            {infoCount > 0 && (
              <div className="flex items-center gap-2 text-blue-600">
                <Info className="h-3 w-3" />
                <span>{infoCount} sugerencia(s)</span>
              </div>
            )}
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Haz clic para ver más detalles
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};