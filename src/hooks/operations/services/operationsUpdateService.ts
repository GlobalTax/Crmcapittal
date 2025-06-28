
import { supabase } from '@/integrations/supabase/client';
import { Operation } from '@/types/Operation';

export const updateOperationInDB = async (operationId: string, operationData: Partial<Operation>) => {
  const { data, error } = await supabase
    .from('operations')
    .update({ 
      ...operationData,
      updated_at: new Date().toISOString() 
    })
    .eq('id', operationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateOperationStatusInDB = async (operationId: string, newStatus: Operation['status']) => {
  const { data, error } = await supabase
    .from('operations')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', operationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateTeaserUrlInDB = async (operationId: string, teaserUrl: string | null) => {
  console.log('Actualizando teaser_url para operación:', operationId, 'nueva URL:', teaserUrl);
  
  const { data, error } = await supabase
    .from('operations')
    .update({ 
      teaser_url: teaserUrl,
      updated_at: new Date().toISOString() 
    })
    .eq('id', operationId)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando teaser_url:', error);
    throw error;
  }

  console.log('Teaser URL actualizada exitosamente:', data);
  return data;
};
