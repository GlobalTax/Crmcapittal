import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Users,
  Euro
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Reconversion = Database['public']['Tables']['reconversiones']['Row'];

interface ReconversionStatsProps {
  reconversiones: Reconversion[];
}

export function ReconversionStats({ reconversiones }: ReconversionStatsProps) {
  const totalReconversiones = reconversiones.length;
  
  const activeReconversiones = reconversiones.filter(r => 
    ['active', 'matching', 'negotiations'].includes(r.status)
  ).length;
  
  const completedReconversiones = reconversiones.filter(r => 
    r.status === 'closed'
  ).length;
  
  const urgentReconversiones = reconversiones.filter(r => 
    (r as any).priority === 'urgent'
  ).length;

  const totalInvestmentCapacity = reconversiones.reduce((acc, r) => {
    const max = r.investment_capacity_max || 0;
    return acc + max;
  }, 0);

  const averageInvestmentCapacity = totalReconversiones > 0 
    ? totalInvestmentCapacity / totalReconversiones 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const completionRate = totalReconversiones > 0 
    ? Math.round((completedReconversiones / totalReconversiones) * 100)
    : 0;

  const stats = [
    {
      title: 'Total Reconversiones',
      value: totalReconversiones.toString(),
      description: 'En el sistema',
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'En Proceso',
      value: activeReconversiones.toString(),
      description: 'Activas en pipeline',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Finalizadas',
      value: completedReconversiones.toString(),
      description: `${completionRate}% tasa de éxito`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Urgentes',
      value: urgentReconversiones.toString(),
      description: 'Requieren atención',
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Capacidad Media',
      value: formatCurrency(averageInvestmentCapacity),
      description: 'Inversión promedio',
      icon: Euro,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Capacidad Total',
      value: formatCurrency(totalInvestmentCapacity),
      description: 'Potencial total',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}