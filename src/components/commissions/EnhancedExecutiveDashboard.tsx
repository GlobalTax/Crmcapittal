/**
 * Enhanced Executive Dashboard - Refactored Component
 * 
 * Now uses feature-based architecture with separated concerns
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExecutiveDashboard } from '@/features/dashboard/hooks/useExecutiveDashboard';
import { ExecutiveMetrics } from '@/features/dashboard/components/ExecutiveMetrics';
import { EnhancedCharts } from '@/features/dashboard/components/EnhancedCharts';
import { DashboardFilters } from '@/features/dashboard/components/DashboardFilters';
import { PerformanceInsights } from '@/features/dashboard/components/PerformanceInsights';
import { RevealSection } from '@/components/ui/RevealSection';

export const EnhancedExecutiveDashboard = () => {
  const {
    isLoading,
    enhancedMetrics,
    dashboardStats,
    insights,
    topPerformers,
    periodComparison,
    filters,
    updateFilters,
    resetFilters,
    selectedMetric,
    selectMetric,
    exportDashboard
  } = useExecutiveDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Ejecutivo</h1>
          <p className="text-muted-foreground">
            Panel de control avanzado para análisis de comisiones
          </p>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onReset={resetFilters}
        onExport={exportDashboard}
      />

      {/* Main KPIs */}
      <RevealSection 
        storageKey="executive-dashboard/main-kpis" 
        defaultCollapsed={false} 
        collapsedLabel="Mostrar métricas ejecutivas" 
        expandedLabel="Ocultar métricas ejecutivas"
        count={8}
      >
        <ExecutiveMetrics stats={dashboardStats} isLoading={isLoading} />
      </RevealSection>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EnhancedCharts data={enhancedMetrics} isLoading={isLoading} />
            </div>
            <div>
              <PerformanceInsights
                insights={insights}
                topPerformers={topPerformers}
                periodComparison={periodComparison}
                isLoading={isLoading}
              />
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceInsights
              insights={insights}
              topPerformers={topPerformers}
              periodComparison={periodComparison}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <PerformanceInsights
            insights={insights}
            topPerformers={topPerformers}
            periodComparison={periodComparison}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <EnhancedCharts data={enhancedMetrics} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};