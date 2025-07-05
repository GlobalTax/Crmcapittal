import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Calendar, 
  FileText, 
  Webhook, 
  Zap, 
  Users, 
  Cloud,  
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Unlink
} from 'lucide-react';
import { useConnectedAccounts } from '@/hooks/useConnectedAccounts';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  configurable: boolean;
  provider?: 'microsoft' | 'google';
}

const staticIntegrations: Integration[] = [
  {
    id: 'resend',
    name: 'Resend',
    description: 'Servicio de email transaccional para notificaciones y seguimiento',
    icon: Mail,
    category: 'Email & Comunicación',
    configurable: true
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Sincronización de calendarios, emails y documentos corporativos',
    icon: Calendar,
    category: 'Microsoft 365',
    configurable: true,
    provider: 'microsoft'
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Notificaciones de leads y creación automática de reuniones',
    icon: Users,
    category: 'Microsoft 365',
    configurable: true
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    description: 'Almacenamiento y sincronización de documentos y propuestas',
    icon: FileText,
    category: 'Microsoft 365',
    configurable: true
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automatización de workflows con miles de aplicaciones',
    icon: Zap,
    category: 'Automatización',
    configurable: true
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Endpoints personalizados para integraciones custom',
    icon: Webhook,
    category: 'APIs & Webhooks',
    configurable: true
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Almacenamiento en la nube de Microsoft',
    icon: Cloud,
    category: 'Almacenamiento',
    configurable: true
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    default:
      return <XCircle className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'connected':
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Conectado</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="outline">Desconectado</Badge>;
  }
};

const categories = [...new Set(staticIntegrations.map(i => i.category))];

export default function Integrations() {
  const { toast } = useToast();
  const {
    accounts,
    loading,
    connectAccount,
    disconnectAccount,
    syncAccount,
    isConnected,
    isTokenExpired,
  } = useConnectedAccounts();

  const getIntegrationStatus = (integration: Integration) => {
    if (integration.provider) {
      const connected = isConnected(integration.provider);
      if (!connected) return 'disconnected';
      
      const account = accounts.find(acc => acc.provider === integration.provider);
      if (account && isTokenExpired(account)) return 'error';
      
      return 'connected';
    }
    
    // Static status for non-connected integrations
    if (integration.id === 'resend' || integration.id === 'webhooks') {
      return 'connected';
    }
    return 'disconnected';
  };

  const getLastSyncInfo = (integration: Integration) => {
    if (integration.provider) {
      const account = accounts.find(acc => acc.provider === integration.provider);
      if (account?.last_sync_at) {
        const lastSync = new Date(account.last_sync_at);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60));
        
        if (diffMinutes < 60) {
          return `hace ${diffMinutes} minutos`;
        } else if (diffMinutes < 1440) {
          return `hace ${Math.floor(diffMinutes / 60)} horas`;
        } else {
          return `hace ${Math.floor(diffMinutes / 1440)} días`;
        }
      }
    }
    return 'hace 5 minutos'; // Default for static integrations
  };

  const handleConnect = async (integration: Integration) => {
    if (integration.provider) {
      await connectAccount(integration.provider);
    } else {
      toast({
        title: "Configuración pendiente",
        description: `La configuración de ${integration.name} estará disponible pronto`,
      });
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    if (integration.provider) {
      const account = accounts.find(acc => acc.provider === integration.provider);
      if (account) {
        await disconnectAccount(account.id);
      }
    }
  };

  const handleSync = async (integration: Integration) => {
    if (integration.provider) {
      const account = accounts.find(acc => acc.provider === integration.provider);
      if (account) {
        await syncAccount(account.id);
      }
    }
  };
  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integraciones</h1>
          <p className="text-muted-foreground mt-2">
            Conecta tu CRM con servicios externos para automatizar procesos y mejorar la productividad
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configuración Global
        </Button>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staticIntegrations
              .filter(integration => integration.category === category)
              .map(integration => {
                const Icon = integration.icon;
                const status = getIntegrationStatus(integration);
                const account = integration.provider ? accounts.find(acc => acc.provider === integration.provider) : null;
                
                return (
                  <Card key={integration.id} className="hover-lift">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <Icon className="h-6 w-6 text-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            {account && (
                              <p className="text-xs text-muted-foreground">{account.email}</p>
                            )}
                          </div>
                        </div>
                        {getStatusIcon(status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {integration.description}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between">
                        {getStatusBadge(status)}
                        <div className="flex space-x-2">
                          {status === 'disconnected' && integration.provider && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleConnect(integration)}
                              disabled={loading}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Conectar
                            </Button>
                          )}
                          
                          {status === 'connected' && integration.provider && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSync(integration)}
                                disabled={loading}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Sincronizar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDisconnect(integration)}
                                disabled={loading}
                              >
                                <Unlink className="h-4 w-4 mr-1" />
                                Desconectar
                              </Button>
                            </>
                          )}
                          
                          {status === 'error' && integration.provider && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleConnect(integration)}
                              disabled={loading}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Reconectar
                            </Button>
                          )}
                          
                          {!integration.provider && integration.configurable && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleConnect(integration)}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Configurar
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {status === 'connected' && (
                        <div className="text-xs text-muted-foreground">
                          Última sincronización: {getLastSyncInfo(integration)}
                        </div>
                      )}
                      
                      {status === 'error' && (
                        <div className="text-xs text-red-600">
                          Token expirado. Reconecta tu cuenta.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}

      {/* Statistics Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Estadísticas de Integraciones</CardTitle>
          <CardDescription>
            Resumen de actividad y rendimiento de las integraciones activas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {staticIntegrations.filter(i => getIntegrationStatus(i) === 'connected').length}
              </div>
              <div className="text-sm text-muted-foreground">Conectadas</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {staticIntegrations.filter(i => getIntegrationStatus(i) === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">Con errores</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">2.3k</div>
              <div className="text-sm text-muted-foreground">Eventos hoy</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">99.8%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}