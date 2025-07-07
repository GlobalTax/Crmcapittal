import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bell } from 'lucide-react';
import { AlertCard } from './AlertCard';
import { useIntelligentAlerts, AlertData } from '@/hooks/useIntelligentAlerts';

interface IntelligentAlertsProps {
  onAlertAction: (alert: AlertData) => void;
}

export const IntelligentAlerts = ({ onAlertAction }: IntelligentAlertsProps) => {
  const { alerts, loading, totalAlerts, refetch } = useIntelligentAlerts();

  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-700">Analizando alertas inteligentes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Sin alertas activas
              </span>
              <span className="text-sm text-green-600">
                Todos los leads están siendo gestionados correctamente
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refetch}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-800 text-lg">
              Alertas Inteligentes
            </CardTitle>
            <Badge variant="secondary" className="bg-orange-200 text-orange-800">
              {totalAlerts} elementos requieren atención
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refetch}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onActionClick={onAlertAction}
          />
        ))}
      </CardContent>
    </Card>
  );
};