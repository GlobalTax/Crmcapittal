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

    const now = new Date().toISOString();
    
    console.log(`🔄 Ejecutando winback step processor para ${now}`);

    // 1. Obtener intentos pendientes programados para ahora o antes
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
          winback_stage,
          score
        ),
        winback_sequences!inner(
          id,
          nombre,
          pasos
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_date', now)
      .limit(100); // Procesar máximo 100 por ejecución

    if (attemptsError) {
      throw attemptsError;
    }

    console.log(`📋 Encontrados ${pendingAttempts?.length || 0} intentos pendientes para procesar`);

    const results = {
      processed: 0,
      emails_sent: 0,
      calls_scheduled: 0,
      linkedin_queued: 0,
      errors: 0,
      engaging_leads: 0,
      irrecuperable_leads: 0
    };

    // 2. Procesar cada intento
    for (const attempt of pendingAttempts || []) {
      try {
        const lead = attempt.leads;
        const sequence = attempt.winback_sequences;
        const currentStep = sequence.pasos[attempt.step_index];
        
        console.log(`📤 Procesando intento ${attempt.id} para lead ${lead.name} (${attempt.canal}) - Paso ${attempt.step_index + 1}`);

        let status = 'sent';
        let notes = '';
        let responseData: any = {
          processed_by: 'step_processor',
          processed_at: now,
          canal: attempt.canal,
          step_info: currentStep
        };

        switch (attempt.canal) {
          case 'email':
            // Enviar email usando Nylas
            try {
              // Obtener template si existe
              let emailSubject = currentStep.asunto || `Reactivación ${sequence.nombre} - Paso ${attempt.step_index + 1}`;
              let emailBody = currentStep.mensaje || `Hola ${lead.name},\n\nNos gustaría retomar el contacto contigo.\n\nSaludos cordiales`;

              // Buscar cuenta Nylas activa del usuario
              const { data: nylasAccounts } = await supabase
                .from('nylas_accounts')
                .select('*')
                .eq('is_active', true)
                .limit(1);

              if (nylasAccounts && nylasAccounts.length > 0) {
                // Enviar email via Nylas
                const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/nylas-send`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
                  },
                  body: JSON.stringify({
                    accountId: nylasAccounts[0].id,
                    to: [lead.email],
                    subject: emailSubject,
                    body: emailBody
                  })
                });

                if (emailResponse.ok) {
                  notes = `Email winback enviado automáticamente vía Nylas`;
                  results.emails_sent++;
                  responseData.email_sent = true;
                  responseData.nylas_account_id = nylasAccounts[0].id;
                } else {
                  throw new Error(`Error enviando email: ${await emailResponse.text()}`);
                }
              } else {
                // No hay cuenta Nylas, marcar como fallido
                status = 'failed';
                notes = `No hay cuenta Nylas activa configurada para envío de emails`;
                responseData.error = 'No Nylas account available';
              }
            } catch (emailError) {
              console.error('Error enviando email:', emailError);
              status = 'failed';
              notes = `Error enviando email: ${emailError.message}`;
              responseData.error = emailError.message;
            }
            break;

          case 'call':
            // Crear tarea de llamada
            const { error: callTaskError } = await supabase
              .from('lead_tasks')
              .insert([{
                lead_id: lead.id,
                title: `Llamada Reactivación - ${lead.name}`,
                description: `Llamada de reactivación automática. Paso ${attempt.step_index + 1} de secuencia "${sequence.nombre}". ${currentStep.script || ''}`,
                task_type: 'call',
                priority: currentStep.prioridad || 'medium',
                due_date: new Date().toISOString(),
                status: 'pending',
                metadata: {
                  winback_attempt_id: attempt.id,
                  sequence_id: attempt.sequence_id,
                  step_index: attempt.step_index,
                  auto_generated: true
                }
              }]);

            if (callTaskError) {
              console.error('Error creando tarea de llamada:', callTaskError);
              status = 'failed';
              notes = `Error creando tarea: ${callTaskError.message}`;
              responseData.error = callTaskError.message;
            } else {
              notes = `Tarea de llamada reactivación creada automáticamente`;
              results.calls_scheduled++;
              responseData.task_created = true;
            }
            break;

          case 'linkedin':
            // Crear tarea de LinkedIn
            const { error: linkedinTaskError } = await supabase
              .from('lead_tasks')
              .insert([{
                lead_id: lead.id,
                title: `LinkedIn Reactivación - ${lead.name}`,
                description: `Enviar invitación LinkedIn de reactivación. Paso ${attempt.step_index + 1} de secuencia "${sequence.nombre}". ${currentStep.mensaje || ''}`,
                task_type: 'linkedin',
                priority: currentStep.prioridad || 'medium',
                due_date: new Date().toISOString(),
                status: 'pending',
                metadata: {
                  winback_attempt_id: attempt.id,
                  sequence_id: attempt.sequence_id,
                  step_index: attempt.step_index,
                  auto_generated: true
                }
              }]);

            if (linkedinTaskError) {
              console.error('Error creando tarea LinkedIn:', linkedinTaskError);
              status = 'failed';
              notes = `Error creando tarea LinkedIn: ${linkedinTaskError.message}`;
              responseData.error = linkedinTaskError.message;
            } else {
              notes = `Tarea LinkedIn reactivación creada automáticamente`;
              results.linkedin_queued++;
              responseData.task_created = true;
            }
            break;

          default:
            status = 'skipped';
            notes = `Canal ${attempt.canal} no soportado`;
            responseData.error = `Unsupported channel: ${attempt.canal}`;
        }

        // 3. Actualizar el intento
        const { error: updateError } = await supabase
          .from('winback_attempts')
          .update({
            status,
            executed_date: now,
            notes,
            response_data: responseData
          })
          .eq('id', attempt.id);

        if (updateError) {
          console.error(`Error actualizando intento ${attempt.id}:`, updateError);
          results.errors++;
        } else {
          results.processed++;
          
          // 4. Actualizar last_winback_attempt del lead
          await supabase
            .from('leads')
            .update({ last_winback_attempt: now })
            .eq('id', lead.id);

          // 5. Verificar si es el último paso de la secuencia
          const isLastStep = attempt.step_index === (sequence.pasos.length - 1);
          
          if (isLastStep && status === 'sent') {
            // Es el último paso y se envió correctamente, pero aún no hay respuesta
            // Marcar como irrecuperable después de un tiempo de gracia
            console.log(`🔚 Último paso para lead ${lead.name}, programando revisión para marcar como irrecuperable`);
            
            // Programar una verificación en 7 días para marcar como irrecuperable si no hay respuesta
            const reviewDate = new Date();
            reviewDate.setDate(reviewDate.getDate() + 7);
            
            await supabase
              .from('winback_attempts')
              .insert([{
                lead_id: lead.id,
                sequence_id: attempt.sequence_id,
                step_index: 999, // Paso especial para revisión final
                canal: 'review',
                scheduled_date: reviewDate.toISOString(),
                status: 'pending',
                template_id: null,
                notes: 'Revisión final para marcar como irrecuperable si no hay respuesta'
              }]);
          }

          // 6. Verificar respuestas positivas (esto se haría idealmente con webhooks de Nylas)
          // Por ahora, este procesamiento se puede hacer en una función separada que revise
          // los tracked_emails y lead_tasks completadas
        }

      } catch (error) {
        console.error(`Error procesando intento ${attempt.id}:`, error);
        results.errors++;
        
        // Marcar como fallido
        await supabase
          .from('winback_attempts')
          .update({
            status: 'failed',
            executed_date: now,
            notes: `Error: ${error.message}`,
            response_data: {
              error: error.message,
              processed_by: 'step_processor',
              processed_at: now
            }
          })
          .eq('id', attempt.id);
      }
    }

    // 7. Procesar revisiones finales (paso 999)
    const { data: reviewAttempts } = await supabase
      .from('winback_attempts')
      .select(`
        id,
        lead_id,
        sequence_id,
        leads!inner(
          id,
          name,
          winback_stage,
          score
        )
      `)
      .eq('status', 'pending')
      .eq('step_index', 999)
      .eq('canal', 'review')
      .lte('scheduled_date', now);

    for (const review of reviewAttempts || []) {
      try {
        const lead = review.leads;
        
        // Verificar si hubo respuestas positivas desde el último paso
        const hasPositiveResponse = await checkForPositiveResponse(supabase, lead.id);
        
        if (hasPositiveResponse) {
          // Marcar como engaging
          await supabase
            .from('leads')
            .update({
              winback_stage: 'engaging',
              score: (lead.score || 0) + 20
            })
            .eq('id', lead.id);
          
          results.engaging_leads++;
          console.log(`✅ Lead ${lead.name} marcado como engaging por respuesta positiva`);
        } else {
          // Marcar como irrecuperable
          await supabase
            .from('leads')
            .update({
              winback_stage: 'irrecuperable',
              score: Math.max(0, (lead.score || 0) - 10)
            })
            .eq('id', lead.id);
          
          results.irrecuperable_leads++;
          console.log(`❌ Lead ${lead.name} marcado como irrecuperable`);
        }

        // Marcar revisión como completada
        await supabase
          .from('winback_attempts')
          .update({
            status: 'completed',
            executed_date: now,
            notes: hasPositiveResponse ? 'Lead reactivado exitosamente' : 'Lead marcado como irrecuperable'
          })
          .eq('id', review.id);

      } catch (error) {
        console.error(`Error procesando revisión ${review.id}:`, error);
        results.errors++;
      }
    }

    // 8. Log de actividad
    const { error: logError } = await supabase
      .from('system_logs')
      .insert([{
        event_type: 'winback_step_processor_executed',
        description: `Step processor ejecutado: ${results.processed} intentos procesados`,
        metadata: {
          timestamp: now,
          results,
          total_pending: pendingAttempts?.length || 0
        }
      }]);

    if (logError) {
      console.error('Error logging activity:', logError);
    }

    console.log(`✅ Winback step processor completado:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Winback step processor executed successfully',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error in winback step processor:', error);
    
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

// Función auxiliar para verificar respuestas positivas
async function checkForPositiveResponse(supabase: any, leadId: string): Promise<boolean> {
  // Verificar emails abiertos/clicks en los últimos 30 días
  const { data: emailResponses } = await supabase
    .from('tracked_emails')
    .select('open_count, click_count')
    .eq('recipient_email', leadId) // Esto necesitaría ajustarse según el esquema real
    .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const hasEmailResponse = emailResponses?.some(email => 
    (email.open_count > 0) || (email.click_count > 0)
  );

  // Verificar tareas completadas
  const { data: completedTasks } = await supabase
    .from('lead_tasks')
    .select('id')
    .eq('lead_id', leadId)
    .eq('status', 'completed')
    .in('task_type', ['call', 'linkedin'])
    .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const hasTaskResponse = completedTasks && completedTasks.length > 0;

  return hasEmailResponse || hasTaskResponse;
}