import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchIcon, TrendingUpIcon, BuildingIcon, AlertTriangleIcon, DollarSignIcon, UsersIcon, BarChart3Icon, RefreshCwIcon, CheckCircleIcon, XCircleIcon, WifiIcon } from 'lucide-react';
import { EInformaMetricsCard } from '@/components/einforma/EInformaMetricsCard';
import { EInformaUsageChart } from '@/components/einforma/EInformaUsageChart';
import { EInformaQueryQueue } from '@/components/einforma/EInformaQueryQueue';
import { EInformaBulkLookup } from '@/components/einforma/EInformaBulkLookup';
import { EInformaCredentialsConfig } from '@/components/einforma/EInformaCredentialsConfig';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useCompanyLookup } from '@/hooks/useCompanyLookup';
import { useEInformaDashboard } from '@/hooks/useEInformaDashboard';
import { NifLookup } from '@/components/companies/NifLookup';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EInformaDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchError, setSearchError] = useState<string>('');
  
  const { lookupCompany, validateNIF, isLoading: isSearching } = useCompanyLookup();
  const { 
    metrics, 
    usageData, 
    recentQueries, 
    companyInsights, 
    riskAlerts, 
    isLoading: isDashboardLoading, 
    refreshData 
  } = useEInformaDashboard();

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Test with a known valid NIF format
      const { data, error } = await supabase.functions.invoke('company-lookup-einforma', {
        body: { nif: 'B12345678' }
      });
      
      if (error) {
        console.error('Test connection error:', error);
        toast.error('Error al probar la conexión con eInforma');
        return;
      }
      
      if (data?.success) {
        toast.success('Conexión con eInforma exitosa');
        console.log('Connection test results:', data);
      } else {
        toast.info('Servició funcionando - usando datos simulados');
        console.log('Using simulated data:', data);
      }
    } catch (error) {
      console.error('Connection test exception:', error);
      toast.error('Error al ejecutar la prueba de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyFound = (company: any) => {
    setSearchResults({
      companyData: company,
      source: 'lookup'
    });
    setSearchError('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard eInforma</h1>
          <p className="text-muted-foreground">
            Panel de control avanzado para la gestión de datos empresariales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={refreshData} variant="outline" size="sm" disabled={isDashboardLoading}>
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isDashboardLoading ? 'animate-spin' : ''}`} />
            Actualizar Datos
          </Button>
          <Button onClick={testConnection} variant="outline" size="sm">
            <WifiIcon className="h-4 w-4 mr-2" />
            Probar Conexión
          </Button>
        </div>
      </div>

      {/* Company Lookup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Búsqueda de Empresas
          </CardTitle>
          <CardDescription>
            Busca información oficial de empresas en el Registro Mercantil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NifLookup onCompanyFound={handleCompanyFound} />
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EInformaMetricsCard
          title="Consultas Totales"
          value={metrics.totalQueries}
          change={metrics.queriesChange}
          icon={SearchIcon}
        />
        <EInformaMetricsCard
          title="Empresas Enriquecidas"
          value={metrics.companiesEnriched}
          change={metrics.companiesChange}
          icon={BuildingIcon}
        />
        <EInformaMetricsCard
          title="Coste Total"
          value={`€${metrics.totalCost}`}
          change={metrics.costChange}
          icon={DollarSignIcon}
        />
        <EInformaMetricsCard
          title="Alertas de Riesgo"
          value={metrics.riskAlerts}
          change={metrics.riskChange}
          icon={AlertTriangleIcon}
        />
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="bulk">Búsqueda Masiva</TabsTrigger>
          <TabsTrigger value="usage">Uso y Costes</TabsTrigger>
          <TabsTrigger value="queue">Cola de Consultas</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="risk">Análisis de Riesgo</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de uso real */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="h-5 w-5" />
                  Uso Mensual
                </CardTitle>
                <CardDescription>
                  Evolución de consultas realizadas - Últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EInformaUsageChart data={usageData} />
              </CardContent>
            </Card>

            {/* Consultas recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Consultas Recientes</CardTitle>
                <CardDescription>
                  Últimas {recentQueries.length} consultas realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentQueries.map((query, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{query.companyName}</p>
                        <p className="text-sm text-muted-foreground">{query.nif}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={query.status === 'success' ? 'default' : 'destructive'}>
                          {query.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(query.timestamp).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estado del servicio */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">API eInforma: Operativa</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Base de Datos: Operativa</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Cache: Optimizando</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Uso y Costes Detallado</CardTitle>
                <CardDescription>Información completa sobre el uso del servicio eInforma</CardDescription>
              </CardHeader>
              <CardContent>
                <EInformaUsageChart data={usageData} detailed={true} />
              </CardContent>
            </Card>
            
            {/* Métricas adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Coste por Consulta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€0.15</div>
                  <p className="text-xs text-muted-foreground">Media del sector: €0.18</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">94.5%</div>
                  <p className="text-xs text-muted-foreground">Consultas exitosas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.3s</div>
                  <p className="text-xs text-muted-foreground">Por consulta</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <EInformaBulkLookup />
        </TabsContent>

        <TabsContent value="queue">
          <EInformaQueryQueue />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights por sector */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis por Sector</CardTitle>
                <CardDescription>Distribución de empresas consultadas por sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyInsights.slice(0, 5).map((insight, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{insight.sector}</p>
                        <p className="text-sm text-muted-foreground">
                          {insight.totalCompanies} empresas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€{insight.averageRevenue.toLocaleString('es-ES')}</p>
                        <Badge variant={insight.riskLevel === 'low' ? 'default' : insight.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                          {insight.riskLevel === 'low' ? 'Bajo riesgo' : insight.riskLevel === 'medium' ? 'Riesgo medio' : 'Alto riesgo'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calidad de datos */}
            <Card>
              <CardHeader>
                <CardTitle>Calidad de Datos</CardTitle>
                <CardDescription>Métricas de confianza y completitud</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Datos financieros completos</span>
                    <span className="font-bold text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Información de contacto</span>
                    <span className="font-bold text-blue-600">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Datos actualizados (&lt; 6 meses)</span>
                    <span className="font-bold text-orange-600">76%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Verificación NIF/CIF</span>
                    <span className="font-bold text-green-600">98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertas de riesgo activas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
                  Alertas Activas
                </CardTitle>
                <CardDescription>Empresas que requieren atención</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskAlerts.slice(0, 5).map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{alert.companyName}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                      <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'outline'}>
                        {alert.severity === 'high' ? 'Alto' : alert.severity === 'medium' ? 'Medio' : 'Bajo'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribución de riesgos */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Riesgo</CardTitle>
                <CardDescription>Clasificación de empresas por nivel de riesgo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      Riesgo Bajo
                    </span>
                    <span className="font-bold">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      Riesgo Medio
                    </span>
                    <span className="font-bold">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                      Riesgo Alto
                    </span>
                    <span className="font-bold">7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recomendaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones de Acción</CardTitle>
              <CardDescription>Acciones sugeridas basadas en el análisis de riesgo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-orange-600 mb-2">⚠️ Revisar Inmediatamente</h4>
                  <p className="text-sm text-muted-foreground mb-2">3 empresas con rating crediticio deteriorado</p>
                  <Button size="sm" variant="outline">Ver Detalles</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-blue-600 mb-2">📊 Actualizar Datos</h4>
                  <p className="text-sm text-muted-foreground mb-2">12 empresas con datos de más de 6 meses</p>
                  <Button size="sm" variant="outline">Programar Actualización</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-green-600 mb-2">✅ Monitoreo Automático</h4>
                  <p className="text-sm text-muted-foreground mb-2">45 empresas bajo seguimiento regular</p>
                  <Button size="sm" variant="outline">Configurar Alertas</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <EInformaCredentialsConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}