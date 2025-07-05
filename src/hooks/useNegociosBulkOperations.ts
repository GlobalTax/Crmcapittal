import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Negocio } from '@/types/Negocio';

export const useNegociosBulkOperations = (selectedIds: string[]) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const selectedCount = selectedIds.length;

  const bulkUpdateStage = useCallback(async (stageId: string, onRefresh: () => void) => {
    if (selectedIds.length === 0) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('negocios')
        .update({ stage_id: stageId })
        .in('id', selectedIds);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `${selectedIds.length} negocios actualizados`,
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los negocios",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, toast]);

  const bulkUpdatePriority = useCallback(async (priority: string, onRefresh: () => void) => {
    if (selectedIds.length === 0) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('negocios')
        .update({ prioridad: priority })
        .in('id', selectedIds);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Prioridad actualizada para ${selectedIds.length} negocios`,
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la prioridad",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, toast]);

  const bulkAssignOwner = useCallback(async (owner: string, onRefresh: () => void) => {
    if (selectedIds.length === 0) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('negocios')
        .update({ propietario_negocio: owner })
        .in('id', selectedIds);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `${selectedIds.length} negocios asignados a ${owner}`,
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo asignar el responsable",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, toast]);

  const bulkDelete = useCallback(async (onRefresh: () => void) => {
    if (selectedIds.length === 0) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('negocios')
        .update({ is_active: false })
        .in('id', selectedIds);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `${selectedIds.length} negocios eliminados`,
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar los negocios",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, toast]);

  return {
    isProcessing,
    selectedCount,
    bulkUpdateStage,
    bulkUpdatePriority,
    bulkAssignOwner,
    bulkDelete
  };
};