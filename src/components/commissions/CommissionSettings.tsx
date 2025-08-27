import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCommissionSettings } from '@/hooks/useCommissionSettings';
import { Settings, Save, Percent, Calendar, Zap, Mail, Bell, FileText, Users, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/productionLogger';

export const CommissionSettings = () => {
  const { settings, loading, updateSetting } = useCommissionSettings();
  const logger = createLogger('CommissionSettings');
  
  const [localSettings, setLocalSettings] = useState({
    autoCalculate: false,
    defaultPercentage: 5.0,
    approvalRequired: true,
    paymentSchedule: 'monthly',
    // Notification settings
    notificationsEnabled: true,
    notificationRecipients: ['admin@empresa.com'],
    newCommissionNotifications: true,
    dueReminderNotifications: true,
    overdueAlertNotifications: true,
    reminderDaysBefore: 3,
    // Report settings
    reportsEnabled: false,
    reportFrequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly',
    reportRecipients: ['admin@empresa.com'],
    reportFormat: 'excel' as 'excel' | 'pdf'
  });

  React.useEffect(() => {
    if (settings) {
      const notifications = settings.notification_settings as any || {};
      const reports = settings.report_settings as any || {};
      
      setLocalSettings({
        autoCalculate: settings.auto_calculate_commissions?.enabled || false,
        defaultPercentage: settings.default_commission_percentage?.percentage || 5.0,
        approvalRequired: settings.approval_required?.enabled || true,
        paymentSchedule: settings.payment_schedule?.frequency || 'monthly',
        // Notification settings
        notificationsEnabled: notifications.enabled ?? true,
        notificationRecipients: notifications.recipients || ['admin@empresa.com'],
        newCommissionNotifications: notifications.newCommissionNotifications ?? true,
        dueReminderNotifications: notifications.dueReminderNotifications ?? true,
        overdueAlertNotifications: notifications.overdueAlertNotifications ?? true,
        reminderDaysBefore: notifications.reminderDaysBefore || 3,
        // Report settings
        reportsEnabled: reports.enabled ?? false,
        reportFrequency: (reports.frequency as 'weekly' | 'monthly' | 'quarterly') || 'monthly',
        reportRecipients: reports.recipients || ['admin@empresa.com'],
        reportFormat: (reports.format as 'excel' | 'pdf') || 'excel'
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await Promise.all([
      updateSetting('auto_calculate_commissions', { enabled: localSettings.autoCalculate }),
      updateSetting('default_commission_percentage', { percentage: localSettings.defaultPercentage }),
      updateSetting('approval_required', { enabled: localSettings.approvalRequired }),
      updateSetting('payment_schedule', { frequency: localSettings.paymentSchedule }),
      updateSetting('notification_settings', {
        enabled: localSettings.notificationsEnabled,
        recipients: localSettings.notificationRecipients,
        newCommissionNotifications: localSettings.newCommissionNotifications,
        dueReminderNotifications: localSettings.dueReminderNotifications,
        overdueAlertNotifications: localSettings.overdueAlertNotifications,
        reminderDaysBefore: localSettings.reminderDaysBefore
      }),
      updateSetting('report_settings', {
        enabled: localSettings.reportsEnabled,
        frequency: localSettings.reportFrequency,
        recipients: localSettings.reportRecipients,
        format: localSettings.reportFormat
      })
    ]);
  };

  const handleTestNotification = async () => {
    try {
      await supabase.functions.invoke('commission-notifications', {
        body: {
          type: 'due_reminder',
          daysAhead: localSettings.reminderDaysBefore
        }
      });
    } catch (error) {
      logger.error('Error testing notification', { error });
    }
  };

  const handleGenerateReport = async () => {
    try {
      await supabase.functions.invoke('scheduled-reports', {
        body: {
          reportType: localSettings.reportFrequency,
          format: localSettings.reportFormat,
          recipients: localSettings.reportRecipients
        }
      });
    } catch (error) {
      logger.error('Error generating report', { error });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
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
            <Settings className="h-5 w-5" />
            Configuración del Sistema
          </CardTitle>
          <CardDescription>
            Configura el comportamiento del sistema de comisiones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cálculo automático */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="auto-calculate">Cálculo Automático</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Calcular comisiones automáticamente cuando se cierran deals o se convierten leads
              </p>
            </div>
            <Switch
              id="auto-calculate"
              checked={localSettings.autoCalculate}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, autoCalculate: checked }))
              }
            />
          </div>

          <Separator />

          {/* Porcentaje por defecto */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="default-percentage">Porcentaje de Comisión por Defecto</Label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="default-percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={localSettings.defaultPercentage}
                onChange={(e) => 
                  setLocalSettings(prev => ({ ...prev, defaultPercentage: Number(e.target.value) }))
                }
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Porcentaje aplicado por defecto a nuevas comisiones
            </p>
          </div>

          <Separator />

          {/* Aprobación requerida */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="approval-required">Aprobación Requerida</Label>
              <p className="text-sm text-muted-foreground">
                Requiere aprobación manual antes de marcar comisiones como pagadas
              </p>
            </div>
            <Switch
              id="approval-required"
              checked={localSettings.approvalRequired}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, approvalRequired: checked }))
              }
            />
          </div>

          <Separator />

          {/* Frecuencia de pagos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="payment-schedule">Frecuencia de Pagos</Label>
            </div>
            <Select
              value={localSettings.paymentSchedule}
              onValueChange={(value) => 
                setLocalSettings(prev => ({ ...prev, paymentSchedule: value }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="biweekly">Quincenal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Frecuencia recomendada para procesar pagos de comisiones
            </p>
          </div>

          <Separator />

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
        </CardContent>
      </Card>

      {/* Configuración de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones por Email
          </CardTitle>
          <CardDescription>
            Configura las notificaciones automáticas del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activar notificaciones */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled">Notificaciones Activadas</Label>
              <p className="text-sm text-muted-foreground">
                Enviar notificaciones por email sobre el estado de comisiones
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={localSettings.notificationsEnabled}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, notificationsEnabled: checked }))
              }
            />
          </div>

          {localSettings.notificationsEnabled && (
            <>
              <Separator />

              {/* Destinatarios */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="notification-recipients">Destinatarios</Label>
                </div>
                <Textarea
                  id="notification-recipients"
                  value={localSettings.notificationRecipients.join(', ')}
                  onChange={(e) => 
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      notificationRecipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                    }))
                  }
                  placeholder="admin@empresa.com, finanzas@empresa.com"
                  className="min-h-[60px]"
                />
                <p className="text-sm text-muted-foreground">
                  Emails separados por comas que recibirán las notificaciones
                </p>
              </div>

              <Separator />

              {/* Tipos de notificaciones */}
              <div className="space-y-4">
                <Label>Tipos de Notificaciones</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-commission-notifications">Nuevas Comisiones</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar cuando se crean nuevas comisiones automáticamente
                      </p>
                    </div>
                    <Switch
                      id="new-commission-notifications"
                      checked={localSettings.newCommissionNotifications}
                      onCheckedChange={(checked) => 
                        setLocalSettings(prev => ({ ...prev, newCommissionNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="due-reminder-notifications">Recordatorios de Vencimiento</Label>
                      <p className="text-sm text-muted-foreground">
                        Recordar comisiones próximas a vencer
                      </p>
                    </div>
                    <Switch
                      id="due-reminder-notifications"
                      checked={localSettings.dueReminderNotifications}
                      onCheckedChange={(checked) => 
                        setLocalSettings(prev => ({ ...prev, dueReminderNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="overdue-alert-notifications">Alertas de Vencimiento</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertar sobre comisiones ya vencidas
                      </p>
                    </div>
                    <Switch
                      id="overdue-alert-notifications"
                      checked={localSettings.overdueAlertNotifications}
                      onCheckedChange={(checked) => 
                        setLocalSettings(prev => ({ ...prev, overdueAlertNotifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Días de anticipación */}
              <div className="space-y-2">
                <Label htmlFor="reminder-days">Días de Anticipación para Recordatorios</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="reminder-days"
                    type="number"
                    min="1"
                    max="30"
                    value={localSettings.reminderDaysBefore}
                    onChange={(e) => 
                      setLocalSettings(prev => ({ ...prev, reminderDaysBefore: Number(e.target.value) }))
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">días antes del vencimiento</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleTestNotification} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Probar Notificación
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Configuración de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reportes Automáticos
          </CardTitle>
          <CardDescription>
            Configura la generación automática de reportes periódicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activar reportes */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reports-enabled">Reportes Automáticos</Label>
              <p className="text-sm text-muted-foreground">
                Generar y enviar reportes de comisiones automáticamente
              </p>
            </div>
            <Switch
              id="reports-enabled"
              checked={localSettings.reportsEnabled}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, reportsEnabled: checked }))
              }
            />
          </div>

          {localSettings.reportsEnabled && (
            <>
              <Separator />

              {/* Frecuencia */}
              <div className="space-y-2">
                <Label htmlFor="report-frequency">Frecuencia</Label>
                <Select
                  value={localSettings.reportFrequency}
                  onValueChange={(value: 'weekly' | 'monthly' | 'quarterly') => 
                    setLocalSettings(prev => ({ ...prev, reportFrequency: value }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Formato */}
              <div className="space-y-2">
                <Label htmlFor="report-format">Formato</Label>
                <Select
                  value={localSettings.reportFormat}
                  onValueChange={(value: 'excel' | 'pdf') => 
                    setLocalSettings(prev => ({ ...prev, reportFormat: value }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel (XLSX)</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Destinatarios de reportes */}
              <div className="space-y-2">
                <Label htmlFor="report-recipients">Destinatarios</Label>
                <Textarea
                  id="report-recipients"
                  value={localSettings.reportRecipients.join(', ')}
                  onChange={(e) => 
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      reportRecipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                    }))
                  }
                  placeholder="direccion@empresa.com, finanzas@empresa.com"
                  className="min-h-[60px]"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleGenerateReport} className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte Ahora
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reglas avanzadas */}
      <Card>
        <CardHeader>
          <CardTitle>Reglas de Comisión Personalizadas</CardTitle>
          <CardDescription>
            Configura reglas específicas por tipo de colaborador o fuente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Próximamente: Configuración de reglas personalizadas
            </p>
            <Button variant="outline" disabled>
              Crear Regla Personalizada
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};