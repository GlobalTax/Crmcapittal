/**
 * Commission Reports Hook
 * 
 * Custom hook for managing commission report data and operations
 */

import { useState, useMemo } from 'react';
import { useCommissions } from '@/hooks/useCommissions';
import { 
  CommissionReportService, 
  ReportFilters, 
  CommissionData 
} from '../services/CommissionReportService';

export const useCommissionReports = () => {
  const { commissions: commissionsData = [], loading: isLoading } = useCommissions();
  
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    collaboratorId: null,
    calculationType: null,
    status: null,
    recipientType: null
  });

  // Transform commission data to match report format
  const transformedData = useMemo(() => {
    return commissionsData.map(commission => ({
      id: commission.id,
      amount: commission.commission_amount || 0, // Use commission amount as base amount
      commission_percentage: commission.commission_percentage || 0,
      commission_amount: commission.commission_amount || 0,
      collaborator_name: commission.recipient_name || 
                        commission.collaborators?.name || 
                        `${commission.user_profiles?.first_name || ''} ${commission.user_profiles?.last_name || ''}`.trim() || 
                        'N/A',
      deal_id: commission.deal_id || '',
      created_at: commission.created_at || new Date().toISOString(),
      status: commission.status || 'pending'
    }));
  }, [commissionsData]);

  // Filtered data
  const filteredData = useMemo(() => {
    return CommissionReportService.filterData(transformedData, filters);
  }, [transformedData, filters]);

  // Statistics
  const stats = useMemo(() => {
    return CommissionReportService.calculateStats(filteredData);
  }, [filteredData]);

  // Chart data
  const chartData = useMemo(() => {
    return CommissionReportService.generateChartData(filteredData);
  }, [filteredData]);

  // Export functions
  const exportToExcel = (filename?: string) => {
    CommissionReportService.exportToExcel(filteredData, filename);
  };

  const exportToPDF = (filename?: string) => {
    CommissionReportService.exportToPDF(filteredData, filters, filename);
  };

  // Filter actions
  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      collaboratorId: null,
      calculationType: null,
      status: null,
      recipientType: null
    });
  };

  const applyFilters = () => {
    // Trigger a re-render by updating state
    setFilters(prev => ({ ...prev }));
  };

  return {
    // Data
    data: filteredData,
    allData: commissionsData,
    isLoading,
    
    // Filters
    filters,
    updateFilters,
    clearFilters,
    applyFilters,
    
    // Statistics
    stats,
    chartData,
    
    // Export functions
    exportToExcel,
    exportToPDF
  };
};