import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL');
const TEAMS_WEBHOOK_URL = Deno.env.get('TEAMS_WEBHOOK_URL');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: 'Missing Supabase envs' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!SLACK_WEBHOOK_URL && !TEAMS_WEBHOOK_URL) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, message: 'No webhooks configured (Slack/Teams). Skipping send.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    });

    const { data: tasks, error } = await supabase.rpc('get_pending_engine_task_reminders');
    if (error) throw error;

    let sent = 0;
    for (const t of tasks as any[]) {
      const text = t.kind === 'pre_sla'
        ? `⏰ Recordatorio: *${t.title}* (tipo: ${t.task_type}) vence en <24h — Lead: ${t.lead_name || t.lead_id}`
        : `⚠️ SLA vencido: *${t.title}* (tipo: ${t.task_type}) — Lead: ${t.lead_name || t.lead_id}`;

      const deliveries: Promise<Response>[] = [];
      if (SLACK_WEBHOOK_URL) {
        deliveries.push(fetch(SLACK_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }));
      }
      if (TEAMS_WEBHOOK_URL) {
        deliveries.push(fetch(TEAMS_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }));
      }
      await Promise.allSettled(deliveries);
      await supabase.rpc('mark_engine_task_notified', { p_task_id: t.task_id, p_kind: t.kind });
      sent++;
    }

    return new Response(JSON.stringify({ ok: true, sent }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('task-reminders error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
