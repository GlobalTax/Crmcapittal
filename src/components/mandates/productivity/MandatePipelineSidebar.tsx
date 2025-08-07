import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BuyingMandate } from '@/types/BuyingMandate';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle,
  Activity,
  BarChart3,
  Calendar
} from 'lucide-react';

interface MandatePipelineSidebarProps {
  mandates: BuyingMandate[];
  selectedMandate: BuyingMandate | null;
}

export function MandatePipelineSidebar({ mandates, selectedMandate }: MandatePipelineSidebarProps) {
  // Calculate pipeline metrics
  const totalMandates = mandates.length;
  const activeMandates = mandates.filter(m => m.status === 'active').length;
  const completedMandates = mandates.filter(m => m.status === 'completed').length;
  const conversionRate = totalMandates > 0 ? (completedMandates / totalMandates) * 100 : 0;

  // Calculate average time per stage (mock data)
  const avgTimePerStage = {
    active: 45,
    review: 15,
    completion: 30
  };

  // Pipeline stages distribution
  const stageDistribution = [
    { status: 'active', count: activeMandates, label: 'Activos', color: 'bg-primary' },
    { status: 'paused', count: mandates.filter(m => m.status === 'paused').length, label: 'Pausados', color: 'bg-warning' },
    { status: 'completed', count: completedMandates, label: 'Completados', color: 'bg-success' },
    { status: 'cancelled', count: mandates.filter(m => m.status === 'cancelled').length, label: 'Cancelados', color: 'bg-destructive' }
  ];

  // Recent activity (mock data)
  const recentActivity = [
    { type: 'mandate_created', mandateName: 'Tech Acquisition Q1', time: '2h ago' },
    { type: 'target_contacted', mandateName: 'Industrial Partners', time: '4h ago' },
    { type: 'mandate_completed', mandateName: 'Services Expansion', time: '1d ago' }
  ];

  return (
    <div className="w-80 border-l border-border bg-muted/20 p-6 space-y-6 overflow-y-auto">
      {/* Pipeline Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Pipeline Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalMandates}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{activeMandates}</div>
              <div className="text-xs text-muted-foreground">Activos</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Conversión</span>
              <span>{conversionRate.toFixed(1)}%</span>
            </div>
            <Progress value={conversionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stage Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Distribución por Estado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stageDistribution.map((stage) => (
            <div key={stage.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <span className="text-sm">{stage.label}</span>
              </div>
              <Badge variant="outline">{stage.count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Average Time per Stage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tiempo Promedio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Ejecución</span>
            <span className="text-sm font-medium">{avgTimePerStage.active} días</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Revisión</span>
            <span className="text-sm font-medium">{avgTimePerStage.review} días</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Cierre</span>
            <span className="text-sm font-medium">{avgTimePerStage.completion} días</span>
          </div>
        </CardContent>
      </Card>

      {/* Selected Mandate Quick Info */}
      {selectedMandate && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Mandato Seleccionado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">{selectedMandate.mandate_name}</h4>
              <p className="text-xs text-muted-foreground">{selectedMandate.client_name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Estado:</span>
                <Badge className="ml-1 text-xs">
                  {selectedMandate.status}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Sectores:</span>
                <p className="font-medium mt-1">
                  {selectedMandate.target_sectors?.slice(0, 2).join(', ')}
                  {selectedMandate.target_sectors && selectedMandate.target_sectors.length > 2 && '...'}
                </p>
              </div>
            </div>

            <div className="text-xs">
              <span className="text-muted-foreground">Última actualización:</span>
              <p className="font-medium">
                {new Date(selectedMandate.updated_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium">{activity.mandateName}</p>
                <p className="text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button className="w-full text-left text-sm p-2 rounded hover:bg-muted/50 transition-colors">
            Ver todos los vencimientos
          </button>
          <button className="w-full text-left text-sm p-2 rounded hover:bg-muted/50 transition-colors">
            Exportar pipeline
          </button>
          <button className="w-full text-left text-sm p-2 rounded hover:bg-muted/50 transition-colors">
            Configurar alertas
          </button>
        </CardContent>
      </Card>
    </div>
  );
}