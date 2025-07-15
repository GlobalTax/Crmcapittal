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

    // Get highlighted opportunities ordered by rod_order
    const { data: opportunities, error: opportunitiesError } = await supabaseClient
      .from("opportunities")
      .select("*")
      .eq("highlighted", true)
      .order("rod_order", { ascending: true });

    if (opportunitiesError) {
      throw new Error(`Error fetching opportunities: ${opportunitiesError.message}`);
    }

    if (!opportunities || opportunities.length === 0) {
      throw new Error("No highlighted opportunities found");
    }

    // Generate HTML content
    const htmlContent = opportunities
      .map((opp) => {
        const sales = opp.value ? `${opp.value.toLocaleString()} EUR` : "N/A";
        const ebitda = opp.ebitda ? `${opp.ebitda.toLocaleString()} EUR` : "N/A";
        const notes = opp.notes || "";
        
        return `<p><b>${opp.title}</b> – ${sales} ventas / ${ebitda} EBITDA.<br>${notes}</p>`;
      })
      .join("\n");

    // Log the ROD generation
    const { error: logError } = await supabaseClient
      .from("rod_log")
      .insert({
        deals: opportunities,
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
        <p>Se ha generado una nueva ROD con ${opportunities.length} oportunidades:</p>
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
        opportunities_count: opportunities.length 
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