import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReconversionNotificationRequest {
  type: 'reconversion_created' | 'candidate_added' | 'reconversion_closed';
  recipient_email: string;
  recipient_name?: string;
  reconversion_data: {
    id: string;
    company_name: string;
    priority?: string;
    status?: string;
    assigned_to_name?: string;
    creator_name?: string;
  };
  metadata?: Record<string, any>;
}

const getEmailTemplate = (type: string, data: any) => {
  const baseStyle = `
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
      .priority-high { color: #dc3545; font-weight: bold; }
      .priority-medium { color: #fd7e14; font-weight: bold; }
      .priority-low { color: #28a745; font-weight: bold; }
      .priority-urgent { color: #e91e63; font-weight: bold; animation: pulse 2s infinite; }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
      .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    </style>
  `;

  switch (type) {
    case 'reconversion_created':
      return `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>🔄 Nueva Reconversión Asignada</h1>
          </div>
          <div class="content">
            <h2>Se te ha asignado una nueva reconversión</h2>
            <p><strong>Empresa:</strong> ${data.company_name}</p>
            <p><strong>Prioridad:</strong> <span class="priority-${data.priority?.toLowerCase() || 'medium'}">${data.priority || 'Media'}</span></p>
            ${data.metadata?.needs_assignment ? '<p><strong>⚠️ Esta reconversión necesita asignación urgente</strong></p>' : ''}
            <p>Por favor, revisa los detalles y comienza el proceso de matching lo antes posible.</p>
            <a href="${Deno.env.get("SITE_URL") || 'https://your-app.com'}/reconversiones/${data.id}" class="btn">Ver Reconversión</a>
          </div>
        </div>
      `;

    case 'candidate_added':
      return `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>🎯 Nueva Empresa Candidata</h1>
          </div>
          <div class="content">
            <h2>Se ha añadido una empresa candidata</h2>
            <p><strong>Reconversión:</strong> ${data.company_name}</p>
            <p><strong>Candidata:</strong> ${data.metadata?.candidate_name || 'Nueva empresa'}</p>
            <p>Se ha identificado una nueva empresa candidata que podría ser una buena opción para esta reconversión.</p>
            <a href="${Deno.env.get("SITE_URL") || 'https://your-app.com'}/reconversiones/${data.id}" class="btn">Revisar Candidata</a>
          </div>
        </div>
      `;

    case 'reconversion_closed':
      return `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>✅ Reconversión Cerrada</h1>
          </div>
          <div class="content">
            <h2>Una reconversión ha sido cerrada</h2>
            <p><strong>Empresa:</strong> ${data.company_name}</p>
            <p><strong>Estado final:</strong> ${data.metadata?.final_status || 'Cerrada'}</p>
            <p>La reconversión ha sido completada. Puedes revisar los resultados y el historial completo.</p>
            <a href="${Deno.env.get("SITE_URL") || 'https://your-app.com'}/reconversiones/${data.id}" class="btn">Ver Resumen</a>
          </div>
        </div>
      `;

    default:
      return `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>📧 Notificación de Reconversión</h1>
          </div>
          <div class="content">
            <p>Has recibido una notificación sobre la reconversión: <strong>${data.company_name}</strong></p>
            <a href="${Deno.env.get("SITE_URL") || 'https://your-app.com'}/reconversiones" class="btn">Ver Reconversiones</a>
          </div>
        </div>
      `;
  }
};

const getSubject = (type: string, data: any) => {
  switch (type) {
    case 'reconversion_created':
      return `🔄 Nueva reconversión asignada: ${data.company_name}`;
    case 'candidate_added':
      return `🎯 Nueva empresa candidata para: ${data.company_name}`;
    case 'reconversion_closed':
      return `✅ Reconversión cerrada: ${data.company_name}`;
    default:
      return `📧 Notificación de reconversión: ${data.company_name}`;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      type,
      recipient_email,
      recipient_name,
      reconversion_data,
      metadata
    }: ReconversionNotificationRequest = await req.json();

    // Validate required fields
    if (!type || !recipient_email || !reconversion_data?.company_name) {
      throw new Error("Missing required fields");
    }

    const emailData = {
      ...reconversion_data,
      metadata
    };

    const emailResponse = await resend.emails.send({
      from: "CRM Pro <notifications@resend.dev>",
      to: [recipient_email],
      subject: getSubject(type, emailData),
      html: getEmailTemplate(type, emailData),
    });

    console.log("Reconversion notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      email_id: emailResponse.data?.id,
      message: "Notification sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-reconversion-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);