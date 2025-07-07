import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
};

interface EnrichmentRequest {
  nif: string;
  companyId?: string;
}

interface EnrichmentResponse {
  success: boolean;
  message: string;
  data?: {
    companyId?: string;
    companyName: string;
    extractedData: {
      sector?: string;
      employees?: number;
      city?: string;
      province?: string;
      revenue?: number;
      founded_year?: number;
      nif: string;
    };
    confidenceScore: number;
  };
  error?: string;
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
    const { nif, companyId }: EnrichmentRequest = await req.json();
    
    if (!nif) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'NIF es requerido',
          error: 'MISSING_NIF'
        } as EnrichmentResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Enriching company with NIF:', nif);

    // Call the existing company-lookup function to get company data
    const lookupUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/company-lookup-einforma`;
    const lookupResponse = await fetch(lookupUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({ nif }),
    });

    if (!lookupResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error al consultar información de la empresa',
          error: 'LOOKUP_FAILED'
        } as EnrichmentResponse),
        {
          status: lookupResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const lookupData = await lookupResponse.json();
    
    if (!lookupData.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: lookupData.error || 'Empresa no encontrada',
          error: 'COMPANY_NOT_FOUND'
        } as EnrichmentResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const companyData = lookupData.data;
    
    // Transform the company data into enrichment format
    const extractedData = {
      sector: companyData.business_sector || null,
      employees: null, // Not available in basic lookup
      city: companyData.address_city || null,
      province: companyData.address_city || null, // Using city as province
      revenue: null, // Not available in basic lookup
      founded_year: null, // Not available in basic lookup
      nif: nif.toUpperCase()
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: `Empresa ${companyData.name} enriquecida exitosamente`,
        data: {
          companyId,
          companyName: companyData.name,
          extractedData,
          confidenceScore: lookupData.source === 'einforma' ? 0.9 : 0.7
        }
      } as EnrichmentResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in einforma-enrich-company:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error interno al procesar el enriquecimiento',
        error: 'INTERNAL_ERROR'
      } as EnrichmentResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});