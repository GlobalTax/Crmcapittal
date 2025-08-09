import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChangeEvent {
  company_id: string;
  field_changed: string;
  old_value: any;
  new_value: any;
  change_source: 'einforma' | 'manual' | 'external';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_id, field_changed, old_value, new_value, change_source }: ChangeEvent = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`🔄 Procesando cambio en empresa ${company_id}: ${field_changed}`);

    // Obtener datos actuales de la empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single();

    if (companyError || !company) {
      throw new Error(`Empresa no encontrada: ${company_id}`);
    }

    // Verificar si el cambio requiere recálculo de fit
    const criticalFields = ['annual_revenue', 'company_size', 'industry', 'business_segment', 'geographic_scope'];
    
    if (criticalFields.includes(field_changed)) {
      console.log(`🎯 Campo crítico cambiado: ${field_changed}, recalculando fit...`);
      
      // 1. Recalcular ICP score
      const newICPScore = await recalculateICPScore(supabase, company);
      
      // 2. Actualizar empresa con nuevo score
      await supabase
        .from('companies')
        .update({ 
          lead_score: newICPScore,
          last_activity_date: new Date().toISOString()
        })
        .eq('id', company_id);

      // 3. Trigger re-matching
      await triggerReMatching(supabase, company_id, field_changed);

      // 4. Notificar a los usuarios relevantes
      await notifyRelevantUsers(supabase, company_id, field_changed, old_value, new_value);

      // 5. Log del cambio
      await logChangeEvent(supabase, {
        company_id,
        field_changed,
        old_value,
        new_value,
        change_source,
        actions_taken: ['icp_recalculated', 'rematching_triggered', 'users_notified']
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cambio procesado exitosamente',
        actions_taken: criticalFields.includes(field_changed) ? 
          ['icp_recalculated', 'rematching_triggered', 'users_notified'] : 
          ['logged_only']
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error procesando cambio:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

async function recalculateICPScore(supabase: any, company: any): Promise<number> {
  try {
    // Llamar a IA para recalcular ICP score
    const { data: aiResult, error: aiError } = await supabase.functions.invoke('openai-assistant', {
      body: {
        type: 'icp_score',
        data: {
          company_name: company.name,
          industry: company.industry,
          company_size: company.company_size,
          annual_revenue: company.annual_revenue,
          geographic_scope: company.geographic_scope,
          business_segment: company.business_segment,
          current_notes: company.description || ''
        }
      }
    });

    if (aiError || !aiResult?.success) {
      console.error('Error calculando ICP score:', aiError);
      return company.lead_score || 0;
    }

    return aiResult.data.icp_score || 0;
  } catch (error) {
    console.error('Error en recálculo de ICP:', error);
    return company.lead_score || 0;
  }
}

async function triggerReMatching(supabase: any, companyId: string, fieldChanged: string) {
  // Llamar al sistema de re-matching
  const { error } = await supabase.functions.invoke('crm-rematching', {
    body: {
      company_id: companyId,
      trigger_field: fieldChanged,
      recalculate_all_matches: true
    }
  });

  if (error) {
    console.error('Error en re-matching:', error);
  } else {
    console.log(`✅ Re-matching triggered para empresa ${companyId}`);
  }
}

async function notifyRelevantUsers(supabase: any, companyId: string, fieldChanged: string, oldValue: any, newValue: any) {
  // Obtener usuarios que deben ser notificados (propietarios, seguidores, etc.)
  const { data: relevantUsers, error } = await supabase
    .from('companies')
    .select(`
      owner_id,
      created_by,
      contacts!inner(id, user_id)
    `)
    .eq('id', companyId);

  if (error || !relevantUsers?.length) return;

  const company = relevantUsers[0];
  const userIds = new Set();

  // Añadir propietario y creador
  if (company.owner_id) userIds.add(company.owner_id);
  if (company.created_by) userIds.add(company.created_by);

  // Añadir usuarios de contactos relacionados
  company.contacts?.forEach((contact: any) => {
    if (contact.user_id) userIds.add(contact.user_id);
  });

  // Crear notificaciones
  for (const userId of userIds) {
    await supabase
      .from('system_notifications')
      .insert({
        user_id: userId,
        type: 'company_change',
        title: 'Cambio importante en empresa',
        message: `Campo ${fieldChanged} cambió de "${oldValue}" a "${newValue}"`,
        data: {
          company_id: companyId,
          field_changed: fieldChanged,
          old_value: oldValue,
          new_value: newValue
        }
      });
  }

  console.log(`📢 Notificaciones enviadas a ${userIds.size} usuarios`);
}

async function logChangeEvent(supabase: any, changeData: any) {
  await supabase
    .from('automation_logs')
    .insert({
      automation_type: 'change_watcher',
      trigger_event: 'company_field_changed',
      entity_type: 'company',
      entity_id: changeData.company_id,
      action_taken: 'process_change',
      action_data: changeData,
      status: 'success'
    });
}

serve(handler);