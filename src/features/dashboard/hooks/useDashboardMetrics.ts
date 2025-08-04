/**
 * Dashboard Metrics Hook
 * 
 * Hook for calculating and managing dashboard metrics and KPIs
 */

import { useMemo } from 'react';
import { DollarSign, Building2, TrendingUp, Users } from 'lucide-react';
import { DashboardMetrics, KPIMetric } from '../types';

export const useDashboardMetrics = (operations: any[], leads: any[]): DashboardMetrics => {
  return useMemo(() => {
    // Calculate basic metrics
    const totalPortfolioValue = operations.reduce((sum, op) => sum + (op.amount || 0), 0);
    const availableOperations = operations.filter(op => op.status === 'available');
    const inProcessOperations = operations.filter(op => op.status === 'in_process');
    const soldOperations = operations.filter(op => op.status === 'sold');
    
    // Lead metrics
    const qualifiedLeads = leads.filter(l => l.status === 'QUALIFIED');
    const conversionRate = leads.length > 0 ? ((qualifiedLeads.length / leads.length) * 100) : 0;
    
    // Mock previous period data for comparison
    const previousPortfolioValue = totalPortfolioValue * 0.85;
    const portfolioGrowth = totalPortfolioValue > 0 ? 
      ((totalPortfolioValue - previousPortfolioValue) / previousPortfolioValue) * 100 : 0;

    // Calculate KPI metrics
    const kpiMetrics: KPIMetric[] = [
      {
        title: "Valor Pipeline",
        value: `€${(totalPortfolioValue / 1000000).toFixed(1)}M`,
        change: portfolioGrowth,
        description: "vs. período anterior",
        icon: DollarSign
      },
      {
        title: "Deals Activos",
        value: availableOperations.length,
        change: 12.5,
        description: "oportunidades abiertas",
        icon: Building2
      },
      {
        title: "Tasa Conversión",
        value: `${conversionRate.toFixed(1)}%`,
        change: 8.3,
        description: "leads a oportunidades",
        icon: TrendingUp
      },
      {
        title: "Deals Cerrados",
        value: soldOperations.length,
        change: 25.0,
        description: "este mes",
        icon: Users
      }
    ];

    return {
      kpiMetrics,
      availableOperations,
      inProcessOperations,
      soldOperations,
      totalPortfolioValue,
      conversionRate
    };
  }, [operations, leads]);
};