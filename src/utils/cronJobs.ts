import { supabase } from '@/integrations/supabase/client';

export interface PendingReminder {
  id: string;
  task_id: string;
  task_type: string;
  notification_type: string;
  task_title: string;
  entity_name?: string;
  entity_id?: string;
  message: string;
  days_overdue: number;
  created_at: string;
  read_at?: string;
}

export class CronJobsService {
  
  /**
   * Check for pending reminders that need to be processed
   * This function is designed to be called by the existing task-reminders-cron Edge Function
   */
  static async checkPendingReminders(): Promise<PendingReminder[]> {
    try {
      console.log('Checking for pending reminders...');
      
      // Get all overdue tasks using the existing RPC function
      const { data: overdueTasks, error } = await supabase.rpc('get_all_overdue_tasks');
      
      if (error) {
        console.error('Error fetching overdue tasks:', error);
        throw error;
      }

      // Filter for reminder-type notifications
      const reminderTasks = (overdueTasks || []).filter((task: any) => {
        const reminderTypes = ['nda_reminder', 'inactivity_reminder', 'proposal_reminder'];
        return reminderTypes.some(type => task.task_type?.includes(type) || task.task_title?.toLowerCase().includes('recordatorio'));
      });

      console.log(`Found ${reminderTasks.length} pending reminder tasks`);
      
      return reminderTasks.map((task: any) => ({
        id: task.task_id,
        task_id: task.task_id,
        task_type: task.task_type,
        notification_type: this.inferNotificationType(task),
        task_title: task.task_title,
        entity_name: task.entity_name,
        entity_id: task.entity_id,
        message: task.task_title || 'Recordatorio pendiente',
        days_overdue: task.days_overdue || 0,
        created_at: new Date().toISOString(),
        read_at: undefined
      }));
      
    } catch (error) {
      console.error('Error checking pending reminders:', error);
      throw error;
    }
  }

  /**
   * Infer notification type from task data
   */
  private static inferNotificationType(task: any): string {
    const title = (task.task_title || '').toLowerCase();
    
    if (title.includes('nda')) return 'nda_reminder';
    if (title.includes('inactividad') || title.includes('actividad')) return 'inactivity_reminder';
    if (title.includes('propuesta')) return 'proposal_reminder';
    
    return 'task_reminder';
  }

  /**
   * Process reminder notifications (send emails, create in-app notifications, etc.)
   */
  static async processReminderNotifications(reminders: PendingReminder[]): Promise<void> {
    try {
      for (const reminder of reminders) {
        await this.processIndividualReminder(reminder);
      }
    } catch (error) {
      console.error('Error processing reminder notifications:', error);
      throw error;
    }
  }

  /**
   * Process a single reminder notification
   */
  private static async processIndividualReminder(reminder: PendingReminder): Promise<void> {
    try {
      // Check if notification already exists to avoid duplicates
      const { data: existingNotification } = await supabase
        .from('task_notifications')
        .select('id')
        .eq('task_id', reminder.task_id)
        .eq('notification_type', reminder.notification_type)
        .is('read_at', null)
        .single();

      if (existingNotification) {
        console.log(`Notification already exists for reminder ${reminder.id}`);
        return;
      }

      // Create new notification
      const { error } = await supabase
        .from('task_notifications')
        .insert({
          user_id: await this.getCurrentUserId(),
          task_id: reminder.task_id,
          task_type: reminder.task_type,
          notification_type: reminder.notification_type,
          task_title: reminder.task_title,
          entity_name: reminder.entity_name,
          entity_id: reminder.entity_id,
          message: reminder.message,
          days_overdue: reminder.days_overdue
        });

      if (error) {
        console.error(`Error creating notification for reminder ${reminder.id}:`, error);
        throw error;
      }

      console.log(`Processed reminder notification: ${reminder.notification_type} for ${reminder.task_id}`);
      
    } catch (error) {
      console.error(`Error processing individual reminder ${reminder.id}:`, error);
      throw error;
    }
  }

  /**
   * Trigger the existing cron job Edge Function
   */
  static async triggerHourlyCheck(): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('task-reminders-cron', {
        body: { type: 'hourly_check' }
      });

      if (error) {
        console.error('Error triggering hourly check:', error);
        throw error;
      }

      console.log('Hourly check triggered successfully:', data);
      
    } catch (error) {
      console.error('Error triggering cron job:', error);
      throw error;
    }
  }

  /**
   * Schedule a manual reminder check (useful for testing)
   */
  static async scheduleManualCheck(): Promise<PendingReminder[]> {
    try {
      // First, get pending reminders
      const pendingReminders = await this.checkPendingReminders();
      
      // Then process them
      await this.processReminderNotifications(pendingReminders);
      
      // Trigger the Edge Function for consistency
      await this.triggerHourlyCheck();
      
      return pendingReminders;
      
    } catch (error) {
      console.error('Error in manual reminder check:', error);
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
   * Get reminder statistics
   */
  static async getReminderStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    overdue: number;
  }> {
    try {
      const { data: notifications, error } = await supabase
        .from('task_notifications')
        .select('notification_type, days_overdue, read_at')
        .in('notification_type', ['nda_reminder', 'inactivity_reminder', 'proposal_reminder']);

      if (error) {
        throw error;
      }

      const unreadNotifications = (notifications || []).filter(n => !n.read_at);
      
      const byType = unreadNotifications.reduce((acc, notification) => {
        acc[notification.notification_type] = (acc[notification.notification_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const overdue = unreadNotifications.filter(n => (n.days_overdue || 0) > 0).length;

      return {
        total: unreadNotifications.length,
        byType,
        overdue
      };
      
    } catch (error) {
      console.error('Error getting reminder stats:', error);
      throw error;
    }
  }
}