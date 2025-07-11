import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  reportType: 'weekly' | 'monthly' | 'quarterly';
  format: 'excel' | 'pdf';
  recipients: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '');

    const { reportType, format, recipients }: ReportRequest = await req.json();

    // Calculate date range based on report type
    const now = new Date();
    let startDate: Date;
    
    switch (reportType) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'quarterly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Fetch commission data
    const { data: commissions, error: commissionsError } = await supabase
      .from('commissions')
      .select(`
        *,
        collaborators:collaborator_id (name, email),
        deals:deal_id (deal_name, company_name)
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (commissionsError) {
      throw new Error('Error fetching commissions: ' + commissionsError.message);
    }

    // Calculate summary statistics
    const totalCommissions = commissions?.length || 0;
    const totalAmount = commissions?.reduce((sum, c) => sum + c.commission_amount, 0) || 0;
    const paidCommissions = commissions?.filter(c => c.status === 'paid').length || 0;
    const pendingCommissions = commissions?.filter(c => c.status === 'pending').length || 0;
    const overdueCommissions = commissions?.filter(c => 
      c.payment_due_date && new Date(c.payment_due_date) < now && c.status !== 'paid'
    ).length || 0;

    // Generate report content
    const reportPeriod = reportType === 'weekly' ? 'Semana' : 
                        reportType === 'monthly' ? 'Mes' : 'Trimestre';
    
    const reportTitle = `Reporte de Comisiones - ${reportPeriod}`;
    const reportDate = now.toLocaleDateString('es-ES');

    // Create HTML report
    const htmlReport = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
            .summary-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
            .summary-value { font-size: 24px; font-weight: bold; color: #1e40af; }
            .summary-label { color: #64748b; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8f9fa; font-weight: 600; }
            .status-paid { color: #16a34a; font-weight: 600; }
            .status-pending { color: #eab308; font-weight: 600; }
            .status-overdue { color: #dc2626; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <p>Generado el ${reportDate}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <div class="summary-value">${totalCommissions}</div>
              <div class="summary-label">Total Comisiones</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">€${totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
              <div class="summary-label">Importe Total</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${paidCommissions}</div>
              <div class="summary-label">Comisiones Pagadas</div>
            </div>
            <div class="summary-card">
              <div class="summary-value">${pendingCommissions}</div>
              <div class="summary-label">Comisiones Pendientes</div>
            </div>
            ${overdueCommissions > 0 ? `
            <div class="summary-card">
              <div class="summary-value" style="color: #dc2626;">${overdueCommissions}</div>
              <div class="summary-label">Comisiones Vencidas</div>
            </div>
            ` : ''}
          </div>

          <h2>Detalle de Comisiones</h2>
          <table>
            <thead>
              <tr>
                <th>Beneficiario</th>
                <th>Fuente</th>
                <th>Importe</th>
                <th>Estado</th>
                <th>Fecha Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              ${commissions?.map(commission => `
                <tr>
                  <td>${commission.recipient_name || 'N/A'}</td>
                  <td>${commission.source_name || 'N/A'}</td>
                  <td>€${commission.commission_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                  <td class="status-${commission.status}">${
                    commission.status === 'paid' ? 'Pagada' :
                    commission.status === 'pending' ? 'Pendiente' : 'Aprobada'
                  }</td>
                  <td>${commission.payment_due_date ? new Date(commission.payment_due_date).toLocaleDateString('es-ES') : '-'}</td>
                </tr>
              `).join('') || '<tr><td colspan="5">No hay comisiones en este período</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Send email with report
    const emailSubject = `${reportTitle} - ${reportDate}`;
    
    const { error: emailError } = await resend.emails.send({
      from: 'Sistema de Comisiones <no-reply@empresa.com>',
      to: recipients,
      subject: emailSubject,
      html: htmlReport,
    });

    if (emailError) {
      throw new Error('Error sending email: ' + emailError.message);
    }

    console.log(`Reporte ${reportType} enviado a ${recipients.length} destinatarios`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Reporte ${reportType} generado y enviado exitosamente`,
        stats: {
          totalCommissions,
          totalAmount,
          paidCommissions,
          pendingCommissions,
          overdueCommissions
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in scheduled-reports function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});