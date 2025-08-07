import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: 'proposal_send' | 'follow_up' | 'reminder' | 'thank_you' | 'custom';
  variables: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger_type: 'proposal_sent' | 'proposal_viewed' | 'no_response' | 'time_based' | 'manual';
  trigger_config: Record<string, any>;
  conditions: any[];
  actions: any[];
  enabled: boolean;
  priority: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomatedFollowup {
  id: string;
  proposal_id: string;
  rule_id?: string;
  template_id?: string;
  recipient_email: string;
  scheduled_for: string;
  sent_at?: string;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  subject?: string;
  content?: string;
  metadata: Record<string, any>;
  error_message?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemNotification {
  id: string;
  user_id: string;
  type: 'proposal_viewed' | 'follow_up_sent' | 'response_received' | 'deadline_approaching' | 'automation_failed';
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  read_at?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
}

export const useEmailTemplates = () => {
  const queryClient = useQueryClient();

  const {
    data: templates = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Plantilla de email creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Error al crear la plantilla de email');
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailTemplate> }) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Plantilla actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Error al actualizar la plantilla');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Plantilla eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Error al eliminar la plantilla');
    },
  });

  return {
    templates,
    isLoading,
    error,
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
  };
};

export const useAutomationRules = () => {
  const queryClient = useQueryClient();

  const {
    data: rules = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as AutomationRule[];
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert([ruleData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla de automatización creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating rule:', error);
      toast.error('Error al crear la regla de automatización');
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AutomationRule> }) => {
      const { data, error } = await supabase
        .from('automation_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Regla actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating rule:', error);
      toast.error('Error al actualizar la regla');
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from('automation_rules')
        .update({ enabled })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast.success('Estado de la regla actualizado');
    },
    onError: (error) => {
      console.error('Error toggling rule:', error);
      toast.error('Error al cambiar el estado de la regla');
    },
  });

  return {
    rules,
    isLoading,
    error,
    createRule: createRuleMutation.mutate,
    updateRule: updateRuleMutation.mutate,
    toggleRule: toggleRuleMutation.mutate,
    isCreating: createRuleMutation.isPending,
    isUpdating: updateRuleMutation.isPending,
    isToggling: toggleRuleMutation.isPending,
  };
};

export const useSystemNotifications = () => {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['system-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as SystemNotification[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('system_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('system_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-notifications'] });
      toast.success('Todas las notificaciones marcadas como leídas');
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast.error('Error al marcar las notificaciones como leídas');
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};

export const useAutomatedFollowups = (proposalId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: followups = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['automated-followups', proposalId],
    queryFn: async () => {
      let query = supabase
        .from('automated_followups')
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (proposalId) {
        query = query.eq('proposal_id', proposalId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AutomatedFollowup[];
    },
    enabled: !!proposalId,
  });

  const scheduleFollowupMutation = useMutation({
    mutationFn: async (followupData: Omit<AutomatedFollowup, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('automated_followups')
        .insert([followupData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-followups'] });
      toast.success('Seguimiento automático programado');
    },
    onError: (error) => {
      console.error('Error scheduling followup:', error);
      toast.error('Error al programar el seguimiento');
    },
  });

  const cancelFollowupMutation = useMutation({
    mutationFn: async (followupId: string) => {
      const { error } = await supabase
        .from('automated_followups')
        .update({ status: 'cancelled' })
        .eq('id', followupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-followups'] });
      toast.success('Seguimiento cancelado');
    },
    onError: (error) => {
      console.error('Error canceling followup:', error);
      toast.error('Error al cancelar el seguimiento');
    },
  });

  return {
    followups,
    isLoading,
    error,
    scheduleFollowup: scheduleFollowupMutation.mutate,
    cancelFollowup: cancelFollowupMutation.mutate,
    isScheduling: scheduleFollowupMutation.isPending,
    isCanceling: cancelFollowupMutation.isPending,
  };
};