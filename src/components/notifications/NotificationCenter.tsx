import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bell, Check, X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotificationSystem, Notification, NotificationCategory } from '@/hooks/useNotificationSystem';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: NotificationCategory) => {
  switch (type) {
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case 'important':
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-success" />;
    default:
      return <Info className="h-4 w-4 text-primary" />;
  }
};

const getNotificationStyles = (type: NotificationCategory, isRead: boolean) => {
  const baseClasses = "p-4 border-l-4 transition-all hover:bg-muted/50";
  
  if (isRead) {
    return cn(baseClasses, "opacity-60 border-l-muted");
  }

  switch (type) {
    case 'critical':
      return cn(baseClasses, "border-l-destructive bg-destructive/5");
    case 'important':
      return cn(baseClasses, "border-l-orange-500 bg-orange-50");
    case 'success':
      return cn(baseClasses, "border-l-success bg-success/5");
    default:
      return cn(baseClasses, "border-l-primary bg-primary/5");
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClear: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onClear }: NotificationItemProps) => {
  return (
    <div className={getNotificationStyles(notification.type, notification.read)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {getNotificationIcon(notification.type)}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              {!notification.read && (
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(notification.timestamp, { 
                addSuffix: true, 
                locale: es 
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              className="h-8 w-8 p-0"
              title="Marcar como leído"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClear(notification.id)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            title="Eliminar notificación"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll
  } = useNotificationSystem();

  const [isOpen, setIsOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[440px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Centro de Notificaciones</span>
            {unreadCount > 0 && (
              <Badge variant="secondary">
                {unreadCount} sin leer
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Quick Actions */}
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marcar todo como leído
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar todo
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <ScrollArea className="h-[calc(100vh-200px)]">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Las notificaciones aparecerán aquí cuando ocurran eventos importantes
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-1">
                {/* Unread notifications */}
                {unreadNotifications.length > 0 && (
                  <>
                    <h4 className="text-sm font-medium text-muted-foreground px-4 py-2">
                      Sin leer ({unreadNotifications.length})
                    </h4>
                    {unreadNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onClear={clearNotification}
                      />
                    ))}
                  </>
                )}

                {/* Separator if both exist */}
                {unreadNotifications.length > 0 && readNotifications.length > 0 && (
                  <Separator className="my-4" />
                )}

                {/* Read notifications */}
                {readNotifications.length > 0 && (
                  <>
                    <h4 className="text-sm font-medium text-muted-foreground px-4 py-2">
                      Leídas ({readNotifications.length})
                    </h4>
                    {readNotifications.slice(0, 20).map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onClear={clearNotification}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};