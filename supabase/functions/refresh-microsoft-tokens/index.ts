import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
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

    // Get Microsoft credentials from Supabase secrets
    const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
    const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
    const tenantId = Deno.env.get('MICROSOFT_TENANT_ID');

    if (!clientId || !clientSecret || !tenantId) {
      console.error('Missing Microsoft OAuth configuration');
      return new Response(
        JSON.stringify({ error: 'OAuth configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get accounts that need token refresh (expire within next 10 minutes)
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
    
    const { data: expiredAccounts, error: queryError } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('provider', 'microsoft')
      .eq('is_active', true)
      .not('refresh_token', 'is', null)
      .lt('expires_at', tenMinutesFromNow.toISOString());

    if (queryError) {
      console.error('Failed to query expired accounts:', queryError);
      return new Response(
        JSON.stringify({ error: 'Database query failed' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!expiredAccounts || expiredAccounts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No accounts need token refresh', refreshed: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let refreshedCount = 0;
    const errors: string[] = [];

    // Refresh tokens for each expired account
    for (const account of expiredAccounts) {
      try {
        const tokenResponse = await fetch(
          `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              refresh_token: account.refresh_token,
              grant_type: 'refresh_token',
              scope: account.scope || 'openid profile email Mail.Read Mail.Send Calendars.Read Calendars.ReadWrite offline_access',
            }),
          }
        );

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.text();
          console.error(`Token refresh failed for account ${account.id}:`, errorData);
          errors.push(`Account ${account.email}: ${errorData}`);
          
          // If refresh token is invalid, mark account as inactive
          if (tokenResponse.status === 400) {
            await supabase
              .from('connected_accounts')
              .update({ is_active: false })
              .eq('id', account.id);
          }
          continue;
        }

        const tokens: MicrosoftTokenResponse = await tokenResponse.json();
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        // Update account with new tokens
        const updateData: any = {
          access_token: tokens.access_token,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Only update refresh token if a new one is provided
        if (tokens.refresh_token) {
          updateData.refresh_token = tokens.refresh_token;
        }

        const { error: updateError } = await supabase
          .from('connected_accounts')
          .update(updateData)
          .eq('id', account.id);

        if (updateError) {
          console.error(`Failed to update account ${account.id}:`, updateError);
          errors.push(`Account ${account.email}: Failed to update database`);
          continue;
        }

        refreshedCount++;
        console.log(`Successfully refreshed tokens for account ${account.email}`);

      } catch (error) {
        console.error(`Error refreshing account ${account.id}:`, error);
        errors.push(`Account ${account.email}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Token refresh completed`,
        total: expiredAccounts.length,
        refreshed: refreshedCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Refresh Microsoft tokens error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});