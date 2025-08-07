import React, { useState } from 'react';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  TrendingUp,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCalendarMetrics } from '../hooks/useCalendar';

type TimePeriod = '7d' | '30d' | '90d';

export function CalendarAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d');
  
  const { data: metrics, isLoading } = useCalendarMetrics(selectedPeriod);

  const getPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
      case '7d': return 'Últimos 7 días';
      case '30d': return 'Últimos 30 días';
      case '90d': return 'Últimos 90 días';
    }
  };

  const getComparisonText = (current: number, previous: number): { text: string; variant: 'positive' | 'negative' | 'neutral' } => {
    const change = ((current - previous) / previous) * 100;
    if (change > 0) return { text: `+${change.toFixed(1)}%`, variant: 'positive' };
    if (change < 0) return { text: `${change.toFixed(1)}%`, variant: 'negative' };
    return { text: '0%', variant: 'neutral' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics del Calendario</h2>
          <p className="text-muted-foreground">
            Métricas y rendimiento de tus eventos y reuniones
          </p>
        </div>
        <Select value={selectedPeriod} onValueChange={(value: TimePeriod) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_events || 0}</div>
            <div className="text-xs text-muted-foreground">
              Eventos en el período seleccionado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Programadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_hours || 0}h</div>
            <div className="text-xs text-muted-foreground">
              Horas programadas total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.conversion_rates?.demo_to_deal || 0}%</div>
            <div className="text-xs text-muted-foreground">
              De demos a deals cerrados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.average_duration_minutes || 0}min</div>
            <div className="text-xs text-muted-foreground">
              Duración promedio por evento
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meeting Types Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tipos de Reunión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics?.meeting_type_breakdown && Object.entries(metrics.meeting_type_breakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={
                    type === 'demo' ? 'border-blue-200 text-blue-700' :
                    type === 'follow_up' ? 'border-green-200 text-green-700' :
                    type === 'closing' ? 'border-purple-200 text-purple-700' :
                    type === 'negotiation' ? 'border-orange-200 text-orange-700' :
                    'border-gray-200 text-gray-700'
                  }>
                    {type === 'demo' ? 'Demo' :
                     type === 'follow_up' ? 'Seguimiento' :
                     type === 'closing' ? 'Cierre' :
                     type === 'negotiation' ? 'Negociación' : 'General'}
                  </Badge>
                </div>
                <div className="font-semibold">{count}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendencias por Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.dailyStats && Object.entries(metrics.dailyStats).map(([day, stats]) => (
                <div key={day} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {format(new Date(day), 'EEEE d', { locale: es })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats.totalHours}h programadas
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {stats.eventCount} eventos
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Eventos Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {metrics?.completedEvents || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                De {metrics?.totalEvents || 0} eventos programados
              </div>
              <div className="text-xs text-muted-foreground">
                {metrics?.totalEvents ? ((metrics.completedEvents / metrics.totalEvents) * 100).toFixed(1) : 0}% tasa de finalización
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Asistencia Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {metrics?.averageAttendees || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Asistentes por reunión
              </div>
              <div className="text-xs text-muted-foreground">
                Basado en eventos con asistentes
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos del Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Demos programadas</span>
                <Badge variant={metrics?.demoCount && metrics.demoCount >= 10 ? 'default' : 'secondary'}>
                  {metrics?.demoCount || 0}/10
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Seguimientos realizados</span>
                <Badge variant={metrics?.followUpCount && metrics.followUpCount >= 15 ? 'default' : 'secondary'}>
                  {metrics?.followUpCount || 0}/15
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cierres programados</span>
                <Badge variant={metrics?.closingCount && metrics.closingCount >= 5 ? 'default' : 'secondary'}>
                  {metrics?.closingCount || 0}/5
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {metrics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.type} • {format(new Date(activity.date), 'dd MMM HH:mm', { locale: es })}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay actividad reciente en el período seleccionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}