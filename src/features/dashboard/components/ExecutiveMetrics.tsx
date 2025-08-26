/**
 * Executive Metrics Component
 * 
 * Enhanced KPI cards for executive dashboard
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  BarChart3,
  Users,
  Zap
} from 'lucide-react';
import { DashboardStats, DashboardService } from '../services/DashboardService';

interface ExecutiveMetricsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export const ExecutiveMetrics: React.FC<ExecutiveMetricsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getTrendIcon = (value: number) => {
    const trend = DashboardService.getTrendIndicator(value);
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (value: number) => {
    const trend = DashboardService.getTrendIndicator(value);
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Revenue */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {DashboardService.formatCurrency(stats.totalAmount)}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {getTrendIcon(stats.growth)}
            <span className={getTrendColor(stats.growth)}>
              {DashboardService.formatPercentage(Math.abs(stats.growth))} vs período anterior
            </span>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
      </Card>

      {/* Total Deals */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCount.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Activas en el período</span>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-500" />
      </Card>

      {/* Average Deal Size */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Medio</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {DashboardService.formatCurrency(stats.avgAmount)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Por comisión</span>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />
      </Card>

      {/* Efficiency */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {DashboardService.formatPercentage(stats.efficiency)}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Badge 
              variant={stats.efficiency > 80 ? 'default' : stats.efficiency > 60 ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {stats.efficiency > 80 ? 'Excelente' : stats.efficiency > 60 ? 'Buena' : 'Mejorable'}
            </Badge>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
      </Card>

      {/* Growth Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getTrendColor(stats.growth)}`}>
            {stats.growth >= 0 ? '+' : ''}{DashboardService.formatPercentage(stats.growth)}
          </div>
          <p className="text-xs text-muted-foreground">Últimos 30 días</p>
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversión</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {DashboardService.formatPercentage(stats.conversion)}
          </div>
          <p className="text-xs text-muted-foreground">Tasa de éxito</p>
        </CardContent>
      </Card>

      {/* Performance Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round((stats.efficiency + stats.conversion) / 2)}
          </div>
          <p className="text-xs text-muted-foreground">Puntuación global</p>
        </CardContent>
      </Card>

      {/* Time Period */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Período Activo</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">Este Mes</div>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};