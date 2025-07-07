/**
 * Edge Function para Gestión de Secretos
 * 
 * Proporciona endpoints para validar y gestionar secretos del sistema
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuraciones de servicios externos
const SERVICE_CONFIGS = {
  einforma: {
    name: 'eInforma',
    requiredSecrets: ['EINFORMA_CLIENT_ID', 'EINFORMA_CLIENT_SECRET'],
    optionalSecrets: ['EINFORMA_BASE_URL'],
    testEndpoint: 'https://api.einforma.com/health',
  },
  microsoft: {
    name: 'Microsoft Graph',
    requiredSecrets: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET', 'MICROSOFT_TENANT_ID'],
    optionalSecrets: ['MICROSOFT_REDIRECT_URI'],
    testEndpoint: 'https://graph.microsoft.com/v1.0/me',
  },
  openai: {
    name: 'OpenAI',
    requiredSecrets: ['OPENAI_API_KEY'],
    optionalSecrets: [],
    testEndpoint: 'https://api.openai.com/v1/models',
  },
  quantum: {
    name: 'Quantum Economics',
    requiredSecrets: ['QUANTUM_API_TOKEN'],
    optionalSecrets: ['QUANTUM_BASE_URL'],
    testEndpoint: 'https://app.quantumeconomics.es/api/health',
  },
};

/**
 * Valida configuración de un servicio específico
 */
async function validateServiceConfiguration(serviceName: string) {
  const config = SERVICE_CONFIGS[serviceName as keyof typeof SERVICE_CONFIGS];
  if (!config) {
    throw new Error(`Servicio ${serviceName} no encontrado`);
  }

  const results = {
    service: config.name,
    requiredSecrets: [] as Array<{key: string, configured: boolean}>,
    optionalSecrets: [] as Array<{key: string, configured: boolean}>,
    connectivity: { success: false, message: '' }
  };

  // Verificar secretos requeridos
  for (const secret of config.requiredSecrets) {
    const value = Deno.env.get(secret);
    results.requiredSecrets.push({
      key: secret,
      configured: !!value && value.length > 0
    });
  }

  // Verificar secretos opcionales
  for (const secret of config.optionalSecrets) {
    const value = Deno.env.get(secret);
    results.optionalSecrets.push({
      key: secret,
      configured: !!value && value.length > 0
    });
  }

  // Test de conectividad (solo para servicios configurados)
  const allRequiredConfigured = results.requiredSecrets.every(s => s.configured);
  if (allRequiredConfigured && config.testEndpoint) {
    try {
      let headers: Record<string, string> = {};
      
      // Configurar headers según el servicio
      switch (serviceName) {
        case 'openai':
          headers['Authorization'] = `Bearer ${Deno.env.get('OPENAI_API_KEY')}`;
          break;
        case 'microsoft':
          headers['Authorization'] = `Bearer ${Deno.env.get('MICROSOFT_ACCESS_TOKEN')}`;
          break;
        case 'quantum':
          headers['Authorization'] = `API-KEY ${Deno.env.get('QUANTUM_API_TOKEN')}`;
          break;
        case 'einforma':
          headers['Authorization'] = `Bearer ${Deno.env.get('EINFORMA_CLIENT_SECRET')}`;
          break;
      }

      const response = await fetch(config.testEndpoint, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });

      if (response.ok || response.status === 401) { // 401 puede indicar que la API está disponible
        results.connectivity = { success: true, message: 'Conectividad confirmada' };
      } else {
        results.connectivity = { 
          success: false, 
          message: `HTTP ${response.status}: ${response.statusText}` 
        };
      }
    } catch (error) {
      results.connectivity = { 
        success: false, 
        message: error instanceof Error ? error.message : 'Error de conectividad' 
      };
    }
  } else {
    results.connectivity = { 
      success: false, 
      message: 'Secretos requeridos no configurados' 
    };
  }

  return results;
}

/**
 * Obtiene el estado general de todos los servicios
 */
async function getSystemStatus() {
  const services = [];
  
  for (const serviceName of Object.keys(SERVICE_CONFIGS)) {
    try {
      const validation = await validateServiceConfiguration(serviceName);
      services.push({
        name: serviceName,
        ...validation
      });
    } catch (error) {
      services.push({
        name: serviceName,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Calcular estadísticas generales
  const totalSecrets = services.reduce((acc, service) => 
    acc + (service.requiredSecrets?.length || 0) + (service.optionalSecrets?.length || 0), 0
  );
  
  const configuredSecrets = services.reduce((acc, service) => 
    acc + (service.requiredSecrets?.filter(s => s.configured).length || 0) + 
    (service.optionalSecrets?.filter(s => s.configured).length || 0), 0
  );

  const connectedServices = services.filter(s => s.connectivity?.success).length;

  return {
    services,
    stats: {
      totalSecrets,
      configuredSecrets,
      configurationHealth: totalSecrets > 0 ? configuredSecrets / totalSecrets : 0,
      connectedServices,
      totalServices: services.length,
      connectivityHealth: services.length > 0 ? connectedServices / services.length : 0
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Ejecuta diagnósticos de health check
 */
async function runHealthCheck() {
  const results = {
    supabase: { success: false, message: '' },
    environment: { success: false, message: '' },
    services: [] as any[],
    timestamp: new Date().toISOString()
  };

  // Test Supabase
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      results.supabase = { 
        success: false, 
        message: 'Variables SUPABASE_URL o SUPABASE_ANON_KEY no configuradas' 
      };
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        results.supabase = { success: false, message: error.message };
      } else {
        results.supabase = { success: true, message: 'Conexión exitosa' };
      }
    }
  } catch (error) {
    results.supabase = { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }

  // Test Environment
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !Deno.env.get(varName));
  
  if (missingVars.length === 0) {
    results.environment = { success: true, message: 'Variables de entorno requeridas configuradas' };
  } else {
    results.environment = { 
      success: false, 
      message: `Variables faltantes: ${missingVars.join(', ')}` 
    };
  }

  // Test Services
  for (const serviceName of Object.keys(SERVICE_CONFIGS)) {
    try {
      const validation = await validateServiceConfiguration(serviceName);
      results.services.push(validation);
    } catch (error) {
      results.services.push({
        service: serviceName,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return results;
}

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    switch (path) {
      case '/status':
        const systemStatus = await getSystemStatus();
        return new Response(JSON.stringify(systemStatus), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case '/health':
        const healthCheck = await runHealthCheck();
        return new Response(JSON.stringify(healthCheck), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case '/validate':
        const serviceName = url.searchParams.get('service');
        if (!serviceName) {
          return new Response(JSON.stringify({ error: 'Parámetro service requerido' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const validation = await validateServiceConfiguration(serviceName);
        return new Response(JSON.stringify(validation), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case '/services':
        return new Response(JSON.stringify(SERVICE_CONFIGS), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Endpoint no encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in secrets-manager function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});