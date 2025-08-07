import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, TrendingUp, Target, Shield, Settings, 
  Zap, Brain, BarChart3, Globe, Key, 
  AlertTriangle, CheckCircle, Clock, Euro
} from 'lucide-react';
import { useCollaboratorPerformance, useCommissionCalculations, useTerritories, useIntegrationMarketplace } from '@/hooks/useEnterpriseAdministration';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
        {change} desde el mes pasado
      </p>
    </CardContent>
  </Card>
);

const CollaboratorPerformancePanel: React.FC = () => {
  const { performance, isLoading } = useCollaboratorPerformance();

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded"></div>
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Revenue Total"
          value={`€${performance.reduce((sum, p) => sum + p.total_revenue, 0).toLocaleString()}`}
          change="+12.5%"
          trend="up"
          icon={<Euro className="h-4 w-4 text-green-600" />}
        />
        <MetricCard
          title="Deals Cerrados"
          value={performance.reduce((sum, p) => sum + p.deals_closed, 0).toString()}
          change="+8.2%"
          trend="up"
          icon={<Target className="h-4 w-4 text-blue-600" />}
        />
        <MetricCard
          title="Conversion Rate Avg"
          value={`${(performance.reduce((sum, p) => sum + p.conversion_rate, 0) / Math.max(performance.length, 1)).toFixed(1)}%`}
          change="+3.1%"
          trend="up"
          icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>League Table - Top Performers</CardTitle>
          <CardDescription>Ranking mensual de colaboradores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performance.slice(0, 10).map((perf, index) => (
              <div key={perf.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant={index < 3 ? "default" : "secondary"}>#{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{perf.collaborators?.name || 'Sin nombre'}</p>
                    <p className="text-sm text-gray-600">{perf.deals_closed} deals cerrados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">€{perf.total_revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{perf.conversion_rate}% conversión</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CommissionManagementPanel: React.FC = () => {
  const { commissions, isLoading, approveCommission } = useCommissionCalculations();

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 rounded"></div>
      ))}
    </div>;
  }

  const pendingCommissions = commissions.filter(c => c.status === 'calculated');
  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.calculated_amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Comisiones Pendientes"
          value={`€${totalPending.toLocaleString()}`}
          change="+5.2%"
          trend="up"
          icon={<Clock className="h-4 w-4 text-orange-600" />}
        />
        <MetricCard
          title="Aprobadas Este Mes"
          value={commissions.filter(c => c.status === 'approved').length.toString()}
          change="+15.3%"
          trend="up"
          icon={<CheckCircle className="h-4 w-4 text-green-600" />}
        />
        <MetricCard
          title="En Disputa"
          value={commissions.filter(c => c.status === 'disputed').length.toString()}
          change="-2.1%"
          trend="down"
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
        />
        <MetricCard
          title="Pagadas"
          value={commissions.filter(c => c.status === 'paid').length.toString()}
          change="+22.8%"
          trend="up"
          icon={<Euro className="h-4 w-4 text-blue-600" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comisiones Pendientes de Aprobación</CardTitle>
          <CardDescription>Comisiones calculadas automáticamente que requieren aprobación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingCommissions.slice(0, 10).map((commission) => (
              <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{commission.collaborators?.name}</p>
                  <p className="text-sm text-gray-600">
                    {commission.calculation_type} - {commission.commission_rate}% de €{commission.base_amount.toLocaleString()}
                  </p>
                  <Badge variant="outline">{commission.status}</Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-bold text-green-600">€{commission.calculated_amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Calculado automáticamente</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => approveCommission({ id: commission.id, approvedBy: 'current-user' })}
                  >
                    Aprobar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TerritoryManagementPanel: React.FC = () => {
  const { territories, isLoading } = useTerritories();

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded"></div>
      ))}
    </div>;
  }

  const territoryTypes = territories.reduce((acc, t) => {
    acc[t.territory_type] = (acc[t.territory_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Territorios Totales"
          value={territories.length.toString()}
          change="+2"
          trend="up"
          icon={<Globe className="h-4 w-4 text-blue-600" />}
        />
        <MetricCard
          title="Geográficos"
          value={(territoryTypes.geographic || 0).toString()}
          change="0"
          trend="neutral"
          icon={<Target className="h-4 w-4 text-green-600" />}
        />
        <MetricCard
          title="Por Sector"
          value={(territoryTypes.sector || 0).toString()}
          change="+1"
          trend="up"
          icon={<BarChart3 className="h-4 w-4 text-purple-600" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Territorios Configurados</CardTitle>
          <CardDescription>Gestión de territorios por tipo y asignación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {territories.map((territory) => (
              <div key={territory.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{territory.name}</p>
                  <p className="text-sm text-gray-600">{territory.description}</p>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{territory.territory_type}</Badge>
                    <Badge variant={territory.exclusivity_level === 'exclusive' ? 'default' : 'secondary'}>
                      {territory.exclusivity_level}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const IntegrationMarketplacePanel: React.FC = () => {
  const { integrations, isLoading, installIntegration } = useIntegrationMarketplace();

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded"></div>
      ))}
    </div>;
  }

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Integraciones Disponibles"
          value={integrations.length.toString()}
          change="+3"
          trend="up"
          icon={<Zap className="h-4 w-4 text-blue-600" />}
        />
        <MetricCard
          title="Categorías"
          value={categories.length.toString()}
          change="0"
          trend="neutral"
          icon={<Settings className="h-4 w-4 text-gray-600" />}
        />
        <MetricCard
          title="Instalaciones Totales"
          value={integrations.reduce((sum, i) => sum + i.installation_count, 0).toString()}
          change="+28"
          trend="up"
          icon={<TrendingUp className="h-4 w-4 text-green-600" />}
        />
        <MetricCard
          title="Rating Promedio"
          value={`${(integrations.reduce((sum, i) => sum + i.rating, 0) / Math.max(integrations.length, 1)).toFixed(1)}`}
          change="+0.2"
          trend="up"
          icon={<CheckCircle className="h-4 w-4 text-yellow-600" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketplace de Integraciones</CardTitle>
          <CardDescription>Integraciones aprobadas disponibles para instalación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.slice(0, 9).map((integration) => (
              <Card key={integration.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <Badge variant={integration.pricing_model === 'free' ? 'secondary' : 'default'}>
                      {integration.pricing_model}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm line-clamp-2">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">★ {integration.rating}</span>
                      <span className="text-xs text-gray-500">({integration.review_count})</span>
                    </div>
                    <span className="text-xs text-gray-500">{integration.installation_count} instalaciones</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => installIntegration({ integrationId: integration.id, configuration: {} })}
                  >
                    Instalar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SystemIntelligencePanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Uptime del Sistema"
          value="99.8%"
          change="+0.1%"
          trend="up"
          icon={<Shield className="h-4 w-4 text-green-600" />}
        />
        <MetricCard
          title="Usuarios Activos"
          value="142"
          change="+8"
          trend="up"
          icon={<Users className="h-4 w-4 text-blue-600" />}
        />
        <MetricCard
          title="API Calls/min"
          value="1,247"
          change="+15%"
          trend="up"
          icon={<Key className="h-4 w-4 text-purple-600" />}
        />
        <MetricCard
          title="Health Score"
          value="94/100"
          change="+2"
          trend="up"
          icon={<Brain className="h-4 w-4 text-yellow-600" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monitoreo en Tiempo Real</CardTitle>
            <CardDescription>Métricas del sistema actualizadas cada minuto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>CPU Usage</span>
                  <span>23%</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Memory Usage</span>
                  <span>67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Database Load</span>
                  <span>34%</span>
                </div>
                <Progress value={34} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>API Response Time</span>
                  <span>156ms</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adopción de Features</CardTitle>
            <CardDescription>Uso de funcionalidades por los usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { feature: 'Pipeline Management', usage: 94, trend: '+5%' },
                { feature: 'Commission Tracking', usage: 78, trend: '+12%' },
                { feature: 'Territory Management', usage: 65, trend: '+8%' },
                { feature: 'Workflow Automation', usage: 52, trend: '+22%' },
                { feature: 'Integration Hub', usage: 43, trend: '+15%' },
              ].map((item) => (
                <div key={item.feature} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.feature}</span>
                    <span className="text-green-600">{item.trend}</span>
                  </div>
                  <Progress value={item.usage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const EnterpriseAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('performance');

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Administración</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center space-x-2">
            <Euro className="h-4 w-4" />
            <span>Comisiones</span>
          </TabsTrigger>
          <TabsTrigger value="territories" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Territorios</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Integraciones</span>
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Intelligence</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <CollaboratorPerformancePanel />
        </TabsContent>

        <TabsContent value="commissions">
          <CommissionManagementPanel />
        </TabsContent>

        <TabsContent value="territories">
          <TerritoryManagementPanel />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationMarketplacePanel />
        </TabsContent>

        <TabsContent value="intelligence">
          <SystemIntelligencePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseAdminDashboard;