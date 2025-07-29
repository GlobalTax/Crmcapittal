import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRule {
  id: string;
  rule_name: string;
  rule_type: string;
  is_active: boolean;
  conditions: any;
  notification_config: any;
}

interface Lead {
  id: string;
  name: string;
  assigned_to_id?: string;
  pipeline_stage_id?: string;
  prob_conversion?: number;
}

interface LeadTask {
  id: string;
  lead_id: string;
  title: string;
  due_date: string;
  assigned_to?: string;
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
    );

    console.log('Starting automated notifications check...');

    // Get active notification rules
    const { data: rules, error: rulesError } = await supabase
      .from('notification_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) {
      throw rulesError;
    }

    const notifications = [];
    const currentTime = new Date();
    const currentHour = currentTime.getHours().toString().padStart(2, '0');
    const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${currentHour}:${currentMinute}`;

    for (const rule of rules as NotificationRule[]) {
      console.log(`Processing rule: ${rule.rule_name}`);

      switch (rule.rule_type) {
        case 'high_score_lead':
          await processHighScoreLeads(supabase, rule, notifications);
          break;
        
        case 'task_reminder':
          await processTaskReminders(supabase, rule, notifications, currentTimeString);
          break;
        
        case 'high_prob_negotiation':
          await processHighProbNegotiation(supabase, rule, notifications);
          break;
      }
    }

    console.log(`Processed ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_sent: notifications.length,
        notifications: notifications 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error in automated notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});

async function processHighScoreLeads(supabase: any, rule: NotificationRule, notifications: any[]) {
  const minScore = rule.conditions.min_score || 70;
  
  // Get leads from lead_nurturing with high scores
  const { data: highScoreLeads, error } = await supabase
    .from('lead_nurturing')
    .select(`
      lead_id,
      lead_score,
      leads (
        id,
        name,
        assigned_to_id
      )
    `)
    .gte('lead_score', minScore);

  if (error) {
    console.error('Error fetching high score leads:', error);
    return;
  }

  for (const leadNurturing of highScoreLeads || []) {
    const lead = leadNurturing.leads;
    if (!lead) continue;

    // Check if we already sent this notification recently (last 24 hours)
    const { data: recentNotification } = await supabase
      .from('notification_logs')
      .select('id')
      .eq('lead_id', lead.id)
      .eq('notification_type', 'high_score_lead')
      .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (recentNotification) {
      continue; // Skip if already notified recently
    }

    const message = rule.notification_config.message
      .replace('{lead_name}', lead.name)
      .replace('{score}', leadNurturing.lead_score);

    const recipientId = lead.assigned_to_id;
    if (recipientId) {
      await sendNotification(supabase, rule, lead.id, null, recipientId, message);
      notifications.push({
        type: 'high_score_lead',
        lead_name: lead.name,
        score: leadNurturing.lead_score,
        recipient_id: recipientId
      });
    }
  }
}

async function processTaskReminders(supabase: any, rule: NotificationRule, notifications: any[], currentTime: string) {
  const reminderTimes = rule.conditions.reminder_times || ['09:00', '16:00'];
  
  // Only process if current time matches reminder times
  if (!reminderTimes.includes(currentTime)) {
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Get tasks due today
  const { data: dueTasks, error } = await supabase
    .from('lead_tasks')
    .select(`
      id,
      lead_id,
      title,
      assigned_to,
      due_date,
      leads (
        name
      )
    `)
    .gte('due_date', `${today}T00:00:00.000Z`)
    .lt('due_date', `${today}T23:59:59.999Z`)
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching due tasks:', error);
    return;
  }

  for (const task of dueTasks || []) {
    // Check if we already sent reminder for this task today
    const { data: recentNotification } = await supabase
      .from('notification_logs')
      .select('id')
      .eq('task_id', task.id)
      .eq('notification_type', 'task_reminder')
      .gte('sent_at', `${today}T00:00:00.000Z`)
      .single();

    if (recentNotification) {
      continue; // Skip if already notified today
    }

    const message = rule.notification_config.message
      .replace('{task_title}', task.title);

    const recipientId = task.assigned_to;
    if (recipientId) {
      await sendNotification(supabase, rule, task.lead_id, task.id, recipientId, message);
      notifications.push({
        type: 'task_reminder',
        task_title: task.title,
        lead_name: task.leads?.name,
        recipient_id: recipientId
      });
    }
  }
}

async function processHighProbNegotiation(supabase: any, rule: NotificationRule, notifications: any[]) {
  const minProbConversion = rule.conditions.min_prob_conversion || 0.8;
  const stageName = rule.conditions.stage_name || 'Negociación';
  
  // Get leads in negotiation stage with high probability
  const { data: highProbLeads, error } = await supabase
    .from('leads')
    .select(`
      id,
      name,
      assigned_to_id,
      prob_conversion,
      pipeline_stages (
        name
      )
    `)
    .gte('prob_conversion', minProbConversion)
    .eq('pipeline_stages.name', stageName);

  if (error) {
    console.error('Error fetching high probability leads:', error);
    return;
  }

  // Get all users with admin/superadmin roles (PMs)
  const { data: adminUsers, error: adminError } = await supabase
    .from('user_roles')
    .select('user_id')
    .in('role', ['admin', 'superadmin']);

  if (adminError) {
    console.error('Error fetching admin users:', adminError);
    return;
  }

  for (const lead of highProbLeads || []) {
    // Check if we already sent this notification recently (last 24 hours)
    const { data: recentNotification } = await supabase
      .from('notification_logs')
      .select('id')
      .eq('lead_id', lead.id)
      .eq('notification_type', 'high_prob_negotiation')
      .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (recentNotification) {
      continue; // Skip if already notified recently
    }

    const message = rule.notification_config.message
      .replace('{lead_name}', lead.name);

    // Notify all PMs
    for (const adminUser of adminUsers || []) {
      await sendNotification(supabase, rule, lead.id, null, adminUser.user_id, message);
      notifications.push({
        type: 'high_prob_negotiation',
        lead_name: lead.name,
        prob_conversion: lead.prob_conversion,
        recipient_id: adminUser.user_id
      });
    }
  }
}

async function sendNotification(
  supabase: any, 
  rule: NotificationRule, 
  leadId: string | null, 
  taskId: string | null, 
  recipientUserId: string, 
  message: string
) {
  // Insert notification log
  const { error: logError } = await supabase
    .from('notification_logs')
    .insert({
      rule_id: rule.id,
      lead_id: leadId,
      task_id: taskId,
      notification_type: rule.rule_type,
      recipient_user_id: recipientUserId,
      message: message,
      delivery_status: 'sent',
      metadata: {
        rule_name: rule.rule_name,
        sent_via: 'automated'
      }
    });

  if (logError) {
    console.error('Error logging notification:', logError);
  }

  // Here you could also send email notifications if configured
  // For now, we just log the in-app notification
  console.log(`Notification sent to ${recipientUserId}: ${message}`);
}