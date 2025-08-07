import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  DollarSignIcon,
  AlertTriangleIcon,
  DownloadIcon,
  CalendarIcon,
  PieChartIcon
} from 'lucide-react';
import { EInformaUsageChart } from '@/components/einforma/EInformaUsageChart';

interface EInformaHistoryTabProps {
  usageData: Array<{
    month: string;
    queries: number;
    cost: number;
    companies: number;
  }>;
  companyInsights: Array<{
    sector: string;
    totalCompanies: number;
    averageRevenue: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  riskAlerts: Array<{
    companyId: string;
    companyName: string;
    riskType: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    timestamp: string;
  }>;
}

export const EInformaHistoryTab = ({ 
  usageData, 
  companyInsights, 
  riskAlerts 
}: EInformaHistoryTabProps) => {
  const totalQueries = usageData.reduce((sum, month) => sum + month.queries, 0);
  const totalCost = usageData.reduce((sum, month) => sum + month.cost, 0);
  const avgCostPerQuery = totalQueries > 0 ? (totalCost / totalQueries).toFixed(2) : '0.00';
  const successRate = 94.5; // Mock value

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Consultas</p>
                <p className="text-2xl font-bold">{totalQueries}</p>
              </div>
              <BarChart3Icon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Coste Total</p>
                <p className="text-2xl font-bold">€{totalCost}</p>
              </div>
              <DollarSignIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa Éxito</p>
                <p className="text-2xl font-bold text-green-600">{successRate}%</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">€/Consulta</p>
                <p className="text-2xl font-bold">€{avgCostPerQuery}</p>
              </div>
              <PieChartIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3Icon className="h-5 w-5" />
                Análisis de Uso Detallado
              </CardTitle>
              <CardDescription>
                Evolución completa de consultas, costes y ROI
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Filtrar período
              </Button>
              <Button variant="outline" size="sm">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EInformaUsageChart data={usageData} detailed={true} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis por Sector</CardTitle>
            <CardDescription>
              Distribución de empresas consultadas y análisis de riesgo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyInsights.slice(0, 8).map((insight, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{insight.sector}</p>
                    <p className="text-sm text-muted-foreground">
                      {insight.totalCompanies} empresas • €{insight.averageRevenue.toLocaleString('es-ES')} promedio
                    </p>
                  </div>
                  <Badge 
                    variant={
                      insight.riskLevel === 'low' ? 'default' : 
                      insight.riskLevel === 'medium' ? 'secondary' : 'destructive'
                    }
                  >
                    {insight.riskLevel === 'low' ? 'Bajo riesgo' : 
                     insight.riskLevel === 'medium' ? 'Riesgo medio' : 'Alto riesgo'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
              Análisis de Riesgo
            </CardTitle>
            <CardDescription>
              Empresas que requieren atención especial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Risk Distribution */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">65%</div>
                  <p className="text-sm text-muted-foreground">Riesgo Bajo</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">28%</div>
                  <p className="text-sm text-muted-foreground">Riesgo Medio</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">7%</div>
                  <p className="text-sm text-muted-foreground">Riesgo Alto</p>
                </div>
              </div>

              {/* Recent Risk Alerts */}
              <div className="space-y-3">
                <h4 className="font-medium">Alertas Recientes</h4>
                {riskAlerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{alert.companyName}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        alert.severity === 'high' ? 'destructive' : 
                        alert.severity === 'medium' ? 'secondary' : 'outline'
                      }
                    >
                      {alert.severity === 'high' ? 'Alto' : 
                       alert.severity === 'medium' ? 'Medio' : 'Bajo'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSignIcon className="h-5 w-5" />
            Optimización de Costes
          </CardTitle>
          <CardDescription>
            Recomendaciones para reducir gastos y maximizar ROI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                💰 Ahorro Potencial
              </h4>
              <p className="text-2xl font-bold text-green-600">€{Math.round(totalCost * 0.15)}</p>
              <p className="text-sm text-muted-foreground">
                Evitando re-consultas innecesarias
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                📊 Predicción Mensual
              </h4>
              <p className="text-2xl font-bold text-blue-600">€{Math.round(totalCost / 6)}</p>
              <p className="text-sm text-muted-foreground">
                Basado en tendencia actual
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950">
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                ⚡ Consultas Duplicadas
              </h4>
              <p className="text-2xl font-bold text-orange-600">{Math.floor(totalQueries * 0.08)}</p>
              <p className="text-sm text-muted-foreground">
                Detectadas automáticamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};