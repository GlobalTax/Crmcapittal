import { useMemo } from 'react';
import { useLeadTasks, LeadTask as ManualLeadTask } from '@/hooks/leads/useLeadTasks';
import { useLeadTaskEngine, LeadTaskEngineRecord } from '@/hooks/leads/useLeadTaskEngine';

export type UnifiedTaskSource = 'manual' | 'engine';
export type UnifiedTaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'open' | 'done' | 'snoozed';
export type UnifiedTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface UnifiedTask {
  id: string;
  source: UnifiedTaskSource;
  lead_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: UnifiedTaskPriority;
  status: UnifiedTaskStatus;
  completed_at?: string | null;
}

function priorityWeight(p?: UnifiedTaskPriority) {
  switch (p) {
    case 'urgent': return 0;
    case 'high': return 1;
    case 'medium': return 2;
    default: return 3;
  }
}

export const useLeadUnifiedTasks = (leadId?: string) => {
  const manual = useLeadTasks(leadId);
  const engine = useLeadTaskEngine(leadId);

  const tasks: UnifiedTask[] = useMemo(() => {
    const m = (manual.tasks || []).map((t: ManualLeadTask): UnifiedTask => ({
      id: t.id,
      source: 'manual',
      lead_id: t.lead_id,
      title: t.title,
      description: t.description ?? null,
      due_date: t.due_date ?? null,
      priority: t.priority,
      status: t.status,
      completed_at: t.completed_at ?? null,
    }));

    const e = (engine.tasks || []).map((t: LeadTaskEngineRecord): UnifiedTask => ({
      id: t.id,
      source: 'engine',
      lead_id: t.lead_id,
      title: t.title,
      description: t.description ?? null,
      due_date: t.due_date ?? null,
      priority: t.priority,
      status: t.status,
      completed_at: t.completed_at ?? null,
    }));

    return [...m, ...e];
  }, [manual.tasks, engine.tasks]);

  const isLoading = manual.isLoading || engine.isLoading;
  const error = manual.error || (engine.error as any);

  const pending = useMemo(() => tasks.filter(t => t.status === 'pending' || t.status === 'open' || t.status === 'in_progress'), [tasks]);
  const completed = useMemo(() => tasks.filter(t => t.status === 'completed' || t.status === 'done'), [tasks]);
  const snoozed = useMemo(() => tasks.filter(t => t.status === 'snoozed'), [tasks]);

  const overdue = useMemo(() => tasks.filter(t => !!t.due_date && (new Date(t.due_date!).getTime() < Date.now()) && !(t.status === 'completed' || t.status === 'done')), [tasks]);

  const pendingSorted = useMemo(() => {
    return [...pending].sort((a, b) => {
      const aw = priorityWeight(a.priority);
      const bw = priorityWeight(b.priority);
      if (aw !== bw) return aw - bw;
      const ad = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const bd = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return ad - bd;
    });
  }, [pending]);

  const completeUnifiedTask = (task: UnifiedTask) => {
    if (task.source === 'engine') {
      engine.completeTask(task.id);
    } else {
      manual.completeTask(task.id);
    }
  };

  const snoozeUnifiedTask = (task: UnifiedTask, days: number) => {
    if (task.source === 'engine') {
      engine.snoozeTask({ id: task.id, days });
    } else {
      // Para tareas manuales, solo movemos la fecha de vencimiento
      const next = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      manual.updateTask({ id: task.id, updates: { due_date: next } });
    }
  };

  const refetch = () => {
    manual.refetch();
    engine.refetch();
  };

  return {
    tasks,
    isLoading,
    error,
    pending,
    completed,
    snoozed,
    overdue,
    pendingSorted,
    counts: {
      total: tasks.length,
      pending: pending.length,
      completed: completed.length,
      overdue: overdue.length,
    },
    actions: {
      completeUnifiedTask,
      snoozeUnifiedTask,
      refetch,
    },
  };
};
