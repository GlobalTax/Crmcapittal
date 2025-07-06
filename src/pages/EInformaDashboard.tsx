import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon, TrendingUpIcon, BuildingIcon, AlertTriangleIcon, DollarSignIcon, UsersIcon, BarChart3Icon, RefreshCwIcon } from 'lucide-react';
import { EInformaMetricsCard } from '@/components/einforma/EInformaMetricsCard';
import { EInformaUsageChart } from '@/components/einforma/EInformaUsageChart';
import { EInformaQueryQueue } from '@/components/einforma/EInformaQueryQueue';
import { EInformaCompanyInsights } from '@/components/einforma/EInformaCompanyInsights';
import { EInformaRiskAnalysis } from '@/components/einforma/EInformaRiskAnalysis';
import { useEInformaDashboard } from '@/hooks/useEInformaDashboard';

export default function EInformaDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    metrics,
    usageData,
    recentQueries,
    companyInsights,
    riskAlerts,
    isLoading,
    refreshData
  } = useEInformaDashboard();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar búsqueda
    console.log('Searching for:', searchTerm);
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
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar empresa por NIF/CIF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="usage">Uso y Costes</TabsTrigger>
          <TabsTrigger value="queue">Cola de Consultas</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="risk">Análisis de Riesgo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de uso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="h-5 w-5" />
                  Uso Mensual
                </CardTitle>
                <CardDescription>
                  Evolución de consultas realizadas
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
          <EInformaUsageChart data={usageData} detailed />
        </TabsContent>

        <TabsContent value="queue">
          <EInformaQueryQueue />
        </TabsContent>

        <TabsContent value="insights">
          <EInformaCompanyInsights data={companyInsights} />
        </TabsContent>

        <TabsContent value="risk">
          <EInformaRiskAnalysis alerts={riskAlerts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}