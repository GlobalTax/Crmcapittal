import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ChecklistItem {
  key: string;
  label: string;
  required?: boolean;
}

export interface StageConfig {
  checklist?: ChecklistItem[];
  [key: string]: any;
}

export interface PipelineStage {
  id: string;
  name: string;
  stage_order: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stage_config?: StageConfig;
}

export const usePipelineStages = () => {
  return useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('is_active', true)
        .order('stage_order');

      if (error) {
        console.error('Error fetching pipeline stages:', error);
        throw new Error('Error al cargar etapas del pipeline');
      }

      return data as PipelineStage[];
    },
  });
};