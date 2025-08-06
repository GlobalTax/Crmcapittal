import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
};

interface CompanyData {
  name: string;
  nif: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  business_sector?: string;
  legal_representative?: string;
  status: 'activo' | 'inactivo';
  client_type: 'empresa';
}

// Mock data for fallback
const mockCompanyData: CompanyData[] = [
  {
    name: "ESTRAPEY FINANZA SL",
    nif: "B12345678",
    address_street: "Calle Serrano, 45",
    address_city: "Madrid",
    address_postal_code: "28001",
    business_sector: "Servicios financieros",
    legal_representative: "María García López",
    status: "activo",
    client_type: "empresa"
  },
  {
    name: "TECNOLOGÍA AVANZADA SA",
    nif: "A87654321",
    address_street: "Avenida Diagonal, 123",
    address_city: "Barcelona",
    address_postal_code: "08028",
    business_sector: "Tecnología de la información",
    legal_representative: "Juan Pérez Martín",
    status: "activo",
    client_type: "empresa"
  }
];

function validateNIF(nif: string): boolean {
  if (!nif || typeof nif !== 'string') return false;
  
  const cleanNif = nif.trim().toUpperCase();
  
  // CIF format: Letter + 7 digits + Letter/Digit
  const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
  // NIF format: 8 digits + letter
  const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
  // NIE format: X/Y/Z + 7 digits + letter
  const nieRegex = /^[XYZ]\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
  
  return cifRegex.test(cleanNif) || nifRegex.test(cleanNif) || nieRegex.test(cleanNif);
}

function getMockData(nif: string): CompanyData | null {
  const cleanNif = nif.trim().toUpperCase();
  return mockCompanyData.find(company => company.nif === cleanNif) || null;
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
    const { nif } = await req.json();
    
    if (!nif) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'NIF es requerido'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate NIF format
    if (!validateNIF(nif)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Formato de NIF/CIF inválido'
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

    console.log('Looking up company with NIF:', nif);
    console.log('Credentials configured:', !!clientId, !!clientSecret);
    console.log('eInforma Base URL:', baseUrl);

    // If credentials are not configured, use mock data
    if (!clientId || !clientSecret) {
      console.log('Using mock data - credentials not configured');
      const mockData = getMockData(nif);
      
      if (mockData) {
        return new Response(
          JSON.stringify({
            success: true,
            data: mockData,
            source: 'simulated'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Empresa no encontrada',
            source: 'simulated'
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Try to connect to eInforma API
    try {
      // Use eInforma OAuth2 endpoint per documentation
      const tokenUrl = `${baseUrl}/api/v1/oauth/token`;
      
      console.log('Requesting OAuth token from:', tokenUrl);
      
      const tokenResponse = await fetch(tokenUrl, {
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
        console.log('eInforma authentication failed:', tokenResponse.status, errorText);
        const mockData = getMockData(nif);
        
        if (mockData) {
          return new Response(
            JSON.stringify({
              success: true,
              data: mockData,
              source: 'simulated',
              note: 'Using simulated data - eInforma API unavailable'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Empresa no encontrada',
              source: 'simulated'
            }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }

      const tokenData = await tokenResponse.json();
      console.log('OAuth token obtained successfully, scope:', tokenData.scope);
      
      // Get company data from eInforma
      const companyUrl = `${baseUrl}/api/v1/companies/${nif}/report`;
      console.log('Requesting company data from:', companyUrl);
      
      const companyResponse = await fetch(companyUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Company response status:', companyResponse.status);

      if (!companyResponse.ok) {
        const errorText = await companyResponse.text();
        console.log('Company not found in eInforma:', companyResponse.status, errorText);
        const mockData = getMockData(nif);
        
        if (mockData) {
          return new Response(
            JSON.stringify({
              success: true,
              data: mockData,
              source: 'simulated',
              note: 'Using simulated data - Company not found in eInforma'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Empresa no encontrada'
            }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }

      const companyData = await companyResponse.json();
      console.log('eInforma response structure:', JSON.stringify(companyData, null, 2));
      
      // Transform eInforma data to our format
      const transformedData: CompanyData = {
        name: companyData.razon_social || companyData.name || companyData.denominacion,
        nif: nif.toUpperCase(),
        address_street: companyData.direccion || companyData.address || companyData.domicilio,
        address_city: companyData.poblacion || companyData.city || companyData.municipio,
        address_postal_code: companyData.codigo_postal || companyData.postal_code || companyData.cp,
        business_sector: companyData.actividad_principal || companyData.sector || companyData.cnae_descripcion,
        legal_representative: companyData.representante_legal || companyData.administrador,
        status: (companyData.estado === 'activa' || companyData.situacion === 'ACTIVA') ? 'activo' : 'inactivo',
        client_type: 'empresa'
      };
      
      console.log('Transformed company data:', JSON.stringify(transformedData, null, 2));

      return new Response(
        JSON.stringify({
          success: true,
          data: transformedData,
          source: 'einforma'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (apiError) {
      console.error('eInforma API error details:', apiError);
      console.log('eInforma API error, using mock data');
      const mockData = getMockData(nif);
      
      if (mockData) {
        return new Response(
          JSON.stringify({
            success: true,
            data: mockData,
            source: 'simulated',
            note: 'Using simulated data - eInforma API error'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Empresa no encontrada'
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

  } catch (error) {
    console.error('Error in company-lookup-einforma:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});