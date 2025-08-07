import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  SettingsIcon, 
  BellIcon, 
  DollarSignIcon,
  ZapIcon,
  ShieldIcon,
  ClockIcon,
  DownloadIcon
} from 'lucide-react';
import { EInformaCredentialsConfig } from '@/components/einforma/EInformaCredentialsConfig';

export const EInformaConfigTab = () => {
  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Configuración de API
          </CardTitle>
          <CardDescription>
            Configuración de credenciales y parámetros de conexión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EInformaCredentialsConfig />
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="h-5 w-5" />
            Automatización Inteligente
          </CardTitle>
          <CardDescription>
            Configura workflows automáticos para optimizar tu flujo de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-consulta nuevas empresas CRM</Label>
                <p className="text-sm text-muted-foreground">
                  Consultar automáticamente eInforma para nuevas empresas con ingresos &gt; €100k
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Actualización automática</Label>
                <p className="text-sm text-muted-foreground">
                  Re-consultar datos de empresas cada 6 meses automáticamente
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Detectar duplicados</Label>
                <p className="text-sm text-muted-foreground">
                  Evitar consultas duplicadas de la misma empresa en 30 días
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-sm">Umbral de ingresos para auto-consulta</Label>
              <Input placeholder="100000" type="number" className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Frecuencia de actualización (meses)</Label>
              <Input placeholder="6" type="number" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            Alertas y Notificaciones
          </CardTitle>
          <CardDescription>
            Configura alertas para mantener tu equipo informado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Alertas de riesgo crediticio</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar cuando una empresa cambie de rating crediticio
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Resumen semanal de uso</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir informe semanal de consultas y costes
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Límite de gasto mensual</Label>
                <p className="text-sm text-muted-foreground">
                  Alertar cuando se alcance el 80% del presupuesto mensual
                </p>
              </div>
              <Switch />
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <Label className="text-sm">Presupuesto mensual máximo (€)</Label>
            <Input placeholder="500" type="number" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Cost Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSignIcon className="h-5 w-5" />
            Gestión de Costes
          </CardTitle>
          <CardDescription>
            Controla y optimiza el gasto en consultas eInforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold">€0.15</div>
              <p className="text-sm text-muted-foreground">Coste por consulta</p>
              <Badge variant="secondary" className="mt-2">Estándar</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">€0.12</div>
              <p className="text-sm text-muted-foreground">Con pack 1000+</p>
              <Badge variant="default" className="mt-2">20% descuento</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">€0.10</div>
              <p className="text-sm text-muted-foreground">Con pack 5000+</p>
              <Badge variant="default" className="mt-2">33% descuento</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div>
              <h4 className="font-medium">Optimización disponible</h4>
              <p className="text-sm text-muted-foreground">
                Puedes ahorrar €45/mes con el pack de 1000 consultas
              </p>
            </div>
            <Button variant="default">
              Ver packs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5" />
            Gestión de Datos
          </CardTitle>
          <CardDescription>
            Configuración de retención y privacidad de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Retención de datos históricos</Label>
                <p className="text-sm text-muted-foreground">
                  Mantener historial de consultas durante 24 meses
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Cache inteligente</Label>
                <p className="text-sm text-muted-foreground">
                  Usar cache local para consultas recientes (ahorra costes)
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Exportar historial
            </Button>
            <Button variant="outline" className="flex-1">
              <ClockIcon className="h-4 w-4 mr-2" />
              Programar backup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};