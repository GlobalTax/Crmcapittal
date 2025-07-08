import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  EyeOff,
  TestTube,
  Save,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConfigStatus {
  clientId: boolean;
  clientSecret: boolean;
  lastTested: string | null;
  connectionStatus: 'connected' | 'simulated' | 'error' | 'unknown';
}

interface TestResult {
  success: boolean;
  message: string;
  status: 'connected' | 'simulated' | 'error';
  details?: {
    apiAvailable: boolean;
    credentialsConfigured: boolean;
    responseTime: number;
  };
}

export const EInformaCredentialsConfig = () => {
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    clientId: false,
    clientSecret: false,
    lastTested: null,
    connectionStatus: 'unknown'
  });
  
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [tempCredentials, setTempCredentials] = useState({
    clientId: '',
    clientSecret: ''
  });

  const checkCurrentConfiguration = async () => {
    try {
      // Try to get current configuration status by testing connection
      const { data, error } = await supabase.functions.invoke('einforma-test-connection');
      
      if (!error && data) {
        setConfigStatus(prev => ({
          ...prev,
          clientId: data.details?.credentialsConfigured || false,
          clientSecret: data.details?.credentialsConfigured || false,
          connectionStatus: data.status,
          lastTested: new Date().toISOString()
        }));
        setTestResult(data);
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('einforma-test-connection');
      
      if (error) {
        throw error;
      }
      
      setTestResult(data);
      setConfigStatus(prev => ({
        ...prev,
        connectionStatus: data.status,
        lastTested: new Date().toISOString()
      }));
      
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      
    } catch (error) {
      const errorMessage = 'Error al probar la conexión con eInforma';
      toast.error(errorMessage);
      setTestResult({
        success: false,
        message: errorMessage,
        status: 'error'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Conectado</Badge>;
      case 'simulated':
        return <Badge variant="secondary">Modo Simulación</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'simulated': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  useEffect(() => {
    checkCurrentConfiguration();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configuración eInforma
          </h2>
          <p className="text-muted-foreground">
            Actualiza las credenciales de API de eInforma
          </p>
        </div>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Estado Actual de la Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                {configStatus.clientId ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div>
                <div className="font-medium">Client ID</div>
                <div className="text-sm text-muted-foreground">
                  {configStatus.clientId ? 'Configurado' : 'No configurado'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                {configStatus.clientSecret ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div>
                <div className="font-medium">Client Secret</div>
                <div className="text-sm text-muted-foreground">
                  {configStatus.clientSecret ? 'Configurado' : 'No configurado'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                {getStatusIcon(configStatus.connectionStatus)}
              </div>
              <div>
                <div className="font-medium">Estado de Conexión</div>
                <div className="text-sm">
                  {getStatusBadge(configStatus.connectionStatus)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Probando...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Probar Conexión
                  </>
                )}
              </Button>
            </div>
          </div>

          {configStatus.lastTested && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Última prueba: {new Date(configStatus.lastTested).toLocaleString('es-ES')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Resultado de la Prueba de Conexión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              {getStatusIcon(testResult.status)}
              <div className="flex-1">
                <div className="font-medium">{testResult.message}</div>
                
                {testResult.details && (
                  <div className="mt-3 grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>API Disponible:</span>
                      <span className={testResult.details.apiAvailable ? 'text-green-600' : 'text-red-600'}>
                        {testResult.details.apiAvailable ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credenciales Configuradas:</span>
                      <span className={testResult.details.credentialsConfigured ? 'text-green-600' : 'text-red-600'}>
                        {testResult.details.credentialsConfigured ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiempo de Respuesta:</span>
                      <span>{testResult.details.responseTime}ms</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Update */}
      <Card>
        <CardHeader>
          <CardTitle>Actualizar Credenciales</CardTitle>
          <CardDescription>
            Configura o actualiza las credenciales de API de eInforma. 
            Las credenciales se almacenan de forma segura en Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Estas credenciales se requieren para acceder a la API real de eInforma. 
              Sin ellas, el sistema funcionará en modo simulación.
              <div className="mt-2">
                <Button variant="link" className="p-0 h-auto text-sm" asChild>
                  <a href="https://developers.einforma.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Obtener credenciales en eInforma Developers
                  </a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="client-id">Client ID de eInforma</Label>
              <Input
                id="client-id"
                type="text"
                placeholder="Tu Client ID de eInforma"
                value={tempCredentials.clientId}
                onChange={(e) => setTempCredentials(prev => ({ ...prev, clientId: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="client-secret">Client Secret de eInforma</Label>
              <div className="relative">
                <Input
                  id="client-secret"
                  type={showClientSecret ? "text" : "password"}
                  placeholder="Tu Client Secret de eInforma"
                  value={tempCredentials.clientSecret}
                  onChange={(e) => setTempCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowClientSecret(!showClientSecret)}
                >
                  {showClientSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Para actualizar las credenciales, usa los botones de abajo para configurar cada secreto individualmente en Supabase.
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="sm">
                  <Key className="h-4 w-4 mr-2" />
                  Configurar Client ID
                </Button>
                <Button variant="outline" size="sm">
                  <Key className="h-4 w-4 mr-2" />
                  Configurar Client Secret
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ayuda y Documentación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>¿Dónde obtener las credenciales?</strong>
              <p className="text-muted-foreground">
                Las credenciales se obtienen desde el portal de desarrolladores de eInforma. 
                Necesitas registrarte y crear una aplicación para obtener el Client ID y Client Secret.
              </p>
            </div>
            
            <div>
              <strong>Modo simulación vs modo real</strong>
              <p className="text-muted-foreground">
                Sin credenciales, el sistema funciona en modo simulación con datos de ejemplo. 
                Con credenciales válidas, se conecta a la API real de eInforma.
              </p>
            </div>

            <div>
              <strong>Seguridad</strong>
              <p className="text-muted-foreground">
                Las credenciales se almacenan de forma segura en Supabase Edge Function Secrets 
                y nunca se exponen en el código frontend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};