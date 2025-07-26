import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReconversionWorkflowRequest {
  reconversionId: string;
  action: 'create' | 'update_subfase' | 'trigger_matching' | 'close' | 'send_nda';
  data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Obtener usuario autenticado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const request: ReconversionWorkflowRequest = await req.json();
    console.log(`Processing reconversion workflow: ${request.action}`, request);

    let result;

    switch (request.action) {
      case 'create':
        result = await createReconversionWithWorkflow(supabase, request.data, user.id);
        break;
      case 'update_subfase':
        result = await updateSubfase(supabase, request.reconversionId, request.data.subfase, user.id);
        break;
      case 'trigger_matching':
        result = await triggerMatching(supabase, request.reconversionId, user.id);
        break;
      case 'close':
        result = await closeReconversion(supabase, request.reconversionId, request.data, user.id);
        break;
      case 'send_nda':
        result = await sendNDA(supabase, request.reconversionId, request.data, user.id);
        break;
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in reconversion-workflow function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function createReconversionWithWorkflow(supabase: any, data: any, userId: string) {
  console.log('Creating reconversion with workflow...');
  
  const { data: reconversionId, error } = await supabase.rpc(
    'create_reconversion_with_workflow',
    {
      reconversion_data: data,
      user_id: userId
    }
  );

  if (error) throw error;

  console.log(`Created reconversion with workflow: ${reconversionId}`);
  return { reconversionId };
}

async function updateSubfase(supabase: any, reconversionId: string, subfase: string, userId: string) {
  console.log(`Updating subfase to ${subfase} for reconversion ${reconversionId}`);
  
  const { data: success, error } = await supabase.rpc(
    'update_reconversion_subfase',
    {
      reconversion_id: reconversionId,
      new_subfase: subfase,
      user_id: userId
    }
  );

  if (error) throw error;

  return { success, subfase };
}

async function triggerMatching(supabase: any, reconversionId: string, userId: string) {
  console.log(`Triggering matching for reconversion ${reconversionId}`);
  
  // Primero actualizar el estado a matching
  const { error: updateError } = await supabase
    .from('reconversiones_new')
    .update({ 
      estado: 'matching',
      updated_at: new Date().toISOString()
    })
    .eq('id', reconversionId);

  if (updateError) throw updateError;

  // El trigger se encargará automáticamente del matching
  // Retornar el resultado del matching
  const { data: matchResult, error: matchError } = await supabase.rpc(
    'match_targets_for_reconversion',
    { reconversion_id: reconversionId }
  );

  if (matchError) throw matchError;

  console.log(`Matching completed: ${matchResult[0]?.target_count || 0} targets found`);
  return matchResult[0] || { target_count: 0, matched_companies: [] };
}

async function closeReconversion(supabase: any, reconversionId: string, closureData: any, userId: string) {
  console.log(`Closing reconversion ${reconversionId}`);
  
  const { data: success, error } = await supabase.rpc(
    'process_reconversion_closure',
    {
      reconversion_id: reconversionId,
      closure_data: closureData,
      user_id: userId
    }
  );

  if (error) throw error;

  return { success, closureData };
}

async function sendNDA(supabase: any, reconversionId: string, ndaData: any, userId: string) {
  console.log(`Sending NDA for reconversion ${reconversionId}`);
  
  try {
    // Obtener datos de la reconversión
    const { data: reconversion, error: fetchError } = await supabase
      .from('reconversiones_new')
      .select('company_name, contact_name, buyer_contact_email')
      .eq('id', reconversionId)
      .single();

    if (fetchError) throw fetchError;

    // Llamar a Nylas para enviar el NDA
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('nylas-send', {
      body: {
        to: reconversion.buyer_contact_email,
        subject: `NDA - ${reconversion.company_name}`,
        body: `
          Estimado/a ${reconversion.contact_name},
          
          Adjuntamos el Acuerdo de Confidencialidad (NDA) para la evaluación de la oportunidad relacionada con ${reconversion.company_name}.
          
          Por favor, revise, firme y devuelva el documento a la mayor brevedad posible para proceder con el proceso.
          
          Atentamente,
          Equipo de M&A
        `,
        attachments: ndaData.attachments || []
      }
    });

    if (emailError) {
      console.error('Error sending NDA email:', emailError);
      // Continuar con el proceso aunque falle el email
    }

    // Registrar documento pendiente de firma
    const { error: docError } = await supabase
      .from('reconversion_documents')
      .insert({
        reconversion_id: reconversionId,
        document_type: 'nda',
        document_name: 'Acuerdo de Confidencialidad',
        status: 'pending_signature',
        sent_to: reconversion.buyer_contact_email,
        sent_at: new Date().toISOString(),
        created_by: userId
      });

    if (docError) {
      console.error('Error recording NDA document:', docError);
    }

    // Registrar en audit log
    await supabase.rpc('log_reconversion_audit', {
      p_reconversion_id: reconversionId,
      p_action_type: 'nda_sent',
      p_action_description: `NDA enviado a ${reconversion.buyer_contact_email}`,
      p_old_data: null,
      p_new_data: { 
        email: reconversion.buyer_contact_email,
        contact_name: reconversion.contact_name 
      },
      p_severity: 'info',
      p_metadata: { 
        automated: false, 
        user_id: userId,
        email_success: !emailError
      }
    });

    return { 
      success: true, 
      emailSent: !emailError,
      documentRecorded: !docError,
      recipient: reconversion.buyer_contact_email 
    };

  } catch (error) {
    console.error('Error in sendNDA:', error);
    throw error;
  }
}

serve(handler);