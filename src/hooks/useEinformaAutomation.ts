import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutomationRule {
  id: string;
  rule_name: string;
  rule_type: 'auto_sync' | 'risk_monitor' | 'budget_alert' | 'coverage_gap';
  trigger_conditions: any;
  action_config: any;
  is_active: boolean;
  priority: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface EinformaAlert {
  id: string;
  alert_type: 'risk_change' | 'budget_warning' | 'sync_error' | 'coverage_gap' | 'high_cost';
  company_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  alert_data: any;
  is_read: boolean;
  is_resolved: boolean;
  created_at: string;
  companies?: {
    name: string;
    nif?: string;
  };
}

interface SyncLog {
  id: string;
  sync_type: 'auto_company' | 'scheduled_update' | 'manual_bulk' | 'risk_monitor';
  companies_processed: number;
  companies_successful: number;
  companies_failed: number;
  total_cost: number;
  sync_status: 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
}

export const useEinformaAutomation = () => {
  const queryClient = useQueryClient();

  // Fetch automation rules
  const { data: automationRules, isLoading: rulesLoading } = useQuery({
    queryKey: ['einforma-automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('einforma_automation_rules')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as AutomationRule[];
    }
  });

  // Fetch unread alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['einforma-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('einforma_alerts')
        .select(`
          *,
          companies(name, nif)
        `)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as EinformaAlert[];
    }
  });

  // Fetch recent sync logs
  const { data: syncLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['einforma-sync-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('einforma_sync_log')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as SyncLog[];
    }
  });

  // Run auto-sync
  const autoSyncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('einforma-auto-sync');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Auto-sincronización completada: ${data.processed} empresas procesadas`);
      queryClient.invalidateQueries({ queryKey: ['einforma-sync-logs'] });
      queryClient.invalidateQueries({ queryKey: ['einforma-alerts'] });
    },
    onError: (error) => {
      console.error('Error in auto-sync:', error);
      toast.error('Error en la auto-sincronización');
    }
  });

  // Run risk monitoring
  const riskMonitorMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('einforma-risk-monitor');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Monitoreo de riesgo completado: ${data.alerts_created} alertas creadas`);
      queryClient.invalidateQueries({ queryKey: ['einforma-alerts'] });
    },
    onError: (error) => {
      console.error('Error in risk monitoring:', error);
      toast.error('Error en el monitoreo de riesgo');
    }
  });

  // Generate report
  const generateReportMutation = useMutation({
    mutationFn: async (reportType: 'weekly' | 'monthly') => {
      const { data, error } = await supabase.functions.invoke('einforma-scheduled-reports', {
        body: { report_type: reportType }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Reporte generado exitosamente');
      return data.report;
    },
    onError: (error) => {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    }
  });

  // Cost optimization analysis
  const costOptimizationMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('einforma-cost-optimizer');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const savings = data.report.potential_savings;
      toast.success(`Análisis completado: €${savings.toFixed(2)} de ahorro potencial identificado`);
      return data.report;
    },
    onError: (error) => {
      console.error('Error in cost optimization:', error);
      toast.error('Error en el análisis de optimización');
    }
  });

  // Mark alert as read
  const markAlertAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('einforma_alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['einforma-alerts'] });
    }
  });

  // Create or update automation rule
  const saveAutomationRule = useMutation({
    mutationFn: async (rule: Partial<AutomationRule> & { rule_name: string; rule_type: string }) => {
      if (rule.id) {
        const { data, error } = await supabase
          .from('einforma_automation_rules')
          .update(rule)
          .eq('id', rule.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const user = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from('einforma_automation_rules')
          .insert({ 
            rule_name: rule.rule_name,
            rule_type: rule.rule_type,
            trigger_conditions: rule.trigger_conditions || {},
            action_config: rule.action_config || {},
            is_active: rule.is_active ?? true,
            priority: rule.priority ?? 0,
            created_by: user.data.user?.id 
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast.success('Regla de automatización guardada');
      queryClient.invalidateQueries({ queryKey: ['einforma-automation-rules'] });
    },
    onError: (error) => {
      console.error('Error saving automation rule:', error);
      toast.error('Error al guardar la regla');
    }
  });

  return {
    // Data
    automationRules,
    alerts,
    syncLogs,
    
    // Loading states
    rulesLoading,
    alertsLoading,
    logsLoading,
    
    // Actions
    runAutoSync: autoSyncMutation.mutate,
    runRiskMonitor: riskMonitorMutation.mutate,
    generateReport: generateReportMutation.mutate,
    runCostOptimization: costOptimizationMutation.mutate,
    markAlertAsRead: markAlertAsRead.mutate,
    saveAutomationRule: saveAutomationRule.mutate,
    
    // Loading states for actions
    isAutoSyncing: autoSyncMutation.isPending,
    isMonitoringRisk: riskMonitorMutation.isPending,
    isGeneratingReport: generateReportMutation.isPending,
    isOptimizingCosts: costOptimizationMutation.isPending,
    
    // Computed metrics
    unreadAlertsCount: alerts?.length || 0,
    criticalAlertsCount: alerts?.filter(a => a.severity === 'critical').length || 0,
    lastSyncStatus: syncLogs?.[0]?.sync_status || 'unknown',
    totalCostThisMonth: syncLogs?.reduce((sum, log) => sum + log.total_cost, 0) || 0
  };
};