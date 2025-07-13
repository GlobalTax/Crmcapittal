
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
  contact_id?: string;
  target_company_id?: string;
  operation_id?: string;
  sender_name?: string;
  sender_email?: string;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const emailData: EmailRequest = await req.json();
    console.log('Processing email request:', emailData);

    // Create email record in database first (let DB generate tracking_id)
    const { data: trackedEmail, error: dbError } = await supabase
      .from('tracked_emails')
      .insert({
        recipient_email: emailData.recipient_email,
        subject: emailData.subject,
        content: emailData.content,
        lead_id: emailData.lead_id,
        contact_id: emailData.contact_id,
        target_company_id: emailData.target_company_id,
        operation_id: emailData.operation_id,
        status: 'SENT'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Build tracking pixel URL using the generated tracking_id from database
    const trackingPixelUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/track-email-open/${trackedEmail.tracking_id}`;
    
    // Create professional HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailData.subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 30px; }
          .content { margin-bottom: 30px; }
          .footer { border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 12px; color: #666; }
          .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
          a { color: #2563eb; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; color: #1f2937;">${emailData.subject}</h2>
          </div>
          
          <div class="content">
            ${emailData.content.replace(/\n/g, '<br>')}
          </div>
          
          <div class="signature">
            <p>Saludos cordiales,<br>
            <strong>${emailData.sender_name || 'Equipo CRM'}</strong></p>
            ${emailData.sender_email ? `<p><a href="mailto:${emailData.sender_email}">${emailData.sender_email}</a></p>` : ''}
          </div>
          
          <div class="footer">
            <p>Este email fue enviado desde nuestro sistema CRM. Si no deseas recibir más comunicaciones, por favor contacta con nosotros.</p>
          </div>
        </div>
        
        <!-- Tracking pixel -->
        <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block;" />
      </body>
      </html>
    `;

    // Send email with Resend with better error handling
    let emailResponse;
    try {
      emailResponse = await resend.emails.send({
        from: emailData.sender_email || 'CRM System <onboarding@resend.dev>',
        to: [emailData.recipient_email],
        subject: emailData.subject,
        html: htmlContent,
        headers: {
          'X-Entity-Ref-ID': trackedEmail.tracking_id,
        }
      });
    } catch (sendError) {
      console.error('Resend send error:', sendError);
      
      // Update status to failed in database
      await supabase
        .from('tracked_emails')
        .update({ status: 'FAILED' })
        .eq('id', trackedEmail.id);
        
      throw new Error(`Email sending failed: ${sendError.message}`);
    }

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      
      // Update status to failed in database
      await supabase
        .from('tracked_emails')
        .update({ status: 'FAILED' })
        .eq('id', trackedEmail.id);
        
      throw new Error(`Email sending failed: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully:', emailResponse);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        email_id: trackedEmail.id,
        tracking_id: trackedEmail.tracking_id,
        resend_id: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    console.error('Error in send-tracked-email function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
