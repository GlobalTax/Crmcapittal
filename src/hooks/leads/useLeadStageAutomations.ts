import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { add } from 'date-fns';
import { Lead } from '@/types/Lead';
import { INTEGRATIONS_CONFIG } from '@/config/integrations';
import { LeadStage, normalizeStage } from '@/features/pipeline/stages';
import { useToast } from '@/hooks/use-toast';

export const useLeadStageAutomations = () => {
  const { toast } = useToast();
  const createEvent = useCallback(async (
    leadId: string,
    title: string,
    startIn: { hours?: number; days?: number } = {},
    extra?: Partial<{ meeting_type: string; follow_up_required: boolean; description: string; is_recurring: boolean; recurrence_rule: string; reminder_minutes: number }>
  ) => {
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return;

    const start = add(new Date(), { hours: startIn.hours ?? 0, days: startIn.days ?? 0 });
    const end = add(start, { minutes: 30 });

    await supabase.from('calendar_events').insert({
      user_id: userId,
      lead_id: leadId,
      title,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      meeting_type: extra?.meeting_type ?? 'general',
      follow_up_required: extra?.follow_up_required ?? false,
      description: extra?.description ?? null,
      status: 'confirmed',
      visibility: 'private',
      is_recurring: extra?.is_recurring ?? false,
      recurrence_rule: extra?.recurrence_rule ?? null,
      reminder_minutes: extra?.reminder_minutes ?? 15,
    });
  }, []);

  const notifySlackAssign = useCallback(async (lead: Lead) => {
    try {
      if (!INTEGRATIONS_CONFIG.automations.enabled || !INTEGRATIONS_CONFIG.slack.enabled) return;
      const assignee = lead.assigned_to?.first_name || lead.assigned_to?.id || lead.assigned_to_id || 'usuario';
      const text = `Nuevo lead asignado → ${lead.name || lead.company_name || 'Sin nombre'} (Fuente: ${lead.source || 'N/A'}) asignado a ${assignee}`;
      await supabase.functions.invoke('slack-notify', { body: { text } });
    } catch (e) {
      console.warn('Slack notify falló (no bloqueante):', e);
    }
  }, []);

  const runForStageChange = useCallback(async (lead: Lead, stageName: string) => {
    if (!INTEGRATIONS_CONFIG.automations.enabled) return;
    const s = normalizeStage(stageName);

    if (s === LeadStage.NewLead) {
      if (lead.assigned_to || lead.assigned_to_id) {
        await notifySlackAssign(lead);
      }
    }

    if (s === LeadStage.Qualified) {
      await createEvent(lead.id, 'Enviar NDA', {}, { follow_up_required: true, description: 'Tarea automática: enviar NDA' });
    }

    if (s === LeadStage.NdaSent) {
      await createEvent(lead.id, 'Recordatorio firma NDA', { hours: 72 }, { description: 'Recordatorio automático 72h', reminder_minutes: 60 });
    }

    if (s === LeadStage.InfoShared) {
      await createEvent(lead.id, 'Reunión de gestión', { days: 1 }, { meeting_type: 'general', description: 'Crear link de Zoom (pendiente)' });
    }

    if (s === LeadStage.Negotiation) {
      await createEvent(lead.id, 'Seguimiento negociación', { days: 5 }, { description: 'Recordatorio cada 5 días sin feedback', is_recurring: true, recurrence_rule: 'FREQ=DAILY;INTERVAL=5' });
    }

    if (s === LeadStage.Qualified || s === LeadStage.NdaSent || s === LeadStage.InfoShared || s === LeadStage.Negotiation) {
      toast({
        title: 'Automatización de tareas',
        description: 'Se han programado tareas automáticamente para esta etapa.',
      });
    }
  }, [createEvent, notifySlackAssign, toast]);

  const runForWin = useCallback(async (lead: Lead) => {
    if (!INTEGRATIONS_CONFIG.automations.enabled) return;
    const type = lead.service_type === 'mandato_venta' ? 'sell' : 'buy';
    try {
      await supabase.rpc('create_entity_from_lead', {
        p_lead_id: lead.id,
        p_type: type,
        p_payload: {},
        p_link: true,
      });
    } catch (e) {
      console.error('Error creando entidad desde lead:', e);
    }
  }, []);

  const runForLose = useCallback(async (_lead: Lead) => {
    return;
  }, []);

  return { runForStageChange, runForWin, runForLose };
};
