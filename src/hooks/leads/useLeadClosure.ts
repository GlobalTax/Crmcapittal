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
      
      // Call appropriate RPC based on type
      switch (type) {
        case 'mandato_venta':
        case 'mandato_compra':
          const { data: mandateData, error: mandateError } = await supabase
            .rpc('create_mandate_from_lead', {
              lead_id: leadId,
              mandate_data: payload
            });
          
          if (mandateError) throw mandateError;
          result = { id: mandateData.id, type: 'mandate' };
          break;
          
        case 'valoracion':
          const { data: valuationData, error: valuationError } = await supabase
            .rpc('create_valuation_from_lead', {
              lead_id: leadId,
              valuation_data: payload
            });
          
          if (valuationError) throw valuationError;
          result = { id: valuationData.id, type: 'valuation' };
          break;
          
        default:
          throw new Error(`Tipo no soportado: ${type}`);
      }

      // Update lead if linking
      if (linkToLead) {
        const { error: updateError } = await supabase
          .from('leads')
          .update({ 
            stage: 'ganado',
            status: 'CONVERTED',
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