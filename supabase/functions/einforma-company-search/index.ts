import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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
    const { cif, name, search_type, limit = 10 } = await req.json();
    
    const clientId = Deno.env.get('EINFORMA_CLIENT_ID');
    const clientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET');
    const baseUrl = Deno.env.get('EINFORMA_BASE_URL');

    if (!clientId || !clientSecret || !baseUrl) {
      throw new Error('Missing eInforma credentials');
    }

    console.log('Getting eInforma access token...');
    
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
      const errorText = await tokenResponse.text();
      console.error('Token request failed:', errorText);
      throw new Error(`Authentication failed: ${tokenResponse.status}`);
    }

    const tokenData: EInformaTokenResponse = await tokenResponse.json();
    console.log('Token obtained successfully');

    let apiUrl: string;
    let searchParams: URLSearchParams;

    if (search_type === 'cif') {
      apiUrl = `${baseUrl}/api/v1/companies/${cif}`;
      searchParams = new URLSearchParams();
    } else {
      apiUrl = `${baseUrl}/api/v1/companies/search`;
      searchParams = new URLSearchParams({
        name: name,
        limit: limit.toString(),
      });
    }

    const fullUrl = searchParams.toString() ? `${apiUrl}?${searchParams}` : apiUrl;
    console.log('Making API request to:', fullUrl);

    const apiResponse = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('API request failed:', errorText);
      throw new Error(`API request failed: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    console.log('API response received successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: search_type === 'cif' ? { company: apiData } : { results: apiData.results || apiData },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in einforma-company-search:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});