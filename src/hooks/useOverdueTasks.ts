import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OverdueTaskData {
  task_id: string;
  task_title: string;
  task_type: 'planned' | 'lead' | 'valoracion';
  entity_id: string;
  entity_name: string;
  due_date: string;
  days_overdue: number;
}

export interface TaskNotification {
  id: string;
  task_id: string;
  task_type: 'planned' | 'lead' | 'valoracion' | 'negocio' | 'deal';
  notification_type: 'overdue_task' | 'task_reminder' | 'nda_reminder' | 'inactivity_reminder' | 'proposal_reminder';
  reminder_type?: string;
  task_title: string;
  entity_name?: string;
  entity_id?: string;
  message: string;
  days_overdue: number;
  created_at: string;
  read_at?: string;
  email_sent_at?: string;
  scheduled_for?: string;
  status?: 'pending' | 'sent' | 'cancelled';
  deal_id?: string;
  negocio_id?: string;
}

export const useOverdueTasks = () => {
  const {
    data: overdueTasks = [],
    isLoading: isLoadingTasks,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery({
    queryKey: ['overdue-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_overdue_tasks');
      
      if (error) {
        console.error('Error fetching overdue tasks:', error);
        throw new Error('Error al cargar tareas vencidas');
      }
      
      return data as OverdueTaskData[];
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['task-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching task notifications:', error);
        throw new Error('Error al cargar notificaciones de tareas');
      }
      
      return data as TaskNotification[];
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('task_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Error al marcar notificación como leída');
    }

    refetchNotifications();
  };

  const markAllNotificationsAsRead = async () => {
    const { error } = await supabase
      .from('task_notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Error al marcar todas las notificaciones como leídas');
    }

    refetchNotifications();
  };

  // Computed values
  const unreadNotifications = notifications.filter(n => !n.read_at);
  const criticalTasks = overdueTasks.filter(task => task.days_overdue > 7);
  const totalOverdueCount = overdueTasks.length;
  const unreadNotificationCount = unreadNotifications.length;

  // Group tasks by type
  const tasksByType = {
    planned: overdueTasks.filter(t => t.task_type === 'planned'),
    lead: overdueTasks.filter(t => t.task_type === 'lead'),
    valoracion: overdueTasks.filter(t => t.task_type === 'valoracion')
  };

  return {
    // Data
    overdueTasks,
    notifications,
    unreadNotifications,
    criticalTasks,
    tasksByType,
    
    // Counts
    totalOverdueCount,
    unreadNotificationCount,
    criticalTaskCount: criticalTasks.length,
    
    // Loading states
    isLoading: isLoadingTasks || isLoadingNotifications,
    isLoadingTasks,
    isLoadingNotifications,
    
    // Errors
    error: tasksError || notificationsError,
    tasksError,
    notificationsError,
    
    // Actions
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refetchTasks,
    refetchNotifications,
    refetch: () => {
      refetchTasks();
      refetchNotifications();
    }
  };
};