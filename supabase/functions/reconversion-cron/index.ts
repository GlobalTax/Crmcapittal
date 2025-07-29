import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CronRequest {
  type: 'daily' | 'weekly' | 'lead_inactivity';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type }: CronRequest = await req.json();
    console.log(`Running ${type} cron job`);

    if (type === 'daily') {
      await runDailyCron(supabase);
    } else if (type === 'weekly') {
      await runWeeklyCron(supabase);
    } else if (type === 'lead_inactivity') {
      await runLeadInactivityCron(supabase);
    }

    return new Response(
      JSON.stringify({ success: true, type, timestamp: new Date().toISOString() }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in reconversion-cron function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function runDailyCron(supabase: any) {
  console.log('Running daily cron for reconversiones...');
  
  // Cron diario: si fecha_objetivo_cierre−hoy < 10 d y no cerrada → prioridad=critica
  const { data: urgentReconversiones, error: urgentError } = await supabase
    .from('reconversiones_new')
    .select('id, company_name, fecha_objetivo_cierre, assigned_to')
    .neq('estado', 'cerrada')
    .neq('prioridad', 'critica')
    .not('fecha_objetivo_cierre', 'is', null);

  if (urgentError) {
    console.error('Error fetching urgent reconversiones:', urgentError);
    return;
  }

  console.log(`Found ${urgentReconversiones?.length || 0} reconversiones to check for urgency`);

  for (const reconversion of urgentReconversiones || []) {
    const today = new Date();
    const targetDate = new Date(reconversion.fecha_objetivo_cierre);
    const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    console.log(`Reconversion ${reconversion.id}: ${daysUntilTarget} days until target closure`);

    if (daysUntilTarget < 10) {
      // Actualizar prioridad a crítica
      const { error: updateError } = await supabase
        .from('reconversiones_new')
        .update({ 
          prioridad: 'critica',
          updated_at: new Date().toISOString()
        })
        .eq('id', reconversion.id);

      if (updateError) {
        console.error(`Error updating priority for reconversion ${reconversion.id}:`, updateError);
        continue;
      }

      // Registrar en audit log
      await supabase.rpc('log_reconversion_audit', {
        p_reconversion_id: reconversion.id,
        p_action_type: 'priority_escalation',
        p_action_description: `Prioridad escalada a crítica: cierre en ${daysUntilTarget} días`,
        p_old_data: null,
        p_new_data: { prioridad: 'critica', days_until_closure: daysUntilTarget },
        p_severity: 'high',
        p_metadata: { automated: true, cron_type: 'daily' }
      });

      // Enviar notificación si hay asignado
      if (reconversion.assigned_to) {
        await supabase.rpc('send_reconversion_notification', {
          p_reconversion_id: reconversion.id,
          p_notification_type: 'urgent_closure',
          p_recipient_user_id: reconversion.assigned_to,
          p_title: 'Reconversión urgente - Cierre próximo',
          p_message: `La reconversión "${reconversion.company_name}" tiene fecha de cierre en ${daysUntilTarget} días. Prioridad escalada a crítica.`,
          p_metadata: { 
            days_until_closure: daysUntilTarget,
            automated: true,
            escalation_reason: 'approaching_closure_date'
          }
        });
      }

      console.log(`Updated reconversion ${reconversion.id} to critical priority (${daysUntilTarget} days until closure)`);
    }
  }
}

async function runWeeklyCron(supabase: any) {
  console.log('Running weekly cron for reconversiones...');
  
  // Cron semanal: si last_activity_at > 21 d → notificación "stalled"
  const twentyOneDaysAgo = new Date();
  twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);

  const { data: stalledReconversiones, error: stalledError } = await supabase
    .from('reconversiones_new')
    .select('id, company_name, last_activity_at, assigned_to, created_by')
    .neq('estado', 'cerrada')
    .neq('estado', 'cancelada')
    .lt('last_activity_at', twentyOneDaysAgo.toISOString());

  if (stalledError) {
    console.error('Error fetching stalled reconversiones:', stalledError);
    return;
  }

  console.log(`Found ${stalledReconversiones?.length || 0} stalled reconversiones`);

  for (const reconversion of stalledReconversiones || []) {
    const daysSinceActivity = Math.floor(
      (new Date().getTime() - new Date(reconversion.last_activity_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Registrar en audit log
    await supabase.rpc('log_reconversion_audit', {
      p_reconversion_id: reconversion.id,
      p_action_type: 'stalled_detected',
      p_action_description: `Reconversión estancada: ${daysSinceActivity} días sin actividad`,
      p_old_data: null,
      p_new_data: { days_since_activity: daysSinceActivity },
      p_severity: 'medium',
      p_metadata: { automated: true, cron_type: 'weekly' }
    });

    // Notificar al asignado y al creador
    const recipients = [reconversion.assigned_to, reconversion.created_by].filter(Boolean);
    
    for (const recipientId of recipients) {
      await supabase.rpc('send_reconversion_notification', {
        p_reconversion_id: reconversion.id,
        p_notification_type: 'stalled',
        p_recipient_user_id: recipientId,
        p_title: 'Reconversión estancada',
        p_message: `La reconversión "${reconversion.company_name}" lleva ${daysSinceActivity} días sin actividad. Considera realizar un seguimiento.`,
        p_metadata: { 
          days_since_activity: daysSinceActivity,
          automated: true,
          stall_reason: 'no_recent_activity'
        }
      });
    }

    console.log(`Notified stalled reconversion ${reconversion.id} (${daysSinceActivity} days inactive)`);
  }
}

async function runLeadInactivityCron(supabase: any) {
  console.log('Running lead inactivity cron...');
  
  try {
    // Call the database function to process inactive leads
    const { data, error } = await supabase.rpc('process_inactive_leads');
    
    if (error) {
      console.error('Error processing inactive leads:', error);
      return;
    }
    
    console.log('Lead inactivity processing completed:', data);
    
    if (data) {
      console.log(`Processed ${data.processed_leads} inactive leads`);
      console.log(`Created ${data.created_tasks} reactivation tasks`);
      console.log(`Applied ${data.score_penalties} score penalties`);
    }
    
  } catch (error) {
    console.error('Unexpected error in lead inactivity cron:', error);
  }
}

serve(handler);