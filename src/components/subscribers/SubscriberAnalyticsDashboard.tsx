import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscribers } from '@/hooks/useSubscribers';
import { useSubscriberSegments } from '@/hooks/useSubscriberSegments';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Mail, 
  MousePointer, 
  UserMinus,
  Activity,
  Target,
  BarChart3,
  Zap
} from 'lucide-react';

export function SubscriberAnalyticsDashboard() {
  const { subscribers } = useSubscribers();
  const { segments } = useSubscriberSegments();

  // Calculate engagement metrics
  const totalSubscribers = subscribers?.length || 0;
  const activeSubscribers = subscribers?.filter(s => !s.unsubscribed && s.verified).length || 0;
  const highEngagement = Math.round(totalSubscribers * 0.25); // Mock data
  const mediumEngagement = Math.round(totalSubscribers * 0.45); // Mock data
  const lowEngagement = Math.round(totalSubscribers * 0.30); // Mock data

  // Calculate growth metrics (mock data for demo)
  const monthlyGrowth = 12.5;
  const weeklyGrowth = 3.2;
  const churnRate = 2.1;

  const metrics = [
    {
      title: "Total Suscriptores",
      value: totalSubscribers,
      change: `+${monthlyGrowth}%`,
      changeType: "positive" as const,
      icon: Users,
      description: "vs mes anterior"
    },
    {
      title: "Suscriptores Activos",
      value: activeSubscribers,
      change: `+${weeklyGrowth}%`,
      changeType: "positive" as const,
      icon: Activity,
      description: "vs semana anterior"
    },
    {
      title: "Tasa de Apertura",
      value: "89.2%",
      change: "+2.1%",
      changeType: "positive" as const,
      icon: Mail,
      description: "promedio 30 días"
    },
    {
      title: "Tasa de Click",
      value: "23.4%",
      change: "-0.8%",
      changeType: "negative" as const,
      icon: MousePointer,
      description: "promedio 30 días"
    },
    {
      title: "Tasa de Churn",
      value: `${churnRate}%`,
      change: "-0.3%",
      changeType: "positive" as const,
      icon: UserMinus,
      description: "vs mes anterior"
    },
    {
      title: "Segmentos Activos",
      value: segments?.length || 0,
      change: "+2",
      changeType: "positive" as const,
      icon: Target,
      description: "nuevos este mes"
    }
  ];

  const engagementDistribution = [
    { level: 'High', count: highEngagement, color: 'bg-green-500', percentage: (highEngagement / totalSubscribers) * 100 },
    { level: 'Medium', count: mediumEngagement, color: 'bg-yellow-500', percentage: (mediumEngagement / totalSubscribers) * 100 },
    { level: 'Low', count: lowEngagement, color: 'bg-red-500', percentage: (lowEngagement / totalSubscribers) * 100 }
  ];

  const topSegments = segments?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics de Suscriptores
          </h2>
          <p className="text-muted-foreground">
            Análisis detallado del comportamiento y engagement de tu audiencia
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <div className="text-2xl font-bold">
                    {metric.value}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={metric.changeType === 'positive' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {metric.changeType === 'positive' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {metric.change}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {metric.description}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <metric.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Distribución de Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {engagementDistribution.map((item) => (
              <div key={item.level} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.level} Engagement</span>
                  <span className="text-muted-foreground">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={item.percentage} 
                    className="flex-1"
                  />
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>
                  {((highEngagement / totalSubscribers) * 100).toFixed(1)}% de alta calidad
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Segments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Segmentos Principales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSegments.map((segment) => (
              <div key={segment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <div className="font-medium">{segment.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {segment.description}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant={segment.is_dynamic ? 'default' : 'secondary'}>
                    {segment.subscriber_count}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {segment.segment_type}
                  </div>
                </div>
              </div>
            ))}
            
            {topSegments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay segmentos configurados</p>
                <p className="text-sm">Crea segmentos para analizar tu audiencia</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencias de Crecimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Este Mes</p>
              <p className="text-2xl font-bold text-green-600">+{Math.round(totalSubscribers * (monthlyGrowth / 100))}</p>
              <p className="text-xs text-muted-foreground">nuevos suscriptores</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
              <p className="text-2xl font-bold text-blue-600">+{Math.round(totalSubscribers * (weeklyGrowth / 100))}</p>
              <p className="text-xs text-muted-foreground">nuevos suscriptores</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tasa Conversión</p>
              <p className="text-2xl font-bold text-purple-600">4.2%</p>
              <p className="text-xs text-muted-foreground">visitante → suscriptor</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Valor Promedio</p>
              <p className="text-2xl font-bold text-orange-600">€127</p>
              <p className="text-xs text-muted-foreground">por suscriptor</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Insights Comportamentales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Mejores Horarios de Apertura</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Martes 10:00-11:00</span>
                  <Badge variant="default">94.2%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Miércoles 09:00-10:00</span>
                  <Badge variant="default">91.8%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Jueves 14:00-15:00</span>
                  <Badge variant="secondary">87.5%</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Contenido Más Efectivo</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Deals Exclusivos</span>
                  <Badge variant="default">34.5% CTR</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Market Insights</span>
                  <Badge variant="default">28.9% CTR</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Newsletter General</span>
                  <Badge variant="secondary">21.3% CTR</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}