/**
 * Executive Dashboard Hook
 * 
 * Custom hook for managing executive dashboard data and operations
 */

import { useState, useMemo } from 'react';
import { useCommissions } from '@/hooks/useCommissions';
import { 
  DashboardService, 
  EnhancedMetrics, 
  DashboardStats 
} from '../services/DashboardService';

export interface DashboardFilters {
  period: 'week' | 'month' | 'quarter' | 'year';
  collaboratorId?: string;
  status?: string;
  source?: string;
}

export const useExecutiveDashboard = () => {
  const { commissions: commissionsData = [], loading: isLoading } = useCommissions();
  
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'month'
  });

  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'deals' | 'performance'>('revenue');

  // Filter data based on period and other criteria
  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (filters.period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return commissionsData.filter(commission => {
      const commissionDate = new Date(commission.created_at);
      
      // Date filter
      if (commissionDate < startDate) return false;
      
      // Status filter
      if (filters.status && commission.status !== filters.status) return false;
      
      // Collaborator filter
      if (filters.collaboratorId && commission.collaborator_id !== filters.collaboratorId) return false;
      
      // Source filter  
      if (filters.source && commission.source_type !== filters.source) return false;
      
      return true;
    });
  }, [commissionsData, filters]);

  // Enhanced metrics
  const enhancedMetrics = useMemo(() => {
    return DashboardService.calculateEnhancedMetrics(filteredData);
  }, [filteredData]);

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    return DashboardService.calculateDashboardStats(filteredData);
  }, [filteredData]);

  // Performance insights
  const insights = useMemo(() => {
    const totalAmount = dashboardStats.totalAmount;
    const growth = dashboardStats.growth;
    const efficiency = dashboardStats.efficiency;

    const insights = [];

    if (growth > 20) {
      insights.push({
        type: 'success',
        title: 'Crecimiento Excepcional',
        message: `Las comisiones han crecido un ${growth.toFixed(1)}% este período.`
      });
    } else if (growth < -10) {
      insights.push({
        type: 'warning',
        title: 'Tendencia Negativa',
        message: `Las comisiones han disminuido un ${Math.abs(growth).toFixed(1)}%.`
      });
    }

    if (efficiency > 85) {
      insights.push({
        type: 'success',
        title: 'Alta Eficiencia',
        message: `La tasa de eficiencia es del ${efficiency.toFixed(1)}%.`
      });
    } else if (efficiency < 60) {
      insights.push({
        type: 'warning',
        title: 'Oportunidad de Mejora',
        message: `La eficiencia puede optimizarse (actual: ${efficiency.toFixed(1)}%).`
      });
    }

    if (totalAmount > 100000) {
      insights.push({
        type: 'info',
        title: 'Volumen Significativo',
        message: `Se han gestionado ${DashboardService.formatCurrency(totalAmount)} en comisiones.`
      });
    }

    return insights;
  }, [dashboardStats]);

  // Top performers
  const topPerformers = useMemo(() => {
    return enhancedMetrics.collaboratorData.slice(0, 5);
  }, [enhancedMetrics]);

  // Period comparison
  const periodComparison = useMemo(() => {
    const now = new Date();
    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentPeriodData = commissionsData.filter(c => 
      new Date(c.created_at) >= currentPeriodStart
    );
    
    const previousPeriodData = commissionsData.filter(c => {
      const date = new Date(c.created_at);
      return date >= previousPeriodStart && date <= previousPeriodEnd;
    });

    const currentAmount = currentPeriodData.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const previousAmount = previousPeriodData.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    
    const change = previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0;

    return {
      current: {
        amount: currentAmount,
        count: currentPeriodData.length
      },
      previous: {
        amount: previousAmount,
        count: previousPeriodData.length
      },
      change: {
        amount: change,
        count: previousPeriodData.length > 0 ? 
          ((currentPeriodData.length - previousPeriodData.length) / previousPeriodData.length) * 100 : 0
      }
    };
  }, [commissionsData]);

  // Filter actions
  const updateFilters = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({ period: 'month' });
  };

  // Metric selection
  const selectMetric = (metric: 'revenue' | 'deals' | 'performance') => {
    setSelectedMetric(metric);
  };

  // Export functionality
  const exportDashboard = async (format: 'pdf' | 'excel') => {
    // Implementation for exporting dashboard data
    if (format === 'excel') {
      // Use existing export logic from CommissionReportService
      console.log('Exporting to Excel...');
    } else {
      // Export to PDF
      console.log('Exporting to PDF...');
    }
  };

  return {
    // Data
    data: filteredData,
    allData: commissionsData,
    isLoading,
    
    // Metrics
    enhancedMetrics,
    dashboardStats,
    insights,
    topPerformers,
    periodComparison,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    
    // UI State
    selectedMetric,
    selectMetric,
    
    // Actions
    exportDashboard
  };
};