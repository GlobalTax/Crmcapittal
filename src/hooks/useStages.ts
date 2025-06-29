
import { useState, useEffect } from 'react';
import { Stage, PipelineType } from '@/types/Pipeline';
import { supabase } from '@/integrations/supabase/client';

export const useStages = (pipelineId?: string) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('stages')
        .select(`
          *,
          pipelines!pipeline_id(*)
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      // Only add pipeline filter if a valid UUID is provided
      if (pipelineId && pipelineId !== 'default' && pipelineId.match(/^[0-9a-f-]+$/i)) {
        query = query.eq('pipeline_id', pipelineId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to match our Stage type
      const transformedData = (data || []).map(stage => ({
        ...stage,
        pipeline: stage.pipelines ? {
          ...stage.pipelines,
          type: stage.pipelines.type as PipelineType
        } : undefined
      }));
      
      setStages(transformedData);
    } catch (err) {
      console.error('Error fetching stages:', err);
      setError('Error al cargar las etapas');
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
  }, [pipelineId]);

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
