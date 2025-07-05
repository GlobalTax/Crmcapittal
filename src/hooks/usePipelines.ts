
import { useState, useEffect } from 'react';
import { Pipeline, PipelineType } from '@/types/Pipeline';
import { supabase } from '@/integrations/supabase/client';

export const usePipelines = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipelines = async () => {
    try {
      console.log('usePipelines: Starting to fetch pipelines...');
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('usePipelines: No authenticated user found');
        setPipelines([]);
        return;
      }

      console.log('usePipelines: User authenticated:', user.id);
      
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      console.log('usePipelines: Query result:', { data, error });

      if (error) {
        console.error('usePipelines: Database error:', error);
        setError(`Error al cargar los pipelines: ${error.message}`);
        setPipelines([]);
        return;
      }
      
      // Transform data to match Pipeline type
      const transformedData = (data || []).map(item => ({
        ...item,
        type: item.type as PipelineType
      }));
      
      console.log('usePipelines: Processed pipelines:', transformedData);
      setPipelines(transformedData);
    } catch (err) {
      console.error('usePipelines: Error fetching pipelines:', err);
      setError(`Error al cargar los pipelines: ${err.message || err}`);
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  };

  const getPipelinesByType = (type: PipelineType) => {
    return pipelines.filter(pipeline => pipeline.type === type);
  };

  const createPipeline = async (pipelineData: Omit<Pipeline, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('pipelines')
        .insert([pipelineData])
        .select()
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const transformedData = {
          ...data,
          type: data.type as PipelineType
        };
        
        setPipelines(prev => [...prev, transformedData]);
        return { data: transformedData, error: null };
      }
      
      return { data: null, error: 'No se pudo crear el pipeline' };
    } catch (err) {
      console.error('Error creating pipeline:', err);
      return { data: null, error: 'Error al crear el pipeline' };
    }
  };

  const updatePipeline = async (id: string, updates: Partial<Pipeline>) => {
    try {
      const { data, error } = await supabase
        .from('pipelines')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const transformedData = {
          ...data,
          type: data.type as PipelineType
        };
        
        setPipelines(prev => prev.map(p => p.id === id ? { ...p, ...transformedData } : p));
        return { data: transformedData, error: null };
      }
      
      return { data: null, error: 'No se pudo actualizar el pipeline' };
    } catch (err) {
      console.error('Error updating pipeline:', err);
      return { data: null, error: 'Error al actualizar el pipeline' };
    }
  };

  const deletePipeline = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pipelines')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setPipelines(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting pipeline:', err);
      return { error: 'Error al eliminar el pipeline' };
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  return {
    pipelines,
    loading,
    error,
    getPipelinesByType,
    createPipeline,
    updatePipeline,
    deletePipeline,
    refetch: fetchPipelines
  };
};
