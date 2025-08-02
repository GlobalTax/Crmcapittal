import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date().toISOString().split('T')[0];
    
    console.log(`🔄 Ejecutando winback scheduler para ${today}`);

    // 1. Obtener intentos pendientes para hoy
    const { data: pendingAttempts, error: attemptsError } = await supabase
      .from('winback_attempts')
      .select(`
        id,
        lead_id,
        sequence_id,
        step_index,
        canal,
        template_id,
        scheduled_date,
        leads!inner(
          id,
          name,
          email,
          phone,
          company,
          winback_stage
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_date', today)
      .limit(50); // Procesar máximo 50 por ejecución

    if (attemptsError) {
      throw attemptsError;
    }

    console.log(`📋 Encontrados ${pendingAttempts?.length || 0} intentos pendientes`);

    const results = {
      processed: 0,
      emails_sent: 0,
      calls_scheduled: 0,
      linkedin_queued: 0,
      errors: 0
    };

    // 2. Procesar cada intento
    for (const attempt of pendingAttempts || []) {
      try {
        const lead = attempt.leads;
        
        console.log(`📤 Procesando intento ${attempt.id} para lead ${lead.name} (${attempt.canal})`);

        let status = 'sent';
        let notes = '';

        switch (attempt.canal) {
          case 'email':
            // Aquí se integraría con el servicio de email
            // Por ahora simulamos el envío
            console.log(`📧 Enviando email a ${lead.email}`);
            notes = `Email programado enviado automáticamente`;
            results.emails_sent++;
            break;

          case 'call':
            // Crear tarea de llamada para el usuario asignado
            const { error: taskError } = await supabase
              .from('lead_tasks')
              .insert([{
                lead_id: lead.id,
                title: `Llamada Winback - ${lead.name}`,
                description: `Llamada de reactivación programada automáticamente. Paso ${attempt.step_index + 1} de secuencia winback.`,
                task_type: 'call',
                priority: 'high',
                due_date: new Date().toISOString(),
                status: 'pending'
              }]);

            if (taskError) {
              console.error('Error creando tarea de llamada:', taskError);
              status = 'failed';
              notes = `Error creando tarea: ${taskError.message}`;
            } else {
              notes = `Tarea de llamada creada automáticamente`;
              results.calls_scheduled++;
            }
            break;

          case 'linkedin':
            // Marcar como pendiente para revisión manual
            status = 'pending';
            notes = `Mensaje LinkedIn preparado para envío manual`;
            results.linkedin_queued++;
            break;

          default:
            status = 'skipped';
            notes = `Canal ${attempt.canal} no soportado`;
        }

        // 3. Actualizar el intento
        const { error: updateError } = await supabase
          .from('winback_attempts')
          .update({
            status,
            executed_date: new Date().toISOString(),
            notes,
            response_data: {
              processed_by: 'scheduler',
              processed_at: new Date().toISOString(),
              canal: attempt.canal
            }
          })
          .eq('id', attempt.id);

        if (updateError) {
          console.error(`Error actualizando intento ${attempt.id}:`, updateError);
          results.errors++;
        } else {
          results.processed++;
        }

        // 4. Actualizar winback_stage del lead si es el primer paso
        if (attempt.step_index === 0 && status === 'sent') {
          await supabase
            .from('leads')
            .update({
              winback_stage: 'campaign_sent',
              last_winback_attempt: today
            })
            .eq('id', lead.id);
        }

      } catch (error) {
        console.error(`Error procesando intento ${attempt.id}:`, error);
        results.errors++;
      }
    }

    // 5. Log de actividad
    const { error: logError } = await supabase
      .from('system_logs')
      .insert([{
        event_type: 'winback_scheduler_executed',
        description: `Scheduler ejecutado: ${results.processed} intentos procesados`,
        metadata: {
          date: today,
          results,
          total_pending: pendingAttempts?.length || 0
        }
      }]);

    if (logError) {
      console.error('Error logging activity:', logError);
    }

    console.log(`✅ Winback scheduler completado:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Winback scheduler executed successfully',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error in winback scheduler:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})