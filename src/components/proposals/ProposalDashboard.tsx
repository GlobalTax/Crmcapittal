
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Eye, 
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Target
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Proposal } from '@/types/Proposal';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProposalDashboardProps {
  proposals: Proposal[];
}

export const ProposalDashboard: React.FC<ProposalDashboardProps> = ({ proposals }) => {
  // Cálculos de métricas avanzadas
  const metrics = React.useMemo(() => {
    const totalProposals = proposals.length;
    const draftProposals = proposals.filter(p => p.status === 'draft').length;
    const sentProposals = proposals.filter(p => p.status === 'sent').length;
    const approvedProposals = proposals.filter(p => p.status === 'approved').length;
    const rejectedProposals = proposals.filter(p => p.status === 'rejected').length;
    const inReviewProposals = proposals.filter(p => p.status === 'in_review').length;
    
    const totalValue = proposals
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (p.total_amount || 0), 0);
    
    const pipelineValue = proposals
      .filter(p => ['sent', 'in_review'].includes(p.status))
      .reduce((sum, p) => sum + (p.total_amount || 0), 0);
    
    const conversionRate = sentProposals > 0 ? (approvedProposals / sentProposals) * 100 : 0;
    
    const avgDealSize = approvedProposals > 0 ? totalValue / approvedProposals : 0;
    
    const totalViews = proposals.reduce((sum, p) => sum + (p.views_count || 0), 0);
    
    // Métricas de tiempo
    const thisMonth = proposals.filter(p => 
      new Date(p.created_at) >= subMonths(new Date(), 1)
    ).length;
    
    const lastMonth = proposals.filter(p => {
      const date = new Date(p.created_at);
      return date >= subMonths(new Date(), 2) && date < subMonths(new Date(), 1);
    }).length;
    
    const monthlyGrowth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    
    return {
      totalProposals,
      draftProposals,
      sentProposals,
      approvedProposals,
      rejectedProposals,
      inReviewProposals,
      totalValue,
      pipelineValue,
      conversionRate,
      avgDealSize,
      totalViews,
      monthlyGrowth,
      thisMonth,
      lastMonth
    };
  }, [proposals]);

  // Datos para gráficos
  const chartData = React.useMemo(() => {
    // Datos de los últimos 30 días
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dayProposals = proposals.filter(p => 
        format(new Date(p.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        date: format(date, 'dd/MM'),
        proposals: dayProposals.length,
        value: dayProposals.reduce((sum, p) => sum + (p.total_amount || 0), 0),
        approved: dayProposals.filter(p => p.status === 'approved').length
      };
    });

    // Distribución por estado
    const statusDistribution = [
      { name: 'Borrador', value: metrics.draftProposals, color: '#94A3B8' },
      { name: 'Enviadas', value: metrics.sentProposals, color: '#3B82F6' },
      { name: 'En Revisión', value: metrics.inReviewProposals, color: '#F59E0B' },
      { name: 'Aprobadas', value: metrics.approvedProposals, color: '#10B981' },
      { name: 'Rechazadas', value: metrics.rejectedProposals, color: '#EF4444' }
    ];

    // Performance por área de práctica
    const practiceAreaData = proposals.reduce((acc, proposal) => {
      if (proposal.practice_area) {
        const area = proposal.practice_area.name;
        if (!acc[area]) {
          acc[area] = { name: area, proposals: 0, value: 0, approved: 0 };
        }
        acc[area].proposals += 1;
        acc[area].value += proposal.total_amount || 0;
        if (proposal.status === 'approved') {
          acc[area].approved += 1;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      timeline: last30Days,
      statusDistribution,
      practiceAreas: Object.values(practiceAreaData)
    };
  }, [proposals, metrics]);

  const kpiCards = [
    {
      title: 'Total Propuestas',
      value: metrics.totalProposals,
      change: metrics.monthlyGrowth,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Valor Pipeline',
      value: `€${(metrics.pipelineValue / 1000).toFixed(0)}K`,
      subtitle: 'En revisión/enviadas',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Valor Cerrado',
      value: `€${(metrics.totalValue / 1000).toFixed(0)}K`,
      subtitle: 'Propuestas aprobadas',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Tasa Conversión',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      subtitle: 'Aprobadas/Enviadas',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Deal Promedio',
      value: `€${(metrics.avgDealSize / 1000).toFixed(0)}K`,
      subtitle: 'Por propuesta aprobada',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Total Visualizaciones',
      value: metrics.totalViews,
      subtitle: 'Engagement del cliente',
      icon: Eye,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              {card.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              )}
              {card.change !== undefined && (
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-3 w-3 mr-1 ${card.change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs ${card.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {card.change >= 0 ? '+' : ''}{card.change.toFixed(1)}% vs mes anterior
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline de Propuestas</CardTitle>
                <CardDescription>Estado actual de todas las propuestas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Borradores</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(metrics.draftProposals / metrics.totalProposals) * 100} className="w-20" />
                      <span className="text-sm text-gray-500">{metrics.draftProposals}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Enviadas</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(metrics.sentProposals / metrics.totalProposals) * 100} className="w-20" />
                      <span className="text-sm text-gray-500">{metrics.sentProposals}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">En Revisión</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(metrics.inReviewProposals / metrics.totalProposals) * 100} className="w-20" />
                      <span className="text-sm text-gray-500">{metrics.inReviewProposals}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Aprobadas</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(metrics.approvedProposals / metrics.totalProposals) * 100} className="w-20" />
                      <span className="text-sm text-green-600 font-medium">{metrics.approvedProposals}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas Clave</CardTitle>
                <CardDescription>Indicadores de rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Tasa de Conversión</p>
                      <p className="text-xs text-gray-500">Propuestas aprobadas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{metrics.conversionRate.toFixed(1)}%</p>
                      <Progress value={metrics.conversionRate} className="w-16 mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Tiempo Promedio</p>
                      <p className="text-xs text-gray-500">Desde envío a cierre</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">12 días</p>
                      <Badge variant="outline" className="text-xs">Mejorado</Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Engagement</p>
                      <p className="text-xs text-gray-500">Visualizaciones promedio</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">{(metrics.totalViews / Math.max(metrics.totalProposals, 1)).toFixed(1)}</p>
                      <Badge variant="outline" className="text-xs">Por propuesta</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad de los Últimos 30 Días</CardTitle>
              <CardDescription>Propuestas creadas y valor generado</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="proposals" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="approved" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
                <CardDescription>Proporción de propuestas por estado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valor por Estado</CardTitle>
                <CardDescription>Distribución del valor monetario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pipeline (€{(metrics.pipelineValue / 1000).toFixed(0)}K)</span>
                    <Progress value={(metrics.pipelineValue / (metrics.totalValue + metrics.pipelineValue)) * 100} className="w-32" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Cerrado (€{(metrics.totalValue / 1000).toFixed(0)}K)</span>
                    <Progress value={(metrics.totalValue / (metrics.totalValue + metrics.pipelineValue)) * 100} className="w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Área de Práctica</CardTitle>
              <CardDescription>Rendimiento y conversión por especialidad</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.practiceAreas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="proposals" fill="#3B82F6" name="Total Propuestas" />
                  <Bar dataKey="approved" fill="#10B981" name="Aprobadas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
