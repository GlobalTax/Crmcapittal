import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type LeadTaskType =
  | 'valoracion_inicial'
  | 'llamada'
  | 'whatsapp'
  | 'informe_mercado'
  | 'datos_sabi'
  | 'balances_4y'
  | 'preguntas_reunion'
  | 'videollamada'
  | 'perfilar_oportunidad';

export type LeadTaskStatus = 'open' | 'done' | 'snoozed';
export type LeadTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface LeadTaskEngineRecord {
  id: string;
  lead_id: string;
  type: LeadTaskType;
  title: string;
  description?: string | null;
  due_date?: string | null;
  assigned_to?: string | null;
  priority: LeadTaskPriority;
  status: LeadTaskStatus;
  dependencies: string[];
  metadata?: any;
  sla_hours?: number | null;
  sla_breached?: boolean | null;
  completed_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // computed from RPC
  can_start?: boolean;
  dependency_status?: Record<string, LeadTaskStatus | null>;
}

export interface CreateLeadEngineTask {
  lead_id: string;
  type: LeadTaskType;
  title?: string;
  description?: string;
  due_date?: string; // ISO
  priority?: LeadTaskPriority;
  assigned_to?: string;
  dependencies?: string[];
  metadata?: any;
}

const DEFAULT_TITLES: Record<LeadTaskType, string> = {
  valoracion_inicial: 'Valoración inicial',
  llamada: 'Llamada inicial',
  whatsapp: 'Mensaje WhatsApp',
  informe_mercado: 'Informe de mercado',
  datos_sabi: 'Descargar datos SABI',
  balances_4y: 'Recopilar balances (4 años)',
  preguntas_reunion: 'Preparar preguntas de reunión',
  videollamada: 'Agendar videollamada',
  perfilar_oportunidad: 'Perfilar oportunidad',
};

export const useLeadTaskEngine = (leadId?: string) => {
  const qc = useQueryClient();

  const tasksQuery = useQuery<LeadTaskEngineRecord[]>({
    queryKey: ['lead-task-engine', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const { data, error } = await supabase.rpc('get_lead_tasks_with_dependencies', {
        p_lead_id: leadId,
      });
      if (error) {
        console.error('Error fetching engine tasks', error);
        throw new Error('No se pudieron cargar las tareas');
      }
      return (data || []) as LeadTaskEngineRecord[];
    },
    enabled: !!leadId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateLeadEngineTask) => {
      const { data: userData } = await supabase.auth.getUser();
      const type = input.type;

      // Obtener SLA por tipo para calcular due_date si no se envía
      const { data: slaRow } = await supabase
        .from('lead_task_sla_policies')
        .select('default_sla_hours')
        .eq('task_type', type)
        .maybeSingle();

      const slaHours = slaRow?.default_sla_hours ?? 24;
      const dueISO = input.due_date
        ? input.due_date
        : new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('lead_task_engine')
        .insert({
          lead_id: input.lead_id,
          type,
          title: input.title || DEFAULT_TITLES[type],
          description: input.description,
          due_date: dueISO,
          assigned_to: input.assigned_to,
          priority: input.priority || 'medium',
          status: 'open',
          dependencies: input.dependencies || [],
          metadata: input.metadata || {},
          created_by: userData.user?.id,
          sla_hours: slaHours,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating engine task', error);
        throw new Error('No se pudo crear la tarea');
      }

      return data as LeadTaskEngineRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead-task-engine', leadId] });
      toast.success('Tarea creada');
    },
    onError: (e: any) => toast.error(e.message || 'Error al crear la tarea'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LeadTaskEngineRecord> }) => {
      const { data, error } = await supabase
        .from('lead_task_engine')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) {
        console.error('Error updating engine task', error);
        throw new Error('No se pudo actualizar la tarea');
      }
      return data as LeadTaskEngineRecord;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead-task-engine', leadId] });
      toast.success('Tarea actualizada');
    },
    onError: (e: any) => toast.error(e.message || 'Error al actualizar la tarea'),
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_task_engine')
        .update({ status: 'done', completed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead-task-engine', leadId] });
      toast.success('Tarea completada');
    },
    onError: () => toast.error('Error al completar la tarea'),
  });

  const snoozeMutation = useMutation({
    mutationFn: async ({ id, days }: { id: string; days: number }) => {
      const due = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from('lead_task_engine')
        .update({ status: 'snoozed', due_date: due })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead-task-engine', leadId] });
      toast.success('Tarea pospuesta');
    },
    onError: () => toast.error('Error al posponer la tarea'),
  });

  const reopenMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_task_engine')
        .update({ status: 'open', completed_at: null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead-task-engine', leadId] });
      toast.success('Tarea reabierta');
    },
    onError: () => toast.error('Error al reabrir la tarea'),
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error as Error | null,
    refetch: tasksQuery.refetch,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    completeTask: completeMutation.mutate,
    snoozeTask: snoozeMutation.mutate,
    reopenTask: reopenMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCompleting: completeMutation.isPending,
    isSnoozing: snoozeMutation.isPending,
    isReopening: reopenMutation.isPending,
  };
};
