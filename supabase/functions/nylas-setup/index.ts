import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SetupRequest {
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
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

    const { email, password, imapHost, imapPort, smtpHost, smtpPort }: SetupRequest = await req.json();

    // Step 1: Create IMAP connector (only if not exists)
    let connectorId = 'imap';
    const connectorResponse = await fetch('https://api.us.nylas.com/v3/connectors', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nylasApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider: 'imap' }),
    });

    if (connectorResponse.status === 409) {
      // Connector already exists, get existing one
      const existingConnectors = await fetch('https://api.us.nylas.com/v3/connectors', {
        headers: { 'Authorization': `Bearer ${nylasApiKey}` },
      });
      const connectorsData = await existingConnectors.json();
      const imapConnector = connectorsData.data?.find((c: any) => c.provider === 'imap');
      if (imapConnector) {
        connectorId = imapConnector.id;
      }
    } else if (connectorResponse.ok) {
      const connectorData = await connectorResponse.json();
      connectorId = connectorData.data.id;
    } else {
      throw new Error(`Failed to create connector: ${await connectorResponse.text()}`);
    }

    // Step 2: Create grant with custom auth
    const grantResponse = await fetch('https://api.us.nylas.com/v3/connect/custom', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nylasApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'imap',
        settings: {
          imap_username: email,
          imap_password: password,
          imap_host: imapHost,
          imap_port: imapPort,
          smtp_host: smtpHost,
          smtp_port: smtpPort,
        },
      }),
    });

    if (!grantResponse.ok) {
      const errorText = await grantResponse.text();
      throw new Error(`Failed to create grant: ${errorText}`);
    }

    const grantData = await grantResponse.json();

    // Step 3: Store account in Supabase
    const { data: accountData, error: accountError } = await supabase
      .from('nylas_accounts')
      .upsert({
        user_id: user.id,
        email_address: email,
        provider: 'imap',
        grant_id: grantData.data.id,
        access_token: grantData.data.access_token,
        connector_id: connectorId,
        account_status: 'active',
        settings: {
          imap_host: imapHost,
          imap_port: imapPort,
          smtp_host: smtpHost,
          smtp_port: smtpPort,
        },
      }, {
        onConflict: 'user_id,email_address',
      })
      .select()
      .single();

    if (accountError) {
      console.error('Error storing account:', accountError);
      throw new Error('Failed to store account');
    }

    console.log('Nylas account setup completed:', accountData);

    return new Response(JSON.stringify({
      success: true,
      account: accountData,
      grant_id: grantData.data.id,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in nylas-setup:', error);
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