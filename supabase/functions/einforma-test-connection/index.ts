import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
};

interface TestConnectionResponse {
  success: boolean;
  message: string;
  status: 'connected' | 'simulated' | 'error';
  timestamp: string;
  details?: {
    apiAvailable: boolean;
    credentialsConfigured: boolean;
    responseTime: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('Testing eInforma connection...');
    const startTime = Date.now();

    const clientId = Deno.env.get('EINFORMA_CLIENT_ID');
    const clientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET');

    // Check if credentials are configured
    const credentialsConfigured = !!(clientId && clientSecret);
    
    if (!credentialsConfigured) {
      console.log('eInforma credentials not configured, connection working in simulation mode');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Conexión en modo simulación - credenciales no configuradas',
          status: 'simulated',
          timestamp: new Date().toISOString(),
          details: {
            apiAvailable: false,
            credentialsConfigured: false,
            responseTime: Date.now() - startTime
          }
        } as TestConnectionResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Test actual eInforma API connection
    try {
      const tokenUrl = 'https://api.einforma.com/oauth/token';
      
      const tokenResponse = await fetch(tokenUrl, {
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

      const responseTime = Date.now() - startTime;

      if (!tokenResponse.ok) {
        console.log('eInforma API authentication failed');
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Error de autenticación con eInforma API',
            status: 'error',
            timestamp: new Date().toISOString(),
            details: {
              apiAvailable: false,
              credentialsConfigured: true,
              responseTime
            }
          } as TestConnectionResponse),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const tokenData = await tokenResponse.json();
      console.log('eInforma API authentication successful');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Conexión exitosa con eInforma API',
          status: 'connected',
          timestamp: new Date().toISOString(),
          details: {
            apiAvailable: true,
            credentialsConfigured: true,
            responseTime
          }
        } as TestConnectionResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (apiError) {
      console.error('eInforma API connection error:', apiError);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error de conexión con eInforma API',
          status: 'error',
          timestamp: new Date().toISOString(),
          details: {
            apiAvailable: false,
            credentialsConfigured: true,
            responseTime: Date.now() - startTime
          }
        } as TestConnectionResponse),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error in einforma-test-connection:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error interno al probar la conexión',
        status: 'error',
        timestamp: new Date().toISOString()
      } as TestConnectionResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});