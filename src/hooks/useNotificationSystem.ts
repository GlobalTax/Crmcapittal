import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export type NotificationCategory = 'critical' | 'important' | 'info' | 'success';

export interface Notification {
  id: string;
  type: NotificationCategory;
  title: string;
  message: string;
  leadId?: string;
  timestamp: Date;
  read: boolean;
  sound?: boolean;
  persistent?: boolean;
}

interface NotificationRule {
  condition: (data: any) => boolean;
  type: NotificationCategory;
  title: string;
  message: string;
  sound?: boolean;
  persistent?: boolean;
}

export const useNotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastLeadCountRef = useRef<number>(0);
  const previousLeadsRef = useRef<any[]>([]);

  // Sound effects
  const playNotificationSound = useCallback((type: NotificationCategory) => {
    if (!('Audio' in window)) return;
    
    const soundMap = {
      critical: '/sounds/critical.mp3',
      important: '/sounds/important.mp3',
      info: '/sounds/info.mp3',
      success: '/sounds/success.mp3'
    };

    try {
      const audio = new Audio(soundMap[type] || soundMap.info);
      audio.volume = 0.5;
      audio.play().catch(console.warn);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, []);

  // Notification rules for different scenarios
  const notificationRules: NotificationRule[] = [
    // New lead detected
    {
      condition: (data: any) => data.type === 'new_lead',
      type: 'important',
      title: 'Nuevo Lead',
      message: 'Lead recibido',
      sound: true,
      persistent: true
    },
    // Critical lead (high priority, unassigned for >1h)
    {
      condition: (data: any) => data.type === 'critical_lead',
      type: 'critical',
      title: 'Lead Crítico',
      message: 'Lead sin asignar por más de 1 hora',
      sound: true,
      persistent: true
    },
    // Lead converted
    {
      condition: (data: any) => data.type === 'lead_converted',
      type: 'success',
      title: 'Lead Convertido',
      message: 'Lead convertido exitosamente',
      sound: false,
      persistent: false
    },
    // Multiple new leads at once
    {
      condition: (data: any) => data.type === 'multiple_leads' && data.count > 1,
      type: 'critical',
      title: 'Múltiples Leads',
      message: 'Múltiples nuevos leads recibidos',
      sound: true,
      persistent: true
    }
  ];

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50

    // Play sound if requested
    if (notification.sound) {
      playNotificationSound(notification.type);
    }

    // Show toast notification
    const toastConfig = {
      critical: { duration: 10000 },
      important: { duration: 5000 },
      info: { duration: 3000 },
      success: { duration: 3000 }
    };

    const config = toastConfig[notification.type] || toastConfig.info;

    switch (notification.type) {
      case 'critical':
        toast.error(notification.message, {
          description: notification.title,
          ...config
        });
        break;
      case 'important':
        toast.warning(notification.message, {
          description: notification.title,
          ...config
        });
        break;
      case 'success':
        toast.success(notification.message, {
          description: notification.title,
          ...config
        });
        break;
      default:
        toast.info(notification.message, {
          description: notification.title,
          ...config
        });
    }

    return newNotification.id;
  }, [playNotificationSound]);

  // Process lead changes for automatic notifications
  const processLeadChanges = useCallback((currentLeads: any[]) => {
    const currentCount = currentLeads.length;
    const previousCount = lastLeadCountRef.current;
    const previousLeads = previousLeadsRef.current;

    // Detect new leads
    if (currentCount > previousCount && previousCount > 0) {
      const newLeads = currentLeads.filter(lead => 
        !previousLeads.some(prevLead => prevLead.id === lead.id)
      );

      if (newLeads.length === 1) {
        addNotification({
          type: 'important',
          title: 'Nuevo Lead',
          message: `${newLeads[0].name} - ${newLeads[0].email}`,
          leadId: newLeads[0].id,
          sound: true,
          persistent: true
        });
      } else if (newLeads.length > 1) {
        addNotification({
          type: 'critical',
          title: 'Múltiples Leads Nuevos',
          message: `${newLeads.length} nuevos leads recibidos`,
          sound: true,
          persistent: true
        });
      }
    }

    // Check for critical leads (unassigned for >1 hour)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const criticalLeads = currentLeads.filter(lead => 
      lead.status === 'NEW' && 
      !lead.assigned_to_id && 
      new Date(lead.created_at) < oneHourAgo
    );

    criticalLeads.forEach(lead => {
      // Check if we already notified about this lead
      const alreadyNotified = notifications.some(notif => 
        notif.leadId === lead.id && notif.type === 'critical'
      );

      if (!alreadyNotified) {
        addNotification({
          type: 'critical',
          title: 'Lead Crítico',
          message: `${lead.name} sin asignar por más de 1 hora`,
          leadId: lead.id,
          sound: true,
          persistent: true
        });
      }
    });

    // Update refs
    lastLeadCountRef.current = currentCount;
    previousLeadsRef.current = [...currentLeads];
  }, [notifications, addNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  // Clear notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(notif => !notif.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    processLeadChanges
  };
};