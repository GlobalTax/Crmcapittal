import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Commission } from '@/hooks/useCommissions';

interface CommissionNotification {
  id: string;
  type: 'new_commission' | 'due_soon' | 'overdue';
  commission: Commission;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const CommissionNotifications = () => {
  const [notifications, setNotifications] = useState<CommissionNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new commissions
    const channel = supabase
      .channel('commission-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'commissions'
        },
        (payload) => {
          const newCommission = payload.new as Commission;
          
          // Show toast notification for new commission
          toast({
            title: "Nueva comisión creada",
            description: `Comisión automática de €${newCommission.commission_amount.toFixed(2)} para ${newCommission.source_name}`,
            duration: 5000,
          });
          
          // Add to notifications
          const notification: CommissionNotification = {
            id: `new-${newCommission.id}`,
            type: 'new_commission',
            commission: newCommission,
            message: `Nueva comisión automática creada por €${newCommission.commission_amount.toFixed(2)}`,
            isRead: false,
            createdAt: new Date().toISOString()
          };
          
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchNotifications = async () => {
    try {
      // Fetch recent commissions for notifications
      const { data: commissions } = await supabase
        .from('commissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (commissions) {
        const notifications: CommissionNotification[] = [];
        const now = new Date();

        commissions.forEach(commission => {
          // Check for due soon commissions (within 7 days)
          if (commission.payment_due_date && commission.status === 'pending') {
            const dueDate = new Date(commission.payment_due_date);
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilDue <= 0) {
              notifications.push({
                id: `overdue-${commission.id}`,
                type: 'overdue',
                commission,
                message: `Comisión vencida: €${commission.commission_amount.toFixed(2)}`,
                isRead: false,
                createdAt: commission.created_at
              });
            } else if (daysUntilDue <= 7) {
              notifications.push({
                id: `due-${commission.id}`,
                type: 'due_soon',
                commission,
                message: `Comisión vence en ${daysUntilDue} días: €${commission.commission_amount.toFixed(2)}`,
                isRead: false,
                createdAt: commission.created_at
              });
            }
          }

          // Add recent commissions as "new" notifications
          const createdAt = new Date(commission.created_at);
          const hoursAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          
          if (hoursAgo <= 24) {
            notifications.push({
              id: `new-${commission.id}`,
              type: 'new_commission',
              commission,
              message: `Nueva comisión creada: €${commission.commission_amount.toFixed(2)}`,
              isRead: false,
              createdAt: commission.created_at
            });
          }
        });

        setNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: CommissionNotification['type']) => {
    switch (type) {
      case 'new_commission':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'due_soon':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <Bell className="h-4 w-4 text-red-600" />;
    }
  };

  const getBadgeVariant = (type: CommissionNotification['type']) => {
    switch (type) {
      case 'new_commission':
        return 'default' as const;
      case 'due_soon':
        return 'secondary' as const;
      case 'overdue':
        return 'destructive' as const;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificaciones</CardTitle>
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
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay notificaciones
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    notification.isRead 
                      ? 'bg-muted/50' 
                      : 'bg-background border-primary/20'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                          {notification.type === 'new_commission' && 'Nueva'}
                          {notification.type === 'due_soon' && 'Próxima'}
                          {notification.type === 'overdue' && 'Vencida'}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};