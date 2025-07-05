import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GraphEmail {
  id: string;
  subject: string;
  from: {
    emailAddress: {
      address: string;
      name: string;
    };
  };
  receivedDateTime: string;
  isRead: boolean;
  bodyPreview: string;
  webLink: string;
}

interface GraphEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location: {
    displayName: string;
  };
  organizer: {
    emailAddress: {
      address: string;
      name: string;
    };
  };
  webLink: string;
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

    // Get request parameters
    const { syncType, userId } = await req.json();

    if (!syncType || !userId) {
      return new Response(
        JSON.stringify({ error: 'syncType and userId are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's Microsoft account
    const { data: account, error: accountError } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'microsoft')
      .eq('is_active', true)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: 'Microsoft account not found or inactive' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(account.expires_at);
    
    if (now >= expiresAt) {
      // Try to refresh the token first
      const refreshResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/refresh-microsoft-tokens`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!refreshResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to refresh token' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Re-fetch the updated account
      const { data: updatedAccount } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('id', account.id)
        .single();

      if (!updatedAccount) {
        return new Response(
          JSON.stringify({ error: 'Failed to get updated token' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      account.access_token = updatedAccount.access_token;
    }

    let syncResult: any = {};

    // Sync emails
    if (syncType === 'emails' || syncType === 'all') {
      try {
        const emailsResponse = await fetch(
          'https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$top=50&$select=id,subject,from,receivedDateTime,isRead,bodyPreview,webLink&$orderby=receivedDateTime desc',
          {
            headers: {
              'Authorization': `Bearer ${account.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (emailsResponse.ok) {
          const emailsData = await emailsResponse.json();
          const emails: GraphEmail[] = emailsData.value || [];

          // Store emails in database (you might want to create an emails table)
          syncResult.emails = {
            count: emails.length,
            latest: emails[0]?.subject || 'No emails found',
            synced_at: new Date().toISOString(),
          };

          console.log(`Synced ${emails.length} emails for user ${userId}`);
        } else {
          console.error('Failed to fetch emails:', await emailsResponse.text());
          syncResult.emails = { error: 'Failed to fetch emails' };
        }
      } catch (error) {
        console.error('Email sync error:', error);
        syncResult.emails = { error: error.message };
      }
    }

    // Sync calendar events
    if (syncType === 'calendar' || syncType === 'all') {
      try {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const eventsResponse = await fetch(
          `https://graph.microsoft.com/v1.0/me/events?$top=50&$select=id,subject,start,end,location,organizer,webLink&$filter=start/dateTime ge '${now.toISOString()}' and start/dateTime le '${nextWeek.toISOString()}'&$orderby=start/dateTime`,
          {
            headers: {
              'Authorization': `Bearer ${account.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          const events: GraphEvent[] = eventsData.value || [];

          // Store events in database (you might want to create a calendar_events table)
          syncResult.calendar = {
            count: events.length,
            next_event: events[0]?.subject || 'No upcoming events',
            synced_at: new Date().toISOString(),
          };

          console.log(`Synced ${events.length} calendar events for user ${userId}`);
        } else {
          console.error('Failed to fetch calendar:', await eventsResponse.text());
          syncResult.calendar = { error: 'Failed to fetch calendar' };
        }
      } catch (error) {
        console.error('Calendar sync error:', error);
        syncResult.calendar = { error: error.message };
      }
    }

    // Update last sync time
    await supabase
      .from('connected_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', account.id);

    return new Response(
      JSON.stringify({
        success: true,
        account: {
          email: account.email,
          name: account.name,
        },
        sync_type: syncType,
        results: syncResult,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Microsoft Graph sync error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});