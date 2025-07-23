import React, { useState } from 'react';
import { useReconversionNotifications } from '@/hooks/useReconversionNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock,
  AlertTriangle,
  Users,
  XCircle,
  Mail,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'reconversion_created':
      return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    case 'candidate_added':
      return <Users className="h-4 w-4 text-green-500" />;
    case 'reconversion_closed':
      return <CheckCheck className="h-4 w-4 text-purple-500" />;
    case 'data_missing':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'reconversion_created':
      return 'bg-blue-50 border-blue-200';
    case 'candidate_added':
      return 'bg-green-50 border-green-200';
    case 'reconversion_closed':
      return 'bg-purple-50 border-purple-200';
    case 'data_missing':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'reconversion_created':
      return 'Reconversión Creada';
    case 'candidate_added':
      return 'Candidata Añadida';
    case 'reconversion_closed':
      return 'Reconversión Cerrada';
    case 'data_missing':
      return 'Datos Faltantes';
    default:
      return 'Notificación';
  }
};

export const ReconversionNotificationPanel = () => {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useReconversionNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const unreadNotifications = notifications.filter(n => !n.sent_email);
  const readNotifications = notifications.filter(n => n.sent_email);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.sent_email) {
      await markAsRead(notification.id);
    }
    navigate(`/reconversiones/${notification.reconversion_id}`);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones de Reconversiones
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={loading}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas como leídas
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay notificaciones de reconversiones
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Notificaciones no leídas */}
              {unreadNotifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Nuevas ({unreadNotifications.length})
                  </h3>
                  <div className="space-y-2">
                    {unreadNotifications.map((notification) => (
                      <Card
                        key={notification.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md border-l-4",
                          getNotificationColor(notification.notification_type)
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.notification_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {getTypeLabel(notification.notification_type)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), {
                                    addSuffix: true,
                                    locale: es
                                  })}
                                </span>
                              </div>
                              <h4 className="font-medium text-sm mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver detalles
                                </Button>
                                {!notification.sent_email && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Marcar como leída
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Separador */}
              {unreadNotifications.length > 0 && readNotifications.length > 0 && (
                <Separator className="my-4" />
              )}

              {/* Notificaciones leídas */}
              {readNotifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <CheckCheck className="h-4 w-4" />
                    Leídas ({readNotifications.length})
                  </h3>
                  <div className="space-y-2">
                    {readNotifications.slice(0, 10).map((notification) => (
                      <Card
                        key={notification.id}
                        className="cursor-pointer transition-all hover:shadow-sm opacity-75"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.notification_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {getTypeLabel(notification.notification_type)}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {notification.sent_email && (
                                    <Mail className="h-3 w-3" />
                                  )}
                                  <span>
                                    {formatDistanceToNow(new Date(notification.created_at), {
                                      addSuffix: true,
                                      locale: es
                                    })}
                                  </span>
                                </div>
                              </div>
                              <h4 className="font-medium text-sm mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};