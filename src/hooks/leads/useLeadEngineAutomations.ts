import { useEffect, useMemo, useRef } from 'react';
import { Lead, LeadPriority } from '@/types/Lead';
import { useLeadTaskEngine, LeadTaskEngineRecord, LeadTaskPriority, LeadTaskType } from '@/hooks/leads/useLeadTaskEngine';
import { TASK_TEMPLATES } from '@/hooks/leads/taskTemplates';

// Automations for LeadTaskEngine based on business rules
// - On lead creation with known sector: schedule starter tasks
// - On qualification: trigger datos_sabi
// - Chained tasks: datos_sabi -> balances_4y; (informe_mercado & balances_4y) -> valoracion_inicial, perfilar_oportunidad
// - Re-engagement: if 72h without contact, reprogram videollamada and llamada with higher priority
// - Priority adjustment: HIGH/URGENT reduce due dates by 1 day for created tasks

function toEnginePriority(p?: LeadPriority): LeadTaskPriority | undefined {
  if (!p) return undefined;
  switch (p) {
    case 'LOW': return 'low';
    case 'MEDIUM': return 'medium';
    case 'HIGH': return 'high';
    case 'URGENT': return 'urgent';
    default: return undefined;
  }
}

function bumpPriority(p: LeadTaskPriority): LeadTaskPriority {
  const order: LeadTaskPriority[] = ['low','medium','high','urgent'];
  const idx = order.indexOf(p);
  return order[Math.min(order.length - 1, Math.max(0, idx + 1))];
}

function addDays(days: number): string {
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms).toISOString();
}

function daysBetween(fromISO?: string): number {
  if (!fromISO) return Number.POSITIVE_INFINITY;
  const from = new Date(fromISO).getTime();
  const diffMs = Date.now() - from;
  return diffMs / (24 * 60 * 60 * 1000);
}

export const useLeadEngineAutomations = (lead?: Lead) => {
  const leadId = lead?.id;
  const { tasks, createTask, updateTask, isCreating, isUpdating } = useLeadTaskEngine(leadId);

  // Guard to avoid re-running on every re-render
  const ranInitialRef = useRef(false);
  const ranQualifiedRef = useRef(false);
  const ranReengageRef = useRef(false);

  const priorityReductionDays = useMemo(() => {
    const p = lead?.priority;
    return p === 'HIGH' || p === 'URGENT' ? 1 : 0;
  }, [lead?.priority]);

  const hasType = (type: LeadTaskType, statuses: Array<LeadTaskEngineRecord['status']> = ['open','snoozed','done']) => {
    return (tasks || []).some(t => t.type === type && statuses.includes(t.status));
  };

  const getFirstOpenOfType = (type: LeadTaskType): LeadTaskEngineRecord | undefined => {
    return (tasks || []).find(t => t.type === type && (t.status === 'open' || t.status === 'snoozed'));
  };

  // 1) On lead created with known sector -> starter tasks
  useEffect(() => {
    if (!lead || !leadId || !tasks) return;
    if (ranInitialRef.current) return;

    const sectorKnown = !!(lead.sector_id || (lead as any).sector?.id);
    if (!sectorKnown) return;

    const alreadyHasStarters = ['whatsapp','videollamada','llamada','preguntas_reunion','informe_mercado']
      .some(t => hasType(t as LeadTaskType));

    if (alreadyHasStarters) {
      ranInitialRef.current = true;
      return;
    }

    const plan: Array<{ type: LeadTaskType; offset: number }> = [
      { type: 'whatsapp', offset: 0 },
      { type: 'videollamada', offset: 0 },
      { type: 'llamada', offset: 1 },
      { type: 'preguntas_reunion', offset: 1 },
      { type: 'informe_mercado', offset: 2 },
    ];

    plan.forEach(({ type, offset }) => {
      const baseOffset = offset;
      const finalOffset = Math.max(0, baseOffset - priorityReductionDays);
      const tpl = TASK_TEMPLATES[type];
      const dueInDays = finalOffset ?? tpl?.dueOffsetDays ?? 1;
      createTask({
        lead_id: leadId,
        type,
        due_date: addDays(dueInDays),
        priority: toEnginePriority(lead.priority) || tpl?.defaultPriority || 'medium'
      });
    });

    ranInitialRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, tasks]);

  // 2) On QUALIFIED -> datos_sabi (T+0)
  useEffect(() => {
    if (!lead || !leadId || !tasks) return;
    if (ranQualifiedRef.current) return;

    const isQualified = lead.status === 'QUALIFIED' || lead.stage === 'cualificado';
    if (!isQualified) return;

    if (!hasType('datos_sabi')) {
      const tpl = TASK_TEMPLATES['datos_sabi'];
      const dueInDays = Math.max(0, (tpl?.dueOffsetDays ?? 0) - priorityReductionDays);
      createTask({
        lead_id: leadId,
        type: 'datos_sabi',
        due_date: addDays(dueInDays),
        priority: toEnginePriority(lead.priority) || tpl?.defaultPriority || 'high'
      });
    }

    // Ensure balances_4y exists (chained) but keep dependency
    if (!hasType('balances_4y')) {
      const tpl = TASK_TEMPLATES['balances_4y'];
      const dueInDays = Math.max(0, (tpl?.dueOffsetDays ?? 2) - priorityReductionDays);
      createTask({
        lead_id: leadId,
        type: 'balances_4y',
        due_date: addDays(dueInDays),
        dependencies: ['datos_sabi'],
        priority: toEnginePriority(lead.priority) || tpl?.defaultPriority || 'high'
      });
    }

    ranQualifiedRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.status, lead?.stage, leadId, tasks]);

  // 3) Chained creations based on completions
  useEffect(() => {
    if (!tasks || !leadId) return;

    const t = (type: LeadTaskType) => tasks.find(x => x.type === type);

    const datosDone = t('datos_sabi')?.status === 'done';
    const balancesExists = !!t('balances_4y');
    if (datosDone && !balancesExists) {
      const tpl = TASK_TEMPLATES['balances_4y'];
      const dueInDays = Math.max(0, (tpl?.dueOffsetDays ?? 2) - priorityReductionDays);
      createTask({
        lead_id: leadId,
        type: 'balances_4y',
        due_date: addDays(dueInDays),
        priority: toEnginePriority(lead?.priority) || tpl?.defaultPriority || 'high'
      });
    }

    const informeDone = t('informe_mercado')?.status === 'done';
    const balancesDone = t('balances_4y')?.status === 'done';

    const bothDone = informeDone && balancesDone;

    if (bothDone) {
      if (!t('valoracion_inicial')) {
        const tpl = TASK_TEMPLATES['valoracion_inicial'];
        const dueInDays = Math.max(0, (tpl?.dueOffsetDays ?? 1) - priorityReductionDays);
        createTask({ lead_id: leadId, type: 'valoracion_inicial', due_date: addDays(dueInDays), priority: toEnginePriority(lead?.priority) || tpl?.defaultPriority || 'high' });
      }
      if (!t('perfilar_oportunidad')) {
        const tpl = TASK_TEMPLATES['perfilar_oportunidad'];
        const dueInDays = Math.max(0, (tpl?.dueOffsetDays ?? 3) - priorityReductionDays);
        createTask({ lead_id: leadId, type: 'perfilar_oportunidad', due_date: addDays(dueInDays), priority: toEnginePriority(lead?.priority) || tpl?.defaultPriority || 'medium' });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tasks?.map(t => ({ type: t.type, status: t.status }))), leadId]);

  // 4) Re-engagement after 72h without contact
  useEffect(() => {
    if (!lead || !leadId || !tasks) return;
    if (ranReengageRef.current) return;

    const hoursSinceLast = daysBetween(lead.last_contacted) * 24;
    const needsReengage = hoursSinceLast >= 72;

    if (!needsReengage) return;

    const types: LeadTaskType[] = ['videollamada','llamada'];

    types.forEach((type) => {
      const openTask = getFirstOpenOfType(type);
      if (openTask) {
        // If already due soon (within next 24h), skip
        const dueInHours = (new Date(openTask.due_date || Date.now()).getTime() - Date.now()) / (60 * 60 * 1000);
        if (dueInHours <= 24) return;
        const newPrio = bumpPriority(openTask.priority);
        updateTask({ id: openTask.id, updates: { priority: newPrio, due_date: new Date().toISOString() } as Partial<LeadTaskEngineRecord> });
      } else {
        // Create a new task right now with higher priority than lead's
        const basePrio = toEnginePriority(lead.priority) || 'medium';
        const newPrio = bumpPriority(basePrio);
        createTask({ lead_id: leadId, type, due_date: addDays(0), priority: newPrio });
      }
    });

    ranReengageRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.last_contacted, leadId, tasks]);

  return null;
};
