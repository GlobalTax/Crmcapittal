import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SearchIcon, RefreshCwIcon, WifiIcon, TrendingUpIcon, DollarSignIcon, BuildingIcon, AlertTriangleIcon } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useEInformaDashboard } from '@/hooks/useEInformaDashboard';
import { EInformaSearchTab } from '@/components/einforma/EInformaSearchTab';
import { EInformaHistoryTab } from '@/components/einforma/EInformaHistoryTab';
import { EInformaConfigTab } from '@/components/einforma/EInformaConfigTab';
import { EInformaSidebar } from '@/components/einforma/EInformaSidebar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EInformaDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const [isLoading, setIsLoading] = useState(false);
  
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
      } else {
        toast.info('Servicio funcionando - usando datos simulados');
      }
    } catch (error) {
      console.error('Connection test exception:', error);
      toast.error('Error al ejecutar la prueba de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background">
        {/* Sidebar with KPIs */}
        <EInformaSidebar 
          metrics={metrics}
          riskAlerts={riskAlerts}
          companyInsights={companyInsights}
          isLoading={isDashboardLoading}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">eInforma</h1>
              <div className="flex items-center gap-3">
                <Button onClick={refreshData} variant="outline" size="sm" disabled={isDashboardLoading}>
                  <RefreshCwIcon className={`h-4 w-4 mr-2 ${isDashboardLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <Button onClick={testConnection} variant="outline" size="sm" disabled={isLoading}>
                  <WifiIcon className="h-4 w-4 mr-2" />
                  Probar Conexión
                </Button>
              </div>
            </div>

            {/* Quick KPI Cards (Simplified for main view) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Consultas Hoy</p>
                      <p className="text-2xl font-bold">{Math.floor(metrics.totalQueries / 30)}</p>
                    </div>
                    <SearchIcon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Empresas CRM</p>
                      <p className="text-2xl font-bold">{metrics.companiesEnriched}</p>
                    </div>
                    <BuildingIcon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Coste Mes</p>
                      <p className="text-2xl font-bold">€{Math.floor(metrics.totalCost / 6)}</p>
                    </div>
                    <DollarSignIcon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Alertas</p>
                      <p className="text-2xl font-bold text-orange-600">{riskAlerts.length}</p>
                    </div>
                    <AlertTriangleIcon className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Simplified Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="search">Búsqueda</TabsTrigger>
                <TabsTrigger value="history">Historial & Analytics</TabsTrigger>
                <TabsTrigger value="config">Configuración</TabsTrigger>
              </TabsList>

              <TabsContent value="search">
                <EInformaSearchTab 
                  recentQueries={recentQueries}
                  onRefresh={refreshData}
                />
              </TabsContent>

              <TabsContent value="history">
                <EInformaHistoryTab 
                  usageData={usageData}
                  companyInsights={companyInsights}
                  riskAlerts={riskAlerts}
                />
              </TabsContent>

              <TabsContent value="config">
                <EInformaConfigTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}