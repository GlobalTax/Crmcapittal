import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    console.log("Generating ROD for user:", user.id);

    // Get highlighted operations (sale mandates)
    const { data: operations, error: operationsError } = await supabaseClient
      .from("operations")
      .select("*")
      .eq("operation_type", "sale")
      .eq("highlighted", true)
      .order("rod_order", { ascending: true });

    if (operationsError) {
      console.error("Error fetching operations:", operationsError);
    }

    // Get highlighted leads
    const { data: leads, error: leadsError } = await supabaseClient
      .from("leads")
      .select("*")
      .eq("highlighted", true)
      .order("rod_order", { ascending: true });

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
    }

    const highlightedOperations = operations || [];
    const highlightedLeads = leads || [];

    if (highlightedOperations.length === 0 && highlightedLeads.length === 0) {
      throw new Error("No highlighted operations or leads found");
    }

    // Generate HTML content for operations
    const operationsHtml = highlightedOperations
      .map((op) => {
        const amount = op.amount ? `€${op.amount.toLocaleString()}` : "N/A";
        const ebitda = op.ebitda ? `€${op.ebitda.toLocaleString()}` : "N/A";
        const description = op.description || "";
        const title = op.project_name || op.company_name;
        
        return `<p><b>${title}</b> – ${amount} importe / ${ebitda} EBITDA.<br>${description}</p>`;
      })
      .join("\n");

    // Generate HTML content for leads
    const leadsHtml = highlightedLeads
      .map((lead) => {
        const value = lead.conversion_value ? `€${lead.conversion_value.toLocaleString()}` : "N/A";
        const score = lead.lead_score || "N/A";
        const message = lead.message || "";
        const title = lead.lead_name || lead.name;
        
        return `<p><b>${title}</b> (${lead.company_name || 'Sin empresa'}) – Valor: ${value} / Score: ${score}.<br>${message}</p>`;
      })
      .join("\n");

    let htmlContent = "";
    if (operationsHtml) {
      htmlContent += `<h3>Mandatos de Venta (${highlightedOperations.length})</h3>\n${operationsHtml}\n`;
    }
    if (leadsHtml) {
      htmlContent += `<h3>Leads Potenciales (${highlightedLeads.length})</h3>\n${leadsHtml}\n`;
    }

    // Log the ROD generation
    const { error: logError } = await supabaseClient
      .from("rod_log")
      .insert({
        deals: [...highlightedOperations, ...highlightedLeads],
        created_by: user.id,
        sent_at: new Date().toISOString()
      });

    if (logError) {
      console.error("Error logging ROD:", logError);
    }

    // Send email with ROD content
    const emailResponse = await resend.emails.send({
      from: "ROD System <onboarding@resend.dev>",
      to: ["admin@capittal.com"], // Change to actual recipient
      subject: "Nueva ROD Generada - CAPITTAL",
      html: `
        <h1>ROD Generada</h1>
        <p>Se ha generado una nueva ROD con ${highlightedOperations.length + highlightedLeads.length} elementos:</p>
        <ul>
          <li>${highlightedOperations.length} Mandatos de Venta</li>
          <li>${highlightedLeads.length} Leads Potenciales</li>
        </ul>
        <div style="border: 1px solid #ccc; padding: 20px; margin: 20px 0;">
          ${htmlContent}
        </div>
        <p>Generado por: ${user.email}</p>
        <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
      `,
    });

    console.log("ROD email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "ROD generada y enviada exitosamente",
        operations_count: highlightedOperations.length,
        leads_count: highlightedLeads.length,
        total_count: highlightedOperations.length + highlightedLeads.length
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in generate_rod function:", error);
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