import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  category: string;
  configurable: boolean;
  lastSync?: string;
}

const integrations: Integration[] = [
  {
    id: 'resend',
    name: 'Resend',
    description: 'Servicio de email transaccional para notificaciones y seguimiento',
    status: 'connected',
    category: 'Email & Comunicación',
    configurable: true,
    lastSync: '2024-07-04T15:30:00Z'
  },
  {
    id: 'microsoft-outlook',
    name: 'Microsoft Outlook',
    description: 'Sincronización de calendarios y envío de emails corporativos',
    status: 'disconnected',
    category: 'Microsoft 365',
    configurable: true
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Notificaciones de leads y creación automática de reuniones',
    status: 'disconnected',
    category: 'Microsoft 365',
    configurable: true
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    description: 'Almacenamiento y sincronización de documentos y propuestas',
    status: 'disconnected',
    category: 'Microsoft 365',
    configurable: true
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automatización de workflows con miles de aplicaciones',
    status: 'disconnected',
    category: 'Automatización',
    configurable: true
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Endpoints personalizados para integraciones custom',
    status: 'connected',
    category: 'APIs & Webhooks',
    configurable: true,
    lastSync: '2024-07-04T14:45:00Z'
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Almacenamiento en la nube de Microsoft',
    status: 'error',
    category: 'Almacenamiento',
    configurable: true
  }
];

export default function MinimalIntegrations() {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { label: "Conectado", color: "green" as const },
      disconnected: { label: "Desconectado", color: "gray" as const },
      error: { label: "Error", color: "red" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('es-ES')} ${date.toLocaleTimeString('es-ES')}`;
  };

  const categories = [...new Set(integrations.map(i => i.category))];
  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;
  const totalEvents = 2300; // Mock data
  const uptime = 99.8; // Mock data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integraciones</h1>
          <p className="text-gray-600 mt-1">Conecta tu CRM con servicios externos para automatizar procesos</p>
        </div>
        <Button variant="secondary">
          Configuración Global
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Conectadas</span>
          <span className="text-3xl font-bold mt-2 block text-green-600">{connectedCount}</span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Con errores</span>
          <span className="text-3xl font-bold mt-2 block text-red-600">{errorCount}</span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Eventos hoy</span>
          <span className="text-3xl font-bold mt-2 block">{totalEvents.toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Uptime</span>
          <span className="text-3xl font-bold mt-2 block">{uptime}%</span>
        </div>
      </div>

      {/* Integrations by Category */}
      {categories.map(category => (
        <div key={category} className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">{category}</h3>
          </div>
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableHead>Servicio</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última sync</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableHeader>
              <TableBody>
                {integrations
                  .filter(integration => integration.category === category)
                  .map(integration => (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div className="font-medium">{integration.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs">
                          {integration.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(integration.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatLastSync(integration.lastSync)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {integration.configurable && (
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              Configurar
                            </button>
                          )}
                          {integration.status === 'connected' && (
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              Test
                            </button>
                          )}
                          {integration.status === 'disconnected' && (
                            <button className="text-green-600 hover:text-green-800 text-sm">
                              Conectar
                            </button>
                          )}
                          {integration.status === 'error' && (
                            <button className="text-red-600 hover:text-red-800 text-sm">
                              Resolver
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Acciones Rápidas</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="primary">Añadir Integración</Button>
          <Button variant="secondary">Configurar Webhooks</Button>
          <Button variant="secondary">Ver Logs</Button>
          <Button variant="secondary">Exportar Configuración</Button>
        </div>
      </div>
    </div>
  );
}