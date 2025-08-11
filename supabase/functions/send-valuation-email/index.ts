import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resendKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Acepta payload legado { email, name?, link } y nuevo { companyData, result, pdf_url }
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body: any = await req.json();
    const resend = new Resend(resendKey);

    const email: string | undefined = body?.email || body?.companyData?.email;
    const name: string = body?.name || body?.companyData?.contactName || '';
    const companyName: string | undefined = body?.companyData?.companyName;
    const link: string | undefined = body?.link || body?.pdf_url;
    const result = body?.result as { finalValuation?: number; valuationRange?: { min: number; max: number }; multiples?: { ebitdaMultipleUsed?: number } } | undefined;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing recipient email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const subject = companyName ? `Valoración inicial — ${companyName}` : `Valoración inicial (Light)`;

    const formatCurrency = (n?: number) => {
      try { return typeof n === 'number' ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n) : undefined; } catch { return n?.toString(); }
    };

    const rangeStr = result?.valuationRange ? `Rango: ${formatCurrency(result.valuationRange.min)} – ${formatCurrency(result.valuationRange.max)}` : '';
    const multipleStr = result?.multiples?.ebitdaMultipleUsed ? `Múltiplo EBITDA usado: ${result.multiples.ebitdaMultipleUsed}x` : '';

    const valuationBlock = result ? `
      <div style="margin-top:12px;padding:12px;border:1px solid #eee;border-radius:8px">
        <p style="margin:0 0 6px 0"><strong>Resultado:</strong> ${formatCurrency(result.finalValuation) || '—'}</p>
        ${rangeStr ? `<p style="margin:0">${rangeStr}</p>` : ''}
        ${multipleStr ? `<p style="margin:6px 0 0 0">${multipleStr}</p>` : ''}
      </div>
    ` : '';

    const linkBlock = link ? `<p><a href="${link}" target="_blank">Descargar valoración (PDF)</a></p>` : '';

    const html = `
      <div style="font-family:Inter,system-ui,sans-serif;padding:12px">
        <h2>Valoración inicial</h2>
        <p>Hola ${name},</p>
        ${companyName ? `<p>Empresa: <strong>${companyName}</strong></p>` : ''}
        ${valuationBlock}
        ${linkBlock}
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
