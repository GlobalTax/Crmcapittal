import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Target, 
  Zap, 
  Coffee,
  BarChart3,
  PieChart,
  Calendar,
  Award,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useSmartTimer } from '@/hooks/useTimeTrackingPro';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export const ProductivityDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const { useProductivityAnalytics } = useSmartTimer();

  // Calcular fechas del periodo
  const getPeriodDates = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'today':
        return {
          start: format(now, 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        };
      case 'week':
        return {
          start: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          end: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        };
      case 'month':
        return {
          start: format(subDays(now, 30), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        };
    }
  };

  const period = getPeriodDates();
  const { data: analytics, isLoading } = useProductivityAnalytics('user-id', period);

  // Mock data para demostración
  const mockData = {
    total_hours: 42.5,
    billable_hours: 38.2,
    revenue_generated: 1910,
    average_focus_score: 0.87,
    average_efficiency_score: 0.82,
    productivity_trend: 12.5,
    daily_breakdown: [
      { date: '2024-01-08', total_minutes: 480, billable_minutes: 420, revenue_generated: 210, focus_score: 0.85, efficiency_score: 0.80 },
      { date: '2024-01-09', total_minutes: 520, billable_minutes: 480, revenue_generated: 240, focus_score: 0.90, efficiency_score: 0.85 },
      { date: '2024-01-10', total_minutes: 460, billable_minutes: 400, revenue_generated: 200, focus_score: 0.82, efficiency_score: 0.78 },
      { date: '2024-01-11', total_minutes: 550, billable_minutes: 510, revenue_generated: 255, focus_score: 0.88, efficiency_score: 0.87 },
      { date: '2024-01-12', total_minutes: 490, billable_minutes: 450, revenue_generated: 225, focus_score: 0.86, efficiency_score: 0.83 }
    ]
  };

  const data = analytics || mockData;

  const categoryBreakdown = [
    { name: 'Llamadas', hours: 12.5, revenue: 625, color: '#22c55e' },
    { name: 'Reuniones', hours: 8.2, revenue: 410, color: '#8b5cf6' },
    { name: 'Emails', hours: 6.8, revenue: 340, color: '#3b82f6' },
    { name: 'Propuestas', hours: 10.2, revenue: 510, color: '#f59e0b' },
    { name: 'Admin', hours: 2.8, revenue: 0, color: '#6b7280' }
  ];

  const peakHours = [
    { hour: '09:00', productivity: 85 },
    { hour: '10:00', productivity: 92 },
    { hour: '11:00', productivity: 95 },
    { hour: '12:00', productivity: 78 },
    { hour: '14:00', productivity: 88 },
    { hour: '15:00', productivity: 90 },
    { hour: '16:00', productivity: 85 },
    { hour: '17:00', productivity: 75 }
  ];

  const billableRate = data.billable_hours / data.total_hours * 100;
  const revenuePerHour = data.revenue_generated / data.billable_hours;
  const goalProgress = (data.total_hours / (8 * 5)) * 100; // Meta de 40h semanales

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Productividad</h2>
          <p className="text-muted-foreground">
            Análisis detallado de tu rendimiento y tiempo
          </p>
        </div>
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod(period)}
              size="sm"
            >
              {period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_hours}h</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{data.productivity_trend.toFixed(1)}% vs periodo anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Facturable</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.billable_hours}h</div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{billableRate.toFixed(1)}%</Badge>
              <span className="text-xs text-green-600">
                €{revenuePerHour.toFixed(0)}/h
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Generados</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{data.revenue_generated}</div>
            <div className="text-xs text-muted-foreground">
              Promedio: €{(data.revenue_generated / data.daily_breakdown.length).toFixed(0)}/día
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Focus</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.average_focus_score * 100).toFixed(0)}%</div>
            <Progress value={data.average_focus_score * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Progreso hacia objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progreso hacia Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Meta Semanal (40h)</span>
                <span className="text-sm text-muted-foreground">
                  {data.total_hours}h / 40h
                </span>
              </div>
              <Progress value={Math.min(goalProgress, 100)} className="h-3" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Tiempo Facturable (90%)</span>
                <span className="text-sm text-muted-foreground">
                  {billableRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={Math.min(billableRate / 90 * 100, 100)} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="patterns">Patrones</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tiempo Diario</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.daily_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                    />
                    <YAxis tickFormatter={(value) => `${(value / 60).toFixed(1)}h`} />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'dd MMMM', { locale: es })}
                      formatter={(value: number) => [`${(value / 60).toFixed(1)}h`, 'Tiempo']}
                    />
                    <Area
                      type="monotone"
                      dataKey="total_minutes"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      name="Total"
                    />
                    <Area
                      type="monotone"
                      dataKey="billable_minutes"
                      stackId="2"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.3}
                      name="Facturable"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos y Productividad</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.daily_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="revenue_generated" fill="#f59e0b" name="Ingresos" />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="efficiency_score" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Eficiencia"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="hours"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}h`, 'Tiempo']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryBreakdown.map((category) => (
                    <div key={category.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">€{category.revenue}</div>
                        <div className="text-sm text-muted-foreground">{category.hours}h</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Horas Pico de Productividad</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Productividad']} />
                    <Bar 
                      dataKey="productivity" 
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patrones Semanales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span>Día más productivo</span>
                    </div>
                    <Badge variant="secondary">Miércoles</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-orange-500" />
                      <span>Mejor hora para descansos</span>
                    </div>
                    <Badge variant="secondary">12:00 - 13:00</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Sesión de focus promedio</span>
                    </div>
                    <Badge variant="secondary">1h 45min</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>Eficiencia media</span>
                    </div>
                    <Badge variant="secondary">{(data.average_efficiency_score * 100).toFixed(0)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Fortalezas Detectadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                    <p className="font-medium text-green-900">Excelente constancia</p>
                    <p className="text-sm text-green-700">
                      Mantienes un ritmo constante de trabajo durante toda la semana
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="font-medium text-blue-900">Alta tasa facturable</p>
                    <p className="text-sm text-blue-700">
                      Tu ratio de tiempo facturable está por encima del promedio
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                    <p className="font-medium text-purple-900">Focus sostenido</p>
                    <p className="text-sm text-purple-700">
                      Mantienes buena concentración en sesiones largas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Oportunidades de Mejora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                    <p className="font-medium text-orange-900">Descansos más frecuentes</p>
                    <p className="text-sm text-orange-700">
                      Considera tomar descansos cada 90 minutos para mantener el rendimiento
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <p className="font-medium text-yellow-900">Variar actividades</p>
                    <p className="text-sm text-yellow-700">
                      Alterna entre tareas pesadas y ligeras para evitar fatiga
                    </p>
                  </div>
                  
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <p className="font-medium text-red-900">Gestión de interrupciones</p>
                    <p className="text-sm text-red-700">
                      Reduce las interrupciones durante las primeras horas de la mañana
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recomendaciones personalizadas */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <h4 className="font-medium mb-2">🎯 Optimiza tu horario</h4>
                  <p className="text-sm text-muted-foreground">
                    Programa las tareas más complejas entre 10:00 y 11:00, tu hora más productiva
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <h4 className="font-medium mb-2">💰 Aumenta ingresos</h4>
                  <p className="text-sm text-muted-foreground">
                    Enfócate más en "Propuestas" - tiene el mejor ratio de ingresos por hora
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <h4 className="font-medium mb-2">⚡ Mejora el focus</h4>
                  <p className="text-sm text-muted-foreground">
                    Usa la técnica Pomodoro: 25 min de trabajo + 5 min de descanso
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};