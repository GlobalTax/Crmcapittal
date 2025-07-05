import { useEffect, useCallback } from 'react';
import { Negocio } from '@/types/Negocio';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: 'value_change' | 'stage_change' | 'priority_change' | 'time_based';
  conditions: {
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'contains';
    value: any;
  }[];
  actions: {
    type: 'move_stage' | 'assign_owner' | 'send_notification' | 'webhook';
    target: string;
    value: any;
  }[];
  isActive: boolean;
}

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: 'high-value-assignment',
    name: 'Asignación de Alto Valor',
    description: 'Auto-asignar negocios de alto valor al gerente',
    trigger: 'value_change',
    conditions: [
      { field: 'valor_negocio', operator: 'gt', value: 100000 }
    ],
    actions: [
      { type: 'assign_owner', target: 'propietario_negocio', value: 'Gerente' }
    ],
    isActive: true
  },
  {
    id: 'urgent-priority-notification',
    name: 'Notificación Prioridad Urgente',
    description: 'Notificar cuando un negocio se marca como urgente',
    trigger: 'priority_change',
    conditions: [
      { field: 'prioridad', operator: 'eq', value: 'urgente' }
    ],
    actions: [
      { type: 'send_notification', target: 'team', value: 'Negocio urgente creado' }
    ],
    isActive: true
  }
];

export const useNegocioAutomations = (negocios: Negocio[], onRefresh: () => void) => {
  const { toast } = useToast();

  const checkConditions = useCallback((negocio: Negocio, conditions: AutomationRule['conditions']) => {
    return conditions.every(condition => {
      const fieldValue = negocio[condition.field as keyof Negocio];
      
      switch (condition.operator) {
        case 'gt':
          return Number(fieldValue) > Number(condition.value);
        case 'lt':
          return Number(fieldValue) < Number(condition.value);
        case 'eq':
          return fieldValue === condition.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        default:
          return false;
      }
    });
  }, []);

  const executeActions = useCallback(async (negocio: Negocio, actions: AutomationRule['actions']) => {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'assign_owner':
            await supabase
              .from('negocios')
              .update({ [action.target]: action.value })
              .eq('id', negocio.id);
            break;
          
          case 'send_notification':
            toast({
              title: "Automatización ejecutada",
              description: `${action.value} - ${negocio.nombre_negocio}`,
            });
            break;
          
          case 'webhook':
            // Webhook implementation would go here
            console.log(`Webhook called: ${action.value}`, negocio);
            break;
        }
      } catch (error) {
        console.error('Error executing automation action:', error);
      }
    }
  }, [toast]);

  const processAutomations = useCallback(async (updatedNegocio: Negocio) => {
    for (const rule of DEFAULT_RULES) {
      if (!rule.isActive) continue;

      if (checkConditions(updatedNegocio, rule.conditions)) {
        await executeActions(updatedNegocio, rule.actions);
        
        toast({
          title: "Regla automatizada ejecutada",
          description: `${rule.name} aplicada a ${updatedNegocio.nombre_negocio}`,
        });
      }
    }
  }, [checkConditions, executeActions, toast]);

  const triggerAutomation = useCallback(async (negocio: Negocio, triggerType: AutomationRule['trigger']) => {
    const relevantRules = DEFAULT_RULES.filter(rule => 
      rule.isActive && rule.trigger === triggerType
    );

    for (const rule of relevantRules) {
      if (checkConditions(negocio, rule.conditions)) {
        await executeActions(negocio, rule.actions);
      }
    }

    if (relevantRules.length > 0) {
      onRefresh();
    }
  }, [checkConditions, executeActions, onRefresh]);

  return {
    rules: DEFAULT_RULES,
    processAutomations,
    triggerAutomation
  };
};