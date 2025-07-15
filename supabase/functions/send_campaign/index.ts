import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  opportunity_ids: string[];
  audience: string;
  subject: string;
  html_body: string;
}

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

    const { opportunity_ids, audience, subject, html_body }: CampaignRequest = await req.json();

    console.log("Sending campaign for user:", user.id, "to audience:", audience);

    // Get subscribers for the specified audience
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from("subscribers")
      .select("email")
      .eq("segment", audience)
      .eq("unsubscribed", false)
      .eq("verified", true);

    if (subscribersError) {
      throw new Error(`Error fetching subscribers: ${subscribersError.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      throw new Error(`No active subscribers found for audience: ${audience}`);
    }

    const emailList = subscribers.map(sub => sub.email);

    // Send campaign email
    const emailResponse = await resend.emails.send({
      from: "CAPITTAL <onboarding@resend.dev>",
      to: emailList,
      subject: subject,
      html: html_body,
    });

    console.log("Campaign email sent successfully:", emailResponse);

    // Save campaign to database
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("campaigns")
      .insert({
        opportunity_ids,
        audience,
        subject,
        html_body,
        created_by: user.id,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (campaignError) {
      console.error("Error saving campaign:", campaignError);
      throw new Error(`Error saving campaign: ${campaignError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Campaña enviada a ${emailList.length} suscriptores`,
        campaign_id: campaign.id,
        recipients_count: emailList.length 
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
    console.error("Error in send_campaign function:", error);
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