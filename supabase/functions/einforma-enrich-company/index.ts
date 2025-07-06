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
    const { cif } = await req.json();
    
    if (!cif) {
      throw new Error('CIF is required');
    }

    const clientId = Deno.env.get('EINFORMA_CLIENT_ID');
    const clientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET');
    const baseUrl = Deno.env.get('EINFORMA_BASE_URL');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!clientId || !clientSecret || !baseUrl) {
      throw new Error('Missing eInforma credentials');
    }

    console.log('Enriching company with CIF:', cif);
    
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

    // Get company data
    const companyResponse = await fetch(`${baseUrl}/api/v1/companies/${cif}`, {
      method: 'GET',
      headers: {
        'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!companyResponse.ok) {
      throw new Error(`Company not found: ${companyResponse.status}`);
    }

    const companyData = await companyResponse.json();

    // Get financial data
    let financialData = [];
    try {
      const financialResponse = await fetch(`${baseUrl}/api/v1/companies/${cif}/financial`, {
        method: 'GET',
        headers: {
          'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (financialResponse.ok) {
        financialData = await financialResponse.json();
      }
    } catch (error) {
      console.log('Financial data not available:', error.message);
    }

    // Get directors data
    let directorsData = [];
    try {
      const directorsResponse = await fetch(`${baseUrl}/api/v1/companies/${cif}/directors`, {
        method: 'GET',
        headers: {
          'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (directorsResponse.ok) {
        directorsData = await directorsResponse.json();
      }
    } catch (error) {
      console.log('Directors data not available:', error.message);
    }

    // Calculate confidence score based on available data
    let confidenceScore = 0.5;
    if (companyData.razon_social) confidenceScore += 0.1;
    if (companyData.actividad_principal) confidenceScore += 0.1;
    if (financialData.length > 0) confidenceScore += 0.2;
    if (directorsData.length > 0) confidenceScore += 0.1;
    
    const enrichmentResult = {
      company_data: companyData,
      financial_data: financialData,
      directors: directorsData,
      enrichment_date: new Date().toISOString(),
      source: 'einforma',
      confidence_score: Math.min(confidenceScore, 1.0)
    };

    console.log('Enrichment completed successfully');

    return new Response(
      JSON.stringify(enrichmentResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in einforma-enrich-company:', error);
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