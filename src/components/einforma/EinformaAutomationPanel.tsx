import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEinformaAutomation } from '@/hooks/useEinformaAutomation';
import { useEinformaCosts } from '@/hooks/useEinformaCosts';
import { 
  Bot, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle,
  XCircle,
  Play,
  BarChart3,
  Settings
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const EinformaAutomationPanel = () => {
  const {
    alerts,
    syncLogs,
    automationRules,
    unreadAlertsCount,
    criticalAlertsCount,
    lastSyncStatus,
    runAutoSync,
    runRiskMonitor,
    generateReport,
    runCostOptimization,
    markAlertAsRead,
    isAutoSyncing,
    isMonitoringRisk,
    isGeneratingReport,
    isOptimizingCosts
  } = useEinformaAutomation();

  const { metrics, budget } = useEinformaCosts('current');

  return (
    <div className="space-y-6">
      {/* Quick Actions & Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Sync</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={lastSyncStatus === 'completed' ? 'default' : 'destructive'}>
                {lastSyncStatus}
              </Badge>
              <Button 
                size="sm" 
                onClick={() => runAutoSync()}
                disabled={isAutoSyncing}
              >
                <Play className="h-3 w-3 mr-1" />
                {isAutoSyncing ? 'Ejecutando...' : 'Ejecutar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unreadAlertsCount}
              {criticalAlertsCount > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {criticalAlertsCount} críticas
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budget.used.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              €{metrics.totalCost.toFixed(0)} / €{budget.monthly}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{metrics.averageCostPerConsultation.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Coste medio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alert */}
      {budget.isAtRisk && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ Presupuesto en riesgo: {budget.used.toFixed(1)}% utilizado (€{metrics.totalCost.toFixed(2)}/€{budget.monthly})
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="automation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="automation">Automatización</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="costs">Costes</TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Acciones Automáticas
              </CardTitle>
              <CardDescription>
                Ejecutar procesos de automatización eInforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => runRiskMonitor()}
                  disabled={isMonitoringRisk}
                  className="w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {isMonitoringRisk ? 'Monitoreando...' : 'Monitoreo de Riesgo'}
                </Button>

                <Button 
                  onClick={() => runCostOptimization()}
                  disabled={isOptimizingCosts}
                  variant="outline"
                  className="w-full"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {isOptimizingCosts ? 'Analizando...' : 'Optimización de Costes'}
                </Button>

                <Button 
                  onClick={() => generateReport('weekly')}
                  disabled={isGeneratingReport}
                  variant="outline"
                  className="w-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {isGeneratingReport ? 'Generando...' : 'Reporte Semanal'}
                </Button>

                <Button 
                  onClick={() => generateReport('monthly')}
                  disabled={isGeneratingReport}
                  variant="outline"
                  className="w-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {isGeneratingReport ? 'Generando...' : 'Reporte Mensual'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sync Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Sincronizaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {syncLogs?.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {log.sync_status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : log.sync_status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Clock className="h-4 w-4 text-warning" />
                      )}
                      <div>
                        <p className="font-medium">{log.sync_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.companies_successful}/{log.companies_processed} exitosas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">€{log.total_cost.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.started_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Activas</CardTitle>
              <CardDescription>
                Alertas automáticas del sistema eInforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts?.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    <AlertTriangle className={`h-4 w-4 mt-1 ${
                      alert.severity === 'critical' ? 'text-destructive' :
                      alert.severity === 'high' ? 'text-warning' :
                      'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'high' ? 'secondary' :
                          'outline'
                        }>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      {alert.companies?.name && (
                        <p className="text-xs text-muted-foreground">
                          Empresa: {alert.companies.name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAlertAsRead(alert.id)}
                    >
                      Marcar leída
                    </Button>
                  </div>
                ))}
                {(!alerts || alerts.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No hay alertas pendientes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avanzados</CardTitle>
              <CardDescription>
                Métricas y análisis de rendimiento eInforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Métricas de Rendimiento</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Consultas totales:</span>
                      <span className="font-medium">{metrics.totalConsultations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coste medio:</span>
                      <span className="font-medium">€{metrics.averageCostPerConsultation.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operaciones bulk:</span>
                      <span className="font-medium">{metrics.bulkOperations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ahorro por bulk:</span>
                      <span className="font-medium text-success">€{metrics.totalSavingsFromBulk.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Proyecciones</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Gasto diario medio:</span>
                      <span className="font-medium">€{metrics.averageDailyCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proyección mensual:</span>
                      <span className="font-medium">€{metrics.projectedMonthlyTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI estimado:</span>
                      <span className="font-medium">{(metrics.estimatedROI * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Costes</CardTitle>
              <CardDescription>
                Control y optimización del presupuesto eInforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Budget Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Presupuesto Mensual</h4>
                    <span className="text-sm text-muted-foreground">
                      €{metrics.totalCost.toFixed(2)} / €{budget.monthly}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        budget.used > 90 ? 'bg-destructive' :
                        budget.used > 70 ? 'bg-warning' :
                        'bg-primary'
                      }`}
                      style={{ width: `${Math.min(budget.used, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {budget.used.toFixed(1)}% utilizado, €{budget.remaining.toFixed(2)} restante
                  </p>
                </div>

                {/* Cost Alerts */}
                {budget.isAtRisk && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Has superado el {budget.alertThreshold}% del presupuesto mensual
                    </AlertDescription>
                  </Alert>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => runCostOptimization()}
                    disabled={isOptimizingCosts}
                    size="sm"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analizar Optimización
                  </Button>
                  <Button 
                    onClick={() => generateReport('monthly')}
                    disabled={isGeneratingReport}
                    variant="outline"
                    size="sm"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Reporte de Costes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};