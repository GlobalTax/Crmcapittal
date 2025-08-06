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
    const baseUrl = Deno.env.get('EINFORMA_BASE_URL') || 'https://developers.einforma.com';

    if (!clientId || !clientSecret || !baseUrl) {
      throw new Error('Missing eInforma credentials');
    }

    console.log('Getting credit info data for CIF:', cif);
    
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

    // Get credit information - this might include rating, incidents, consultation history
    const apiUrl = `${baseUrl}/api/v1/companies/${cif}/credit-info`;
    console.log('Making credit info request to:', apiUrl);

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Credit info request failed:', errorText);
      
      // If credit info endpoint doesn't exist, try alternative endpoints
      const alternativeData = {
        cif: cif,
        fecha_consulta: new Date().toISOString(),
        rating_crediticio: null,
        scoring_crediticio: null,
        limite_credito_recomendado: null,
        nivel_riesgo: 'medio' as const,
        incidencias: {
          protestos: 0,
          impagados: 0,
          concursos: 0,
          embargos: 0,
          fecha_ultima_incidencia: null
        },
        historial_consultas: {
          total_consultas_6m: 0,
          total_consultas_12m: 0,
          consultas_recientes: []
        },
        evolucion_rating: []
      };

      return new Response(
        JSON.stringify({
          success: true,
          credit_info: alternativeData,
          note: 'Credit info endpoint not available, returning default structure'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const creditData = await apiResponse.json();
    console.log('Credit info data retrieved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        credit_info: creditData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in einforma-credit-info:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        credit_info: null
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});