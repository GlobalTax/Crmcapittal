import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CronRequest {
  type: 'hourly_check' | 'daily_summary';
}

interface OverdueTask {
  task_id: string;
  task_title: string;
  task_type: 'planned' | 'lead' | 'valoracion';
  entity_id: string;
  entity_name: string;
  due_date: string;
  owner_id: string;
  owner_email: string;
  days_overdue: number;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type }: CronRequest = await req.json();
    console.log(`Running task reminders cron: ${type}`);

    if (type === 'hourly_check') {
      await runHourlyCheck(supabase);
    } else if (type === 'daily_summary') {
      await runDailySummary(supabase);
    }

    return new Response(
      JSON.stringify({ success: true, type, timestamp: new Date().toISOString() }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in task-reminders-cron function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function runHourlyCheck(supabase: any) {
  console.log('Running hourly check for scheduled reminders and overdue tasks...');
  
  try {
    // 1. Process scheduled reminders first
    console.log('Processing scheduled reminders...');
    const { data: scheduledReminders, error: scheduledError } = await supabase.rpc('get_pending_scheduled_reminders');
    
    if (scheduledError) {
      console.error('Error fetching scheduled reminders:', scheduledError);
    } else {
      console.log(`Found ${scheduledReminders?.length || 0} scheduled reminders`);
      
      for (const reminder of scheduledReminders || []) {
        try {
          // Mark reminder as sent
          const { error: markError } = await supabase.rpc('mark_reminder_processed', { 
            p_reminder_id: reminder.id,
            p_status: 'sent'
          });

          if (!markError) {
            console.log(`Processed scheduled reminder: ${reminder.id}`);
            
            // Log automation event
            await supabase.rpc('log_automation_event', {
              p_automation_type: 'scheduled_reminder',
              p_entity_type: reminder.deal_id ? 'deal' : 'negocio',
              p_entity_id: reminder.deal_id || reminder.negocio_id,
              p_trigger_event: 'scheduled_time_reached',
              p_action_taken: 'reminder_sent',
              p_action_data: {
                reminder_type: reminder.reminder_type,
                notification_type: reminder.notification_type,
                task_title: reminder.task_title
              }
            });
          }
        } catch (reminderError) {
          console.error('Error processing scheduled reminder:', reminder.id, reminderError);
          
          // Mark as failed
          await supabase.rpc('mark_reminder_processed', { 
            p_reminder_id: reminder.id,
            p_status: 'failed',
            p_error_message: reminderError.message
          });
        }
      }
    }

    // 2. Process overdue tasks
    console.log('Processing overdue tasks...');
    const { data: overdueTasks, error } = await supabase.rpc('get_all_overdue_tasks');
    
    if (error) {
      console.error('Error fetching overdue tasks:', error);
      return;
    }

    console.log(`Found ${overdueTasks?.length || 0} overdue tasks`);

    // Process each overdue task
    for (const task of overdueTasks || []) {
      // Check if we already have a notification for this task
      const { data: existingNotification } = await supabase
        .from('task_notifications')
        .select('id')
        .eq('task_id', task.task_id)
        .eq('user_id', task.owner_id)
        .eq('notification_type', 'overdue_task')
        .single();

      // If no existing notification, create one
      if (!existingNotification) {
        const message = `Tarea vencida hace ${task.days_overdue} día${task.days_overdue !== 1 ? 's' : ''}: "${task.task_title}"${task.entity_name ? ` en ${task.entity_name}` : ''}`;
        
        await supabase
          .from('task_notifications')
          .insert({
            user_id: task.owner_id,
            task_id: task.task_id,
            task_type: task.task_type,
            notification_type: 'overdue_task',
            task_title: task.task_title,
            entity_name: task.entity_name,
            entity_id: task.entity_id,
            message: message,
            days_overdue: task.days_overdue,
            status: 'sent'
          });

        console.log(`Created notification for overdue task: ${task.task_title} (${task.days_overdue} days overdue)`);
        
        // Log automation event
        await supabase.rpc('log_automation_event', {
          p_automation_type: 'overdue_notification',
          p_entity_type: 'task',
          p_entity_id: task.task_id,
          p_trigger_event: 'task_overdue_detected',
          p_action_taken: 'notification_created',
          p_action_data: {
            task_type: task.task_type,
            days_overdue: task.days_overdue,
            entity_name: task.entity_name
          }
        });
      }
    }

  } catch (error) {
    console.error('Error in hourly check:', error);
  }
}

async function runDailySummary(supabase: any) {
  console.log('Running daily summary for overdue tasks...');
  
  try {
    // Get users with overdue tasks for email summary
    const { data: userSummaries, error } = await supabase.rpc('get_all_overdue_tasks');
    
    if (error) {
      console.error('Error fetching overdue tasks for summary:', error);
      return;
    }

    // Group tasks by user
    const tasksByUser = new Map<string, OverdueTask[]>();
    
    for (const task of userSummaries || []) {
      if (!tasksByUser.has(task.owner_id)) {
        tasksByUser.set(task.owner_id, []);
      }
      tasksByUser.get(task.owner_id)!.push(task);
    }

    console.log(`Sending daily summary to ${tasksByUser.size} users`);

    // Send email summary to each user
    for (const [userId, tasks] of tasksByUser) {
      await sendDailySummaryEmail(supabase, userId, tasks);
    }

  } catch (error) {
    console.error('Error in daily summary:', error);
  }
}

async function sendDailySummaryEmail(supabase: any, userId: string, tasks: OverdueTask[]) {
  if (!tasks.length) return;

  const userEmail = tasks[0].owner_email;
  if (!userEmail) return;

  const totalTasks = tasks.length;
  const criticalTasks = tasks.filter(t => t.days_overdue > 7);
  
  const emailHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">📋 Resumen de Tareas Vencidas</h2>
        
        <p>Tienes <strong>${totalTasks} tarea${totalTasks !== 1 ? 's' : ''} vencida${totalTasks !== 1 ? 's' : ''}</strong> que requieren tu atención:</p>
        
        ${criticalTasks.length > 0 ? `
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
            <h3 style="color: #dc2626; margin: 0 0 8px 0;">🚨 Críticas (${criticalTasks.length})</h3>
            <ul style="margin: 0;">
              ${criticalTasks.slice(0, 5).map(task => `
                <li style="margin-bottom: 4px;">
                  <strong>${task.task_title}</strong> - ${task.days_overdue} días vencida
                  ${task.entity_name ? `<br><small style="color: #666;">En: ${task.entity_name}</small>` : ''}
                </li>
              `).join('')}
              ${criticalTasks.length > 5 ? `<li><em>... y ${criticalTasks.length - 5} más</em></li>` : ''}
            </ul>
          </div>
        ` : ''}
        
        <h3>📝 Todas las tareas vencidas:</h3>
        <ul>
          ${tasks.slice(0, 10).map(task => `
            <li style="margin-bottom: 8px;">
              <strong>${task.task_title}</strong>
              <br>
              <small style="color: #666;">
                ${task.entity_name ? `${task.entity_name} • ` : ''}
                Vencida hace ${task.days_overdue} día${task.days_overdue !== 1 ? 's' : ''}
                • Tipo: ${task.task_type === 'planned' ? 'Planificada' : task.task_type === 'lead' ? 'Lead' : 'Valoración'}
              </small>
            </li>
          `).join('')}
          ${tasks.length > 10 ? `<li><em>... y ${tasks.length - 10} tareas más</em></li>` : ''}
        </ul>
        
        <div style="background-color: #f9fafb; padding: 16px; margin-top: 24px; border-radius: 8px;">
          <p style="margin: 0;"><strong>💡 Consejo:</strong> Revisa y actualiza el estado de tus tareas regularmente para mantener un seguimiento efectivo.</p>
        </div>
        
        <hr style="margin: 24px 0; border: 0; height: 1px; background-color: #e5e7eb;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          Este es un resumen automático enviado por el sistema CRM Pro.
        </p>
      </body>
    </html>
  `;

  try {
    const emailResponse = await resend.emails.send({
      from: "CRM Pro <noreply@crm-pro.com>",
      to: [userEmail],
      subject: `📋 Tienes ${totalTasks} tarea${totalTasks !== 1 ? 's' : ''} vencida${totalTasks !== 1 ? 's' : ''} pendiente${totalTasks !== 1 ? 's' : ''}`,
      html: emailHtml,
    });

    // Mark notifications as email sent
    await supabase
      .from('task_notifications')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('email_sent_at', null);

    console.log(`Daily summary email sent to ${userEmail}:`, emailResponse);

  } catch (error) {
    console.error(`Failed to send email to ${userEmail}:`, error);
  }
}

serve(handler);