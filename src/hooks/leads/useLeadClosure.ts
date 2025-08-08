import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CreateFromLeadParams {
  leadId: string;
  type: string;
  payload: any;
  linkToLead: boolean;
}

// Export util to log when the dialog is opened (for adoption metrics)
export const logLeadClosureDialogOpened = async (leadId?: string) => {
  try {
    const environment = (import.meta as any).env?.MODE || 'development';
    const { data: { user } } = await supabase.auth.getUser();
    console.log('[feature_analytics] dialog_opened', { leadId, environment });

    await supabase.from('feature_analytics').insert({
      feature_key: 'lead_closure_dialog',
      action: 'dialog_opened',
      metadata: { environment, leadId },
      user_id: user?.id,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Failed to log dialog_opened:', e);
  }
};

export const useLeadClosure = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const createFromLeadMutation = useMutation({
    mutationFn: async ({ leadId, type, payload, linkToLead }: CreateFromLeadParams) => {
      let result;
      
      try {
        // Use generic create_entity_from_lead function
        const { data, error } = await supabase
          .rpc('create_entity_from_lead', {
            p_lead_id: leadId,
            p_type: type,
            p_payload: payload,
            p_link: linkToLead
          });
        
        if (error) throw error;
        result = { id: data, type: type };

        // Update lead if linking
        if (linkToLead) {
          const { error: updateError } = await supabase
            .from('leads')
            .update({ 
              stage: 'ganado',
              status: 'CONVERTED' as any,
              conversion_date: new Date().toISOString()
            })
            .eq('id', leadId);
            
          if (updateError) throw updateError;
        }

        // Log successful creation
        await logFeatureUsage('lead_closure_dialog', 'entity_created', {
          leadId,
          entityType: type,
          linkToLead,
          success: true
        });

        return result;
      } catch (error: any) {
        console.error('RPC failed, attempting fallback:', error);
        
        // Fallback: close lead without creating entity
        if (linkToLead) {
          const { error: fallbackError } = await supabase
            .from('leads')
            .update({ 
              stage: 'perdido',
              status: 'LOST' as any,
              lost_reason: 'Error en conversión - procesado manualmente'
            })
            .eq('id', leadId);
            
          if (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
          }
        }

        // Log the failure with environment
        await logFeatureUsage('lead_closure_dialog', 'entity_creation_failed', {
          leadId,
          entityType: type,
          linkToLead,
          success: false,
          error: error?.message
        });

        throw new Error('Error en la conversión. El lead se ha marcado como perdido para revisión manual.');
      }
    },
    onSuccess: (data, variables) => {
      const { type, linkToLead } = variables;
      
      if (linkToLead) {
        // Navigate to the created entity
        const route = type === 'valuation' ? `/valoraciones/${data.id}` : `/mandatos/${data.id}`;
        navigate(route);
        
        toast({
          title: "Navegación automática",
          description: `Redirigiendo al ${type === 'valuation' ? 'valoración' : 'mandato'} creado`,
        });
      } else {
        toast({
          title: "Creado exitosamente",
          description: `${type === 'valuation' ? 'Valoración' : 'Mandato'} creado correctamente`,
        });
      }
    },
    onError: (error: any) => {
      console.error('Error creating from lead:', error);
      toast({
        title: "Error en conversión",
        description: error.message || "No se pudo crear el elemento desde el lead",
        variant: "destructive"
      });
    }
  });

  const createFromLead = async (
    leadId: string, 
    type: string, 
    payload: any, 
    linkToLead: boolean = true
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      const result = await createFromLeadMutation.mutateAsync({
        leadId,
        type,
        payload,
        linkToLead
      });
      
      return { success: true, id: result.id };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  };

  return {
    createFromLead,
    isCreating: (createFromLeadMutation as any).isPending
  };
};

// Analytics helper function
const logFeatureUsage = async (feature: string, action: string, metadata: any) => {
  try {
    const environment = (import.meta as any).env?.MODE || 'development';
    const { data: { user } } = await supabase.auth.getUser();
    console.log('[feature_analytics]', feature, action, { ...metadata, environment });

    await supabase.from('feature_analytics').insert({
      feature_key: feature,
      action,
      metadata: { ...metadata, environment },
      user_id: user?.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log feature usage:', error);
  }
};
