import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SettingSection } from '@/components/settings/SettingSection';
import { useReminders, REMINDER_CONFIGS } from '@/hooks/automation/useReminders';
import { toast } from 'sonner';
import { Bell, Clock, Settings, Save } from 'lucide-react';

interface ReminderSettings {
  [key: string]: {
    enabled: boolean;
    delayHours: number;
    message: string;
  };
}

export default function RemindersConfigPage() {
  const { REMINDER_CONFIGS: defaultConfigs } = useReminders();
  
  // Initialize settings from default configs
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    const initialSettings: ReminderSettings = {};
    Object.entries(defaultConfigs).forEach(([type, config]) => {
      initialSettings[type] = {
        enabled: true,
        delayHours: config.delayHours,
        message: config.message || ''
      };
    });
    return initialSettings;
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleToggleReminder = (type: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled
      }
    }));
  };

  const handleUpdateDelay = (type: string, delayHours: number) => {
    if (delayHours < 1) return; // Minimum 1 hour
    
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        delayHours
      }
    }));
  };

  const handleUpdateMessage = (type: string, message: string) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        message
      }
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would save to backend
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configuración de recordatorios guardada', {
        description: 'Los cambios se aplicarán a los nuevos recordatorios.'
      });
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const reminderTypeLabels = {
    NDA_NOT_SIGNED: 'NDA no firmado',
    NO_ACTIVITY_NEGOTIATION: 'Sin actividad en negociación',
    PROPOSAL_PENDING: 'Propuesta pendiente'
  };

  const reminderTypeDescriptions = {
    NDA_NOT_SIGNED: 'Recordatorio cuando un NDA no ha sido firmado después del tiempo especificado',
    NO_ACTIVITY_NEGOTIATION: 'Recordatorio cuando no hay actividad en una negociación',
    PROPOSAL_PENDING: 'Recordatorio cuando una propuesta no ha recibido respuesta'
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configuración de Recordatorios
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los recordatorios automáticos del sistema
          </p>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <SettingSection
          title="Configuración General"
          description="Ajustes globales para el sistema de recordatorios"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Recordatorios habilitados</Label>
                <p className="text-xs text-muted-foreground">
                  Activar o desactivar completamente el sistema de recordatorios
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Zona horaria para recordatorios</Label>
              <p className="text-xs text-muted-foreground">
                Actualmente: Europe/Madrid (UTC+1)
              </p>
            </div>
          </div>
        </SettingSection>

        {/* Reminder Types Configuration */}
        <SettingSection
          title="Tipos de Recordatorio"
          description="Configura cada tipo de recordatorio individualmente"
        >
          <div className="space-y-6">
            {Object.entries(settings).map(([type, config]) => (
              <Card key={type} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    {reminderTypeLabels[type as keyof typeof reminderTypeLabels]}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {reminderTypeDescriptions[type as keyof typeof reminderTypeDescriptions]}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Habilitado</Label>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(enabled) => handleToggleReminder(type, enabled)}
                    />
                  </div>
                  
                  {config.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Retraso (horas)
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="8760" // Max 1 year
                          value={config.delayHours}
                          onChange={(e) => handleUpdateDelay(type, parseInt(e.target.value) || 1)}
                          className="w-32"
                        />
                        <p className="text-xs text-muted-foreground">
                          El recordatorio se enviará después de {config.delayHours} horas
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">Mensaje personalizado</Label>
                        <Input
                          value={config.message}
                          onChange={(e) => handleUpdateMessage(type, e.target.value)}
                          placeholder="Mensaje del recordatorio..."
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </SettingSection>

        {/* Advanced Settings */}
        <SettingSection
          title="Configuración Avanzada"
          description="Opciones adicionales para recordatorios"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Recordatorios en email</Label>
                <p className="text-xs text-muted-foreground">
                  Enviar recordatorios también por correo electrónico
                </p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Notificaciones push</Label>
                <p className="text-xs text-muted-foreground">
                  Mostrar notificaciones del navegador para recordatorios urgentes
                </p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-cancelar recordatorios</Label>
                <p className="text-xs text-muted-foreground">
                  Cancelar automáticamente recordatorios cuando se complete la acción
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}