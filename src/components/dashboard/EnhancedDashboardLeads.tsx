import React, { useState } from 'react';
import { useEnhancedLeadsKpi } from '@/hooks/useEnhancedLeadsKpi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Flame, TrendingUp, Euro, Calendar, Clock, Target, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StandardDashboardLayout } from './StandardDashboardLayout';
import { StandardDashboardHeader } from './StandardDashboardHeader';
import { StandardMetricsGrid } from './StandardMetricsGrid';
import { StandardMetricCard } from './StandardMetricCard';

export const EnhancedDashboardLeads = () => {
  const { kpis, funnelData, loading, error } = useEnhancedLeadsKpi();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 20) return 'text-success';
    if (rate >= 10) return 'text-warning';
    return 'text-destructive';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getPerformanceColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'bg-success/10 text-success border-success/20';
      case 'good': return 'bg-primary/10 text-primary border-primary/20';
      case 'average': return 'bg-warning/10 text-warning border-warning/20';
      case 'poor': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  if (loading) {
    return (
      <StandardDashboardLayout>
        <StandardDashboardHeader
          title="Dashboard de Leads"
          subtitle="Cargando datos..."
        />
        <StandardMetricsGrid columns={6}>
          {[...Array(6)].map((_, i) => (
            <StandardMetricCard key={i} title="Cargando..." value="..." />
          ))}
        </StandardMetricsGrid>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-muted animate-pulse rounded-lg" />
          <div className="h-80 bg-muted animate-pulse rounded-lg" />
        </div>
      </StandardDashboardLayout>
    );
  }

  if (error) {
    return (
      <StandardDashboardLayout>
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          Error al cargar datos de leads: {error}
        </div>
      </StandardDashboardLayout>
    );
  }

  return (
    <StandardDashboardLayout>
      <StandardDashboardHeader
        title="Dashboard de Leads"
        subtitle="Análisis completo del pipeline de leads"
        rightContent={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 días</SelectItem>
                <SelectItem value="30d">30 días</SelectItem>
                <SelectItem value="90d">90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <StandardMetricsGrid columns={6}>
        <StandardMetricCard
          title="Total Leads"
          value={kpis.totalLeads.toString()}
          icon={Users}
          variant="info"
        >
          <div className="text-xs text-muted-foreground">
            {kpis.newLeads7d} nuevos (7d)
          </div>
        </StandardMetricCard>
        
        <StandardMetricCard
          title="Leads Hot"
          value={kpis.hotLeads.toString()}
          icon={Flame}
          variant="warning"
        >
          <Badge className="text-xs bg-warning/10 text-warning border-warning/20">
            Score ≥80
          </Badge>
        </StandardMetricCard>
        
        <StandardMetricCard
          title="Conversión"
          value={`${kpis.conversionRate}%`}
          icon={TrendingUp}
          variant="success"
        >
          <div className={`text-sm font-medium ${getConversionColor(kpis.conversionRate)}`}>
            {kpis.conversionRate >= 20 ? 'Excelente' : 
             kpis.conversionRate >= 10 ? 'Buena' : 'Mejorar'}
          </div>
        </StandardMetricCard>
        
        <StandardMetricCard
          title="Valor Pipeline"
          value={formatCurrency(kpis.pipelineValue)}
          icon={Euro}
          variant="default"
        >
          <div className="text-sm text-muted-foreground">
            Valor cualificado
          </div>
        </StandardMetricCard>

        <StandardMetricCard
          title="Crecimiento 30d"
          value={`${kpis.growthRate30d > 0 ? '+' : ''}${kpis.growthRate30d}%`}
          icon={Calendar}
          variant="info"
          change={{ 
            value: kpis.leadsTrend === 'up' ? 'Positiva' : kpis.leadsTrend === 'down' ? 'Negativa' : 'Estable',
            trend: kpis.leadsTrend
          }}
        />

        <StandardMetricCard
          title="Tiempo Promedio"
          value={`${kpis.avgTimeToQualifyDays}d`}
          icon={Clock}
          variant="default"
        >
          <div className="text-sm text-muted-foreground">
            Para cualificar
          </div>
        </StandardMetricCard>
      </StandardMetricsGrid>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Funnel Chart */}
        <div className="bg-card rounded-lg border p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Embudo de Leads Avanzado</h3>
            <p className="text-sm text-muted-foreground">
              Pipeline con métricas de conversión entre etapas
            </p>
          </div>
          
          {funnelData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={funnelData}
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      type="number" 
                      className="text-muted-foreground text-xs"
                    />
                    <YAxis 
                      type="category" 
                      dataKey="stageName"
                      className="text-muted-foreground text-xs"
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                      formatter={(value, name) => [
                        `${value} leads`,
                        'Cantidad'
                      ]}
                      labelFormatter={(label) => `Etapa: ${label}`}
                    />
                    <Bar 
                      dataKey="leadCount" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 4, 4]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Stage Performance Indicators */}
              <div className="grid grid-cols-1 gap-2">
                {funnelData.map((stage) => (
                  <div key={stage.stageId} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: stage.stageColor || '#3B82F6' }}
                      />
                      <span className="text-sm font-medium">{stage.stageName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getPerformanceColor(stage.performanceRating)}`}>
                        {stage.stageConversionRate}% conv.
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {stage.recentCount} recientes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay datos de embudo disponibles</p>
              </div>
            </div>
          )}
        </div>

        {/* Conversion Trends Chart */}
        <div className="bg-card rounded-lg border p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Tendencias de Conversión</h3>
            <p className="text-sm text-muted-foreground">
              Evolución de la tasa de conversión semanal
            </p>
          </div>
          
          {kpis.conversionTrendData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpis.conversionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="week" 
                    className="text-muted-foreground text-xs"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                    }}
                  />
                  <YAxis 
                    className="text-muted-foreground text-xs"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value) => [`${value}%`, 'Conversión']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `Semana del ${date.toLocaleDateString('es-ES')}`;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversion_rate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay datos de tendencias disponibles</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Insights Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium text-primary">Score Promedio</span>
            </div>
            <p className="text-2xl font-bold text-primary">{kpis.avgScore}</p>
            <p className="text-sm text-muted-foreground">Calidad general de leads</p>
          </div>
          
          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-success" />
              <span className="font-medium text-success">Leads Cualificados</span>
            </div>
            <p className="text-2xl font-bold text-success">{kpis.qualifiedLeads}</p>
            <p className="text-sm text-muted-foreground">Listos para contactar</p>
          </div>
          
          <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-warning" />
              <span className="font-medium text-warning">Actividad Reciente</span>
            </div>
            <p className="text-2xl font-bold text-warning">{kpis.newLeads30d}</p>
            <p className="text-sm text-muted-foreground">Nuevos en 30 días</p>
          </div>
        </div>
      </div>
    </StandardDashboardLayout>
  );
};