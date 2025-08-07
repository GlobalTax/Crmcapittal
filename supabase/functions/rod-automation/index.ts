import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutomationRequest {
  type: 'segment_calculation' | 'behavior_scoring' | 'template_suggestion' | 'campaign_trigger';
  config?: any;
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

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    const { type, config }: AutomationRequest = await req.json();

    let result;

    switch (type) {
      case 'segment_calculation':
        result = await calculateDynamicSegments(supabaseClient);
        break;
        
      case 'behavior_scoring':
        result = await updateSubscriberBehaviorScores(supabaseClient);
        break;
        
      case 'template_suggestion':
        result = await generateTemplateIntelligence(supabaseClient, user.id);
        break;
        
      case 'campaign_trigger':
        result = await processCampaignTriggers(supabaseClient, user.id);
        break;
        
      default:
        throw new Error(`Unknown automation type: ${type}`);
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in rod-automation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function calculateDynamicSegments(supabase: any) {
  console.log("Calculating dynamic segments...");
  
  // Get all dynamic segments
  const { data: segments, error: segmentsError } = await supabase
    .from('subscriber_segments')
    .select('*')
    .eq('is_dynamic', true);

  if (segmentsError) throw segmentsError;

  const results = [];

  for (const segment of segments) {
    const conditions = segment.conditions;
    
    // Build dynamic query based on conditions
    let query = supabase.from('subscribers').select('id, email');
    
    // Apply engagement level filter
    if (conditions.engagement_score?.min) {
      query = query.gte('behavior_score', conditions.engagement_score.min);
    }
    
    // Apply last engagement filter
    if (conditions.last_opened?.days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - conditions.last_opened.days);
      query = query.gte('last_engagement_at', cutoffDate.toISOString());
    }
    
    // Apply creation date filter for new subscribers
    if (conditions.created_at?.days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - conditions.created_at.days);
      query = query.gte('created_at', cutoffDate.toISOString());
    }

    const { data: matchingSubscribers, error } = await query;
    
    if (error) {
      console.error(`Error calculating segment ${segment.name}:`, error);
      continue;
    }

    // Clear existing memberships for this segment
    await supabase
      .from('subscriber_segment_members')
      .delete()
      .eq('segment_id', segment.id);

    // Add new memberships
    if (matchingSubscribers && matchingSubscribers.length > 0) {
      const memberships = matchingSubscribers.map(sub => ({
        subscriber_id: sub.id,
        segment_id: segment.id,
        added_by: null // System generated
      }));

      await supabase
        .from('subscriber_segment_members')
        .insert(memberships);
    }

    // Update segment count
    await supabase
      .from('subscriber_segments')
      .update({
        subscriber_count: matchingSubscribers?.length || 0,
        last_calculated_at: new Date().toISOString()
      })
      .eq('id', segment.id);

    results.push({
      segment: segment.name,
      count: matchingSubscribers?.length || 0
    });
  }

  return { segmentsUpdated: results.length, results };
}

async function updateSubscriberBehaviorScores(supabase: any) {
  console.log("Updating subscriber behavior scores...");
  
  // Get all subscribers
  const { data: subscribers, error } = await supabase
    .from('subscribers')
    .select('id, email, created_at, last_engagement_at');

  if (error) throw error;

  const scores = [];

  for (const subscriber of subscribers) {
    // Calculate engagement score based on recent activity
    const { data: recentAnalytics } = await supabase
      .from('campaign_analytics')
      .select('event_type, timestamp')
      .eq('subscriber_id', subscriber.id)
      .gte('timestamp', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // Last 90 days

    let engagementScore = 0;
    let recencyScore = 0;
    let frequencyScore = 0;

    if (recentAnalytics) {
      // Engagement score: opens = 1, clicks = 3, downloads = 5
      engagementScore = recentAnalytics.reduce((score, event) => {
        switch (event.event_type) {
          case 'opened': return score + 1;
          case 'clicked': return score + 3;
          case 'downloaded': return score + 5;
          default: return score;
        }
      }, 0);

      // Frequency score based on number of interactions
      frequencyScore = Math.min(recentAnalytics.length * 2, 100);

      // Recency score based on last engagement
      if (subscriber.last_engagement_at) {
        const daysSinceLastEngagement = Math.floor(
          (Date.now() - new Date(subscriber.last_engagement_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        recencyScore = Math.max(100 - daysSinceLastEngagement, 0);
      }
    }

    const totalScore = Math.round((engagementScore + recencyScore + frequencyScore) / 3);

    // Update subscriber behavior score
    await supabase
      .from('subscriber_behavior_scores')
      .upsert({
        subscriber_id: subscriber.id,
        engagement_score: engagementScore,
        recency_score: recencyScore,
        frequency_score: frequencyScore,
        total_score: totalScore,
        last_calculated_at: new Date().toISOString(),
        behavior_data: {
          recent_events: recentAnalytics?.length || 0,
          calculation_date: new Date().toISOString()
        }
      });

    // Update subscriber engagement level
    let engagementLevel = 'low';
    if (totalScore >= 80) engagementLevel = 'high';
    else if (totalScore >= 40) engagementLevel = 'medium';

    await supabase
      .from('subscribers')
      .update({
        behavior_score: totalScore,
        engagement_level: engagementLevel
      })
      .eq('id', subscriber.id);

    scores.push({
      email: subscriber.email,
      score: totalScore,
      level: engagementLevel
    });
  }

  return { subscribersUpdated: scores.length, scores: scores.slice(0, 10) }; // Return first 10 for preview
}

async function generateTemplateIntelligence(supabase: any, userId: string) {
  console.log("Generating template intelligence...");
  
  // Analyze ROD performance to suggest templates
  const { data: rodLogs } = await supabase
    .from('rod_log')
    .select('id, deals, sent_at')
    .eq('created_by', userId)
    .order('sent_at', { ascending: false })
    .limit(10);

  const suggestions = [];

  if (rodLogs && rodLogs.length > 0) {
    // Analyze deal patterns
    const dealTypes = new Map();
    const sectors = new Map();

    rodLogs.forEach(rod => {
      if (rod.deals && Array.isArray(rod.deals)) {
        rod.deals.forEach((deal: any) => {
          if (deal.type) {
            dealTypes.set(deal.type, (dealTypes.get(deal.type) || 0) + 1);
          }
          if (deal.sector) {
            sectors.set(deal.sector, (sectors.get(deal.sector) || 0) + 1);
          }
        });
      }
    });

    // Generate template suggestions based on patterns
    const topSector = [...sectors.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topSector && topSector[1] >= 3) {
      suggestions.push({
        type: 'sector_focus',
        title: `${topSector[0]} Sector Specialist`,
        description: `Template optimizado para sector ${topSector[0]} basado en tu actividad`,
        confidence: 0.8,
        usage_potential: topSector[1]
      });
    }

    const topDealType = [...dealTypes.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topDealType && topDealType[1] >= 2) {
      suggestions.push({
        type: 'deal_type_focus',
        title: `${topDealType[0]} Operations Report`,
        description: `Template especializado en operaciones tipo ${topDealType[0]}`,
        confidence: 0.7,
        usage_potential: topDealType[1]
      });
    }
  }

  // Add time-based suggestions
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();

  if (dayOfWeek === 1) { // Monday
    suggestions.push({
      type: 'weekly_timing',
      title: 'Monday Market Update',
      description: 'Template para actualizaciones semanales los lunes',
      confidence: 0.6,
      usage_potential: 4
    });
  }

  if (dayOfMonth <= 3) { // First 3 days of month
    suggestions.push({
      type: 'monthly_timing',
      title: 'Monthly Market Overview',
      description: 'Template para resúmenes mensuales',
      confidence: 0.6,
      usage_potential: 12
    });
  }

  return { suggestionsGenerated: suggestions.length, suggestions };
}

async function processCampaignTriggers(supabase: any, userId: string) {
  console.log("Processing campaign triggers...");
  
  // Get active workflows
  const { data: workflows } = await supabase
    .from('campaign_workflows')
    .select('*')
    .eq('created_by', userId)
    .eq('is_active', true);

  if (!workflows || workflows.length === 0) {
    return { triggersProcessed: 0, campaigns: [] };
  }

  const triggeredCampaigns = [];

  for (const workflow of workflows) {
    const trigger = workflow.trigger_config;
    let shouldTrigger = false;

    switch (workflow.trigger_type) {
      case 'time_based':
        shouldTrigger = await checkTimeTrigger(trigger);
        break;
        
      case 'event_based':
        shouldTrigger = await checkEventTrigger(supabase, trigger, userId);
        break;
        
      case 'behavior_based':
        shouldTrigger = await checkBehaviorTrigger(supabase, trigger);
        break;
    }

    if (shouldTrigger) {
      // Create campaign from template
      const campaignData = {
        ...workflow.campaign_template,
        automation_workflow_id: workflow.id,
        created_by: userId,
        campaign_type: 'automated',
        created_at: new Date().toISOString()
      };

      const { data: campaign } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select()
        .single();

      if (campaign) {
        triggeredCampaigns.push({
          workflow: workflow.name,
          campaign_id: campaign.id,
          trigger_type: workflow.trigger_type
        });

        // Update workflow execution count
        await supabase
          .from('campaign_workflows')
          .update({
            last_executed_at: new Date().toISOString(),
            execution_count: workflow.execution_count + 1
          })
          .eq('id', workflow.id);
      }
    }
  }

  return { triggersProcessed: triggeredCampaigns.length, campaigns: triggeredCampaigns };
}

async function checkTimeTrigger(trigger: any): Promise<boolean> {
  const now = new Date();
  
  if (trigger.frequency === 'weekly') {
    const dayOfWeek = now.getDay();
    return trigger.day_of_week === dayOfWeek;
  }
  
  if (trigger.frequency === 'monthly') {
    const dayOfMonth = now.getDate();
    return trigger.day_of_month === dayOfMonth;
  }
  
  return false;
}

async function checkEventTrigger(supabase: any, trigger: any, userId: string): Promise<boolean> {
  if (trigger.event === 'new_deal_added') {
    // Check if new deals were added in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { data: recentDeals } = await supabase
      .from('deals')
      .select('id')
      .eq('created_by', userId)
      .gte('created_at', oneHourAgo.toISOString());
    
    return recentDeals && recentDeals.length > 0;
  }
  
  return false;
}

async function checkBehaviorTrigger(supabase: any, trigger: any): Promise<boolean> {
  if (trigger.condition === 'high_engagement_segment_growth') {
    // Check if high engagement segment grew significantly
    const { data: highEngagementSegment } = await supabase
      .from('subscriber_segments')
      .select('subscriber_count, last_calculated_at')
      .eq('name', 'High Engagement')
      .single();
    
    if (highEngagementSegment && trigger.threshold) {
      return highEngagementSegment.subscriber_count >= trigger.threshold;
    }
  }
  
  return false;
}

serve(handler);