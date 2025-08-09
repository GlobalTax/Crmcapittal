import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resendKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload { email: string; name?: string; link: string; leadId?: string; taskId?: string }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { email, name, link }: Payload = await req.json();
    const resend = new Resend(resendKey);

    const subject = `Valoración inicial (Light)`;
    const html = `
      <div style="font-family:Inter,system-ui,sans-serif;padding:12px">
        <h2>Valoración inicial</h2>
        <p>Hola ${name || ''},</p>
        <p>Adjuntamos el enlace a tu valoración inicial (Light):</p>
        <p><a href="${link}" target="_blank">Descargar valoración (PDF)</a></p>
        <p style="color:#666;font-size:12px;margin-top:16px">Documento orientativo y no vinculante.</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "CRM Pro <noreply@resend.dev>",
      to: [email],
      subject,
      html,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('send-valuation-email error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
