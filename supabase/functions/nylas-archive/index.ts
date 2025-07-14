import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArchiveRequest {
  accountId: string;
  threadId: string;
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

    const { accountId, threadId }: ArchiveRequest = await req.json();

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

    // Archive thread via Nylas
    const archiveResponse = await fetch(
      `https://api.us.nylas.com/v3/grants/${nylasAccount.grant_id}/threads/${threadId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${nylasApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          labels: ['archive']
        }),
      }
    );

    if (!archiveResponse.ok) {
      const errorText = await archiveResponse.text();
      throw new Error(`Failed to archive thread: ${errorText}`);
    }

    const archiveData = await archiveResponse.json();

    // Update status in tracked_emails for all messages in this thread
    const { data: updatedEmails, error: updateError } = await supabase
      .from('tracked_emails')
      .update({ 
        status: 'ARCHIVED',
        updated_at: new Date().toISOString()
      })
      .eq('nylas_thread_id', threadId)
      .eq('nylas_account_id', accountId)
      .select();

    if (updateError) {
      console.error('Error updating tracked emails:', updateError);
      // Continue anyway as archive was successful
    }

    console.log(`Thread ${threadId} archived successfully`);

    return new Response(JSON.stringify({
      success: true,
      thread_id: threadId,
      archived_emails_count: updatedEmails?.length || 0,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in nylas-archive:', error);
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