/**
 * Monitor de Secretos en Tiempo Real
 * 
 * Componente de depuración para monitorear el estado de los secretos
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Activity,
  Wifi,
  WifiOff 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { validateSecrets, isSecretConfigured } from '@/utils/secretsManager';
import { logger } from '@/utils/productionLogger';

interface ServiceStatus {
  name: string;
  requiredSecrets: Array<{key: string, configured: boolean}>;
  optionalSecrets: Array<{key: string, configured: boolean}>;
  connectivity: { success: boolean, message: string };
}

interface SystemStats {
  totalSecrets: number;
  configuredSecrets: number;
  configurationHealth: number;
  connectedServices: number;
  totalServices: number;
  connectivityHealth: number;
}

export const SecretsMonitor: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<{
    services: ServiceStatus[];
    stats: SystemStats;
    timestamp: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('secrets-manager', {
        body: { action: 'status' }
      });

      if (error) throw error;

      setSystemStatus(data);
      setLastUpdate(new Date());
    } catch (error) {
      logger.error('Failed to fetch system status', { error });
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('secrets-manager', {
        body: { action: 'health' }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      logger.error('Failed to run health check', { error });
      return null;
    }
  };

  useEffect(() => {
    fetchSystemStatus();

    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      interval = setInterval(fetchSystemStatus, 30000); // 30 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getHealthColor = (health: number) => {
    if (health >= 0.8) return 'text-green-600';
    if (health >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBg = (health: number) => {
    if (health >= 0.8) return 'bg-green-500';
    if (health >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading && !systemStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando estado del sistema...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h3 className="font-semibold">Monitor de Secretos</h3>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Actualizado: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className={`h-4 w-4 mr-1 ${autoRefresh ? 'text-green-600' : ''}`} />
            Auto
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSystemStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas Generales */}
      {systemStatus?.stats && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-xl font-bold ${getHealthColor(systemStatus.stats.configurationHealth)}`}>
                  {Math.round(systemStatus.stats.configurationHealth * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Configuración</div>
                <Progress 
                  value={systemStatus.stats.configurationHealth * 100} 
                  className="h-1 mt-1"
                />
              </div>
              
              <div className="text-center">
                <div className={`text-xl font-bold ${getHealthColor(systemStatus.stats.connectivityHealth)}`}>
                  {Math.round(systemStatus.stats.connectivityHealth * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Conectividad</div>
                <Progress 
                  value={systemStatus.stats.connectivityHealth * 100} 
                  className="h-1 mt-1"
                />
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold">
                  {systemStatus.stats.configuredSecrets}/{systemStatus.stats.totalSecrets}
                </div>
                <div className="text-xs text-muted-foreground">Secretos</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold">
                  {systemStatus.stats.connectedServices}/{systemStatus.stats.totalServices}
                </div>
                <div className="text-xs text-muted-foreground">Servicios</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de Servicios */}
      {systemStatus?.services && (
        <div className="grid gap-3">
          {systemStatus.services.map((service) => (
            <Card key={service.name} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {service.requiredSecrets.filter(s => s.configured).length}/
                      {service.requiredSecrets.length} requeridos
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Estado de Configuración */}
                  {service.requiredSecrets.every(s => s.configured) ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Configurado
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Incompleto
                    </Badge>
                  )}
                  
                  {/* Estado de Conectividad */}
                  {service.connectivity.success ? (
                    <Wifi className="h-4 w-4 text-green-600" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              
              {!service.connectivity.success && service.connectivity.message && (
                <div className="mt-2 text-xs text-red-600">
                  {service.connectivity.message}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Debug Info */}
      {import.meta.env.DEV && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Modo Debug:</strong> Este monitor está activo solo en desarrollo.
            Los datos se actualizan {autoRefresh ? 'automáticamente cada 30s' : 'manualmente'}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};