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
    const { nif, companyId } = await req.json();
    
    if (!nif || !companyId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'NIF y companyId son requeridos'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const clientId = Deno.env.get('EINFORMA_CLIENT_ID');
    const clientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET');
    const baseUrl = Deno.env.get('EINFORMA_BASE_URL') || 'https://developers.einforma.com';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Enriching company with NIF:', nif, 'Company ID:', companyId);

    if (!clientId || !clientSecret) {
      console.log('eInforma credentials not configured');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Credenciales de eInforma no configuradas'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
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

      // Get company data from eInforma
      const companyResponse = await fetch(`${baseUrl}/api/v1/companies/${nif}/report`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!companyResponse.ok) {
        throw new Error(`Company lookup failed: ${companyResponse.status}`);
      }

      const companyData = await companyResponse.json();

      // Store enrichment data
      const { error: enrichError } = await supabase
        .from('company_enrichments')
        .upsert({
          company_id: companyId,
          enrichment_data: companyData,
          enrichment_source: 'einforma',
          enriched_at: new Date().toISOString(),
        });

      if (enrichError) {
        console.error('Error storing enrichment data:', enrichError);
        throw new Error('Failed to store enrichment data');
      }

      console.log('Company enriched successfully');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Empresa enriquecida exitosamente',
          data: companyData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (apiError) {
      console.error('eInforma API error:', apiError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error al conectar con eInforma: ' + apiError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error in einforma-enrich-company:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});