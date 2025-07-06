import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangleIcon, 
  TrendingDownIcon, 
  DollarSignIcon, 
  CalendarIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon
} from 'lucide-react';

interface RiskAlert {
  companyId: string;
  companyName: string;
  riskType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
}

interface EInformaRiskAnalysisProps {
  alerts: RiskAlert[];
}

export const EInformaRiskAnalysis = ({ alerts }: EInformaRiskAnalysisProps) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertCircleIcon className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      default: return <AlertCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskTypeIcon = (riskType: string) => {
    switch (riskType) {
      case 'financial': return <DollarSignIcon className="h-4 w-4" />;
      case 'temporal': return <CalendarIcon className="h-4 w-4" />;
      case 'operational': return <TrendingDownIcon className="h-4 w-4" />;
      default: return <AlertTriangleIcon className="h-4 w-4" />;
    }
  };

  const highRiskAlerts = alerts.filter(alert => alert.severity === 'high');
  const mediumRiskAlerts = alerts.filter(alert => alert.severity === 'medium');
  const lowRiskAlerts = alerts.filter(alert => alert.severity === 'low');

  const riskScore = {
    high: highRiskAlerts.length * 3,
    medium: mediumRiskAlerts.length * 2,
    low: lowRiskAlerts.length * 1
  };

  const totalRiskScore = riskScore.high + riskScore.medium + riskScore.low;
  const maxPossibleScore = alerts.length * 3;
  const riskPercentage = maxPossibleScore > 0 ? (totalRiskScore / maxPossibleScore) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Resumen de riesgos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{highRiskAlerts.length}</div>
                <p className="text-sm text-muted-foreground">Alto Riesgo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{mediumRiskAlerts.length}</div>
                <p className="text-sm text-muted-foreground">Riesgo Medio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{lowRiskAlerts.length}</div>
                <p className="text-sm text-muted-foreground">Bajo Riesgo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{Math.round(riskPercentage)}%</div>
                <p className="text-sm text-muted-foreground">Puntuación Riesgo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas críticas */}
      {highRiskAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangleIcon className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>Atención:</strong> Hay {highRiskAlerts.length} empresa(s) con alertas de alto riesgo que requieren revisión inmediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Puntuación general de riesgo */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis General de Riesgo</CardTitle>
          <CardDescription>
            Evaluación del riesgo general del portfolio de empresas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Puntuación de Riesgo General</span>
                <span>{Math.round(riskPercentage)}%</span>
              </div>
              <Progress 
                value={riskPercentage} 
                className="w-full h-3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Basado en {alerts.length} análisis de empresas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Alto Riesgo</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Requiere acción inmediata
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Riesgo Medio</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Monitoreo regular recomendado
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Bajo Riesgo</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Situación estable
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista detallada de alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Detalladas</CardTitle>
          <CardDescription>
            Lista completa de alertas de riesgo por empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircleIcon className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>No hay alertas de riesgo activas</p>
                <p className="text-sm">Todas las empresas están en situación estable</p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div key={`${alert.companyId}-${index}`} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getSeverityIcon(alert.severity)}
                      <h4 className="font-medium">{alert.companyName}</h4>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {getRiskTypeIcon(alert.riskType)}
                        <span className="text-xs capitalize">{alert.riskType}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Detectado: {new Date(alert.timestamp).toLocaleString('es-ES')}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <ExternalLinkIcon className="h-3 w-3 mr-1" />
                      Ver Empresa
                    </Button>
                    <Button variant="outline" size="sm">
                      Revisar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones</CardTitle>
          <CardDescription>
            Acciones recomendadas basadas en el análisis de riesgo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {highRiskAlerts.length > 0 && (
              <div className="p-3 border-l-4 border-red-500 bg-red-50">
                <h5 className="font-medium text-red-800">Acción Inmediata Requerida</h5>
                <p className="text-sm text-red-700">
                  Revisar y contactar empresas con alto riesgo financiero para evaluar su situación actual.
                </p>
              </div>
            )}
            {mediumRiskAlerts.length > 0 && (
              <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                <h5 className="font-medium text-yellow-800">Monitoreo Recomendado</h5>
                <p className="text-sm text-yellow-700">
                  Establecer seguimiento regular de empresas con riesgo medio para prevenir deterioro.
                </p>
              </div>
            )}
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
              <h5 className="font-medium text-blue-800">Optimización General</h5>
              <p className="text-sm text-blue-700">
                Considerar actualizar datos de eInforma cada 3-6 meses para mantener información actualizada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};