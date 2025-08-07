import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, BellOff, MessageCircle, Share, Shield, Trash2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDocumentNotifications } from '@/hooks/useDocumentNotifications';
import { DocumentNotification } from '@/types/DocumentCollaboration';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useDocumentNotifications();

  const getNotificationIcon = (type: DocumentNotification['notification_type']) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'mention':
        return <MessageCircle className="h-4 w-4 text-orange-500" />;
      case 'document_shared':
        return <Share className="h-4 w-4 text-green-500" />;
      case 'permission_granted':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = async (notification: DocumentNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navegar al documento si es necesario
    if (notification.document_id) {
      // Aquí podrías agregar lógica de navegación
      console.log('Navigate to document:', notification.document_id);
    }
  };

  const NotificationItem: React.FC<{ notification: DocumentNotification }> = ({ notification }) => (
    <Card 
      className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
        !notification.read ? 'border-l-4 border-l-primary bg-muted/20' : ''
      }`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex gap-3 flex-1">
          {getNotificationIcon(notification.notification_type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium truncate">
                {notification.title}
              </p>
              {!notification.read && (
                <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              {notification.message}
            </p>
            {notification.document && (
              <p className="text-xs text-muted-foreground">
                Documento: {notification.document.title}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { 
                addSuffix: true, 
                locale: es 
              })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
              className="h-6 w-6 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
            className="h-6 w-6 p-0 text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como leídas
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} sin leer
            </p>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Cargando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center">
              <BellOff className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No hay notificaciones</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};