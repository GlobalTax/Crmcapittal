import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestConnectionResponse {
  success: boolean;
  message: string;
  connection_status: 'connected' | 'error' | 'simulated';
  details?: {
    api_available: boolean;
    credentials_configured: boolean;
  };
}

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
    const clientId = Deno.env.get('EINFORMA_CLIENT_ID');
    const clientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET');
    const baseUrl = Deno.env.get('EINFORMA_BASE_URL') || 'https://developers.einforma.com';

    console.log('Testing eInforma connection...');
    console.log('Base URL:', baseUrl);
    console.log('Credentials configured:', !!clientId, !!clientSecret);

    // Check if credentials are configured
    if (!clientId || !clientSecret) {
      console.log('Credentials not configured, returning simulated response');
      
      const response: TestConnectionResponse = {
        success: false,
        message: 'Credenciales de eInforma no configuradas. Configure EINFORMA_CLIENT_ID y EINFORMA_CLIENT_SECRET.',
        connection_status: 'simulated',
        details: {
          api_available: false,
          credentials_configured: false
        }
      };

      return new Response(
        JSON.stringify(response),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      console.log('Attempting to get OAuth token...');
      
      // Test the connection by getting an OAuth token
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

      console.log('Token response status:', tokenResponse.status);

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token request failed:', errorText);
        throw new Error(`Authentication failed: ${tokenResponse.status}`);
      }

      const tokenData: EInformaTokenResponse = await tokenResponse.json();
      console.log('OAuth token obtained successfully');

      const response: TestConnectionResponse = {
        success: true,
        message: 'Conexión con eInforma establecida correctamente',
        connection_status: 'connected',
        details: {
          api_available: true,
          credentials_configured: true
        }
      };

      return new Response(
        JSON.stringify(response),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (apiError) {
      console.error('API connection error:', apiError);
      
      const response: TestConnectionResponse = {
        success: false,
        message: `Error al conectar con la API de eInforma: ${apiError.message}`,
        connection_status: 'error',
        details: {
          api_available: false,
          credentials_configured: true
        }
      };

      return new Response(
        JSON.stringify(response),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Unexpected error in einforma-test-connection:', error);
    
    const response: TestConnectionResponse = {
      success: false,
      message: `Error interno: ${error.message}`,
      connection_status: 'error'
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});