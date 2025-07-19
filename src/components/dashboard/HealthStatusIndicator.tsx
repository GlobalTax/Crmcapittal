
import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHealthCheck } from '@/hooks/useHealthCheck';

export const HealthStatusIndicator = () => {
  const { health, checkHealth } = useHealthCheck();

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    const configs = {
      healthy: { 
        variant: 'default' as const, 
        className: 'bg-green-100 text-green-800 border-green-200',
        label: 'Operativo'
      },
      warning: { 
        variant: 'secondary' as const, 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Advertencia'
      },
      error: { 
        variant: 'destructive' as const, 
        className: 'bg-red-100 text-red-800 border-red-200',
        label: 'Error'
      }
    };

    const config = configs[status];

    return (
      <Badge variant={config.variant} className={`text-xs ${config.className}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Estado del Sistema
          <button 
            onClick={checkHealth}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-gray-100"
          >
            Actualizar
          </button>
        </CardTitle>
        {health.lastChecked && (
          <CardDescription className="text-xs">
            Última verificación: {health.lastChecked.toLocaleTimeString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Base de Datos</span>
          {getStatusBadge(health.database)}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">HubSpot</span>
          {getStatusBadge(health.hubspot)}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Email</span>
          {getStatusBadge(health.email)}
        </div>
      </CardContent>
    </Card>
  );
};
