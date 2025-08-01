import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useOverdueTasks } from '@/hooks/useOverdueTasks';
import { Bell, Clock, AlertTriangle, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const OverdueTasksBadge: React.FC = () => {
  const {
    totalOverdueCount,
    unreadNotificationCount,
    criticalTaskCount,
    notifications,
    unreadNotifications,
    overdueTasks,
    tasksByType,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isLoading
  } = useOverdueTasks();

  const totalBadgeCount = Math.max(unreadNotificationCount, totalOverdueCount);

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Bell className="h-4 w-4" />
      </Button>
    );
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'planned': return '📋';
      case 'lead': return '🎯';
      case 'valoracion': return '💰';
      default: return '📝';
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'planned': return 'Planificada';
      case 'lead': return 'Lead';
      case 'valoracion': return 'Valoración';
      default: return 'Tarea';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative hover:bg-destructive/10"
        >
          <Bell className={`h-4 w-4 ${totalBadgeCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          {totalBadgeCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalBadgeCount > 99 ? '99+' : totalBadgeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Tareas y Notificaciones</h4>
            {unreadNotificationCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas leídas
              </Button>
            )}
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-lg font-bold text-destructive">{totalOverdueCount}</div>
              <div className="text-xs text-muted-foreground">Vencidas</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-lg font-bold text-orange-500">{criticalTaskCount}</div>
              <div className="text-xs text-muted-foreground">Críticas</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-lg font-bold text-blue-500">{unreadNotificationCount}</div>
              <div className="text-xs text-muted-foreground">Sin leer</div>
            </div>
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-96">
          <div className="p-4 space-y-4">
            
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center">
                  <Bell className="h-3 w-3 mr-1" />
                  Notificaciones ({unreadNotifications.length})
                </h5>
                <div className="space-y-2">
                  {unreadNotifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border-l-2 border-blue-500 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/40"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            {getTaskTypeIcon(notification.task_type)} {getTaskTypeLabel(notification.task_type)}
                          </div>
                          <div className="text-sm">{notification.task_title}</div>
                          {notification.entity_name && (
                            <div className="text-xs text-muted-foreground">
                              En: {notification.entity_name}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {notification.days_overdue} día{notification.days_overdue !== 1 ? 's' : ''} vencida
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {unreadNotifications.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center">
                      ... y {unreadNotifications.length - 5} más
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Critical Tasks */}
            {criticalTaskCount > 0 && (
              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center text-destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Tareas Críticas ({criticalTaskCount})
                </h5>
                <div className="space-y-2">
                  {overdueTasks
                    .filter(task => task.days_overdue > 7)
                    .slice(0, 3)
                    .map((task) => (
                      <div
                        key={task.task_id}
                        className="p-2 bg-red-50 dark:bg-red-950/20 rounded border-l-2 border-red-500"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-xs font-medium text-red-700 dark:text-red-300">
                              {getTaskTypeIcon(task.task_type)} {getTaskTypeLabel(task.task_type)}
                            </div>
                            <div className="text-sm font-medium">{task.task_title}</div>
                            {task.entity_name && (
                              <div className="text-xs text-muted-foreground">
                                En: {task.entity_name}
                              </div>
                            )}
                            <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                              🚨 {task.days_overdue} días vencida
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tasks by Type Summary */}
            {totalOverdueCount > 0 && (
              <div>
                <h5 className="font-medium text-sm mb-2 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Resumen por Tipo
                </h5>
                <div className="space-y-1">
                  {Object.entries(tasksByType).map(([type, tasks]) => {
                    if (tasks.length === 0) return null;
                    return (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          {getTaskTypeIcon(type)}
                          <span className="ml-2">{getTaskTypeLabel(type)}</span>
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {tasks.length}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {totalOverdueCount === 0 && unreadNotificationCount === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No hay tareas vencidas</div>
                <div className="text-xs">¡Buen trabajo!</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};