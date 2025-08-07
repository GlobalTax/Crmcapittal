import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Eye, 
  Mail, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  Check,
  CheckCheck 
} from 'lucide-react';
import { useSystemNotifications, SystemNotification } from '@/hooks/useAutomationSystem';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead
  } = useSystemNotifications();

  const getNotificationIcon = (type: SystemNotification['type']) => {
    const icons = {
      proposal_viewed: Eye,
      follow_up_sent: Mail,
      response_received: MessageSquare,
      deadline_approaching: Clock,
      automation_failed: AlertTriangle
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type: SystemNotification['type'], priority: SystemNotification['priority']) => {
    if (priority === 'urgent') return 'text-red-500';
    if (priority === 'high') return 'text-orange-500';
    
    const colors = {
      proposal_viewed: 'text-blue-500',
      follow_up_sent: 'text-green-500',
      response_received: 'text-purple-500',
      deadline_approaching: 'text-yellow-500',
      automation_failed: 'text-red-500'
    };
    return colors[type] || 'text-gray-500';
  };

  const getPriorityBadge = (priority: SystemNotification['priority']) => {
    const variants = {
      low: 'bg-gray-500',
      medium: 'bg-blue-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    
    const labels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };

    return (
      <Badge variant="secondary" className={`${variants[priority]} text-white text-xs`}>
        {labels[priority]}
      </Badge>
    );
  };

  const handleNotificationClick = (notification: SystemNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-foreground" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Centro de Notificaciones</h2>
            <p className="text-muted-foreground">
              {unreadCount > 0 
                ? `${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
                : 'Todas las notificaciones están leídas'
              }
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            onClick={() => markAllAsRead()}
            disabled={isMarkingAllAsRead}
            variant="outline"
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notificaciones sin leer */}
        {unreadNotifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Sin Leer ({unreadNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {unreadNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    const iconColor = getNotificationColor(notification.type, notification.priority);
                    
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="p-3 border rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-background">
                            <IconComponent className={`h-4 w-4 ${iconColor}`} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{notification.title}</p>
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: es
                              })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            disabled={isMarkingAsRead}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Notificaciones leídas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCheck className="h-5 w-5" />
              Leídas ({readNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {readNotifications.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p>No hay notificaciones leídas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {readNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    const iconColor = getNotificationColor(notification.type, notification.priority);
                    
                    return (
                      <div
                        key={notification.id}
                        className="p-3 border rounded-lg opacity-60 hover:opacity-80 transition-opacity"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-background">
                            <IconComponent className={`h-4 w-4 ${iconColor}`} />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{notification.title}</p>
                              {getPriorityBadge(notification.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: es
                                })}
                              </span>
                              {notification.read_at && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Leída {formatDistanceToNow(new Date(notification.read_at), {
                                      addSuffix: true,
                                      locale: es
                                    })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay notificaciones
            </h3>
            <p className="text-muted-foreground">
              Las notificaciones del sistema aparecerán aquí cuando se generen automáticamente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};