import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Settings, Save, User, Calendar, Mail, Bell, Archive } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { logger } from '@/utils/productionLogger';

interface MandateConfigurationPanelProps {
  mandate: BuyingMandate;
}

export const MandatoConfig = ({ mandate }: MandateConfigurationPanelProps) => {
  const { updateMandateStatus } = useBuyingMandates();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoFollowup: true,
    weeklyReports: true,
    clientUpdates: true,
    teamNotifications: false,
  });

  const handleStatusChange = async (newStatus: BuyingMandate['status']) => {
    setIsLoading(true);
    try {
      await updateMandateStatus(mandate.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (setting: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuración del Mandato</h2>
          <p className="text-muted-foreground">
            Gestiona las configuraciones y parámetros del mandato
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado del Mandato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Estado del Mandato
            </CardTitle>
            <CardDescription>
              Controla el estado actual del mandato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Estado Actual:</span>
                <Badge variant={mandate.status === 'active' ? 'default' : 'secondary'}>
                  {mandate.status === 'active' ? 'Activo' : 
                   mandate.status === 'paused' ? 'Pausado' :
                   mandate.status === 'completed' ? 'Completado' : 'Cancelado'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={mandate.status === 'active' ? 'default' : 'outline'}
                  size="sm"
                  disabled={isLoading || mandate.status === 'active'}
                  onClick={() => handleStatusChange('active')}
                >
                  Activar
                </Button>
                <Button 
                  variant={mandate.status === 'paused' ? 'default' : 'outline'}
                  size="sm"
                  disabled={isLoading || mandate.status === 'paused'}
                  onClick={() => handleStatusChange('paused')}
                >
                  Pausar
                </Button>
                <Button 
                  variant={mandate.status === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  disabled={isLoading || mandate.status === 'completed'}
                  onClick={() => handleStatusChange('completed')}
                >
                  Completar
                </Button>
                <Button 
                  variant={mandate.status === 'cancelled' ? 'destructive' : 'outline'}
                  size="sm"
                  disabled={isLoading || mandate.status === 'cancelled'}
                  onClick={() => handleStatusChange('cancelled')}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura las alertas y notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      {key === 'emailNotifications' ? 'Notificaciones por Email' :
                       key === 'autoFollowup' ? 'Seguimiento Automático' :
                       key === 'weeklyReports' ? 'Reportes Semanales' :
                       key === 'clientUpdates' ? 'Actualizaciones al Cliente' :
                       'Notificaciones del Equipo'}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {key === 'emailNotifications' ? 'Recibir emails de cambios importantes' :
                       key === 'autoFollowup' ? 'Crear recordatorios automáticos' :
                       key === 'weeklyReports' ? 'Resumen semanal del progreso' :
                       key === 'clientUpdates' ? 'Enviar actualizaciones al cliente' :
                       'Notificar cambios al equipo'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => handleSettingChange(key as keyof typeof settings, checked)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Información del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Información del Sistema
            </CardTitle>
            <CardDescription>
              Detalles técnicos y de auditoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID del Mandato:</span>
                <span className="font-mono text-xs">{mandate.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Creado:</span>
                <span>{formatDate(mandate.created_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Última actualización:</span>
                <span>{formatDate(mandate.updated_at)}</span>
              </div>
              {mandate.created_by && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Creado por:</span>
                  <span>{mandate.created_by}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Acciones Avanzadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Acciones Avanzadas
            </CardTitle>
            <CardDescription>
              Operaciones de gestión avanzada del mandato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Archive className="h-4 w-4 mr-2" />
                Exportar Datos del Mandato
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Programar Reporte Automático
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Actualización al Cliente
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Eliminar Mandato
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Changes */}
      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
};