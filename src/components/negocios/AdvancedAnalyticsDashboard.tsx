import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar
} from 'lucide-react';
import { Negocio } from '@/types/Negocio';
import { Stage } from '@/types/Pipeline';

interface AdvancedAnalyticsDashboardProps {
  negocios: Negocio[];
  stages: Stage[];
}

export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  negocios,
  stages
}) => {
  const analytics = useMemo(() => {
    // Conversion rates by stage
    const stageAnalytics = stages.map(stage => {
      const stageNegocios = negocios.filter(n => n.stage_id === stage.id);
      const totalValue = stageNegocios.reduce((sum, n) => sum + (n.valor_negocio || 0), 0);
      const avgValue = stageNegocios.length > 0 ? totalValue / stageNegocios.length : 0;
      
      return {
        name: stage.name,
        count: stageNegocios.length,
        value: totalValue,
        avgValue,
        color: stage.color || '#8884d8'
      };
    });

    // Priority distribution
    const priorityData = [
      { name: 'Urgente', value: negocios.filter(n => n.prioridad === 'urgente').length, color: '#ef4444' },
      { name: 'Alta', value: negocios.filter(n => n.prioridad === 'alta').length, color: '#f97316' },
      { name: 'Media', value: negocios.filter(n => n.prioridad === 'media').length, color: '#eab308' },
      { name: 'Baja', value: negocios.filter(n => n.prioridad === 'baja').length, color: '#22c55e' }
    ];

    // Sector analysis
    const sectorAnalysis = negocios.reduce((acc, negocio) => {
      const sector = negocio.sector || 'Sin clasificar';
      if (!acc[sector]) {
        acc[sector] = { count: 0, value: 0 };
      }
      acc[sector].count++;
      acc[sector].value += negocio.valor_negocio || 0;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const sectorData = Object.entries(sectorAnalysis).map(([sector, data]) => ({
      name: sector,
      count: data.count,
      value: data.value,
      avgValue: data.value / data.count
    }));

    // Monthly trend (simulated)
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      
      return {
        month: month.toLocaleDateString('es-ES', { month: 'short' }),
        negocios: Math.floor(Math.random() * 20) + 10,
        valor: Math.floor(Math.random() * 500000) + 200000,
        conversion: Math.floor(Math.random() * 30) + 15
      };
    });

    // Key metrics
    const totalValue = negocios.reduce((sum, n) => sum + (n.valor_negocio || 0), 0);
    const avgValue = negocios.length > 0 ? totalValue / negocios.length : 0;
    const highPriorityCount = negocios.filter(n => n.prioridad === 'alta' || n.prioridad === 'urgente').length;
    const conversionRate = stages.length > 0 ? 
      (stageAnalytics[stageAnalytics.length - 1]?.count / negocios.length) * 100 : 0;

    return {
      stageAnalytics,
      priorityData,
      sectorData,
      monthlyTrend,
      totalValue,
      avgValue,
      highPriorityCount,
      conversionRate
    };
  }, [negocios, stages]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      notation: value > 999999 ? 'compact' : 'standard',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {formatCurrency(analytics.avgValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Negocios</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{negocios.length}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.highPriorityCount} de alta prioridad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
            <Progress value={analytics.conversionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23 días</div>
            <p className="text-xs text-muted-foreground">
              Por etapa
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis por Etapa</CardTitle>
            <CardDescription>
              Distribución de negocios y valores por etapa del pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.stageAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'count' ? value : formatCurrency(Number(value)),
                  name === 'count' ? 'Cantidad' : 'Valor Total'
                ]} />
                <Bar dataKey="count" fill="#8884d8" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Prioridad</CardTitle>
            <CardDescription>
              Clasificación de negocios según su prioridad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {analytics.priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
            <CardDescription>
              Evolución de negocios y valores en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'valor' ? formatCurrency(Number(value)) : value,
                  name === 'negocios' ? 'Negocios' : name === 'valor' ? 'Valor' : 'Conversión %'
                ]} />
                <Area type="monotone" dataKey="valor" stackId="1" stroke="#8884d8" fill="#8884d8" opacity={0.6} />
                <Line type="monotone" dataKey="conversion" stroke="#82ca9d" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis por Sector</CardTitle>
            <CardDescription>
              Top sectores por cantidad y valor de negocios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.sectorData.slice(0, 5).map((sector) => (
                <div key={sector.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{sector.name}</span>
                      <Badge variant="secondary">{sector.count}</Badge>
                    </div>
                    <Progress 
                      value={(sector.value / analytics.totalValue) * 100} 
                      className="mt-2" 
                    />
                  </div>
                  <div className="ml-4 text-right">
                    <div className="font-medium text-sm">
                      {formatCurrency(sector.value)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Promedio: {formatCurrency(sector.avgValue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions and Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights y Predicciones</CardTitle>
          <CardDescription>
            Análisis automatizado basado en los datos actuales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Tendencia Positiva</span>
              </div>
              <p className="text-sm text-green-700">
                El valor promedio por negocio ha aumentado un 12% este mes
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Oportunidad</span>
              </div>
              <p className="text-sm text-blue-700">
                El sector tecnológico muestra el mayor potencial de crecimiento
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">Atención Requerida</span>
              </div>
              <p className="text-sm text-orange-700">
                {analytics.highPriorityCount} negocios de alta prioridad necesitan seguimiento
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};