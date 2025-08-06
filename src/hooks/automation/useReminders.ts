import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AutomationService, ReminderType } from '@/services/automationService';
import { useOverdueTasks } from '@/hooks/useOverdueTasks';
import { toast } from 'sonner';

export interface ReminderConfig {
  type: ReminderType;
  delayHours: number;
  message?: string;
}

export const REMINDER_CONFIGS: Record<ReminderType, Omit<ReminderConfig, 'type'>> = {
  NDA_NOT_SIGNED: {
    delayHours: 48,
    message: 'El NDA no ha sido firmado. Seguimiento requerido.'
  },
  NO_ACTIVITY_NEGOTIATION: {
    delayHours: 168, // 7 days
    message: 'Sin actividad en la negociación por más de 7 días.'
  },
  PROPOSAL_PENDING: {
    delayHours: 120, // 5 days  
    message: 'La propuesta está pendiente de respuesta hace 5 días.'
  }
};

export const useReminders = () => {
  const queryClient = useQueryClient();
  const { refetch: refetchOverdueTasks } = useOverdueTasks();

  // Set query client for AutomationService
  AutomationService.setQueryClient(queryClient);

  /**
   * Schedule a reminder for a specific deal
   */
  const scheduleReminderMutation = useMutation({
    mutationFn: async ({ 
      type, 
      dealId, 
      delayHours, 
      dealType = 'negocio' 
    }: { 
      type: ReminderType; 
      dealId: string; 
      delayHours?: number;
      dealType?: 'negocio' | 'deal';
    }) => {
      const config = REMINDER_CONFIGS[type];
      const actualDelayHours = delayHours || config.delayHours;
      const message = config.message || `Recordatorio: ${type}`;

      // Create the reminder task directly through AutomationService
      await AutomationService.onDealStageUpdate('', type, dealId, dealType);
      
      return {
        type,
        dealId,
        delayHours: actualDelayHours,
        message,
        scheduledAt: new Date()
      };
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['task-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      refetchOverdueTasks();
      
      toast.success(`Recordatorio programado: ${data.type}`);
    },
    onError: (error) => {
      console.error('Error scheduling reminder:', error);
      toast.error('Error al programar recordatorio');
    }
  });

  /**
   * Cancel a specific reminder
   */
  const cancelReminderMutation = useMutation({
    mutationFn: async ({ dealId, type }: { dealId: string; type: ReminderType }) => {
      await AutomationService.cancelReminder(dealId, type);
      return { dealId, type };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['task-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      refetchOverdueTasks();
      
      toast.success(`Recordatorio cancelado: ${data.type}`);
    },
    onError: (error) => {
      console.error('Error cancelling reminder:', error);
      toast.error('Error al cancelar recordatorio');
    }
  });

  /**
   * Get active reminders for a deal
   */
  const useActiveReminders = (dealId: string) => {
    return useQuery({
      queryKey: ['active-reminders', dealId],
      queryFn: () => AutomationService.getActiveReminders(dealId),
      enabled: !!dealId,
      refetchInterval: 60000 // Refetch every minute
    });
  };

  /**
   * Schedule multiple reminders at once
   */
  const scheduleBulkReminders = async (
    reminders: Array<{
      type: ReminderType;
      dealId: string;
      delayHours?: number;
      dealType?: 'negocio' | 'deal';
    }>
  ) => {
    const results = await Promise.allSettled(
      reminders.map(reminder => scheduleReminderMutation.mutateAsync(reminder))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    if (successful > 0) {
      toast.success(`${successful} recordatorios programados exitosamente`);
    }
    
    if (failed > 0) {
      toast.error(`${failed} recordatorios fallaron`);
    }
    
    return results;
  };

  /**
   * Quick reminder functions for common scenarios
   */
  const scheduleNDAReminder = (dealId: string, dealType?: 'negocio' | 'deal') => 
    scheduleReminderMutation.mutate({ 
      type: 'NDA_NOT_SIGNED', 
      dealId, 
      dealType 
    });

  const scheduleInactivityReminder = (dealId: string, dealType?: 'negocio' | 'deal') => 
    scheduleReminderMutation.mutate({ 
      type: 'NO_ACTIVITY_NEGOTIATION', 
      dealId, 
      dealType 
    });

  const scheduleProposalReminder = (dealId: string, dealType?: 'negocio' | 'deal') => 
    scheduleReminderMutation.mutate({ 
      type: 'PROPOSAL_PENDING', 
      dealId, 
      dealType 
    });

  return {
    // Main functions
    scheduleReminder: scheduleReminderMutation.mutate,
    cancelReminder: cancelReminderMutation.mutate,
    scheduleBulkReminders,
    
    // Quick reminder shortcuts
    scheduleNDAReminder,
    scheduleInactivityReminder, 
    scheduleProposalReminder,
    
    // Query hook
    useActiveReminders,
    
    // Loading states
    isScheduling: scheduleReminderMutation.isPending,
    isCancelling: cancelReminderMutation.isPending,
    
    // Configuration
    REMINDER_CONFIGS
  };
};