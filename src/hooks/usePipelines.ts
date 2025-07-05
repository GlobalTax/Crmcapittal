
import { useState, useEffect, useCallback } from 'react';
import { Pipeline, PipelineType } from '@/types/Pipeline';
import { supabase } from '@/integrations/supabase/client';
import { useSmartPolling } from './useSmartPolling';

export const usePipelines = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Smart polling configuration
  const smartPolling = useSmartPolling({
    baseInterval: 30000, // 30 seconds
    maxInterval: 300000, // 5 minutes
    pauseWhenHidden: true,
    pauseWhenInactive: true
  });

  const fetchPipelines = useCallback(async (retryCount = 0) => {
    try {
      console.log('usePipelines: Starting to fetch pipelines...', retryCount > 0 ? `(retry ${retryCount})` : '');
      
      if (retryCount === 0) {
        setLoading(true);
        setError(null);
      }

      // Wait for auth to be ready
      if (!authReady) {
        console.log('usePipelines: Waiting for auth to be ready...');
        return;
      }

      // Check authentication with session validation
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('usePipelines: Session error:', sessionError);
        throw sessionError;
      }

      if (!session?.user) {
        console.log('usePipelines: No authenticated session found');
        setPipelines([]);
        setLoading(false);
        return;
      }

      console.log('usePipelines: User authenticated:', session.user.id);
      
      // Add a small delay to ensure RLS context is ready
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      console.log('usePipelines: Query result:', { data, error, count: data?.length });

      if (error) {
        console.error('usePipelines: Database error:', error);
        
        // Handle authentication errors specifically
        if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
          console.log('usePipelines: Authentication error, refreshing session...');
          await supabase.auth.refreshSession();
          if (retryCount < 2) {
            setTimeout(() => fetchPipelines(retryCount + 1), 1000);
            return;
          }
        }
        
        // Retry on certain error codes with exponential backoff
        if ((error.code === 'PGRST116' || error.message?.includes('406') || error.message?.includes('400')) && retryCount < 3) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          console.log(`usePipelines: Retrying in ${delay}ms...`);
          setTimeout(() => fetchPipelines(retryCount + 1), delay);
          smartPolling.handleError();
          return;
        }
        
        throw error;
      }
      
      // Transform data to match Pipeline type
      const transformedData = (data || []).map(item => ({
        ...item,
        type: item.type as PipelineType
      }));
      
      console.log('usePipelines: Successfully loaded', transformedData.length, 'pipelines');
      setPipelines(transformedData);
      setError(null);
      smartPolling.handleSuccess();
      
    } catch (err) {
      console.error('usePipelines: Error fetching pipelines:', err);
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // Retry on network errors with exponential backoff
      if (retryCount < 3 && (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to'))) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(`usePipelines: Network error, retrying in ${delay}ms...`);
        setTimeout(() => fetchPipelines(retryCount + 1), delay);
        smartPolling.handleError();
        return;
      }
      
      setError(`Error al cargar los pipelines: ${errorMessage}`);
      setPipelines([]);
      smartPolling.handleError();
    } finally {
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  }, [authReady, smartPolling]);

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

  // Set up polling for real-time updates
  useEffect(() => {
    if (!authReady || loading || error) return;

    const interval = setInterval(() => {
      const pollingConfig = smartPolling.getPollingConfig();
      if (pollingConfig.enabled) {
        fetchPipelines();
      }
    }, smartPolling.currentInterval);

    return () => clearInterval(interval);
  }, [authReady, loading, error, smartPolling, fetchPipelines]);

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
