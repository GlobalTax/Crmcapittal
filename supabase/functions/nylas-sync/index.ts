import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { accountId } = await req.json();

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

    // Fetch messages from Nylas
    const messagesResponse = await fetch(
      `https://api.us.nylas.com/v3/grants/${nylasAccount.grant_id}/messages?in=inbox&limit=50&query_imap=true`,
      {
        headers: {
          'Authorization': `Bearer ${nylasApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!messagesResponse.ok) {
      throw new Error(`Failed to fetch messages: ${await messagesResponse.text()}`);
    }

    const messagesData = await messagesResponse.json();
    const messages = messagesData.data || [];

    // Process each message and store/update in tracked_emails
    const syncedMessages = [];
    
    for (const message of messages) {
      try {
        // Check if message already exists
        const { data: existingEmail, error: checkError } = await supabase
          .from('tracked_emails')
          .select('*')
          .eq('nylas_message_id', message.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking existing email:', checkError);
          continue;
        }

        if (!existingEmail) {
          // Create new tracked email
          const { data: newEmail, error: insertError } = await supabase
            .from('tracked_emails')
            .insert({
              tracking_id: `nylas_${message.id}`,
              recipient_email: nylasAccount.email_address,
              subject: message.subject || 'No Subject',
              content: message.body || message.snippet || '',
              status: 'OPENED', // Received emails are considered opened
              sent_at: message.date ? new Date(message.date * 1000).toISOString() : new Date().toISOString(),
              nylas_account_id: nylasAccount.id,
              nylas_message_id: message.id,
              nylas_thread_id: message.thread_id,
              open_count: 1,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error inserting email:', insertError);
            continue;
          }

          syncedMessages.push(newEmail);
        } else {
          syncedMessages.push(existingEmail);
        }
      } catch (msgError) {
        console.error('Error processing message:', msgError);
        continue;
      }
    }

    // Update last sync time
    await supabase
      .from('nylas_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', accountId);

    console.log(`Synced ${syncedMessages.length} messages for account ${accountId}`);

    return new Response(JSON.stringify({
      success: true,
      synced_count: syncedMessages.length,
      messages: syncedMessages,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in nylas-sync:', error);
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