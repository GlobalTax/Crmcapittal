import { useState, useEffect } from 'react';
import { Stage, PipelineType } from '@/types/Pipeline';
import { supabase } from '@/integrations/supabase/client';
import { getDefaultPipelineByType } from '@/services/pipelineService';

const VALID_PIPELINE_TYPES: PipelineType[] = ['OPERACION', 'PROYECTO', 'LEAD', 'TARGET_COMPANY', 'DEAL'];

export const useStages = (pipelineTypeOrId?: string | PipelineType) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Enhanced logging to track what's being passed
      console.log('useStages called with parameter:', {
        pipelineTypeOrId,
        type: typeof pipelineTypeOrId,
        isValidType: VALID_PIPELINE_TYPES.includes(pipelineTypeOrId as PipelineType)
      });
      
      // Si no se proporciona parámetro, no hacer consulta
      if (!pipelineTypeOrId) {
        console.log('No pipeline type or ID provided, skipping stages fetch');
        setStages([]);
        return;
      }

      // Check authentication first to prevent RLS issues
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('useStages: No authenticated user found');
        setError('Usuario no autenticado');
        setStages([]);
        return;
      }

      let query = supabase
        .from('stages')
        .select(`
          *,
          pipelines!pipeline_id(*)
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      // Check if it's a UUID (pipeline ID) or a pipeline type
      const isUUID = typeof pipelineTypeOrId === 'string' && 
                     pipelineTypeOrId.length === 36 && 
                     pipelineTypeOrId.includes('-');
      
      if (isUUID) {
        // Direct pipeline ID
        console.log('Using direct pipeline ID:', pipelineTypeOrId);
        query = query.eq('pipeline_id', pipelineTypeOrId);
      } else {
        // Pipeline type - validate it first
        const pipelineType = pipelineTypeOrId as PipelineType;
        
        if (!VALID_PIPELINE_TYPES.includes(pipelineType)) {
          console.error(`Invalid or undefined pipeline type: "${pipelineType}". Valid types are: ${VALID_PIPELINE_TYPES.join(', ')}`);
          setError(`Tipo de pipeline inválido: ${pipelineType}`);
          setStages([]);
          return;
        }

        console.log('Fetching default pipeline for valid type:', pipelineType);
        
        // Get the default pipeline for this type
        const defaultPipelineId = await getDefaultPipelineByType(pipelineType);
        
        if (!defaultPipelineId) {
          console.warn(`No default pipeline found for type: ${pipelineType}`);
          // Don't set as error, just return empty stages
          setStages([]);
          return;
        }

        console.log('Using default pipeline ID:', defaultPipelineId);
        query = query.eq('pipeline_id', defaultPipelineId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching stages:', error);
        throw error;
      }
      
      // Transform the data to match our Stage type
      const transformedData = (data || []).map(stage => ({
        ...stage,
        pipeline: stage.pipelines ? {
          ...stage.pipelines,
          type: stage.pipelines.type as PipelineType
        } : undefined
      }));
      
      console.log(`Fetched ${transformedData.length} stages for pipeline`);
      setStages(transformedData);
    } catch (err) {
      console.error('Error in fetchStages:', err);
      setError('Error al cargar las etapas');
      setStages([]);
    } finally {
      setLoading(false);
    }
  };

  const getStagesByPipeline = (pipelineId: string) => {
    return stages.filter(stage => stage.pipeline_id === pipelineId);
  };

  const createStage = async (stageData: Omit<Stage, 'id' | 'created_at' | 'updated_at' | 'pipeline'>) => {
    try {
      const { data, error } = await supabase
        .from('stages')
        .insert([stageData])
        .select()
        .single();

      if (error) throw error;
      
      setStages(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index));
      return { data, error: null };
    } catch (err) {
      console.error('Error creating stage:', err);
      return { data: null, error: 'Error al crear la etapa' };
    }
  };

  const updateStage = async (id: string, updates: Partial<Stage>) => {
    try {
      const { data, error } = await supabase
        .from('stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setStages(prev => prev.map(s => s.id === id ? { ...s, ...data } : s)
        .sort((a, b) => a.order_index - b.order_index));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating stage:', err);
      return { data: null, error: 'Error al actualizar la etapa' };
    }
  };

  const deleteStage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stages')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setStages(prev => prev.filter(s => s.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting stage:', err);
      return { error: 'Error al eliminar la etapa' };
    }
  };

  const reorderStages = async (stageIds: string[]) => {
    try {
      const updates = stageIds.map((id, index) => ({
        id,
        order_index: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('stages')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      await fetchStages(); // Refresh to get updated order
      return { error: null };
    } catch (err) {
      console.error('Error reordering stages:', err);
      return { error: 'Error al reordenar las etapas' };
    }
  };

  useEffect(() => {
    fetchStages();
  }, [pipelineTypeOrId]);

  return {
    stages,
    loading,
    error,
    getStagesByPipeline,
    createStage,
    updateStage,
    deleteStage,
    reorderStages,
    refetch: fetchStages
  };
};
