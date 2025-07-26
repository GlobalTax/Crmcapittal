import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/useToast';

export interface ReconversionWorkflowHook {
  createReconversion: (data: any) => Promise<string | null>;
  updateSubfase: (reconversionId: string, subfase: string) => Promise<boolean>;
  triggerMatching: (reconversionId: string) => Promise<any>;
  closeReconversion: (reconversionId: string, closureData: any) => Promise<boolean>;
  sendNDA: (reconversionId: string, ndaData: any) => Promise<boolean>;
  loading: boolean;
}

export function useReconversionWorkflow(): ReconversionWorkflowHook {
  const [loading, setLoading] = useState(false);

  const callWorkflowFunction = async (action: string, reconversionId?: string, data?: any) => {
    try {
      setLoading(true);
      
      const { data: result, error } = await supabase.functions.invoke('reconversion-workflow', {
        body: {
          action,
          reconversionId,
          data
        }
      });

      if (error) {
        console.error(`Error in ${action}:`, error);
        toast({
          title: 'Error en workflow',
          description: `Error al ejecutar ${action}: ${error.message}`,
          variant: 'destructive'
        });
        return null;
      }

      return result.data;
    } catch (err) {
      console.error(`Exception in ${action}:`, err);
      toast({
        title: 'Error de conexión',
        description: 'Error al conectar con el servidor',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createReconversion = async (data: any): Promise<string | null> => {
    const result = await callWorkflowFunction('create', undefined, data);
    
    if (result?.reconversionId) {
      toast({
        title: 'Reconversión creada',
        description: 'La reconversión ha sido creada exitosamente con su workflow inicial',
        variant: 'default'
      });
      return result.reconversionId;
    }
    
    return null;
  };

  const updateSubfase = async (reconversionId: string, subfase: string): Promise<boolean> => {
    const result = await callWorkflowFunction('update_subfase', reconversionId, { subfase });
    
    if (result?.success) {
      toast({
        title: 'Subfase actualizada',
        description: `La subfase ha sido cambiada a ${subfase}`,
        variant: 'default'
      });
      return true;
    }
    
    return false;
  };

  const triggerMatching = async (reconversionId: string): Promise<any> => {
    const result = await callWorkflowFunction('trigger_matching', reconversionId);
    
    if (result) {
      const count = result.target_count || 0;
      toast({
        title: 'Matching completado',
        description: `Se encontraron ${count} posibles targets`,
        variant: count > 0 ? 'default' : 'destructive'
      });
      return result;
    }
    
    return null;
  };

  const closeReconversion = async (reconversionId: string, closureData: any): Promise<boolean> => {
    const result = await callWorkflowFunction('close', reconversionId, closureData);
    
    if (result?.success) {
      toast({
        title: 'Reconversión cerrada',
        description: 'La reconversión ha sido cerrada exitosamente',
        variant: 'default'
      });
      return true;
    }
    
    return false;
  };

  const sendNDA = async (reconversionId: string, ndaData: any): Promise<boolean> => {
    const result = await callWorkflowFunction('send_nda', reconversionId, ndaData);
    
    if (result?.success) {
      const emailStatus = result.emailSent ? 'enviado' : 'falló el envío';
      toast({
        title: 'NDA procesado',
        description: `NDA registrado y ${emailStatus} a ${result.recipient}`,
        variant: result.emailSent ? 'default' : 'destructive'
      });
      return true;
    }
    
    return false;
  };

  return {
    createReconversion,
    updateSubfase,
    triggerMatching,
    closeReconversion,
    sendNDA,
    loading
  };
}