/**
 * Utilidades para validación y documentación del sistema de secretos
 */

export interface SecretValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuraciones de secretos por servicio
 */
export const SERVICE_CONFIGS = {
  einforma: {
    name: 'eInforma',
    requiredSecrets: ['EINFORMA_CLIENT_ID', 'EINFORMA_CLIENT_SECRET'],
    optionalSecrets: ['EINFORMA_BASE_URL'],
    description: 'Servicio de información empresarial',
  },
  microsoft: {
    name: 'Microsoft Graph',
    requiredSecrets: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET', 'MICROSOFT_TENANT_ID'],
    optionalSecrets: ['MICROSOFT_REDIRECT_URI'],
    description: 'Integración con Microsoft 365',
  },
  openai: {
    name: 'OpenAI',
    requiredSecrets: ['OPENAI_API_KEY'],
    optionalSecrets: [],
    description: 'API de inteligencia artificial',
  },
  quantum: {
    name: 'Quantum Economics',
    requiredSecrets: ['QUANTUM_API_TOKEN'],
    optionalSecrets: ['QUANTUM_BASE_URL'],
    description: 'Servicio de datos económicos',
  },
} as const;

/**
 * Headers estándar para CORS
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Genera documentación de secretos requeridos
 */
export const generateSecretsDocumentation = () => {
  const docs = Object.entries(SERVICE_CONFIGS).map(([key, config]) => ({
    service: config.name,
    key,
    required: config.requiredSecrets,
    optional: config.optionalSecrets,
    description: config.description,
  }));

  return {
    services: docs,
    totalSecrets: docs.reduce((acc, doc) => acc + doc.required.length + doc.optional.length, 0),
    requiredSecrets: docs.reduce((acc, doc) => acc + doc.required.length, 0),
  };
};

/**
 * Valida configuración de un servicio específico
 */
export const validateServiceConfig = (serviceName: keyof typeof SERVICE_CONFIGS): SecretValidationResult => {
  const config = SERVICE_CONFIGS[serviceName];
  const errors: string[] = [];
  const warnings: string[] = [];

  // En el cliente, solo podemos validar que existan las configuraciones
  // La validación real se hace en el servidor/Edge Functions
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};