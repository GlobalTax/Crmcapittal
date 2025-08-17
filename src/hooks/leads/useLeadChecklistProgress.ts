import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type StageChecklistItem = Database['public']['Tables']['stage_checklist_items']['Row'];
type LeadChecklistProgress = Database['public']['Tables']['lead_checklist_progress']['Row'];

export interface LeadChecklistItemProgress extends StageChecklistItem {
  // Datos del progreso
  progress_id?: string;
  completed: boolean;
  completed_at?: string | null;
  completed_by?: string | null;
}

interface ToggleProgressData {
  lead_id: string;
  item_id: string;
  stage_id: string;
  completed: boolean;
}

export const useLeadChecklistProgress = (leadId: string, stageId: string) => {
  const queryClient = useQueryClient();

  // Obtener items de checklist con estado de progreso
  const progressQuery = useQuery({
    queryKey: ['lead-checklist-progress', leadId, stageId],
    queryFn: async () => {
      // Query para obtener items de checklist con LEFT JOIN al progreso
      const { data, error } = await supabase
        .from('stage_checklist_items')
        .select(`
          *,
          progress:lead_checklist_progress!left(
            id,
            completed,
            completed_at,
            completed_by
          )
        `)
        .eq('stage_id', stageId)
        .eq('is_active', true)
        .eq('progress.lead_id', leadId)
        .order('order_index');

      if (error) {
        console.error('Error fetching lead checklist progress:', error);
        throw new Error('Error al cargar progreso del checklist');
      }

      // Transformar los datos para el formato esperado
      const transformedData: LeadChecklistItemProgress[] = data.map(item => {
        const progress = Array.isArray(item.progress) ? item.progress[0] : item.progress;
        
        return {
          ...item,
          progress_id: progress?.id,
          completed: progress?.completed || false,
          completed_at: progress?.completed_at,
          completed_by: progress?.completed_by,
        };
      });

      return transformedData;
    },
    enabled: !!(leadId && stageId),
  });

  // Toggle completado de item
  const toggleProgressMutation = useMutation({
    mutationFn: async ({ lead_id, item_id, stage_id, completed }: ToggleProgressData) => {
      if (completed) {
        // Crear o actualizar registro como completado
        const { data, error } = await supabase
          .from('lead_checklist_progress')
          .upsert({
            lead_id,
            item_id,
            stage_id,
            completed: true,
            completed_at: new Date().toISOString(),
            completed_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        return { item_id, progress: data };
      } else {
        // Marcar como no completado o eliminar registro
        const { data, error } = await supabase
          .from('lead_checklist_progress')
          .upsert({
            lead_id,
            item_id,
            stage_id,
            completed: false,
            completed_at: null,
            completed_by: null,
          })
          .select()
          .single();

        if (error) throw error;
        return { item_id, progress: data };
      }
    },
    onMutate: async ({ item_id, completed }) => {
      // Optimistic update
      queryClient.setQueryData(['lead-checklist-progress', leadId, stageId], (old: LeadChecklistItemProgress[] = []) =>
        old.map(item => 
          item.id === item_id 
            ? {
                ...item,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
                completed_by: completed ? 'current-user' : null, // Se actualizará con la respuesta real
              }
            : item
        )
      );
    },
    onSuccess: ({ item_id, progress }) => {
      // Actualizar con datos reales del servidor
      queryClient.setQueryData(['lead-checklist-progress', leadId, stageId], (old: LeadChecklistItemProgress[] = []) =>
        old.map(item => 
          item.id === item_id 
            ? {
                ...item,
                progress_id: progress.id,
                completed: progress.completed,
                completed_at: progress.completed_at,
                completed_by: progress.completed_by,
              }
            : item
        )
      );
      
      toast.success(progress.completed ? 'Item marcado como completado' : 'Item marcado como pendiente');
    },
    onError: (error, { item_id }) => {
      console.error('Error toggling checklist progress:', error);
      toast.error('Error al actualizar progreso del checklist');
      
      // Revertir optimistic update
      queryClient.invalidateQueries({ queryKey: ['lead-checklist-progress', leadId, stageId] });
    },
  });

  // Marcar todos los items como completados
  const completeAllMutation = useMutation({
    mutationFn: async () => {
      const currentUser = (await supabase.auth.getUser()).data.user?.id;
      const now = new Date().toISOString();
      
      const items = progressQuery.data || [];
      const upsertData = items.map(item => ({
        lead_id: leadId,
        item_id: item.id,
        stage_id: stageId,
        completed: true,
        completed_at: now,
        completed_by: currentUser,
      }));

      const { error } = await supabase
        .from('lead_checklist_progress')
        .upsert(upsertData);

      if (error) throw error;
      return upsertData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-checklist-progress', leadId, stageId] });
      toast.success('Todos los items marcados como completados');
    },
    onError: (error) => {
      console.error('Error completing all items:', error);
      toast.error('Error al completar todos los items');
    },
  });

  // Calcular estadísticas de progreso
  const progressStats = {
    total: progressQuery.data?.length || 0,
    completed: progressQuery.data?.filter(item => item.completed).length || 0,
    required: progressQuery.data?.filter(item => item.is_required).length || 0,
    requiredCompleted: progressQuery.data?.filter(item => item.is_required && item.completed).length || 0,
  };

  const completionPercentage = progressStats.total > 0 
    ? Math.round((progressStats.completed / progressStats.total) * 100) 
    : 0;

  const requiredCompletionPercentage = progressStats.required > 0 
    ? Math.round((progressStats.requiredCompleted / progressStats.required) * 100) 
    : 100; // Si no hay items requeridos, está 100% completo

  return {
    // Queries
    items: progressQuery.data || [],
    isLoading: progressQuery.isLoading,
    error: progressQuery.error,
    refetch: progressQuery.refetch,

    // Progress stats
    stats: progressStats,
    completionPercentage,
    requiredCompletionPercentage,
    isRequiredComplete: requiredCompletionPercentage === 100,

    // Mutations
    toggleProgress: toggleProgressMutation.mutate,
    completeAll: completeAllMutation.mutate,

    // Loading states
    isToggling: toggleProgressMutation.isPending,
    isCompletingAll: completeAllMutation.isPending,
  };
};