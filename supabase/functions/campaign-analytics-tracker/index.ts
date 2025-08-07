import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsEvent {
  campaign_id: string;
  subscriber_id?: string;
  subscriber_email?: string;
  event_type: 'sent' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  event_data?: any;
  ip_address?: string;
  user_agent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const event: AnalyticsEvent = await req.json();
    
    // Get IP and User Agent from headers
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';

    // If subscriber_email provided but not subscriber_id, look it up
    let subscriberId = event.subscriber_id;
    if (!subscriberId && event.subscriber_email) {
      const { data: subscriber } = await supabaseClient
        .from('subscribers')
        .select('id')
        .eq('email', event.subscriber_email)
        .single();
      
      subscriberId = subscriber?.id;
    }

    // Insert analytics event
    const { error: analyticsError } = await supabaseClient
      .from('campaign_analytics')
      .insert({
        campaign_id: event.campaign_id,
        subscriber_id: subscriberId,
        event_type: event.event_type,
        event_data: event.event_data || {},
        ip_address: event.ip_address || ip,
        user_agent: event.user_agent || userAgent,
        timestamp: new Date().toISOString()
      });

    if (analyticsError) {
      throw analyticsError;
    }

    // Update subscriber engagement if it was an engagement event
    if (subscriberId && ['opened', 'clicked'].includes(event.event_type)) {
      await supabaseClient
        .from('subscribers')
        .update({
          last_engagement_at: new Date().toISOString()
        })
        .eq('id', subscriberId);
    }

    // Handle unsubscribe
    if (event.event_type === 'unsubscribed' && subscriberId) {
      await supabaseClient
        .from('subscribers')
        .update({
          unsubscribed: true
        })
        .eq('id', subscriberId);
    }

    // Update campaign performance metrics
    await updateCampaignMetrics(supabaseClient, event.campaign_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Analytics event tracked successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in campaign-analytics-tracker:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function updateCampaignMetrics(supabase: any, campaignId: string) {
  try {
    // Get all analytics for this campaign
    const { data: analytics } = await supabase
      .from('campaign_analytics')
      .select('event_type, subscriber_id')
      .eq('campaign_id', campaignId);

    if (!analytics) return;

    // Calculate metrics
    const metrics = {
      total_sent: 0,
      total_opened: 0,
      total_clicked: 0,
      total_bounced: 0,
      total_unsubscribed: 0,
      unique_opens: 0,
      unique_clicks: 0,
      open_rate: 0,
      click_rate: 0,
      bounce_rate: 0,
      unsubscribe_rate: 0
    };

    const uniqueOpens = new Set();
    const uniqueClicks = new Set();

    analytics.forEach(event => {
      switch (event.event_type) {
        case 'sent':
          metrics.total_sent++;
          break;
        case 'opened':
          metrics.total_opened++;
          if (event.subscriber_id) {
            uniqueOpens.add(event.subscriber_id);
          }
          break;
        case 'clicked':
          metrics.total_clicked++;
          if (event.subscriber_id) {
            uniqueClicks.add(event.subscriber_id);
          }
          break;
        case 'bounced':
          metrics.total_bounced++;
          break;
        case 'unsubscribed':
          metrics.total_unsubscribed++;
          break;
      }
    });

    metrics.unique_opens = uniqueOpens.size;
    metrics.unique_clicks = uniqueClicks.size;

    // Calculate rates
    if (metrics.total_sent > 0) {
      metrics.open_rate = (metrics.unique_opens / metrics.total_sent) * 100;
      metrics.click_rate = (metrics.unique_clicks / metrics.total_sent) * 100;
      metrics.bounce_rate = (metrics.total_bounced / metrics.total_sent) * 100;
      metrics.unsubscribe_rate = (metrics.total_unsubscribed / metrics.total_sent) * 100;
    }

    // Update campaign with metrics
    await supabase
      .from('campaigns')
      .update({
        performance_metrics: {
          ...metrics,
          last_updated: new Date().toISOString()
        }
      })
      .eq('id', campaignId);

  } catch (error) {
    console.error('Error updating campaign metrics:', error);
  }
}

serve(handler);