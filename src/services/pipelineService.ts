
import { supabase } from '@/integrations/supabase/client';
import { PipelineType } from '@/types/Pipeline';

export const getDefaultPipelineByType = async (type: PipelineType) => {
  try {
    const { data, error } = await supabase
      .from('pipelines')
      .select('id')
      .eq('type', type)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching default pipeline for type ${type}:`, error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error(`Failed to get default pipeline for type ${type}:`, err);
    return null;
  }
};

export const ensureDefaultPipeline = async (type: PipelineType, name: string, description?: string) => {
  try {
    // First try to get existing pipeline
    const existingId = await getDefaultPipelineByType(type);
    if (existingId) {
      return existingId;
    }

    // Create default pipeline if it doesn't exist
    const { data, error } = await supabase
      .from('pipelines')
      .insert({
        name,
        type,
        description: description || `Pipeline por defecto para ${type}`,
        is_active: true
      })
      .select('id')
      .maybeSingle();

    if (error) {
      console.error(`Error creating default pipeline for type ${type}:`, error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error(`Failed to ensure default pipeline for type ${type}:`, err);
    return null;
  }
};
