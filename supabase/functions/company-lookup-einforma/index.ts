import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

interface EInformaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Mock data for fallback when eInforma API is not available
const mockCompanyData: CompanyData[] = [
  {
    name: "Empresa Ejemplo S.L.",
    nif: "B12345678",
    address_street: "Calle Ficticia 123",
    address_city: "Madrid",
    address_postal_code: "28001",
    business_sector: "Servicios tecnológicos",
    legal_representative: "Juan Pérez García",
    status: 'activo',
    client_type: 'empresa'
  },
  {
    name: "Innovación Digital S.A.",
    nif: "A87654321",
    address_street: "Avenida Principal 456",
    address_city: "Barcelona",
    address_postal_code: "08001",
    business_sector: "Desarrollo de software",
    legal_representative: "María López Martín",
    status: 'activo',
    client_type: 'empresa'
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
  return mockCompanyData.find(company => company.nif === nif.toUpperCase()) || null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nif } = await req.json();
    
    console.log('Looking up company with NIF:', nif);
    
    // Validate NIF format
    if (!validateNIF(nif)) {
      console.log('Invalid NIF format:', nif);
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

    console.log('eInforma Base URL:', baseUrl);
    console.log('Credentials configured:', !!clientId, !!clientSecret);

    // If credentials are not configured, use mock data
    if (!clientId || !clientSecret) {
      console.log('eInforma credentials not configured, using mock data');
      const mockData = getMockData(nif);
      
      if (mockData) {
        return new Response(
          JSON.stringify({
            success: true,
            data: mockData,
            source: 'simulated',
            note: 'Datos simulados - Configure las credenciales de eInforma para acceder a datos reales'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Empresa no encontrada en datos simulados'
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    try {
      console.log('Requesting OAuth token from:', `${baseUrl}/api/v1/oauth/token`);
      
      // Get OAuth2 token with proper scope
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
      console.log('OAuth token obtained successfully, scope: buscar:consultar:empresas');

      // Request company data
      const companyUrl = `${baseUrl}/api/v1/companies/${nif.trim().toUpperCase()}/report`;
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
        console.error('Company request failed:', errorText);
        throw new Error(`Company lookup failed: ${companyResponse.status}`);
      }

      const companyData = await companyResponse.json();
      console.log('Company data received, processing...');

      // Transform eInforma response to our format
      const transformedData: CompanyData = {
        name: companyData.nombre || companyData.razonSocial || companyData.denominacion || '',
        nif: nif.trim().toUpperCase(),
        address_street: companyData.direccion?.calle || companyData.domicilio?.direccion || '',
        address_city: companyData.direccion?.municipio || companyData.domicilio?.municipio || '',
        address_postal_code: companyData.direccion?.codigoPostal || companyData.domicilio?.codigoPostal || '',
        business_sector: companyData.actividad?.descripcion || companyData.cnae?.descripcion || '',
        legal_representative: companyData.representanteLegal?.nombre || '',
        status: companyData.situacion === 'ACTIVA' || companyData.estado === 'ACTIVA' ? 'activo' : 'inactivo',
        client_type: 'empresa'
      };

      console.log('Company data transformed successfully');

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
      console.log('eInforma API error, using mock data');
      console.error('eInforma API error details:', apiError);
      
      // Fallback to mock data
      const mockData = getMockData(nif);
      
      if (mockData) {
        return new Response(
          JSON.stringify({
            success: true,
            data: mockData,
            source: 'simulated',
            note: 'API de eInforma no disponible - Usando datos simulados'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        console.log('Company not found in eInforma, using mock data');
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
    console.error('Unexpected error in company-lookup-einforma:', error);
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