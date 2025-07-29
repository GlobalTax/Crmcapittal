import React from 'react';
import { DashboardCard } from './DashboardCard';
import { useLeadsKpi } from '@/hooks/useLeadsKpi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Flame, TrendingUp, Euro } from 'lucide-react';

export const DashboardLeads = () => {
  const { kpis, funnelData, loading, error } = useLeadsKpi();

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <DashboardCard key={i} title="Cargando..." />
          ))}
        </div>
        <div className="h-80 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        Error al cargar datos de leads: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Leads"
          metric={kpis.totalLeads.toString()}
          icon={Users}
          className="border-primary/20"
        />
        
        <DashboardCard
          title="Leads Hot"
          metric={kpis.hotLeads.toString()}
          icon={Flame}
          className="border-warning/20"
        >
          <div className="flex items-center gap-2 mt-2">
            <Flame className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning font-medium">Alta prioridad</span>
          </div>
        </DashboardCard>
        
        <DashboardCard
          title="Conversión"
          metric={`${kpis.conversionRate}%`}
          icon={TrendingUp}
          className="border-success/20"
        >
          <div className={`text-sm font-medium mt-1 ${getConversionColor(kpis.conversionRate)}`}>
            {kpis.conversionRate >= 20 ? 'Excelente' : 
             kpis.conversionRate >= 10 ? 'Buena' : 'Mejorar'}
          </div>
        </DashboardCard>
        
        <DashboardCard
          title="Valor Pipeline"
          metric={formatCurrency(kpis.pipelineValue)}
          icon={Euro}
          className="border-accent/20"
        >
          <div className="text-sm text-muted-foreground mt-1">
            Valor estimado total
          </div>
        </DashboardCard>
      </div>

      {/* Funnel Chart */}
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Embudo de Leads</h3>
          <p className="text-sm text-muted-foreground">
            Distribución de leads por etapa del pipeline
          </p>
        </div>
        
        {funnelData.length > 0 ? (
          <div className="h-80">
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
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay datos de embudo disponibles</p>
              <p className="text-sm">Agrega algunos leads para ver el embudo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};