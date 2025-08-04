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
    
    console.log(`🔄 Ejecutando winback daily scheduler para ${today}`);

    // 1. Obtener secuencia default (primera activa)
    const { data: defaultSequence, error: sequenceError } = await supabase
      .from('winback_sequences')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (sequenceError || !defaultSequence) {
      console.error('No se encontró secuencia default:', sequenceError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No hay secuencias activas disponibles'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    console.log(`📋 Usando secuencia default: ${defaultSequence.nombre}`);

    // 2. Seleccionar leads elegibles para winback
    const { data: eligibleLeads, error: leadsError } = await supabase
      .from('leads')
      .select('id, name, email, lost_date, lost_reason, winback_stage, status')
      .eq('status', 'DISQUALIFIED')
      .eq('winback_stage', 'cold')
      .not('lost_date', 'is', null)
      .gte('lost_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()) // Max 365 días
      .lte('lost_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Min 30 días

    if (leadsError) {
      throw leadsError;
    }

    // Filtrar leads con lost_reason válido
    const validLeads = eligibleLeads?.filter(lead => 
      !lead.lost_reason || lead.lost_reason !== 'competidor comprometido'
    ) || [];

    console.log(`🎯 Encontrados ${validLeads.length} leads elegibles para winback`);

    const results = {
      processed: 0,
      enrolled_leads: 0,
      attempts_created: 0,
      errors: 0
    };

    // 3. Procesar cada lead elegible
    for (const lead of validLeads) {
      try {
        console.log(`📤 Procesando lead ${lead.name} (${lead.email})`);

        // Actualizar winback_stage del lead
        const { error: updateError } = await supabase
          .from('leads')
          .update({
            winback_stage: 'campaign_sent',
            last_winback_attempt: today
          })
          .eq('id', lead.id);

        if (updateError) {
          console.error(`Error actualizando lead ${lead.id}:`, updateError);
          results.errors++;
          continue;
        }

        // Crear registros en winback_attempts para cada paso de la secuencia
        const attemptsToCreate = defaultSequence.pasos.map((paso: any, index: number) => {
          const scheduledDate = new Date(lead.lost_date);
          scheduledDate.setDate(scheduledDate.getDate() + paso.dias);
          
          return {
            lead_id: lead.id,
            sequence_id: defaultSequence.id,
            step_index: index,
            canal: paso.canal,
            template_id: paso.template_id || null,
            scheduled_date: scheduledDate.toISOString(),
            status: 'pending',
            created_by: null
          };
        });

        const { error: attemptsError } = await supabase
          .from('winback_attempts')
          .insert(attemptsToCreate);

        if (attemptsError) {
          console.error(`Error creando intentos para lead ${lead.id}:`, attemptsError);
          results.errors++;
          
          // Revertir cambio en lead si falló la creación de attempts
          await supabase
            .from('leads')
            .update({
              winback_stage: 'cold',
              last_winback_attempt: null
            })
            .eq('id', lead.id);
        } else {
          results.enrolled_leads++;
          results.attempts_created += attemptsToCreate.length;
          console.log(`✅ Lead ${lead.name} enrollado en secuencia winback con ${attemptsToCreate.length} pasos`);
        }

        results.processed++;

      } catch (error) {
        console.error(`Error procesando lead ${lead.id}:`, error);
        results.errors++;
      }
    }

    // 4. Log de actividad
    const { error: logError } = await supabase
      .from('system_logs')
      .insert([{
        event_type: 'winback_daily_scheduler_executed',
        description: `Daily scheduler ejecutado: ${results.enrolled_leads} leads enrollados`,
        metadata: {
          date: today,
          results,
          total_eligible: validLeads.length,
          default_sequence: {
            id: defaultSequence.id,
            name: defaultSequence.nombre
          }
        }
      }]);

    if (logError) {
      console.error('Error logging activity:', logError);
    }

    console.log(`✅ Winback daily scheduler completado:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Winback daily scheduler executed successfully',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error in winback daily scheduler:', error);
    
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