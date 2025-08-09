import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutomationResult {
  success: boolean;
  message: string;
  results?: {
    processed_companies?: number;
    new_matches?: number;
    updated_matches?: number;
  };
}

export const useCRMAutomations = () => {
  const [isRunningBackfill, setIsRunningBackfill] = useState(false);
  const [isRunningRematching, setIsRunningRematching] = useState(false);
  const [isProcessingChange, setIsProcessingChange] = useState(false);

  const runBackfillAutomation = async (): Promise<AutomationResult> => {
    try {
      setIsRunningBackfill(true);
      
      const { data, error } = await supabase.functions.invoke('crm-automation-backfill', {
        body: { manual_trigger: true }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Automatización de backfill completada exitosamente');
      return data;

    } catch (error: any) {
      console.error('Error en automatización de backfill:', error);
      toast.error('Error ejecutando automatización de backfill');
      throw error;
    } finally {
      setIsRunningBackfill(false);
    }
  };

  const runRematchingAutomation = async (
    companyId?: string, 
    mandateId?: string, 
    fullRecalculate?: boolean
  ): Promise<AutomationResult> => {
    try {
      setIsRunningRematching(true);
      
      const { data, error } = await supabase.functions.invoke('crm-rematching', {
        body: {
          company_id: companyId,
          mandate_id: mandateId,
          recalculate_all_matches: fullRecalculate
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Re-matching completado exitosamente');
      return data;

    } catch (error: any) {
      console.error('Error en re-matching:', error);
      toast.error('Error ejecutando re-matching');
      throw error;
    } finally {
      setIsRunningRematching(false);
    }
  };

  const processCompanyChange = async (
    companyId: string,
    fieldChanged: string,
    oldValue: any,
    newValue: any,
    changeSource: 'einforma' | 'manual' | 'external' = 'manual'
  ): Promise<AutomationResult> => {
    try {
      setIsProcessingChange(true);
      
      const { data, error } = await supabase.functions.invoke('crm-change-watcher', {
        body: {
          company_id: companyId,
          field_changed: fieldChanged,
          old_value: oldValue,
          new_value: newValue,
          change_source: changeSource
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;

    } catch (error: any) {
      console.error('Error procesando cambio de empresa:', error);
      toast.error('Error procesando cambio de empresa');
      throw error;
    } finally {
      setIsProcessingChange(false);
    }
  };

  const getMandateMatches = async (mandateId: string) => {
    try {
      const { data, error } = await supabase
        .from('mandate_matches')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            industry,
            annual_revenue,
            company_size,
            lead_score
          )
        `)
        .eq('mandate_id', mandateId)
        .order('match_score', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error obteniendo matches:', error);
      toast.error('Error obteniendo matches del mandato');
      throw error;
    }
  };

  const updateMatchStatus = async (
    matchId: string, 
    status: 'new' | 'reviewed' | 'contacted' | 'qualified' | 'rejected',
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('mandate_matches')
        .update({
          status,
          notes,
          reviewed_by: status !== 'new' ? (await supabase.auth.getUser()).data.user?.id : null,
          reviewed_at: status !== 'new' ? new Date().toISOString() : null
        })
        .eq('id', matchId);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Estado del match actualizado');
    } catch (error: any) {
      console.error('Error actualizando estado del match:', error);
      toast.error('Error actualizando estado del match');
      throw error;
    }
  };

  const getAutomationLogs = async (limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error obteniendo logs de automatización:', error);
      throw error;
    }
  };

  return {
    runBackfillAutomation,
    runRematchingAutomation,
    processCompanyChange,
    getMandateMatches,
    updateMatchStatus,
    getAutomationLogs,
    isRunningBackfill,
    isRunningRematching,
    isProcessingChange,
  };
};