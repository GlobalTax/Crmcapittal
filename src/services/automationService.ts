import { supabase } from '@/integrations/supabase/client';
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type ReminderType = 'NDA_NOT_SIGNED' | 'NO_ACTIVITY_NEGOTIATION' | 'PROPOSAL_PENDING';

export interface StageChangeEvent {
  prevStage: string;
  newStage: string;
  dealId: string;
  dealType: 'negocio' | 'deal';
}

export class AutomationService {
  private static queryClient: QueryClient;

  static setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  /**
   * Handle deal stage updates and trigger appropriate reminders
   */
  static async onDealStageUpdate(prevStage: string, newStage: string, dealId: string, dealType: 'negocio' | 'deal' = 'negocio') {
    try {
      console.log(`Deal stage updated: ${prevStage} → ${newStage} for ${dealType} ${dealId}`);
      
      // Invalidate relevant queries
      this.invalidateQueries();
      
      // Schedule reminders based on stage transition
      await this.scheduleStageBasedReminders(prevStage, newStage, dealId, dealType);
      
    } catch (error) {
      console.error('Error handling deal stage update:', error);
      toast.error('Error al procesar cambio de etapa');
    }
  }

  /**
   * Schedule reminders based on stage transitions
   */
  private static async scheduleStageBasedReminders(prevStage: string, newStage: string, dealId: string, dealType: string) {
    const stageRules = {
      // NDA stage - remind if not signed in 48 hours
      'nda': {
        reminder: 'NDA_NOT_SIGNED' as ReminderType,
        delayHours: 48,
        message: 'Recordatorio: NDA pendiente de firma'
      },
      // Negotiation stage - remind if no activity in 7 days
      'negotiation': {
        reminder: 'NO_ACTIVITY_NEGOTIATION' as ReminderType,
        delayHours: 168, // 7 days
        message: 'Recordatorio: Sin actividad en negociación por 7 días'
      },
      // Proposal stage - remind if pending response in 5 days
      'proposal': {
        reminder: 'PROPOSAL_PENDING' as ReminderType,
        delayHours: 120, // 5 days
        message: 'Recordatorio: Propuesta pendiente de respuesta'
      }
    };

    const rule = stageRules[newStage.toLowerCase() as keyof typeof stageRules];
    
    if (rule) {
      await this.createReminderTask(dealId, dealType, rule.reminder, rule.delayHours, rule.message);
    }
  }

  /**
   * Create a reminder task in the database
   */
  private static async createReminderTask(dealId: string, dealType: string, reminderType: ReminderType, delayHours: number, message: string) {
    try {
      const scheduledFor = new Date();
      scheduledFor.setHours(scheduledFor.getHours() + delayHours);

      // Create notification in task_notifications table with scheduled_for field
      const { error } = await supabase
        .from('task_notifications')
        .insert({
          user_id: await this.getCurrentUserId(),
          task_id: dealId,
          task_type: dealType === 'negocio' ? 'negocio' : 'deal',
          notification_type: this.mapReminderToNotificationType(reminderType),
          reminder_type: this.mapReminderToNotificationType(reminderType),
          task_title: message,
          entity_name: `${dealType.charAt(0).toUpperCase() + dealType.slice(1)} ${dealId}`,
          entity_id: dealId,
          message,
          scheduled_for: scheduledFor.toISOString(),
          status: 'pending',
          deal_id: dealType === 'deal' ? dealId : null,
          negocio_id: dealType === 'negocio' ? dealId : null,
          days_overdue: 0
        });

      if (error) {
        throw error;
      }

      // Log automation event
      await supabase.rpc('log_automation_event', {
        p_automation_type: 'reminder_scheduled',
        p_entity_type: dealType,
        p_entity_id: dealId,
        p_trigger_event: 'stage_change',
        p_action_taken: 'reminder_created',
        p_action_data: {
          reminder_type: reminderType,
          delay_hours: delayHours,
          scheduled_for: scheduledFor.toISOString()
        }
      });

      console.log(`Reminder scheduled: ${reminderType} for ${dealType} ${dealId} in ${delayHours} hours`);
      
    } catch (error) {
      console.error('Error creating reminder task:', error);
      throw error;
    }
  }

  /**
   * Map reminder types to notification types
   */
  private static mapReminderToNotificationType(reminderType: ReminderType): string {
    const mapping = {
      'NDA_NOT_SIGNED': 'nda_reminder',
      'NO_ACTIVITY_NEGOTIATION': 'inactivity_reminder',
      'PROPOSAL_PENDING': 'proposal_reminder'
    };
    
    return mapping[reminderType] || 'task_reminder';
  }

  /**
   * Invalidate TanStack Query caches
   */
  private static invalidateQueries() {
    if (!this.queryClient) return;

    // Invalidate relevant query caches
    this.queryClient.invalidateQueries({ queryKey: ['negocios'] });
    this.queryClient.invalidateQueries({ queryKey: ['deals'] });
    this.queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
    this.queryClient.invalidateQueries({ queryKey: ['task-notifications'] });
    this.queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
  }

  /**
   * Cancel reminder for a specific deal/stage
   */
  static async cancelReminder(dealId: string, reminderType: ReminderType) {
    try {
      const notificationType = this.mapReminderToNotificationType(reminderType);
      
      const { error } = await supabase
        .from('task_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('task_id', dealId)
        .eq('notification_type', notificationType)
        .is('read_at', null);

      if (error) {
        throw error;
      }

      console.log(`Reminder cancelled: ${reminderType} for deal ${dealId}`);
      this.invalidateQueries();
      
    } catch (error) {
      console.error('Error cancelling reminder:', error);
      throw error;
    }
  }

  /**
   * Get current user ID
   */
  private static async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || '';
  }

  /**
   * Get active reminders for a deal
   */
  static async getActiveReminders(dealId: string) {
    try {
      const { data, error } = await supabase
        .from('task_notifications')
        .select('*')
        .eq('task_id', dealId)
        .is('read_at', null)
        .in('notification_type', ['nda_reminder', 'inactivity_reminder', 'proposal_reminder']);

      if (error) {
        throw error;
      }

      return data || [];
      
    } catch (error) {
      console.error('Error getting active reminders:', error);
      return [];
    }
  }
}