import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { validateSecrets } from '@/utils/secretsManager';
import { SERVICE_CONFIGS, generateSecretsDocumentation } from '@/utils/edgeFunctionHelpers';

interface SecretStatus {
  key: string;
  service: string;
  required: boolean;
  configured: boolean;
  description: string;
}

export function SecretsMonitor() {
  const [secrets, setSecrets] = useState<SecretStatus[]>([]);
  const [showValues, setShowValues] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const checkSecrets = () => {
    const documentation = generateSecretsDocumentation();
    const validationErrors = validateSecrets();
    
    const secretStatuses: SecretStatus[] = [];
    
    documentation.services.forEach(service => {
        [...service.required, ...service.optional].forEach(secretKey => {
          // Verificar si el secreto está configurado comprobando las variables de entorno
          const isConfigured = secretKey.startsWith('VITE_') 
            ? !!import.meta.env[secretKey as keyof ImportMetaEnv]
            : false; // Los secretos no-VITE no se pueden verificar desde el cliente
            
          secretStatuses.push({
            key: secretKey,
            service: service.service,
            required: service.required.some(req => req === secretKey),
            configured: isConfigured,
            description: service.description,
          });
        });
    });

    setSecrets(secretStatuses);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    checkSecrets();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkSecrets, 30000);
    return () => clearInterval(interval);
  }, []);

  const configuredCount = secrets.filter(s => s.configured).length;
  const requiredCount = secrets.filter(s => s.required).length;
  const requiredConfigured = secrets.filter(s => s.required && s.configured).length;

  if (!import.meta.env.DEV) {
    return null; // Solo mostrar en desarrollo
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🔒 Monitor de Secretos
            <Badge variant={requiredConfigured === requiredCount ? "default" : "destructive"}>
              {configuredCount}/{secrets.length} configurados
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowValues(!showValues)}
            >
              {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showValues ? 'Ocultar' : 'Mostrar'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={checkSecrets}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {Object.entries(SERVICE_CONFIGS).map(([serviceKey, serviceConfig]) => {
            const serviceSecrets = secrets.filter(s => s.service === serviceConfig.name);
            const serviceConfigured = serviceSecrets.filter(s => s.configured).length;
            
            return (
              <div key={serviceKey} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{serviceConfig.name}</h3>
                    <p className="text-sm text-muted-foreground">{serviceConfig.description}</p>
                  </div>
                  <Badge variant={serviceConfigured === serviceSecrets.length ? "default" : "secondary"}>
                    {serviceConfigured}/{serviceSecrets.length}
                  </Badge>
                </div>
                
                <div className="grid gap-2">
                  {serviceSecrets.map(secret => (
                    <div
                      key={secret.key}
                      className="flex items-center justify-between p-2 rounded bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        {secret.configured ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        <code className="text-sm font-mono">{secret.key}</code>
                        {secret.required && (
                          <Badge variant="destructive">Requerido</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {secret.configured ? '✓ Configurado' : '✗ Faltante'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {requiredConfigured < requiredCount && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Secretos Requeridos Faltantes</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Algunos secretos requeridos no están configurados. Esto puede causar errores en las funcionalidades correspondientes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}