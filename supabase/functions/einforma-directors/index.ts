import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EInformaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cif } = await req.json();
    
    if (!cif) {
      throw new Error('CIF is required');
    }

    const clientId = Deno.env.get('EINFORMA_CLIENT_ID');
    const clientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET');
    const baseUrl = Deno.env.get('EINFORMA_BASE_URL') || 'https://api.einforma.com';

    if (!clientId || !clientSecret || !baseUrl) {
      throw new Error('Missing eInforma credentials');
    }

    console.log('Getting directors data for CIF:', cif);
    
    // Get OAuth2 token
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Authentication failed: ${tokenResponse.status}`);
    }

    const tokenData: EInformaTokenResponse = await tokenResponse.json();

    const apiUrl = `${baseUrl}/api/v1/companies/${cif}/directors`;
    console.log('Making directors request to:', apiUrl);

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Directors request failed:', errorText);
      throw new Error(`Directors request failed: ${apiResponse.status}`);
    }

    const directorsData = await apiResponse.json();
    console.log('Directors data retrieved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        directors: directorsData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in einforma-directors:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        directors: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});