import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  recipient_email: string;
  subject: string;
  content: string;
  lead_id?: string;
  sender_name?: string;
  sender_email?: string;
  test?: boolean;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailRequest = await req.json();

    if (emailData.test === true) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email service is operational', test: true }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!emailData.recipient_email || !emailData.subject || !emailData.content) {
      return new Response(
        JSON.stringify({ success: false, error: 'recipient_email, subject y content son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'RESEND_API_KEY no configurado' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Cliente admin (bypassa RLS) para DB writes confiables
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Cliente usuario para obtener auth.uid() desde el JWT del request
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabaseUser.auth.getUser();
    const userId = userData?.user?.id ?? null;

    // 1) Crear registro en lead_emails (DB generará tracking_id)
    const { data: leadEmail, error: insertError } = await supabaseAdmin
      .from('lead_emails')
      .insert({
        lead_id: emailData.lead_id,
        to_email: emailData.recipient_email,
        subject: emailData.subject,
        body: emailData.content,
        status: 'draft',
        created_by: userId,
      })
      .select()
      .single();

    if (insertError || !leadEmail) {
      console.error('DB insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'No se pudo crear el registro de email' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const trackingId = leadEmail.tracking_id as string;
    const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open/${trackingId}`;

    // HTML final con pixel
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${emailData.subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 640px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 1px solid #eee; padding-bottom: 12px; margin-bottom: 24px; }
          .content { white-space: pre-line; }
          .footer { border-top: 1px solid #eee; padding-top: 12px; margin-top: 24px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0">${emailData.subject}</h2>
          </div>
          <div class="content">${emailData.content.replace(/\n/g, '<br/>')}</div>
          <div class="footer">Enviado desde CRM Pro</div>
        </div>
        <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block" />
      </body>
      </html>
    `;

    const fromAddress = emailData.sender_email || 'CRM Pro <onboarding@resend.dev>';

    let emailResponse;
    try {
      emailResponse = await resend.emails.send({
        from: fromAddress,
        to: [emailData.recipient_email],
        subject: emailData.subject,
        html: htmlContent,
        headers: { 'X-Entity-Ref-ID': trackingId },
      });
    } catch (sendErr: any) {
      console.error('Resend send error:', sendErr);
      await supabaseAdmin.from('lead_emails').update({ status: 'failed' }).eq('id', leadEmail.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Fallo enviando email' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if ((emailResponse as any).error) {
      console.error('Resend error:', (emailResponse as any).error);
      await supabaseAdmin.from('lead_emails').update({ status: 'failed' }).eq('id', leadEmail.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Fallo enviando email' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const providerId = (emailResponse as any).data?.id || null;
    await supabaseAdmin
      .from('lead_emails')
      .update({ status: 'sent', sent_at: new Date().toISOString(), provider_message_id: providerId })
      .eq('id', leadEmail.id);

    return new Response(
      JSON.stringify({ success: true, email_id: leadEmail.id, tracking_id: trackingId, provider_id: providerId }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Error in send-tracked-email function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
