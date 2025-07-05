
import { useState, useEffect, useCallback } from 'react';
import { Pipeline, PipelineType } from '@/types/Pipeline';
import { supabase } from '@/integrations/supabase/client';
import { supabaseQuery } from '@/services/requestManager';

export const usePipelines = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Optimized polling with much longer intervals to reduce rate limiting
  const [lastFetch, setLastFetch] = useState<number>(0);
  const pollingInterval = 300000; // 5 minutes - much more conservative

  const fetchPipelines = useCallback(async () => {
    if (!authReady) {
      console.log('usePipelines: Waiting for auth to be ready...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await supabaseQuery<Pipeline[]>(
        'pipelines',
        (query) => query
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true }),
        'pipelines_active',
        'medium',
        180000 // 3 minutes cache
      );

      // Transform data to match Pipeline type
      const transformedData = (data || []).map(item => ({
        ...item,
        type: item.type as PipelineType
      }));
      
      console.log('usePipelines: Successfully loaded', transformedData.length, 'pipelines');
      setPipelines(transformedData);
      setError(null);
      setLastFetch(Date.now());
      
    } catch (err) {
      console.error('usePipelines: Error fetching pipelines:', err);
      setError(`Error al cargar los pipelines: ${err instanceof Error ? err.message : String(err)}`);
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  }, [authReady]);

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

  // Set up auth state listener and initialize
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check for existing session first
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setAuthReady(true);
          console.log('usePipelines: Auth initialized, session exists:', !!session);
        }
      } catch (error) {
        console.error('usePipelines: Auth initialization error:', error);
        if (mounted) {
          setAuthReady(true); // Still set ready to avoid hanging
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('usePipelines: Auth state changed:', event, !!session);
      if (mounted) {
        setAuthReady(true);
        
        // Refetch pipelines when auth state changes
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setTimeout(() => fetchPipelines(), 500);
        } else if (event === 'SIGNED_OUT') {
          setPipelines([]);
          setError(null);
          setLoading(false);
        }
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchPipelines]);

  // Fetch pipelines when auth is ready
  useEffect(() => {
    if (authReady) {
      fetchPipelines();
    }
  }, [authReady, fetchPipelines]);

  // Set up optimized polling with longer intervals
  useEffect(() => {
    if (!authReady || loading) return;

    const interval = setInterval(() => {
      // Only fetch if data is stale (older than polling interval)
      const isStale = Date.now() - lastFetch > pollingInterval;
      if (isStale && !document.hidden) {
        fetchPipelines();
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [authReady, loading, fetchPipelines, lastFetch, pollingInterval]);

  return {
    pipelines,
    loading: loading && authReady, // Don't show loading if auth isn't ready
    error,
    authReady,
    getPipelinesByType,
    createPipeline,
    updatePipeline,
    deletePipeline,
    refetch: fetchPipelines
  };
};
