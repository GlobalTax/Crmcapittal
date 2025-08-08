import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface FeatureMetrics {
  feature_key: string;
  total_events: number;
  unique_users: number;
  success_rate: number;
  daily_adoption: Array<{
    date: string;
    events: number;
    users: number;
  }>;
  action_breakdown: Array<{
    action: string;
    count: number;
  }>;
}

export const FeatureAdoptionDashboard = () => {
  const [metrics, setMetrics] = useState<FeatureMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    loadMetrics();
  }, [selectedPeriod]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      const daysBack = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysBack);

      // Get feature analytics with aggregated metrics
      const { data: analytics } = await supabase
        .from('feature_analytics')
        .select('*')
        .gte('timestamp', fromDate.toISOString())
        .order('timestamp', { ascending: false });

      if (analytics) {
        const metricsMap = new Map<string, FeatureMetrics>();
        
        // Process analytics data
        analytics.forEach(event => {
          const feature = event.feature_key;
          if (!metricsMap.has(feature)) {
            metricsMap.set(feature, {
              feature_key: feature,
              total_events: 0,
              unique_users: 0,
              success_rate: 0,
              daily_adoption: [],
              action_breakdown: []
            });
          }
          
          const metric = metricsMap.get(feature)!;
          metric.total_events++;
        });

        // Calculate detailed metrics for each feature
        for (const [feature, metric] of metricsMap) {
          const featureEvents = analytics.filter(e => e.feature_key === feature);
          
          // Unique users
          metric.unique_users = new Set(featureEvents.map(e => e.user_id).filter(Boolean)).size;
          
          // Success rate
          const successEvents = featureEvents.filter(e => 
            e.action.includes('completed') || e.action.includes('success')
          );
          const attemptEvents = featureEvents.filter(e => 
            e.action.includes('attempted') || e.action.includes('started')
          );
          metric.success_rate = attemptEvents.length > 0 
            ? (successEvents.length / attemptEvents.length) * 100 
            : 0;
          
          // Daily adoption
          const dailyData = new Map<string, { events: number; users: Set<string> }>();
          featureEvents.forEach(event => {
            const date = new Date(event.timestamp).toISOString().split('T')[0];
            if (!dailyData.has(date)) {
              dailyData.set(date, { events: 0, users: new Set() });
            }
            const day = dailyData.get(date)!;
            day.events++;
            if (event.user_id) day.users.add(event.user_id);
          });
          
          metric.daily_adoption = Array.from(dailyData.entries()).map(([date, data]) => ({
            date,
            events: data.events,
            users: data.users.size
          })).sort((a, b) => a.date.localeCompare(b.date));
          
          // Action breakdown
          const actionCounts = new Map<string, number>();
          featureEvents.forEach(event => {
            const action = event.action;
            actionCounts.set(action, (actionCounts.get(action) || 0) + 1);
          });
          
          metric.action_breakdown = Array.from(actionCounts.entries()).map(([action, count]) => ({
            action,
            count
          })).sort((a, b) => b.count - a.count);
        }
        
        setMetrics(Array.from(metricsMap.values()));
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const leadClosureMetrics = metrics.find(m => m.feature_key === 'lead_closure_dialog');

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de Adopción</h2>
          <p className="text-muted-foreground">Métricas de adopción de funcionalidades</p>
        </div>
        
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPeriod === period 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Lead Closure Dialog Metrics */}
      {leadClosureMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Totales</CardTitle>
              <Badge variant="secondary">Lead Closure</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadClosureMetrics.total_events}</div>
              <p className="text-xs text-muted-foreground">
                Últimos {selectedPeriod}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Únicos</CardTitle>
              <Badge variant="secondary">Lead Closure</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadClosureMetrics.unique_users}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
              <Badge variant="secondary">Lead Closure</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadClosureMetrics.success_rate.toFixed(1)}%</div>
              <Progress value={leadClosureMetrics.success_rate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Conversiones exitosas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
              <Badge variant="secondary">Lead Closure</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leadClosureMetrics.daily_adoption.length > 0 
                  ? Math.round(leadClosureMetrics.total_events / leadClosureMetrics.daily_adoption.length)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Eventos por día
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {leadClosureMetrics && leadClosureMetrics.daily_adoption.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Adopción Diaria - Lead Closure</CardTitle>
              <CardDescription>Eventos y usuarios únicos por día</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={leadClosureMetrics.daily_adoption}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="events" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Eventos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Usuarios"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {leadClosureMetrics && leadClosureMetrics.action_breakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Acciones por Tipo</CardTitle>
              <CardDescription>Distribución de acciones en Lead Closure</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadClosureMetrics.action_breakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ action, percent }) => `${action} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="count"
                  >
                    {leadClosureMetrics.action_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Todas las Funcionalidades</CardTitle>
          <CardDescription>Comparativa de adopción entre funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature_key" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_events" fill="hsl(var(--primary))" name="Eventos Totales" />
              <Bar dataKey="unique_users" fill="hsl(var(--secondary))" name="Usuarios Únicos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};