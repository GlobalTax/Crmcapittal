import { useEffect } from 'react';
import { useOverdueTasks } from './useOverdueTasks';
import { toast } from 'sonner';

export const useReminderNotifications = () => {
  const { notifications, unreadNotifications, markNotificationAsRead } = useOverdueTasks();

  useEffect(() => {
    // Show pending scheduled reminders as persistent toasts
    const scheduledReminders = notifications.filter(
      n => (n.notification_type === 'task_reminder' || 
           n.notification_type === 'nda_reminder' || 
           n.notification_type === 'inactivity_reminder' || 
           n.notification_type === 'proposal_reminder') && 
           !n.read_at && 
           n.scheduled_for &&
           new Date(n.scheduled_for) <= new Date()
    );

    scheduledReminders.forEach(reminder => {
      const toastId = `reminder-${reminder.id}`;
      
      toast.info(reminder.task_title, {
        id: toastId,
        description: reminder.message,
        duration: 0, // Persistent until manually dismissed
        action: {
          label: "Marcar como visto",
          onClick: () => {
            markNotificationAsRead(reminder.id);
            toast.dismiss(toastId);
          }
        }
      });
    });
  }, [notifications, markNotificationAsRead]);

  return {
    totalNotifications: notifications.length,
    unreadCount: unreadNotifications.length,
    pendingReminders: notifications.filter(
      n => (n.notification_type === 'task_reminder' || 
           n.notification_type === 'nda_reminder' || 
           n.notification_type === 'inactivity_reminder' || 
           n.notification_type === 'proposal_reminder') && !n.read_at
    ).length
  };
};