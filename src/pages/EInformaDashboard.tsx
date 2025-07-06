import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchIcon, TrendingUpIcon, BuildingIcon, AlertTriangleIcon, DollarSignIcon, UsersIcon, BarChart3Icon, RefreshCwIcon } from 'lucide-react';
import { EInformaMetricsCard } from '@/components/einforma/EInformaMetricsCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function EInformaDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for now
  const metrics = {
    totalQueries: 247,
    queriesChange: 15,
    companiesEnriched: 189,
    companiesChange: 12,
    totalCost: 37,
    costChange: 8,
    riskAlerts: 5,
    riskChange: -2
  };

  const recentQueries = [
    {
      companyName: "ESTRAPEY FINANZA SL",
      nif: "B12345678",
      status: "success" as const,
      timestamp: new Date().toISOString()
    },
    {
      companyName: "TECNOLOGÍA AVANZADA SA", 
      nif: "A87654321",
      status: "success" as const,
      timestamp: new Date().toISOString()
    }
  ];

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
            {/* Placeholder para gráfico de uso */}
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
                <div className="flex items-center justify-center h-48 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <BarChart3Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Gráfico de uso mensual</p>
                  </div>
                </div>
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
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Uso y Costes</CardTitle>
              <CardDescription>Información detallada sobre el uso del servicio eInforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <BarChart3Icon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Gráficos de uso detallado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>Cola de Consultas</CardTitle>
              <CardDescription>Gestión de consultas pendientes y en proceso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <UsersIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Cola de procesamiento de consultas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Insights Empresariales</CardTitle>
              <CardDescription>Análisis e insights de las empresas consultadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <TrendingUpIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Insights y análisis empresariales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Riesgo</CardTitle>
              <CardDescription>Evaluación de riesgos empresariales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <AlertTriangleIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Análisis de riesgo empresarial</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}