import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  accountId: string;
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  replyToMessageId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const nylasApiKey = Deno.env.get('NYLAS_API_KEY');
    if (!nylasApiKey) {
      throw new Error('NYLAS_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Invalid user');
    }

    const { accountId, to, subject, body, cc, bcc, replyToMessageId }: SendEmailRequest = await req.json();

    // Get Nylas account
    const { data: nylasAccount, error: accountError } = await supabase
      .from('nylas_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (accountError || !nylasAccount) {
      throw new Error('Nylas account not found');
    }

    // Prepare email data
    const emailData: any = {
      to: to.map(email => ({ email })),
      subject,
      body,
    };

    if (cc && cc.length > 0) {
      emailData.cc = cc.map(email => ({ email }));
    }

    if (bcc && bcc.length > 0) {
      emailData.bcc = bcc.map(email => ({ email }));
    }

    if (replyToMessageId) {
      emailData.reply_to_message_id = replyToMessageId;
    }

    // Send email via Nylas
    const sendResponse = await fetch(
      `https://api.us.nylas.com/v3/grants/${nylasAccount.grant_id}/messages/send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nylasApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      }
    );

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const sendData = await sendResponse.json();
    const sentMessage = sendData.data;

    // Store sent email in tracked_emails
    const { data: trackedEmail, error: trackError } = await supabase
      .from('tracked_emails')
      .insert({
        tracking_id: `nylas_sent_${sentMessage.id}`,
        recipient_email: to[0], // Primary recipient
        subject: subject,
        content: body,
        status: 'SENT',
        sent_at: new Date().toISOString(),
        nylas_account_id: nylasAccount.id,
        nylas_message_id: sentMessage.id,
        nylas_thread_id: sentMessage.thread_id,
        open_count: 0,
      })
      .select()
      .single();

    if (trackError) {
      console.error('Error tracking sent email:', trackError);
      // Continue anyway as email was sent successfully
    }

    console.log('Email sent successfully:', sentMessage.id);

    return new Response(JSON.stringify({
      success: true,
      message_id: sentMessage.id,
      thread_id: sentMessage.thread_id,
      tracked_email: trackedEmail,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in nylas-send:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);