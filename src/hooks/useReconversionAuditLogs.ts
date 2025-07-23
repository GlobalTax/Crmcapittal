
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

export interface ReconversionAuditLog {
  id: string;
  reconversion_id: string;
  action_type: string;
  action_description: string;
  old_data?: any;
  new_data?: any;
  user_id: string;
  user_email?: string;
  ip_address?: string | null;
  user_agent?: string;
  severity: string;
  metadata?: any;
  created_at: string;
}

export function useReconversionAuditLogs(reconversionId?: string) {
  const [logs, setLogs] = useState<ReconversionAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { role } = useUserRole();

  const fetchLogs = async () => {
    // Solo admins pueden ver los logs de auditoría
    if (role !== 'admin' && role !== 'superadmin') {
      setLogs([]);
      setLoading(false);
      return;
    }

    if (!reconversionId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reconversion_audit_logs')
        .select('*')
        .eq('reconversion_id', reconversionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs((data || []) as ReconversionAuditLog[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (
    reconversionId: string,
    actionType: string,
    actionDescription: string,
    oldData?: any,
    newData?: any,
    severity: string = 'info',
    metadata?: any
  ) => {
    try {
      const { error } = await supabase.rpc('log_reconversion_audit', {
        p_reconversion_id: reconversionId,
        p_action_type: actionType,
        p_action_description: actionDescription,
        p_old_data: oldData,
        p_new_data: newData,
        p_severity: severity,
        p_metadata: metadata || {}
      });

      if (error) throw error;
      
      // Refrescar logs si estamos viendo esta reconversión
      if (reconversionId === reconversionId) {
        fetchLogs();
      }
    } catch (err) {
      console.error('Error logging audit action:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [reconversionId, role]);

  return {
    logs,
    loading,
    error,
    logAction,
    refetch: fetchLogs,
    canViewLogs: role === 'admin' || role === 'superadmin'
  };
}
