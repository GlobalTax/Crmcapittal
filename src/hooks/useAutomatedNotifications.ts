import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { NotificationRule, NotificationLog, AutomatedNotificationResponse } from '@/types/AutomatedNotifications';

export const useAutomatedNotifications = () => {
  // Query para obtener reglas de notificación
  const {
    data: notificationRules = [],
    isLoading: rulesLoading,
    error: rulesError,
    refetch: refetchRules
  } = useQuery({
    queryKey: ['notification_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_rules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as NotificationRule[];
    },
  });

  // Query para obtener logs de notificaciones
  const {
    data: notificationLogs = [],
    isLoading: logsLoading,
    error: logsError,
    refetch: refetchLogs
  } = useQuery({
    queryKey: ['notification_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as NotificationLog[];
    },
  });

  // Mutation para ejecutar notificaciones automáticas manualmente
  const triggerAutomatedNotifications = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('automated-notifications', {
        body: { manual_trigger: true }
      });

      if (error) throw error;
      return data as AutomatedNotificationResponse;
    },
    onSuccess: (data) => {
      toast.success(`Notificaciones procesadas: ${data.notifications_sent} enviadas`);
      refetchLogs();
    },
    onError: (error) => {
      console.error('Error triggering notifications:', error);
      toast.error('Error al procesar notificaciones automáticas');
    },
  });

  // Mutation para actualizar regla de notificación
  const updateNotificationRule = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NotificationRule> }) => {
      const { data, error } = await supabase
        .from('notification_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Regla de notificación actualizada');
      refetchRules();
    },
    onError: (error) => {
      console.error('Error updating notification rule:', error);
      toast.error('Error al actualizar regla de notificación');
    },
  });

  // Mutation para crear nueva regla de notificación
  const createNotificationRule = useMutation({
    mutationFn: async (ruleData: Omit<NotificationRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('notification_rules')
        .insert(ruleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Regla de notificación creada');
      refetchRules();
    },
    onError: (error) => {
      console.error('Error creating notification rule:', error);
      toast.error('Error al crear regla de notificación');
    },
  });

  return {
    // Data
    notificationRules,
    notificationLogs,
    
    // Loading states
    rulesLoading,
    logsLoading,
    
    // Errors
    rulesError,
    logsError,
    
    // Actions
    triggerAutomatedNotifications: triggerAutomatedNotifications.mutate,
    updateNotificationRule: updateNotificationRule.mutate,
    createNotificationRule: createNotificationRule.mutate,
    
    // Refetch functions
    refetchRules,
    refetchLogs,
    
    // Loading states for mutations
    isTriggeringNotifications: triggerAutomatedNotifications.isPending,
    isUpdatingRule: updateNotificationRule.isPending,
    isCreatingRule: createNotificationRule.isPending,
  };
};