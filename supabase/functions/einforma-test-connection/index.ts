import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
};

interface EInformaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
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
    const clientId = Deno.env.get('EINFORMA_CLIENT_ID');
    const clientSecret = Deno.env.get('EINFORMA_CLIENT_SECRET');
    const baseUrl = Deno.env.get('EINFORMA_BASE_URL');

    console.log('Testing eInforma connection...');
    console.log('Configuration check:');
    console.log('- Client ID configured:', !!clientId);
    console.log('- Client Secret configured:', !!clientSecret);
    console.log('- Base URL configured:', !!baseUrl);
    console.log('- Base URL value:', baseUrl);

    const testResults = {
      timestamp: new Date().toISOString(),
      configuration: {
        client_id_configured: !!clientId,
        client_secret_configured: !!clientSecret,
        base_url_configured: !!baseUrl,
        base_url_value: baseUrl
      },
      tests: []
    };

    if (!clientId || !clientSecret || !baseUrl) {
      const missingFields = [];
      if (!clientId) missingFields.push('EINFORMA_CLIENT_ID');
      if (!clientSecret) missingFields.push('EINFORMA_CLIENT_SECRET');
      if (!baseUrl) missingFields.push('EINFORMA_BASE_URL');
      
      testResults.tests.push({
        test: 'configuration_check',
        status: 'failed',
        error: `Missing configuration: ${missingFields.join(', ')}`
      });

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Configuration test failed',
          results: testResults
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    testResults.tests.push({
      test: 'configuration_check',
      status: 'passed'
    });

    // Test OAuth2 token endpoint - ensure no double slashes
    const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    const tokenUrl = `${cleanBaseUrl}/oauth/token`;
    console.log('Testing authentication with URL:', tokenUrl);
    
    try {
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

      console.log('Token response status:', tokenResponse.status);
      console.log('Token response headers:', Object.fromEntries(tokenResponse.headers));

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Authentication failed. Status:', tokenResponse.status);
        console.error('Error response:', errorText);
        
        testResults.tests.push({
          test: 'authentication_check',
          status: 'failed',
          error: `HTTP ${tokenResponse.status}: ${errorText}`,
          url: tokenUrl
        });
      } else {
        const tokenData: EInformaTokenResponse = await tokenResponse.json();
        console.log('Authentication successful, token type:', tokenData.token_type);
        
        testResults.tests.push({
          test: 'authentication_check',
          status: 'passed',
          token_type: tokenData.token_type
        });

        // Test a simple API call with the token
        try {
          const testApiUrl = `${cleanBaseUrl}/api/v1/companies/A12345678`; // Test with a dummy CIF
          const testResponse = await fetch(testApiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          testResults.tests.push({
            test: 'api_endpoint_check',
            status: testResponse.ok ? 'passed' : 'failed',
            http_status: testResponse.status,
            url: testApiUrl,
            note: testResponse.ok ? 'API endpoint accessible' : 'API endpoint returned error (expected for dummy CIF)'
          });

        } catch (apiError) {
          testResults.tests.push({
            test: 'api_endpoint_check',
            status: 'failed',
            error: apiError.message
          });
        }
      }
    } catch (authError) {
      console.error('Authentication test failed:', authError);
      testResults.tests.push({
        test: 'authentication_check',
        status: 'failed',
        error: authError.message,
        url: tokenUrl
      });
    }

    const allTestsPassed = testResults.tests.every(test => test.status === 'passed');
    
    return new Response(
      JSON.stringify({
        success: allTestsPassed,
        message: allTestsPassed ? 'All tests passed' : 'Some tests failed',
        results: testResults
      }),
      {
        status: allTestsPassed ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in einforma-test-connection:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});