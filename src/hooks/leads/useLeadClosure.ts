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

export const useLeadClosure = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const createFromLeadMutation = useMutation({
    mutationFn: async ({ leadId, type, payload, linkToLead }: CreateFromLeadParams) => {
      let result;
      
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

      return result;
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
    onError: (error) => {
      console.error('Error creating from lead:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el elemento desde el lead",
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
    isCreating: createFromLeadMutation.isPending
  };
};