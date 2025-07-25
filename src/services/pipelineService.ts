
import { supabase } from '@/integrations/supabase/client';
import { PipelineType } from '@/types/Pipeline';

// Valid pipeline types as defined in the database
const VALID_PIPELINE_TYPES: PipelineType[] = ['OPERACION', 'PROYECTO', 'LEAD', 'TARGET_COMPANY', 'DEAL', 'MANDATE'];

export const getDefaultPipelineByType = async (type: PipelineType) => {
  try {
    // Validate pipeline type before making the query
    if (!type || !VALID_PIPELINE_TYPES.includes(type)) {
      console.warn(`Invalid pipeline type provided: "${type}". Valid types are: ${VALID_PIPELINE_TYPES.join(', ')}`);
      return null;
    }

    console.log(`Fetching default pipeline for valid type: ${type}`);
    
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

    const result = data?.id || null;
    console.log(`Default pipeline for type ${type}:`, result);
    return result;
  } catch (err) {
    console.error(`Failed to get default pipeline for type ${type}:`, err);
    return null;
  }
};

export const ensureDefaultPipeline = async (type: PipelineType, name: string, description?: string) => {
  try {
    // Validate pipeline type
    if (!type || !VALID_PIPELINE_TYPES.includes(type)) {
      console.error(`Cannot create pipeline with invalid type: "${type}"`);
      return null;
    }

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

    const result = data?.id || null;
    console.log(`Created default pipeline for type ${type}:`, result);
    return result;
  } catch (err) {
    console.error(`Failed to ensure default pipeline for type ${type}:`, err);
    return null;
  }
};
