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
    const { cif, years } = await req.json();
    
    if (!cif) {
      throw new Error('CIF is required');
    }

    const clientId = Deno.env.get('EINFORMA_CLIENT_ID');
    const clientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET');
    const baseUrl = Deno.env.get('EINFORMA_BASE_URL') || 'https://developers.einforma.com';

    if (!clientId || !clientSecret || !baseUrl) {
      throw new Error('Missing eInforma credentials');
    }

    console.log('Getting financial data for CIF:', cif);
    
    // Get OAuth2 token
    const tokenResponse = await fetch(`${baseUrl}/api/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'buscar:consultar:empresas'
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Authentication failed: ${tokenResponse.status}`);
    }

    const tokenData: EInformaTokenResponse = await tokenResponse.json();

    // Build API URL
    let apiUrl = `${baseUrl}/api/v1/companies/${cif}/financial`;
    
    // Add years filter if provided
    if (years && years.length > 0) {
      const yearParams = years.map((year: number) => `year=${year}`).join('&');
      apiUrl += `?${yearParams}`;
    }

    console.log('Making financial data request to:', apiUrl);

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Financial data request failed:', errorText);
      throw new Error(`Financial data request failed: ${apiResponse.status}`);
    }

    const financialData = await apiResponse.json();
    console.log('Financial data retrieved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        financial_data: financialData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in einforma-financial-data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        financial_data: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});