import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LeadTaskEngineRecord, LeadTaskType, useLeadTaskEngine } from '@/hooks/leads/useLeadTaskEngine';
import { TASK_TEMPLATES } from '@/hooks/leads/taskTemplates';
import { LeadTaskSLA } from './LeadTaskSLA';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateValuationLightPDF } from '@/utils/valuation/pdf';

interface Props { leadId: string }

const QUICK_ACTIONS: { label: string; type: LeadTaskType }[] = [
  { label: 'Informe Mercado (IA)', type: 'informe_mercado' },
  { label: 'Preguntas Reunión (IA)', type: 'preguntas_reunion' },
  { label: 'Agendar Video', type: 'videollamada' },
  { label: 'WhatsApp', type: 'whatsapp' },
  { label: 'Llamada', type: 'llamada' },
  { label: 'SABI', type: 'datos_sabi' },
  { label: 'Balances', type: 'balances_4y' },
];

const StatusBadge: React.FC<{ status: LeadTaskEngineRecord['status'] }> = ({ status }) => {
  const map: Record<string, { text: string; variant: 'secondary' | 'outline' | 'default' }> = {
    open: { text: 'Abierta', variant: 'secondary' },
    snoozed: { text: 'Pospuesta', variant: 'outline' },
    done: { text: 'Hecha', variant: 'default' },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.text}</Badge>;
};

export const LeadTaskEnginePanel: React.FC<Props> = ({ leadId }) => {
  const { tasks, createTask, completeTask, snoozeTask, updateTask, isLoading } = useLeadTaskEngine(leadId);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const sorted = useMemo(() => {
    const arr = [...(tasks || [])];
    arr.sort((a, b) => {
      const order = (s: LeadTaskEngineRecord['status']) => (s === 'open' ? 0 : s === 'snoozed' ? 1 : 2);
      const byStatus = order(a.status) - order(b.status);
      if (byStatus !== 0) return byStatus;
      const aDue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const bDue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return aDue - bDue;
    });
    return arr;
  }, [tasks]);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const clearSel = () => setSelected({});

  const doCreate = (type: LeadTaskType) => {
    const tpl = TASK_TEMPLATES[type];
    createTask({ lead_id: leadId, type, priority: tpl?.defaultPriority });
  };

  const completeSelected = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    await Promise.all(ids.map((id) => completeTask(id)));
    clearSel();
  };

  const snoozeSelected = async (days: number) => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    await Promise.all(ids.map((id) => snoozeTask({ id, days })));
    clearSel();
  };

  const reassignSelectedToMe = async () => {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return toast.error('No autenticado');
    const ids = Object.keys(selected).filter((k) => selected[k]);
    await Promise.all(ids.map((id) => updateTask({ id, updates: { assigned_to: uid } as Partial<LeadTaskEngineRecord> })));
    clearSel();
  };

  // Valoración: generar PDF y adjuntar a tarea
  const handleGenerateValuation = async (task: LeadTaskEngineRecord) => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return toast.error('No autenticado');

      const { data: leadRes, error: leadErr } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .maybeSingle();
      if (leadErr || !leadRes) throw leadErr || new Error('Lead no encontrado');

      const { blob, fileName } = await generateValuationLightPDF(leadRes as any);
      const path = `${uid}/${leadId}/${Date.now()}_${fileName}`;
      const { error: upErr } = await supabase.storage.from('valuations').upload(path, blob, {
        contentType: 'application/pdf',
        upsert: true,
      });
      if (upErr) throw upErr;

      const { data: signed } = await supabase.storage.from('valuations').createSignedUrl(path, 60 * 60 * 24 * 7);
      const meta = { ...(task.metadata || {}), storage_bucket: 'valuations', storage_path: path, signed_url: signed?.signedUrl };
      await updateTask({ id: task.id, updates: { metadata: meta } as Partial<LeadTaskEngineRecord> });
      toast.success('PDF generado y adjuntado a la tarea');
    } catch (e: any) {
      console.error(e);
      toast.error('Error al generar la valoración');
    }
  };

  const handleSendValuation = async (task: LeadTaskEngineRecord) => {
    try {
      const { data: leadRes, error: leadErr } = await supabase
        .from('leads')
        .select('email,name')
        .eq('id', leadId)
        .maybeSingle();
      if (leadErr || !leadRes) throw leadErr || new Error('Lead no encontrado');

      const link = (task.metadata as any)?.signed_url as string | undefined;
      if (!link) return toast.error('Genera primero el PDF');

      const { data, error } = await supabase.functions.invoke('send-valuation-email', {
        body: { email: leadRes.email, name: leadRes.name, link, leadId, taskId: task.id },
      });
      if (error) throw error;
      toast.success('Email enviado (revisa seguimiento)');
    } catch (e: any) {
      console.error(e);
      toast.error('No se pudo enviar el email (configura Resend si es la primera vez)');
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((qa) => (
          <Button key={qa.type} variant="outline" size="sm" onClick={() => doCreate(qa.type)}>
            {qa.label}
          </Button>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Batch bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {Object.values(selected).filter(Boolean).length > 0
            ? `${Object.values(selected).filter(Boolean).length} seleccionadas`
            : `${sorted.length} tareas`}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={completeSelected} disabled={Object.values(selected).every((v) => !v)}>
            Completar
          </Button>
          <Button variant="outline" size="sm" onClick={() => snoozeSelected(1)} disabled={Object.values(selected).every((v) => !v)}>
            Posponer 1d
          </Button>
          <Button variant="outline" size="sm" onClick={reassignSelectedToMe} disabled={Object.values(selected).every((v) => !v)}>
            Reasignar a mí
          </Button>
        </div>
      </div>

      {/* Checklist */}
      <div className="flex-1 min-h-0 overflow-y-auto mt-3 space-y-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : sorted.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin tareas del motor</div>
        ) : (
          sorted.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!selected[t.id]}
                onChange={() => toggle(t.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{t.title || t.type}</span>
                  <StatusBadge status={t.status} />
                  <LeadTaskSLA task={t} />
                </div>
                {t.dependencies?.length ? (
                  <div className="mt-1 text-xs text-muted-foreground">Deps: {t.dependencies.join(', ')}</div>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {t.type === 'valoracion_inicial' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleGenerateValuation(t)}>
                      Generar PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleSendValuation(t)}>
                      Enviar
                    </Button>
                  </>
                )}
                {['informe_mercado','preguntas_reunion'].includes(t.type) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const { data: leadRes } = await supabase.from('leads').select('name').eq('id', leadId).maybeSingle();
                      const prompt = t.type === 'informe_mercado'
                        ? `Quiero un informe ejecutivo y accionable sobre el mercado en el que opera esta empresa.\n\nContexto del lead:\n- Empresa: ${leadRes?.name || ''}\n- Sector/NAICS: \n- País/Región: \n- Tamaño/Facturación estimada: \n- Notas clave del lead: \n\n[Estructura]\n1) Tamaño/dinámica (TAM/SAM/SOM aproximado)\n2) Tendencias (3–5) con impacto directo\n3) Competidores (3–6) y posicionamiento breve\n4) Múltiplos habituales (Revenue, EBITDA) del segmento\n5) SWOT con supuestos razonables\n6) Recomendaciones inmediatas (3–5)\n7) Fuentes (enlaces fiables)\n\nFormato: profesional y conciso.`
                        : `Necesito un set breve de preguntas para una reunión de 30 minutos con ${leadRes?.name || ''} (sector: ), orientadas a descubrir oportunidad de M&A/valoración.\n\n[8–12 preguntas]\n- Objetivos estratégicos (2–3)\n- Palancas de crecimiento y retos (2–3)\n- Situación financiera operativa (2–3)\n- Proceso/stakeholders de decisión (2)\n- Próximos pasos comprometibles (2)\n- +2 opcionales si hay tiempo\n\nEstilo: claras, abiertas, orden lógico, no invasivas.`;
                      await navigator.clipboard.writeText(prompt);
                      toast.success('Prompt copiado');
                    }}
                  >
                    Copiar prompt
                  </Button>
                )}
                {t.can_start === false && t.dependencies?.length ? (
                  <Button size="sm" variant="outline" onClick={() => completeTask(t.dependencies[0])}>
                    Marcar predecesora
                  </Button>
                ) : null}
                {t.can_start === false ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button size="sm" variant="secondary" disabled>
                          Hecho
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Completa primero la(s) predecesora(s)
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => completeTask(t.id)}
                    disabled={t.status === 'done'}
                  >
                    Hecho
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => snoozeTask({ id: t.id, days: 1 })} disabled={t.status === 'done'}>
                  +1d
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeadTaskEnginePanel;
