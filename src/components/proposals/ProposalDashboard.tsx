
import * as React from 'react';
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
    <div className="space-y-8">
      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpiCards.map((card, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-gradient-to-br from-background to-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                {card.change !== undefined && (
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    card.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${card.change >= 0 ? '' : 'rotate-180'}`} />
                    {card.change >= 0 ? '+' : ''}{card.change.toFixed(1)}%
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </h3>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {card.subtitle}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Charts Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted p-1 h-12">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">Resumen</TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-background">Timeline</TabsTrigger>
          <TabsTrigger value="distribution" className="data-[state=active]:bg-background">Distribución</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-background">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Pipeline de Propuestas
                </CardTitle>
                <CardDescription>Estado actual de todas las propuestas</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
                      <span className="text-sm font-medium">Borradores</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={(metrics.draftProposals / Math.max(metrics.totalProposals, 1)) * 100} className="w-24" />
                      <span className="text-sm font-semibold w-6 text-right">{metrics.draftProposals}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">Enviadas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={(metrics.sentProposals / Math.max(metrics.totalProposals, 1)) * 100} className="w-24" />
                      <span className="text-sm font-semibold w-6 text-right">{metrics.sentProposals}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-sm font-medium">En Revisión</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={(metrics.inReviewProposals / Math.max(metrics.totalProposals, 1)) * 100} className="w-24" />
                      <span className="text-sm font-semibold w-6 text-right">{metrics.inReviewProposals}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-green-600">Aprobadas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={(metrics.approvedProposals / Math.max(metrics.totalProposals, 1)) * 100} className="w-24" />
                      <span className="text-sm font-semibold w-6 text-right text-green-600">{metrics.approvedProposals}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Métricas Clave
                </CardTitle>
                <CardDescription>Indicadores de rendimiento principales</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Tasa de Conversión</p>
                      <p className="text-xs text-muted-foreground">Propuestas aprobadas</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-lg font-bold text-green-600">{metrics.conversionRate.toFixed(1)}%</p>
                      <Progress value={metrics.conversionRate} className="w-20" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Tiempo Promedio</p>
                      <p className="text-xs text-muted-foreground">Desde envío a cierre</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-lg font-bold text-blue-600">12 días</p>
                      <Badge variant="secondary" className="text-xs">Mejorado</Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Engagement</p>
                      <p className="text-xs text-muted-foreground">Visualizaciones promedio</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-lg font-bold text-purple-600">{(metrics.totalViews / Math.max(metrics.totalProposals, 1)).toFixed(1)}</p>
                      <Badge variant="secondary" className="text-xs">Por propuesta</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <div className="border border-gray-200 bg-white p-4">
            <div className="pb-2">
              <h3 className="text-sm font-semibold text-black">Actividad de los Últimos 30 Días</h3>
              <p className="text-sm text-gray-600 mt-1">Propuestas creadas y valor generado</p>
            </div>
            <div className="pt-0">
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-gray-200 bg-white p-4">
              <div className="pb-2">
                <h3 className="text-sm font-semibold text-black">Distribución por Estado</h3>
                <p className="text-sm text-gray-600 mt-1">Proporción de propuestas por estado</p>
              </div>
              <div className="pt-0">
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
              </div>
            </div>

            <div className="border border-gray-200 bg-white p-4">
              <div className="pb-2">
                <h3 className="text-sm font-semibold text-black">Valor por Estado</h3>
                <p className="text-sm text-gray-600 mt-1">Distribución del valor monetario</p>
              </div>
              <div className="pt-0">
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
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="border border-gray-200 bg-white p-4">
            <div className="pb-2">
              <h3 className="text-sm font-semibold text-black">Performance por Área de Práctica</h3>
              <p className="text-sm text-gray-600 mt-1">Rendimiento y conversión por especialidad</p>
            </div>
            <div className="pt-0">
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
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
