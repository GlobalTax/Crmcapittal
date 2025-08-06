/**
 * Hook for M&A Pipeline Stages
 * 
 * Provides integration with Supabase pipeline stages table
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PipelineStage {
  id: number;
  name: string;
  description: string;
  probability_pct: number;
  stage_order: number;
  condition_to_advance: string;
  automation: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch pipeline stages from Supabase
 */
export const usePipelineStages = () => {
  return useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ma_pipeline_stages')
        .select('*')
        .eq('is_active', true)
        .order('stage_order');

      if (error) {
        console.error('Error fetching pipeline stages:', error);
        throw new Error('Error al cargar las etapas del pipeline');
      }

      return data as PipelineStage[];
    },
  });
};

/**
 * Hook to get probability for a specific stage from database
 */
export const useStageProability = (stageName: string) => {
  return useQuery({
    queryKey: ['stage-probability', stageName],
    queryFn: async () => {
      if (!stageName) return 0;

      const { data, error } = await supabase
        .from('ma_pipeline_stages')
        .select('probability_pct')
        .eq('name', stageName)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching stage probability:', error);
        return 0;
      }

      return data?.probability_pct || 0;
    },
    enabled: !!stageName,
  });
};