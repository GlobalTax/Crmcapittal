/**
 * Performance Insights Component
 * 
 * AI-powered insights and recommendations for executive dashboard
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Target,
  Award,
  Zap
} from 'lucide-react';

interface Insight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
}

interface TopPerformer {
  name: string;
  amount: number;
  count: number;
}

interface PeriodComparison {
  current: { amount: number; count: number };
  previous: { amount: number; count: number };
  change: { amount: number; count: number };
}

interface PerformanceInsightsProps {
  insights: Insight[];
  topPerformers: TopPerformer[];
  periodComparison: PeriodComparison;
  isLoading?: boolean;
}

export const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({
  insights,
  topPerformers,
  periodComparison,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getInsightVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Period Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Comparación de Períodos
          </CardTitle>
          <CardDescription>
            Rendimiento actual vs período anterior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ingresos</span>
                <div className="flex items-center gap-2">
                  {periodComparison.change.amount >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    periodComparison.change.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(periodComparison.change.amount)}
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(periodComparison.current.amount)}
              </div>
              <div className="text-sm text-muted-foreground">
                Anterior: {formatCurrency(periodComparison.previous.amount)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cantidad</span>
                <div className="flex items-center gap-2">
                  {periodComparison.change.count >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    periodComparison.change.count >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(periodComparison.change.count)}
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {periodComparison.current.count.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Anterior: {periodComparison.previous.count.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performers
          </CardTitle>
          <CardDescription>
            Los colaboradores con mejor rendimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos suficientes para mostrar top performers
              </div>
            ) : (
              topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant={index === 0 ? 'default' : 'secondary'} className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{performer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {performer.count} comisiones
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(performer.amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(performer.amount / performer.count)} promedio
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Insights Inteligentes
          </CardTitle>
          <CardDescription>
            Análisis automático y recomendaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay insights disponibles para este período</p>
              <p className="text-xs">Intenta ajustar los filtros o el período de análisis</p>
            </div>
          ) : (
            insights.map((insight, index) => (
              <Alert key={index} variant={getInsightVariant(insight.type) as any}>
                <div className="flex items-start gap-2">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="font-medium">{insight.title}</div>
                    <AlertDescription className="mt-1">
                      {insight.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};