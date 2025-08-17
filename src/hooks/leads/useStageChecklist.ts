import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type StageChecklistItem = Database['public']['Tables']['stage_checklist_items']['Row'];
type CreateChecklistItemData = Database['public']['Tables']['stage_checklist_items']['Insert'];
type UpdateChecklistItemData = Database['public']['Tables']['stage_checklist_items']['Update'];

interface ReorderItemData {
  id: string;
  order_index: number;
}

export const useStageChecklist = (stageId: string) => {
  const queryClient = useQueryClient();

  // Obtener items de checklist por stage_id
  const checklistQuery = useQuery({
    queryKey: ['stage-checklist', stageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stage_checklist_items')
        .select('*')
        .eq('stage_id', stageId)
        .eq('is_active', true)
        .order('order_index');

      if (error) {
        console.error('Error fetching stage checklist:', error);
        throw new Error('Error al cargar checklist de la etapa');
      }

      return data as StageChecklistItem[];
    },
    enabled: !!stageId,
  });

  // Crear nuevo item de checklist
  const createItemMutation = useMutation({
    mutationFn: async (data: CreateChecklistItemData) => {
      // Si no se especifica order_index, ponerlo al final
      if (data.order_index === undefined) {
        const maxOrder = Math.max(...(checklistQuery.data?.map(item => item.order_index) || [0]));
        data.order_index = maxOrder + 1;
      }

      const { data: result, error } = await supabase
        .from('stage_checklist_items')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData(['stage-checklist', stageId], (old: StageChecklistItem[] = []) => [
        ...old,
        newItem
      ]);
      toast.success('Item de checklist creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating checklist item:', error);
      toast.error('Error al crear item de checklist');
    },
  });

  // Actualizar item existente
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateChecklistItemData }) => {
      const { data: result, error } = await supabase
        .from('stage_checklist_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (updatedItem) => {
      queryClient.setQueryData(['stage-checklist', stageId], (old: StageChecklistItem[] = []) =>
        old.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      toast.success('Item de checklist actualizado');
    },
    onError: (error) => {
      console.error('Error updating checklist item:', error);
      toast.error('Error al actualizar item de checklist');
    },
  });

  // Eliminar item
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stage_checklist_items')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['stage-checklist', stageId], (old: StageChecklistItem[] = []) =>
        old.filter(item => item.id !== deletedId)
      );
      toast.success('Item de checklist eliminado');
    },
    onError: (error) => {
      console.error('Error deleting checklist item:', error);
      toast.error('Error al eliminar item de checklist');
    },
  });

  // Reordenar items
  const reorderItemsMutation = useMutation({
    mutationFn: async (reorderData: ReorderItemData[]) => {
      const updates = reorderData.map(({ id, order_index }) =>
        supabase
          .from('stage_checklist_items')
          .update({ order_index })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      
      // Verificar si alguna actualización falló
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Error reordenando items');
      }

      return reorderData;
    },
    onMutate: async (reorderData) => {
      // Optimistic update
      queryClient.setQueryData(['stage-checklist', stageId], (old: StageChecklistItem[] = []) => {
        const updated = [...old];
        reorderData.forEach(({ id, order_index }) => {
          const item = updated.find(i => i.id === id);
          if (item) {
            item.order_index = order_index;
          }
        });
        return updated.sort((a, b) => a.order_index - b.order_index);
      });
    },
    onSuccess: () => {
      toast.success('Items reordenados exitosamente');
    },
    onError: (error) => {
      console.error('Error reordering items:', error);
      toast.error('Error al reordenar items');
      // Refetch en caso de error para restaurar estado
      queryClient.invalidateQueries({ queryKey: ['stage-checklist', stageId] });
    },
  });

  return {
    // Queries
    items: checklistQuery.data || [],
    isLoading: checklistQuery.isLoading,
    error: checklistQuery.error,
    refetch: checklistQuery.refetch,

    // Mutations
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    reorderItems: reorderItemsMutation.mutate,

    // Loading states
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    isReordering: reorderItemsMutation.isPending,
  };
};