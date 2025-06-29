
import { useState, useEffect } from 'react';
import { Pipeline, PipelineType } from '@/types/Pipeline';
import { supabase } from '@/integrations/supabase/client';

export const usePipelines = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform data to match Pipeline type
      const transformedData = (data || []).map(item => ({
        ...item,
        type: item.type as PipelineType
      }));
      
      setPipelines(transformedData);
    } catch (err) {
      console.error('Error fetching pipelines:', err);
      setError('Error al cargar los pipelines');
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
        .single();

      if (error) throw error;
      
      const transformedData = {
        ...data,
        type: data.type as PipelineType
      };
      
      setPipelines(prev => [...prev, transformedData]);
      return { data: transformedData, error: null };
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
        .single();

      if (error) throw error;
      
      const transformedData = {
        ...data,
        type: data.type as PipelineType
      };
      
      setPipelines(prev => prev.map(p => p.id === id ? { ...p, ...transformedData } : p));
      return { data: transformedData, error: null };
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
