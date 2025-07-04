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
  AlertCircle
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'connected' | 'disconnected' | 'error';
  category: string;
  configurable: boolean;
}

const integrations: Integration[] = [
  {
    id: 'resend',
    name: 'Resend',
    description: 'Servicio de email transaccional para notificaciones y seguimiento',
    icon: Mail,
    status: 'connected',
    category: 'Email & Comunicación',
    configurable: true
  },
  {
    id: 'microsoft-outlook',
    name: 'Microsoft Outlook',
    description: 'Sincronización de calendarios y envío de emails corporativos',
    icon: Calendar,
    status: 'disconnected',
    category: 'Microsoft 365',
    configurable: true
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Notificaciones de leads y creación automática de reuniones',
    icon: Users,
    status: 'disconnected',
    category: 'Microsoft 365',
    configurable: true
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    description: 'Almacenamiento y sincronización de documentos y propuestas',
    icon: FileText,
    status: 'disconnected',
    category: 'Microsoft 365',
    configurable: true
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automatización de workflows con miles de aplicaciones',
    icon: Zap,
    status: 'disconnected',
    category: 'Automatización',
    configurable: true
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Endpoints personalizados para integraciones custom',
    icon: Webhook,
    status: 'connected',
    category: 'APIs & Webhooks',
    configurable: true
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Almacenamiento en la nube de Microsoft',
    icon: Cloud,
    status: 'disconnected',
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

const categories = [...new Set(integrations.map(i => i.category))];

export default function Integrations() {
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
            {integrations
              .filter(integration => integration.category === category)
              .map(integration => {
                const Icon = integration.icon;
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
                          </div>
                        </div>
                        {getStatusIcon(integration.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">
                        {integration.description}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between">
                        {getStatusBadge(integration.status)}
                        <div className="flex space-x-2">
                          {integration.configurable && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={!integration.configurable}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Configurar
                            </Button>
                          )}
                          {integration.status === 'connected' && (
                            <Button variant="outline" size="sm">
                              Test
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {integration.status === 'connected' && (
                        <div className="text-xs text-muted-foreground">
                          Última sincronización: hace 5 minutos
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
                {integrations.filter(i => i.status === 'connected').length}
              </div>
              <div className="text-sm text-muted-foreground">Conectadas</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {integrations.filter(i => i.status === 'error').length}
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