import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUpIcon, 
  DollarSignIcon, 
  BuildingIcon, 
  AlertTriangleIcon,
  TargetIcon,
  PercentIcon,
  ClockIcon
} from 'lucide-react';

interface EInformaSidebarProps {
  metrics: {
    totalQueries: number;
    queriesChange: number;
    companiesEnriched: number;
    companiesChange: number;
    totalCost: number;
    costChange: number;
    riskAlerts: number;
    riskChange: number;
  };
  riskAlerts: Array<{
    companyName: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  companyInsights: Array<{
    sector: string;
    totalCompanies: number;
    averageRevenue: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  isLoading: boolean;
}

export const EInformaSidebar = ({ 
  metrics, 
  riskAlerts, 
  companyInsights,
  isLoading 
}: EInformaSidebarProps) => {
  const coveragePercentage = Math.round((metrics.companiesEnriched / (metrics.companiesEnriched + 50)) * 100);
  const avgCostPerQuery = metrics.totalQueries > 0 ? (metrics.totalCost / metrics.totalQueries).toFixed(2) : '0.00';
  const monthlyProjection = Math.round(metrics.totalCost / 6 * 12);

  return (
    <div className="w-80 bg-card border-r p-4 space-y-4 overflow-auto">
      {/* Executive KPIs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-primary" />
            KPIs Ejecutivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Consultas/mes</span>
              <div className="text-right">
                <span className="font-bold">{Math.floor(metrics.totalQueries / 6)}</span>
                <Badge variant={metrics.queriesChange > 0 ? 'default' : 'secondary'} className="ml-2 text-xs">
                  {metrics.queriesChange > 0 ? '+' : ''}{metrics.queriesChange}%
                </Badge>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Coverage CRM</span>
              <div className="text-right">
                <span className="font-bold">{coveragePercentage}%</span>
                <PercentIcon className="h-3 w-3 ml-1 inline text-muted-foreground" />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Coste/consulta</span>
              <span className="font-bold">€{avgCostPerQuery}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Proyección anual</span>
              <span className="font-bold text-primary">€{monthlyProjection.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TargetIcon className="h-5 w-5 text-primary" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <BuildingIcon className="h-4 w-4 mr-2" />
            Consultar empresas sin eInforma
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <ClockIcon className="h-4 w-4 mr-2" />
            Actualizar datos antiguos
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <AlertTriangleIcon className="h-4 w-4 mr-2" />
            Revisar alertas de riesgo
          </Button>
        </CardContent>
      </Card>

      {/* Risk Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
            Alertas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskAlerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="p-3 rounded-lg border bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.companyName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  </div>
                  <Badge 
                    variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {alert.severity === 'high' ? 'Alto' : alert.severity === 'medium' ? 'Medio' : 'Bajo'}
                  </Badge>
                </div>
              </div>
            ))}
            {riskAlerts.length > 3 && (
              <Button variant="ghost" size="sm" className="w-full">
                Ver todas las alertas ({riskAlerts.length - 3} más)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Sectors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Sectores Top</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {companyInsights.slice(0, 4).map((insight, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{insight.sector}</span>
                <div className="text-right">
                  <span className="font-medium">{insight.totalCompanies}</span>
                  <div className={`w-2 h-2 rounded-full inline-block ml-2 ${
                    insight.riskLevel === 'low' ? 'bg-green-500' : 
                    insight.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>API eInforma: Operativa</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sincronización CRM: Activa</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Queue: {Math.floor(Math.random() * 5)} pendientes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};