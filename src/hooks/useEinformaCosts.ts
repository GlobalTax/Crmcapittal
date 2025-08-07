import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CostTracking {
  id: string;
  consultation_type: 'basic' | 'financial' | 'credit' | 'directors' | 'full';
  cost_amount: number;
  company_id?: string;
  consultation_date: string;
  billing_month: string;
  is_bulk_operation: boolean;
  bulk_discount_applied: number;
  companies?: {
    name: string;
    industry?: string;
  };
}

interface CostAnalytics {
  metric_type: string;
  metric_value: number;
  metric_date: string;
  additional_data: any;
}

interface BudgetConfig {
  monthly_budget: number;
  alert_at_80_percent: boolean;
  emergency_stop: boolean;
}

export const useEinformaCosts = (period: 'current' | 'last' | 'year' = 'current') => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Calculate date ranges based on period
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (period) {
      case 'current':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch cost tracking data
  const { data: costData, isLoading: costsLoading } = useQuery({
    queryKey: ['einforma-costs', period, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('einforma_cost_tracking')
        .select(`
          *,
          companies(name, industry)
        `)
        .gte('consultation_date', startDate.toISOString())
        .lte('consultation_date', endDate.toISOString())
        .order('consultation_date', { ascending: false });
      
      if (error) throw error;
      return data as CostTracking[];
    }
  });

  // Fetch budget configuration
  const { data: budgetConfig } = useQuery({
    queryKey: ['einforma-budget-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('einforma_config')
        .select('config_value')
        .eq('config_key', 'cost_limits')
        .single();
      
      if (error) throw error;
      return data?.config_value as unknown as BudgetConfig;
    }
  });

  // Fetch cost analytics
  const { data: analytics } = useQuery({
    queryKey: ['einforma-cost-analytics', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('einforma_analytics')
        .select('*')
        .in('metric_type', ['cost_efficiency', 'roi_score'])
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .lte('metric_date', endDate.toISOString().split('T')[0])
        .order('metric_date', { ascending: false });
      
      if (error) throw error;
      return data as CostAnalytics[];
    }
  });

  // Calculate metrics
  const metrics = {
    totalCost: costData?.reduce((sum, item) => sum + item.cost_amount, 0) || 0,
    totalConsultations: costData?.length || 0,
    averageCostPerConsultation: costData?.length ? 
      (costData.reduce((sum, item) => sum + item.cost_amount, 0) / costData.length) : 0,
    bulkOperations: costData?.filter(item => item.is_bulk_operation).length || 0,
    totalSavingsFromBulk: costData?.reduce((sum, item) => 
      sum + (item.bulk_discount_applied || 0), 0) || 0,
  };

  // Cost by type breakdown
  const costByType = costData?.reduce((acc, item) => {
    acc[item.consultation_type] = (acc[item.consultation_type] || 0) + item.cost_amount;
    return acc;
  }, {} as Record<string, number>) || {};

  // Cost by industry breakdown
  const costByIndustry = costData?.reduce((acc, item) => {
    const industry = item.companies?.industry || 'Unknown';
    acc[industry] = (acc[industry] || 0) + item.cost_amount;
    return acc;
  }, {} as Record<string, number>) || {};

  // Daily cost trend
  const dailyCostTrend = costData?.reduce((acc, item) => {
    const date = item.consultation_date.split('T')[0];
    acc[date] = (acc[date] || 0) + item.cost_amount;
    return acc;
  }, {} as Record<string, number>) || {};

  // Budget analysis
  const monthlyBudget = budgetConfig?.monthly_budget || 5000;
  const budgetUsed = (metrics.totalCost / monthlyBudget) * 100;
  const budgetRemaining = monthlyBudget - metrics.totalCost;
  const alertThreshold = budgetConfig?.alert_at_80_percent ? 80 : 90;
  const isBudgetAtRisk = budgetUsed >= alertThreshold;

  // Cost predictions (simple linear projection)
  const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const averageDailyCost = metrics.totalCost / Math.max(daysElapsed, 1);
  const projectedMonthlyTotal = averageDailyCost * daysInPeriod;

  // ROI calculations (simplified - needs more business logic)
  const estimatedROI = analytics?.find(a => a.metric_type === 'roi_score')?.metric_value || 0;

  // Cost efficiency score (lower is better)
  const efficiencyScore = analytics?.find(a => a.metric_type === 'cost_efficiency')?.metric_value || 0;

  return {
    // Raw data
    costData,
    budgetConfig,
    analytics,

    // Loading states
    costsLoading,

    // Metrics
    metrics: {
      ...metrics,
      budgetUsed,
      budgetRemaining,
      isBudgetAtRisk,
      averageDailyCost,
      projectedMonthlyTotal,
      estimatedROI,
      efficiencyScore
    },

    // Breakdowns
    costByType,
    costByIndustry,
    dailyCostTrend,

    // Budget info
    budget: {
      monthly: monthlyBudget,
      used: budgetUsed,
      remaining: budgetRemaining,
      alertThreshold,
      isAtRisk: isBudgetAtRisk
    },

    // Date controls
    selectedMonth,
    setSelectedMonth,
    dateRange: { startDate, endDate },

    // Helper functions
    formatCurrency: (amount: number) => `€${amount.toFixed(2)}`,
    formatPercentage: (value: number) => `${value.toFixed(1)}%`,
    
    // Top cost drivers
    topCompanies: costData?.reduce((acc, item) => {
      if (item.companies?.name) {
        const name = item.companies.name;
        acc[name] = (acc[name] || 0) + item.cost_amount;
      }
      return acc;
    }, {} as Record<string, number>),

    // Cost efficiency indicators
    efficiency: {
      bulkUsageRate: metrics.totalConsultations > 0 ? 
        (metrics.bulkOperations / metrics.totalConsultations) * 100 : 0,
      averageSavingsPerBulk: metrics.bulkOperations > 0 ? 
        metrics.totalSavingsFromBulk / metrics.bulkOperations : 0,
      costPerSuccessfulEnrichment: efficiencyScore
    }
  };
};