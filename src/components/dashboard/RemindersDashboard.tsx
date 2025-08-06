import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOverdueTasks } from '@/hooks/useOverdueTasks';
import { useReminders } from '@/hooks/automation/useReminders';
import { Bell, Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const RemindersDashboard = () => {
  const { 
    notifications, 
    unreadNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    isLoading 
  } = useOverdueTasks();
  
  const { cancelReminder, isScheduling, isCancelling } = useReminders();

  // Filter different types of reminders
  const reminderTypes = ['task_reminder', 'nda_reminder', 'inactivity_reminder', 'proposal_reminder'];
  
  const pendingReminders = notifications.filter(n => 
    reminderTypes.includes(n.notification_type) && 
    (!n.status || n.status === 'pending') && 
    !n.read_at
  );

  const overdueReminders = notifications.filter(n => 
    reminderTypes.includes(n.notification_type) && 
    n.scheduled_for && 
    new Date(n.scheduled_for) < new Date() && 
    !n.read_at
  );

  const upcomingReminders = notifications.filter(n => 
    reminderTypes.includes(n.notification_type) && 
    n.scheduled_for && 
    new Date(n.scheduled_for) > new Date() && 
    !n.read_at
  );

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleCancelReminder = async (notification: any) => {
    try {
      await cancelReminder({
        dealId: notification.task_id,
        type: notification.reminder_type
      });
    } catch (error) {
      console.error('Error cancelling reminder:', error);
    }
  };

  const ReminderCard = ({ notification, showCancel = false }: { notification: any, showCancel?: boolean }) => (
    <div className="p-3 border border-border rounded-lg bg-card space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-foreground">{notification.task_title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
          {notification.entity_name && (
            <p className="text-xs text-muted-foreground">
              Entidad: {notification.entity_name}
            </p>
          )}
        </div>
        {notification.days_overdue > 0 && (
          <Badge variant="destructive" className="ml-2">
            {notification.days_overdue}d vencido
          </Badge>
        )}
      </div>
      
      {notification.scheduled_for && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDistanceToNow(new Date(notification.scheduled_for), { 
            addSuffix: true, 
            locale: es 
          })}
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleMarkAsRead(notification.id)}
          className="text-xs"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Marcar visto
        </Button>
        {showCancel && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCancelReminder(notification)}
            disabled={isCancelling}
            className="text-xs"
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recordatorios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recordatorios
            {unreadNotifications.length > 0 && (
              <Badge variant="secondary">{unreadNotifications.length}</Badge>
            )}
          </CardTitle>
          {unreadNotifications.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllNotificationsAsRead}
              className="text-xs"
            >
              Marcar todos como leídos
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue Reminders */}
        {overdueReminders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h3 className="text-sm font-medium text-destructive">
                Vencidos ({overdueReminders.length})
              </h3>
            </div>
            <div className="space-y-2">
              {overdueReminders.slice(0, 3).map(notification => (
                <ReminderCard 
                  key={notification.id} 
                  notification={notification}
                  showCancel={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pending Reminders */}
        {pendingReminders.length > 0 && (
          <>
            {overdueReminders.length > 0 && <Separator />}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-warning" />
                <h3 className="text-sm font-medium text-warning">
                  Pendientes ({pendingReminders.length})
                </h3>
              </div>
              <div className="space-y-2">
                {pendingReminders.slice(0, 3).map(notification => (
                  <ReminderCard 
                    key={notification.id} 
                    notification={notification}
                    showCancel={true}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <>
            {(overdueReminders.length > 0 || pendingReminders.length > 0) && <Separator />}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">
                  Próximos ({upcomingReminders.length})
                </h3>
              </div>
              <div className="space-y-2">
                {upcomingReminders.slice(0, 2).map(notification => (
                  <ReminderCard 
                    key={notification.id} 
                    notification={notification}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="text-center py-6">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay recordatorios activos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};