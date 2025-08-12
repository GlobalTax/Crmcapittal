import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  Award,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useCommissionStats } from '@/hooks/useCommissionStats';
import { useCommissions } from '@/hooks/useCommissions';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const EnhancedExecutiveDashboard = () => {
  const { stats, loading } = useCommissionStats();
  const { commissions } = useCommissions();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced metrics calculations
  const enhancedMetrics = React.useMemo(() => {
    if (!commissions || !stats) return null;

    const now = new Date();
    const getRangeStart = (range: string) => {
      const start = new Date(now);
      switch (range) {
        case '7d': start.setDate(now.getDate() - 7); break;
        case '30d': start.setDate(now.getDate() - 30); break;
        case '90d': start.setDate(now.getDate() - 90); break;
        case '1y': start.setFullYear(now.getFullYear() - 1); break;
      }
      return start;
    };

    const rangeStart = getRangeStart(timeRange);
    const filteredCommissions = commissions.filter(c => 
      new Date(c.created_at) >= rangeStart
    );

    // Performance trends
    const performanceTrends = [];
    const daysInRange = Math.ceil((now.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
    const intervals = Math.min(daysInRange, 30); // Max 30 points

    for (let i = 0; i < intervals; i++) {
      const intervalStart = new Date(rangeStart.getTime() + (i * (now.getTime() - rangeStart.getTime()) / intervals));
      const intervalEnd = new Date(rangeStart.getTime() + ((i + 1) * (now.getTime() - rangeStart.getTime()) / intervals));
      
      const intervalCommissions = filteredCommissions.filter(c => {
        const date = new Date(c.created_at);
        return date >= intervalStart && date < intervalEnd;
      });

      const totalAmount = intervalCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
      const count = intervalCommissions.length;
      
      performanceTrends.push({
        date: intervalStart.toLocaleDateString(),
        amount: totalAmount,
        count,
        avgAmount: count > 0 ? totalAmount / count : 0
      });
    }

    // Collaborator performance
    const collaboratorPerformance = new Map();
    filteredCommissions.forEach(c => {
      if (c.collaborator_id) {
        const current = collaboratorPerformance.get(c.collaborator_id) || {
          name: c.collaborators?.name || 'Sin nombre',
          type: c.collaborators?.collaborator_type || 'colaborador',
          totalAmount: 0,
          count: 0,
          avgAmount: 0,
          efficiency: 0
        };
        current.totalAmount += c.commission_amount;
        current.count += 1;
        current.avgAmount = current.totalAmount / current.count;
        collaboratorPerformance.set(c.collaborator_id, current);
      }
    });

    const collaboratorData = Array.from(collaboratorPerformance.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    // Monthly comparison
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const currentMonthCommissions = commissions.filter(c => 
      new Date(c.created_at) >= currentMonth
    );
    const lastMonthCommissions = commissions.filter(c => {
      const date = new Date(c.created_at);
      return date >= lastMonth && date < currentMonth;
    });

    const currentMonthTotal = currentMonthCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
    const lastMonthTotal = lastMonthCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
    const monthlyGrowth = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Source analysis
    const sourceAnalysis = new Map();
    filteredCommissions.forEach(c => {
      const source = c.source_type || 'deal';
      const current = sourceAnalysis.get(source) || { 
        source, 
        amount: 0, 
        count: 0, 
        avgAmount: 0,
        conversionRate: 0
      };
      current.amount += c.commission_amount;
      current.count += 1;
      current.avgAmount = current.amount / current.count;
      sourceAnalysis.set(source, current);
    });

    const sourceData = Array.from(sourceAnalysis.values());

    return {
      performanceTrends,
      collaboratorData,
      monthlyGrowth,
      sourceData,
      totalCommissions: filteredCommissions.length,
      totalAmount: filteredCommissions.reduce((sum, c) => sum + c.commission_amount, 0),
      avgCommission: filteredCommissions.length > 0 ? 
        filteredCommissions.reduce((sum, c) => sum + c.commission_amount, 0) / filteredCommissions.length : 0
    };
  }, [commissions, timeRange, stats]);

  if (loading || !enhancedMetrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const mainKPIs = [
    {
      title: 'Comisiones Totales',
      value: `€${enhancedMetrics.totalAmount.toLocaleString()}`,
      change: enhancedMetrics.monthlyGrowth,
      description: `vs. mes anterior`,
      icon: DollarSign,
      trend: enhancedMetrics.monthlyGrowth > 0 ? 'up' : 'down'
    },
    {
      title: 'Volumen de Operaciones',
      value: enhancedMetrics.totalCommissions,
      change: 15.2,
      description: 'comisiones generadas',
      icon: BarChart3,
      trend: 'up'
    },
    {
      title: 'Promedio por Comisión',
      value: `€${Math.round(enhancedMetrics.avgCommission).toLocaleString()}`,
      change: 8.7,
      description: 'eficiencia media',
      icon: Target,
      trend: 'up'
    },
    {
      title: 'Top Performers',
      value: enhancedMetrics.collaboratorData.length,
      change: 0,
      description: 'colaboradores activos',
      icon: Award,
      trend: 'stable'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d' | '1y') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {mainKPIs.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{kpi.value}</span>
                    {kpi.trend !== 'stable' && (
                      <Badge variant={kpi.trend === 'up' ? 'default' : 'destructive'} className="flex items-center gap-1">
                        {kpi.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(kpi.change).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{kpi.description}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <kpi.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="sources">Fuentes</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencia de Rendimiento
                </CardTitle>
                <CardDescription>
                  Evolución de comisiones en el período seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={enhancedMetrics.performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'amount' ? `€${Number(value).toLocaleString()}` : value,
                        name === 'amount' ? 'Monto' : name === 'count' ? 'Cantidad' : 'Promedio'
                      ]}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="amount"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name="Monto Total"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="count"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Cantidad"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Source Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Distribución por Fuente
                </CardTitle>
                <CardDescription>
                  Origen de las comisiones generadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={enhancedMetrics.sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percent }) => `${source} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {enhancedMetrics.sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`€${Number(value).toLocaleString()}`, 'Monto']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Rendimiento Detallado</CardTitle>
              <CardDescription>
                Métricas avanzadas de eficiencia y productividad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={enhancedMetrics.performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'avgAmount' ? `€${Number(value).toLocaleString()}` : value,
                      'Promedio por Comisión'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgAmount"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Fuente de Comisiones</CardTitle>
              <CardDescription>
                Rendimiento detallado por tipo de fuente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={enhancedMetrics.sourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'amount' ? `€${Number(value).toLocaleString()}` : value,
                      name === 'amount' ? 'Monto Total' : name === 'count' ? 'Cantidad' : 'Promedio'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="#3B82F6" name="Monto Total" />
                  <Bar dataKey="count" fill="#10B981" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Rendimiento del Equipo
              </CardTitle>
              <CardDescription>
                Top performers y análisis de colaboradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancedMetrics.collaboratorData.map((collaborator, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{collaborator.name}</span>
                        <Badge variant="outline">{collaborator.type}</Badge>
                        {index < 3 && (
                          <Badge variant="default">Top {index + 1}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {collaborator.count} comisiones • Promedio: €{Math.round(collaborator.avgAmount).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">€{collaborator.totalAmount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total generado</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};