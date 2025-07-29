import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Play, Settings, Bell, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAutomatedNotifications } from '@/hooks/useAutomatedNotifications';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function AutomatedNotificationsPanel() {
  const {
    notificationRules,
    notificationLogs,
    rulesLoading,
    logsLoading,
    triggerAutomatedNotifications,
    updateNotificationRule,
    isTriggeringNotifications,
  } = useAutomatedNotifications();

  const [showLogs, setShowLogs] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'high_score_lead':
        return <TrendingUp className="h-4 w-4" />;
      case 'task_reminder':
        return <Clock className="h-4 w-4" />;
      case 'high_prob_negotiation':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'high_score_lead':
        return 'Lead HOT (Score ≥70)';
      case 'task_reminder':
        return 'Recordatorio de Tareas';
      case 'high_prob_negotiation':
        return 'Negociación Alta Probabilidad';
      default:
        return type;
    }
  };

  const handleRuleToggle = (ruleId: string, isActive: boolean) => {
    updateNotificationRule({
      id: ruleId,
      updates: { is_active: isActive }
    });
  };

  if (rulesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones Automáticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones Automáticas
          </CardTitle>
          <CardDescription>
            Configuración de notificaciones automáticas basadas en eventos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Botón de prueba manual */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Ejecutar Manualmente</h4>
              <p className="text-sm text-muted-foreground">
                Procesar todas las reglas de notificación ahora
              </p>
            </div>
            <Button
              onClick={() => triggerAutomatedNotifications()}
              disabled={isTriggeringNotifications}
              size="sm"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isTriggeringNotifications ? 'Procesando...' : 'Ejecutar'}
            </Button>
          </div>

          <Separator />

          {/* Lista de reglas */}
          <div className="space-y-4">
            <h4 className="font-medium">Reglas Configuradas</h4>
            {notificationRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getNotificationIcon(rule.rule_type)}
                  <div>
                    <h5 className="font-medium">{getTypeLabel(rule.rule_type)}</h5>
                    <p className="text-sm text-muted-foreground">
                      {rule.notification_config.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {rule.notification_config.in_app && (
                        <Badge variant="secondary" className="text-xs">In-App</Badge>
                      )}
                      {rule.notification_config.email && (
                        <Badge variant="secondary" className="text-xs">Email</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) => handleRuleToggle(rule.id, checked)}
                  />
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Toggle para logs */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Registro de Actividad</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogs(!showLogs)}
            >
              {showLogs ? 'Ocultar' : 'Mostrar'} Logs
            </Button>
          </div>

          {/* Lista de logs */}
          {showLogs && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded"></div>
                  ))}
                </div>
              ) : notificationLogs.length > 0 ? (
                notificationLogs.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(log.notification_type)}
                        <span className="font-medium text-sm">
                          {getTypeLabel(log.notification_type)}
                        </span>
                        <Badge 
                          variant={log.delivery_status === 'sent' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {log.delivery_status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.sent_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay registros de notificaciones</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}