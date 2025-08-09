import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConsentRequest {
  to: string;
  name: string;
  contact_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, contact_id }: ConsentRequest = await req.json();

    const consentUrl = `${Deno.env.get('SITE_URL')}/consent?token=${contact_id}`;

    const emailResponse = await resend.emails.send({
      from: "CRM Pro <noreply@crmproject.com>",
      to: [to],
      subject: "Solicitud de consentimiento para comunicaciones",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Hola ${name},</h1>
          
          <p>Nos gustaría mantener el contacto contigo para compartir información relevante sobre oportunidades de negocio y servicios que podrían interesarte.</p>
          
          <p>Para cumplir con la normativa de protección de datos, necesitamos tu consentimiento explícito para enviarte comunicaciones comerciales.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${consentUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Dar mi consentimiento
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Si prefieres no recibir comunicaciones nuestras, simplemente ignora este email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #888;">
            Este email se envía en cumplimiento del RGPD. Puedes gestionar tus preferencias de comunicación en cualquier momento.
          </p>
        </div>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error enviando solicitud de consentimiento:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);