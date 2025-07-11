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
import { useCommissionSettings } from '@/hooks/useCommissionSettings';
import { Settings, Save, Percent, Calendar, Zap } from 'lucide-react';

export const CommissionSettings = () => {
  const { settings, loading, updateSetting } = useCommissionSettings();
  
  const [localSettings, setLocalSettings] = useState({
    autoCalculate: false,
    defaultPercentage: 5.0,
    approvalRequired: true,
    paymentSchedule: 'monthly'
  });

  React.useEffect(() => {
    if (settings) {
      setLocalSettings({
        autoCalculate: settings.auto_calculate_commissions?.enabled || false,
        defaultPercentage: settings.default_commission_percentage?.percentage || 5.0,
        approvalRequired: settings.approval_required?.enabled || true,
        paymentSchedule: settings.payment_schedule?.frequency || 'monthly'
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await Promise.all([
      updateSetting('auto_calculate_commissions', { enabled: localSettings.autoCalculate }),
      updateSetting('default_commission_percentage', { percentage: localSettings.defaultPercentage }),
      updateSetting('approval_required', { enabled: localSettings.approvalRequired }),
      updateSetting('payment_schedule', { frequency: localSettings.paymentSchedule })
    ]);
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