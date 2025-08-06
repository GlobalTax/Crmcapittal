import React from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useValoracionesKpis } from '@/hooks/useValoracionesKpis';
import { 
  TrendingUp, 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  AlertTriangle, 
  UserX 
} from 'lucide-react';

export const ValoracionesKpiCards = () => {
  const { kpis, loading } = useValoracionesKpis();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <MetricCard
        title="Total Valoraciones"
        value={kpis.totalValoraciones}
        icon={TrendingUp}
        colorScheme="info"
        change={{ value: `${kpis.valoracionesCompletadas} completadas`, trend: 'up' }}
      />
      
      <MetricCard
        title="Pendientes"
        value={kpis.valoracionesPendientes}
        icon={Clock}
        colorScheme="warning"
        change={{ value: "Por iniciar", trend: 'down' }}
      />
      
      <MetricCard
        title="En Proceso"
        value={kpis.valoracionesEnProceso}
        icon={PlayCircle}
        colorScheme="primary"
        change={{ value: "Activas", trend: 'up' }}
      />
      
      <MetricCard
        title="Completadas"
        value={kpis.valoracionesCompletadas}
        icon={CheckCircle}
        colorScheme="success"
        change={{ value: "Finalizadas", trend: 'up' }}
      />
      
      <MetricCard
        title="Ingresos Totales"
        value={formatCurrency(kpis.ingresosTotales)}
        icon={TrendingUp}
        colorScheme="success"
        change={{ 
          value: `Promedio: ${formatCurrency(kpis.promedioEvPorValoracion)}`, 
          trend: 'up' 
        }}
      />
      
      <MetricCard
        title="Urgentes"
        value={kpis.valoracionesUrgentes}
        icon={AlertTriangle}
        colorScheme="destructive"
        change={{ value: "Alta prioridad", trend: 'down' }}
      />
    </div>
  );
};