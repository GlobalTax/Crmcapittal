/**
 * Componente de Administración de Configuración de Secretos
 * 
 * Proporciona una interfaz para gestionar y validar secretos del sistema
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, RefreshCw, Settings, Shield } from 'lucide-react';
import { validateSecrets, isSecretConfigured } from '@/utils/secretsManager';
import { SERVICE_CONFIGS, generateSecretsDocumentation } from '@/utils/edgeFunctionHelpers';
import { runSecretValidationTests, startSecretsMonitoring, getSecretsStats } from '@/utils/secretsConfig';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/productionLogger';

interface SecretStatus {
  key: string;
  configured: boolean;
  required: boolean;
  service: string;
}

export const SecretsConfiguration: React.FC = () => {
  const [secretsStatus, setSecretsStatus] = useState<SecretStatus[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<any>(null);

  const refreshConfiguration = async () => {
    setLoading(true);
    try {
      // Obtener estado de secretos
      const errors = validateSecrets();
      setValidationErrors(errors);

      // Obtener estadísticas
      const currentStats = getSecretsStats();
      setStats(currentStats);

      // Generar estado de todos los secretos
      const documentation = generateSecretsDocumentation();
      const status: SecretStatus[] = [];

      documentation.services.forEach(service => {
        service.required.forEach(secret => {
          status.push({
            key: secret,
            configured: isSecretConfigured(secret),
            required: true,
            service: service.service
          });
        });
        
        service.optional.forEach(secret => {
          status.push({
            key: secret,
            configured: isSecretConfigured(secret),
            required: false,
            service: service.service
          });
        });
      });

      setSecretsStatus(status);

      // Ejecutar tests de validación
      const tests = runSecretValidationTests();
      setTestResults(tests);

    } catch (error) {
      logger.error('Failed to refresh secrets configuration', { error });
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('contacts').select('count').limit(1);
      if (error) throw error;
      return { success: true, message: 'Conexión exitosa' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  useEffect(() => {
    refreshConfiguration();
    
    // Iniciar monitoreo
    if (typeof window !== 'undefined') {
      startSecretsMonitoring();
    }
  }, []);

  const getStatusBadge = (configured: boolean, required: boolean) => {
    if (configured) {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Configurado</Badge>;
    }
    if (required) {
      return <Badge variant="destructive">Requerido</Badge>;
    }
    return <Badge variant="secondary">Opcional</Badge>;
  };

  const getHealthColor = (health: number) => {
    if (health >= 0.8) return 'bg-green-500';
    if (health >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuración de Secretos</h2>
          <p className="text-muted-foreground">
            Gestiona y valida las credenciales del sistema
          </p>
        </div>
        <Button onClick={refreshConfiguration} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Resumen de Estado */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Estado General del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.configured}</div>
                <div className="text-sm text-muted-foreground">Configurados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{stats.missing}</div>
                <div className="text-sm text-muted-foreground">Faltantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{stats.errors}</div>
                <div className="text-sm text-muted-foreground">Errores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(stats.configurationHealth * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Salud</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Configuración completada</span>
                <span>{Math.round(stats.configurationHealth * 100)}%</span>
              </div>
              <Progress 
                value={stats.configurationHealth * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errores de Validación */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Errores de configuración encontrados:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="secrets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="secrets">Secretos</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="documentation">Documentación</TabsTrigger>
        </TabsList>

        <TabsContent value="secrets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Secretos por Servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(
                  secretsStatus.reduce((acc, secret) => {
                    if (!acc[secret.service]) acc[secret.service] = [];
                    acc[secret.service].push(secret);
                    return acc;
                  }, {} as Record<string, SecretStatus[]>)
                ).map(([service, secrets]) => (
                  <div key={service}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {service}
                    </h3>
                    <div className="grid gap-2">
                      {secrets.map(secret => (
                        <div key={secret.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{secret.key}</div>
                            <div className="text-sm text-muted-foreground">
                              {secret.required ? 'Requerido' : 'Opcional'}
                            </div>
                          </div>
                          {getStatusBadge(secret.configured, secret.required)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultados de Tests de Validación</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{testResults.passed}</div>
                      <div className="text-sm text-muted-foreground">Pasados</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{testResults.failed}</div>
                      <div className="text-sm text-muted-foreground">Fallidos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{testResults.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {testResults.failed === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {testResults.failed === 0 
                        ? 'Todos los tests pasaron exitosamente' 
                        : `${testResults.failed} tests fallaron`
                      }
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Los tests se ejecutarán automáticamente...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentación de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(SERVICE_CONFIGS).map(([key, config]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{config.name}</h3>
                    <p className="text-muted-foreground mb-3">{config.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Secretos Requeridos:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {config.requiredSecrets.map(secret => (
                            <li key={secret} className="text-sm">{secret}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Secretos Opcionales:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {config.optionalSecrets.map(secret => (
                            <li key={secret} className="text-sm">{secret}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};