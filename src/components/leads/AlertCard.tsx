import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, AlertCircle, TrendingDown } from 'lucide-react';
import { AlertData } from '@/hooks/useIntelligentAlerts';

interface AlertCardProps {
  alert: AlertData;
  onActionClick: (alert: AlertData) => void;
}

const getAlertIcon = (type: AlertData['type']) => {
  switch (type) {
    case 'lead_not_contacted':
      return AlertTriangle;
    case 'lead_stagnant':
      return Clock;
    case 'deal_inactive':
      return TrendingDown;
    default:
      return AlertCircle;
  }
};

const getSeverityColor = (severity: AlertData['severity']) => {
  switch (severity) {
    case 'critical':
      return 'border-red-200 bg-red-50';
    case 'warning':
      return 'border-orange-200 bg-orange-50';
    case 'info':
      return 'border-blue-200 bg-blue-50';
  }
};

const getSeverityBadgeColor = (severity: AlertData['severity']) => {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'warning':
      return 'secondary';
    case 'info':
      return 'default';
  }
};

const getActionLabel = (action?: string) => {
  switch (action) {
    case 'contact_immediately':
      return 'Contactar Ahora';
    case 'follow_up_required':
      return 'Hacer Seguimiento';
    case 'schedule_activity':
      return 'Programar Actividad';
    default:
      return 'Ver Detalles';
  }
};

export const AlertCard = ({ alert, onActionClick }: AlertCardProps) => {
  const Icon = getAlertIcon(alert.type);

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${getSeverityColor(alert.severity)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-full ${
              alert.severity === 'critical' ? 'bg-red-100' : 
              alert.severity === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
            }`}>
              <Icon className={`h-4 w-4 ${
                alert.severity === 'critical' ? 'text-red-600' : 
                alert.severity === 'warning' ? 'text-orange-600' : 'text-blue-600'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{alert.title}</h4>
                <Badge variant={getSeverityBadgeColor(alert.severity)} className="text-xs">
                  {alert.count}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {alert.description}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onActionClick(alert)}
            className="ml-2 shrink-0"
          >
            {getActionLabel(alert.action)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};