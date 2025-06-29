
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { source, data, webhook_key } = await req.json()
    
    // Verify webhook key for security
    const expectedKey = Deno.env.get('WEBHOOK_SECRET_KEY')
    if (webhook_key !== expectedKey) {
      console.error('Invalid webhook key')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Received webhook:', { source, data })

    // Create lead record
    const leadData = {
      name: data.name || data.fullName || 'Lead sin nombre',
      email: data.email,
      phone: data.phone || data.telefono,
      company_name: data.company || data.empresa,
      message: data.message || data.mensaje || data.comments,
      source: source === 'capital_market' ? 'CAPITAL_MARKET' : 'WEBSITE_FORM',
      status: 'NEW'
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single()

    if (leadError) {
      console.error('Error creating lead:', leadError)
      throw leadError
    }

    console.log('Lead created:', lead.id)

    // Create lead nurturing record
    const nurturingData = {
      lead_id: lead.id,
      stage: 'CAPTURED',
      lead_score: 10, // Initial score for new leads
      engagement_score: 0,
      nurturing_status: 'ACTIVE',
      source_details: {
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
        referrer: data.referrer,
        landing_page: data.landing_page,
        ip_address: data.ip_address,
        user_agent: data.user_agent
      }
    }

    const { error: nurturingError } = await supabase
      .from('lead_nurturing')
      .insert([nurturingData])

    if (nurturingError) {
      console.error('Error creating lead nurturing:', nurturingError)
    }

    // Create initial activity
    const activityData = {
      lead_id: lead.id,
      activity_type: 'FORM_SUBMITTED',
      activity_data: {
        source: source,
        form_data: data,
        timestamp: new Date().toISOString()
      },
      points_awarded: 10
    }

    const { error: activityError } = await supabase
      .from('lead_activities')
      .insert([activityData])

    if (activityError) {
      console.error('Error creating lead activity:', activityError)
    }

    // Trigger automated scoring rules
    EdgeRuntime.waitUntil(applyAutomatedScoring(supabase, lead.id))

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: lead.id,
        message: 'Lead captured successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function applyAutomatedScoring(supabase: any, leadId: string) {
  try {
    // Get active scoring rules
    const { data: rules, error } = await supabase
      .from('lead_scoring_rules')
      .select('*')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching scoring rules:', error)
      return
    }

    // Apply each rule
    for (const rule of rules || []) {
      const { data: activities } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .eq('activity_type', rule.trigger_condition.activity_type)

      if (activities && activities.length > 0) {
        // Update lead score
        const { error: scoreError } = await supabase.rpc('update_lead_score', {
          p_lead_id: leadId,
          p_points_to_add: rule.points_awarded
        })

        if (scoreError) {
          console.error('Error updating lead score:', scoreError)
        }
      }
    }
  } catch (error) {
    console.error('Error in automated scoring:', error)
  }
}
