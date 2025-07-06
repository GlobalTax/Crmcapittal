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

    // Enhanced logging for configuration check
    console.log('Configuration check:');
    console.log('- Client ID configured:', !!clientId);
    console.log('- Client Secret configured:', !!clientSecret); 
    console.log('- Base URL configured:', !!baseUrl);
    console.log('- Base URL value:', baseUrl);

    if (!clientId || !clientSecret || !baseUrl) {
      const missingFields = [];
      if (!clientId) missingFields.push('EINFORMA_CLIENT_ID');
      if (!clientSecret) missingFields.push('EINFORMA_CLIENT_SECRET');
      if (!baseUrl) missingFields.push('EINFORMA_BASE_URL');
      
      console.error('Missing eInforma configuration:', missingFields);
      throw new Error(`Missing eInforma credentials: ${missingFields.join(', ')}`);
    }

    console.log('Enriching company with CIF:', cif);
    console.log('Using baseUrl:', baseUrl);
    console.log('Client ID configured:', !!clientId);
    
    // Get OAuth2 token
    const tokenUrl = `${baseUrl}/oauth/token`;
    console.log('Attempting authentication with URL:', tokenUrl);
    
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
      throw new Error(`Authentication failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData: EInformaTokenResponse = await tokenResponse.json();
    console.log('Authentication successful, token type:', tokenData.token_type);

    // Get company data
    const companyUrl = `${baseUrl}/api/v1/companies/${cif}`;
    console.log('Fetching company data from:', companyUrl);
    
    const companyResponse = await fetch(companyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Company response status:', companyResponse.status);

    if (!companyResponse.ok) {
      const errorText = await companyResponse.text();
      console.error('Company fetch failed. Status:', companyResponse.status);
      console.error('Error response:', errorText);
      throw new Error(`Company not found: ${companyResponse.status} - ${errorText}`);
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

    // Get balance sheet data
    let balanceSheetData = [];
    try {
      const balanceResponse = await fetch(`${baseUrl}/api/v1/companies/${cif}/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (balanceResponse.ok) {
        balanceSheetData = await balanceResponse.json();
      }
    } catch (error) {
      console.log('Balance sheet data not available:', error.message);
    }

    // Get income statement data
    let incomeStatementData = [];
    try {
      const incomeResponse = await fetch(`${baseUrl}/api/v1/companies/${cif}/income-statement`, {
        method: 'GET',
        headers: {
          'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (incomeResponse.ok) {
        incomeStatementData = await incomeResponse.json();
      }
    } catch (error) {
      console.log('Income statement data not available:', error.message);
    }

    // Get credit info
    let creditInfoData = null;
    try {
      const creditResponse = await fetch(`${baseUrl}/api/v1/companies/${cif}/credit-info`, {
        method: 'GET',
        headers: {
          'Authorization': `${tokenData.token_type} ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (creditResponse.ok) {
        creditInfoData = await creditResponse.json();
      }
    } catch (error) {
      console.log('Credit info not available:', error.message);
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

    // Calculate financial ratios if we have the data
    let financialRatios = [];
    if (balanceSheetData.length > 0 && incomeStatementData.length > 0) {
      financialRatios = calculateFinancialRatios(balanceSheetData, incomeStatementData);
    }

    // Calculate confidence score based on available data
    let confidenceScore = 0.3;
    if (companyData.razon_social) confidenceScore += 0.1;
    if (companyData.actividad_principal) confidenceScore += 0.1;
    if (financialData.length > 0) confidenceScore += 0.15;
    if (balanceSheetData.length > 0) confidenceScore += 0.15;
    if (incomeStatementData.length > 0) confidenceScore += 0.15;
    if (creditInfoData) confidenceScore += 0.1;
    if (directorsData.length > 0) confidenceScore += 0.05;
    
    const enrichmentResult = {
      company_data: companyData,
      financial_data: financialData,
      balance_sheet: balanceSheetData,
      income_statement: incomeStatementData,
      financial_ratios: financialRatios,
      credit_info: creditInfoData,
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
    
    // Enhanced error reporting
    let errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      requestBody: { cif }
    };
    
    console.error('Full error details:', JSON.stringify(errorDetails, null, 2));
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: errorDetails
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to calculate financial ratios
function calculateFinancialRatios(balanceData: any[], incomeData: any[]) {
  const ratios = [];
  
  for (let i = 0; i < Math.min(balanceData.length, incomeData.length); i++) {
    const balance = balanceData[i];
    const income = incomeData[i];
    
    if (balance.ejercicio === income.ejercicio) {
      const ratio = {
        cif: balance.cif,
        ejercicio: balance.ejercicio,
        rentabilidad: {
          roe: balance.patrimonio_neto > 0 ? (income.resultado_ejercicio / balance.patrimonio_neto) * 100 : null,
          roa: balance.activo_total > 0 ? (income.resultado_ejercicio / balance.activo_total) * 100 : null,
          margen_bruto: income.ingresos_explotacion > 0 ? ((income.ingresos_explotacion - (income.consumos_materias_primas || 0)) / income.ingresos_explotacion) * 100 : null,
          margen_neto: income.ingresos_explotacion > 0 ? (income.resultado_ejercicio / income.ingresos_explotacion) * 100 : null,
        },
        liquidez: {
          ratio_corriente: balance.pasivo_corriente > 0 ? balance.activo_corriente / balance.pasivo_corriente : null,
          capital_trabajo: balance.activo_corriente - balance.pasivo_corriente,
        },
        endeudamiento: {
          ratio_endeudamiento: balance.activo_total > 0 ? (balance.pasivo_total / balance.activo_total) * 100 : null,
          ratio_autonomia: balance.activo_total > 0 ? (balance.patrimonio_neto / balance.activo_total) * 100 : null,
        },
        eficiencia: {
          rotacion_activos: balance.activo_total > 0 ? income.ingresos_explotacion / balance.activo_total : null,
        }
      };
      
      ratios.push(ratio);
    }
  }
  
  return ratios;
}