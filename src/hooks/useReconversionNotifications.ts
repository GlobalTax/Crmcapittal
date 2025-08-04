import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ReconversionNotification = Database['public']['Tables']['reconversion_notifications']['Row'];

export interface ReconversionNotificationData {
  type: 'reconversion_created' | 'candidate_added' | 'reconversion_closed' | 'data_missing';
  reconversionId: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  recipientUserId?: string;
}

export function useReconversionNotifications() {
  const [notifications, setNotifications] = useState<ReconversionNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reconversion_notifications')
        .select('*')
        .eq('recipient_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => n.sent_in_app && !n.sent_email).length);
    } catch (error) {
      console.error('Error fetching reconversion notifications:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('reconversion_notifications')
        .update({ sent_email: true, email_sent_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, sent_email: true, email_sent_at: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Error al marcar notificación como leída');
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reconversion_notifications')
        .update({ sent_email: true, email_sent_at: new Date().toISOString() })
        .eq('recipient_user_id', user.id)
        .eq('sent_email', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ 
          ...n, 
          sent_email: true, 
          email_sent_at: new Date().toISOString() 
        }))
      );
      
      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Error al marcar todas las notificaciones como leídas');
    }
  };

  const sendEmailNotification = async (notificationData: ReconversionNotificationData) => {
    try {
      // Get recipient email
      const recipientId = notificationData.recipientUserId || user?.id;
      if (!recipientId) return;

      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(recipientId);
      if (userError || !userData.user?.email) return;

      // Send email via edge function
      const { data, error } = await supabase.functions.invoke('send-reconversion-notification', {
        body: {
          type: notificationData.type,
          recipient_email: userData.user.email,
          reconversion_data: {
            id: notificationData.reconversionId,
            company_name: notificationData.metadata?.company_name || 'Reconversión',
            priority: notificationData.metadata?.priority,
            status: notificationData.metadata?.status
          },
          metadata: notificationData.metadata
        }
      });

      if (error) throw error;

      // Update notification as email sent
      const { error: updateError } = await supabase
        .from('reconversion_notifications')
        .update({ 
          sent_email: true, 
          email_sent_at: new Date().toISOString() 
        })
        .eq('reconversion_id', notificationData.reconversionId)
        .eq('notification_type', notificationData.type)
        .eq('recipient_user_id', recipientId);

      if (updateError) {
        console.error('Error updating email status:', updateError);
      }

    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  };

  const createNotification = async (notificationData: ReconversionNotificationData) => {
    if (!user) return;

    try {
      const recipientId = notificationData.recipientUserId || user.id;

      const { data, error } = await supabase
        .rpc('send_reconversion_notification', {
          p_reconversion_id: notificationData.reconversionId,
          p_notification_type: notificationData.type,
          p_recipient_user_id: recipientId,
          p_title: notificationData.title,
          p_message: notificationData.message,
          p_metadata: notificationData.metadata || {}
        });

      if (error) throw error;

      // Send email notification in background
      await sendEmailNotification(notificationData);

      // Refresh notifications
      await fetchNotifications();

      // Show toast notification
      toast.success(notificationData.title, {
        description: notificationData.message
      });

    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Error al crear notificación');
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('reconversion_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reconversion_notifications',
          filter: `recipient_user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as ReconversionNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast.info(newNotification.title, {
            description: newNotification.message
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
    refetch: fetchNotifications
  };
}