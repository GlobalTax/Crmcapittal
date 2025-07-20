import { useQuery } from '@tanstack/react-query';

export interface PipelineStage {
  id: string;
  name: string;
  stage_order: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePipelineStages = () => {
  const {
    data: stages = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['pipeline_stages'],
    queryFn: async () => {
      // For now, return mock data since the table might not be reflected in types yet
      return [
        { id: '1', name: 'Pipeline', stage_order: 1, color: '#6B7280', is_active: true, created_at: '', updated_at: '' },
        { id: '2', name: 'Cualificado', stage_order: 2, color: '#3B82F6', is_active: true, created_at: '', updated_at: '' },
        { id: '3', name: 'Propuesta', stage_order: 3, color: '#F59E0B', is_active: true, created_at: '', updated_at: '' },
        { id: '4', name: 'Negociación', stage_order: 4, color: '#EF4444', is_active: true, created_at: '', updated_at: '' },
        { id: '5', name: 'Ganado', stage_order: 5, color: '#10B981', is_active: true, created_at: '', updated_at: '' },
        { id: '6', name: 'Perdido', stage_order: 6, color: '#6B7280', is_active: true, created_at: '', updated_at: '' },
      ] as PipelineStage[];
    },
  });

  return {
    stages,
    isLoading,
    error,
    refetch
  };
};