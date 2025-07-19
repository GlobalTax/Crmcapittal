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
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
    const variants = {
      healthy: 'default',
      warning: 'secondary', 
      error: 'destructive'
    } as const;

    const labels = {
      healthy: 'Operativo',
      warning: 'Advertencia',
      error: 'Error'
    };

    return (
      <Badge variant={variants[status]} className="text-xs">
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status]}</span>
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
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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