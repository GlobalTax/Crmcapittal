
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

    // Verify webhook signature (in production)
    const signature = req.headers.get('x-capital-market-signature');
    const payload = await req.text();
    
    // Parse the webhook payload
    const data = JSON.parse(payload);
    console.log('Capital Market webhook received:', data);

    // Process different webhook events
    switch (data.event_type) {
      case 'lead.created':
        await handleLeadCreated(supabase, data.lead);
        break;
      case 'lead.updated':
        await handleLeadUpdated(supabase, data.lead);
        break;
      case 'lead.status_changed':
        await handleLeadStatusChanged(supabase, data.lead);
        break;
      default:
        console.log('Unknown webhook event:', data.event_type);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function handleLeadCreated(supabase: any, leadData: any) {
  console.log('Processing new lead from Capital Market:', leadData);
  
  // Calculate lead score
  const leadScore = calculateLeadScore(leadData);
  
  // Map Capital Market data to our schema
  const mappedLead = {
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    company_name: leadData.company_name,
    job_title: leadData.job_title,
    message: leadData.message || leadData.description,
    source: 'capittal_market',
    status: 'NEW',
    priority: leadData.priority || 'MEDIUM',
    quality: calculateLeadQuality(leadScore),
    lead_score: leadScore,
    tags: [...(leadData.tags || []), 'Capital Market', 'Webhook Import'],
    form_data: {
      external_source: 'capital_market',
      webhook_data: leadData,
      import_date: new Date().toISOString()
    },
    external_id: leadData.id,
    external_source: 'capital_market'
  };

  // Check if lead already exists
  const { data: existingLead } = await supabase
    .from('leads')
    .select('id')
    .eq('external_id', leadData.id)
    .single();

  if (existingLead) {
    console.log('Lead already exists, skipping:', leadData.id);
    return;
  }

  // Insert new lead
  const { data: newLead, error } = await supabase
    .from('leads')
    .insert([mappedLead])
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    throw error;
  }

  // Trigger automation rules
  await triggerAutomationRules(supabase, 'lead_created', newLead);
  await triggerAutomationRules(supabase, 'capital_market_lead_imported', newLead);
  
  // Start nurturing sequence if applicable
  await startNurturingSequence(supabase, newLead);

  console.log('Lead processed successfully:', newLead.id);
}

async function handleLeadUpdated(supabase: any, leadData: any) {
  console.log('Updating existing lead from Capital Market:', leadData);
  
  const updates = {
    name: leadData.name,
    phone: leadData.phone,
    company_name: leadData.company_name,
    job_title: leadData.job_title,
    message: leadData.message || leadData.description,
    priority: leadData.priority || 'MEDIUM',
    lead_score: calculateLeadScore(leadData),
    tags: [...(leadData.tags || []), 'Capital Market', 'Updated'],
    form_data: {
      external_source: 'capital_market',
      webhook_data: leadData,
      last_update: new Date().toISOString()
    },
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('external_id', leadData.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating lead:', error);
    throw error;
  }

  // Trigger score change automation if applicable
  await triggerAutomationRules(supabase, 'score_changed', data);
}

async function handleLeadStatusChanged(supabase: any, leadData: any) {
  console.log('Handling status change for lead:', leadData);
  
  // Map Capital Market status to our system
  const statusMapping: Record<string, string> = {
    'new': 'NEW',
    'contacted': 'CONTACTED', 
    'qualified': 'QUALIFIED',
    'disqualified': 'DISQUALIFIED'
  };

  const mappedStatus = statusMapping[leadData.status?.toLowerCase()] || 'NEW';

  const { data, error } = await supabase
    .from('leads')
    .update({ 
      status: mappedStatus,
      updated_at: new Date().toISOString()
    })
    .eq('external_id', leadData.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }

  // Trigger status change automation
  await triggerAutomationRules(supabase, 'status_changed', data);
}

function calculateLeadScore(leadData: any): number {
  let score = 10; // Base score

  // Company name adds credibility
  if (leadData.company_name) score += 15;
  
  // Job title scoring
  if (leadData.job_title) {
    const title = leadData.job_title.toLowerCase();
    if (title.includes('ceo') || title.includes('founder')) score += 25;
    else if (title.includes('director') || title.includes('manager')) score += 15;
    else score += 10;
  }

  // Phone number availability
  if (leadData.phone) score += 10;

  // Message quality
  if (leadData.message && leadData.message.length > 50) score += 15;

  // Pre-calculated score from Capital Market
  if (leadData.lead_score) score += leadData.lead_score;

  return Math.min(score, 100); // Cap at 100
}

function calculateLeadQuality(score: number): string {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAIR';
  return 'POOR';
}

async function triggerAutomationRules(supabase: any, triggerType: string, leadData: any) {
  try {
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_type', triggerType)
      .eq('enabled', true)
      .order('priority', { ascending: false });

    for (const rule of rules || []) {
      const conditionsMet = evaluateConditions(rule.conditions, leadData);
      if (conditionsMet) {
        await executeActions(supabase, rule.actions, leadData);
      }
    }
  } catch (error) {
    console.error('Error triggering automation rules:', error);
  }
}

function evaluateConditions(conditions: any[], leadData: any): boolean {
  if (!conditions || conditions.length === 0) return true;
  
  return conditions.every(condition => {
    const fieldValue = leadData[condition.field];
    const expectedValue = condition.value;
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'contains':
        return Array.isArray(fieldValue) 
          ? fieldValue.includes(expectedValue)
          : String(fieldValue).includes(String(expectedValue));
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
      default:
        return false;
    }
  });
}

async function executeActions(supabase: any, actions: any[], leadData: any) {
  for (const action of actions) {
    try {
      switch (action.type) {
        case 'send_email':
          await sendAutomatedEmail(supabase, leadData, action.config);
          break;
        case 'create_task':
          await createFollowUpTask(supabase, leadData, action.config);
          break;
        case 'move_stage':
          await updateLeadStatus(supabase, leadData.id, action.config.new_status);
          break;
        case 'notify_user':
          console.log('Notification:', action.config.message);
          break;
        default:
          console.log('Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('Error executing action:', action.type, error);
    }
  }
}

async function sendAutomatedEmail(supabase: any, leadData: any, config: any) {
  // Log email for now - in production this would integrate with email service
  console.log('Sending automated email to:', leadData.email, config);
  
  // Record the email in tracked_emails table
  await supabase.from('tracked_emails').insert({
    recipient_email: leadData.email,
    subject: config.subject,
    content: `Automated email triggered by ${config.template}`,
    status: 'SENT',
    lead_id: leadData.id
  });
}

async function createFollowUpTask(supabase: any, leadData: any, config: any) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (config.due_days || 1));
  
  await supabase.from('planned_tasks').insert({
    title: config.description || 'Follow up with lead',
    description: `${config.description} - ${leadData.name} (${leadData.email})`,
    date: dueDate.toISOString().split('T')[0],
    lead_id: leadData.id,
    status: 'PENDING'
  });
}

async function updateLeadStatus(supabase: any, leadId: string, newStatus: string) {
  if (['NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED'].includes(newStatus)) {
    await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);
  }
}

async function startNurturingSequence(supabase: any, leadData: any) {
  try {
    const { data: sequences } = await supabase
      .from('nurturing_sequences')
      .select('*')
      .eq('enabled', true);

    for (const sequence of sequences || []) {
      const isTargetAudience = evaluateTargetAudience(sequence.target_audience, leadData);
      
      if (isTargetAudience) {
        await supabase.from('lead_nurturing_sequences').insert({
          lead_id: leadData.id,
          sequence_id: sequence.id,
          sequence_name: sequence.name,
          current_step: 0,
          status: 'active'
        });
        
        console.log(`Started nurturing sequence "${sequence.name}" for lead ${leadData.id}`);
        break; // Start only the first matching sequence
      }
    }
  } catch (error) {
    console.error('Error starting nurturing sequence:', error);
  }
}

function evaluateTargetAudience(criteria: any[], leadData: any): boolean {
  if (!criteria || criteria.length === 0) return true;
  
  return criteria.some(criterion => {
    const fieldValue = leadData[criterion.field];
    const expectedValue = criterion.value;
    
    switch (criterion.operator) {
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.some(item => 
            String(item).toLowerCase().includes(String(expectedValue).toLowerCase())
          );
        }
        return String(fieldValue || '').toLowerCase().includes(String(expectedValue).toLowerCase());
      case 'equals':
        return fieldValue === expectedValue;
      default:
        return false;
    }
  });
}
