import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StageAction, ActionConfig } from '@/types/StageAction';
import { toast } from 'sonner';

export const useStageActions = (stageId?: string) => {
  const [actions, setActions] = useState<StageAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStageActions = async (targetStageId?: string) => {
    if (!targetStageId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('stage_actions')
        .select('*')
        .eq('stage_id', targetStageId)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      setActions((data || []) as StageAction[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar acciones';
      setError(errorMessage);
      console.error('Error fetching stage actions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createStageAction = async (actionData: Omit<StageAction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('stage_actions')
        .insert([{
          ...actionData,
          action_config: actionData.action_config as any
        }])
        .select()
        .single();

      if (error) throw error;
      
      setActions(prev => [...prev, data as StageAction]);
      toast.success('Acción creada exitosamente');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear acción';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateStageAction = async (actionId: string, updates: Partial<StageAction>) => {
    try {
      const { data, error } = await supabase
        .from('stage_actions')
        .update({
          ...updates,
          action_config: updates.action_config as any
        })
        .eq('id', actionId)
        .select()
        .single();

      if (error) throw error;
      
      setActions(prev => prev.map(action => 
        action.id === actionId ? { ...action, ...(data as StageAction) } : action
      ));
      toast.success('Acción actualizada exitosamente');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar acción';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteStageAction = async (actionId: string) => {
    try {
      const { error } = await supabase
        .from('stage_actions')
        .update({ is_active: false })
        .eq('id', actionId);

      if (error) throw error;
      
      setActions(prev => prev.filter(action => action.id !== actionId));
      toast.success('Acción eliminada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar acción';
      toast.error(errorMessage);
      throw err;
    }
  };

  const reorderStageActions = async (actionIds: string[]) => {
    try {
      const updates = actionIds.map((actionId, index) => ({
        id: actionId,
        order_index: index
      }));

      for (const update of updates) {
        await supabase
          .from('stage_actions')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      // Refetch to get updated order
      await fetchStageActions(stageId);
      toast.success('Orden de acciones actualizado');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reordenar acciones';
      toast.error(errorMessage);
      throw err;
    }
  };

  const executeAction = async (actionId: string, context?: any) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) {
      throw new Error('Acción no encontrada');
    }

    try {
      // Aquí implementarías la lógica específica para cada tipo de acción
      switch (action.action_type) {
        case 'automatic':
          await executeAutomaticAction(action, context);
          break;
        case 'manual':
          await executeManualAction(action, context);
          break;
        case 'validation':
          return await executeValidation(action, context);
        default:
          throw new Error(`Tipo de acción no soportado: ${action.action_type}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al ejecutar acción';
      toast.error(errorMessage);
      throw err;
    }
  };

  const executeAutomaticAction = async (action: StageAction, context?: any) => {
    const { action_config } = action;
    
    // Implementar lógica para acciones automáticas
    if (action_config.email_template_id) {
      // Enviar email
      console.log('Enviando email con template:', action_config.email_template_id);
    }
    
    if (action_config.task_description) {
      // Crear tarea
      console.log('Creando tarea:', action_config.task_description);
    }
    
    if (action_config.notification_message) {
      // Mostrar notificación
      toast.info(action_config.notification_message);
    }
  };

  const executeManualAction = async (action: StageAction, context?: any) => {
    const { action_config } = action;
    
    if (action_config.confirmation_message) {
      const confirmed = window.confirm(action_config.confirmation_message);
      if (!confirmed) return false;
    }
    
    // Ejecutar lógica de la acción manual
    console.log('Ejecutando acción manual:', action.action_name);
    
    if (action_config.success_message) {
      toast.success(action_config.success_message);
    }
    
    return true;
  };

  const executeValidation = async (action: StageAction, context?: any) => {
    const { action_config } = action;
    const errors: string[] = [];
    
    // Validar campos requeridos
    if (action_config.required_fields) {
      for (const field of action_config.required_fields) {
        if (!context || !context[field]) {
          errors.push(`El campo ${field} es requerido`);
        }
      }
    }
    
    // Ejecutar reglas de validación
    if (action_config.validation_rules) {
      for (const rule of action_config.validation_rules) {
        const fieldValue = context?.[rule.field];
        
        switch (rule.rule_type) {
          case 'required':
            if (!fieldValue) {
              errors.push(rule.error_message || `${rule.field} es requerido`);
            }
            break;
          case 'min_length':
            if (fieldValue && fieldValue.length < rule.value) {
              errors.push(rule.error_message || `${rule.field} debe tener al menos ${rule.value} caracteres`);
            }
            break;
          case 'email':
            if (fieldValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
              errors.push(rule.error_message || `${rule.field} debe ser un email válido`);
            }
            break;
          // Agregar más validaciones según necesidad
        }
      }
    }
    
    if (errors.length > 0) {
      toast.error(errors.join(', '));
      return { valid: false, errors };
    }
    
    return { valid: true, errors: [] };
  };

  useEffect(() => {
    if (stageId) {
      fetchStageActions(stageId);
    }
  }, [stageId]);

  return {
    actions,
    loading,
    error,
    fetchStageActions,
    createStageAction,
    updateStageAction,
    deleteStageAction,
    reorderStageActions,
    executeAction,
    refetch: () => fetchStageActions(stageId)
  };
};