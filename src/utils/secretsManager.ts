/**
 * Sistema de Gestión de Secretos Seguro
 * 
 * Este módulo proporciona una interfaz segura para acceder a variables de entorno
 * y secretos del sistema, con validación y manejo de errores.
 */

import { secureLogger } from './secureLogger';

interface SecretConfig {
  required: boolean;
  defaultValue?: string;
  validator?: (value: string) => boolean;
}

const SECRET_CONFIGS: Record<string, SecretConfig> = {
  // Supabase
  VITE_SUPABASE_URL: { required: true },
  VITE_SUPABASE_ANON_KEY: { required: true },
  
  // APIs Externas
  VITE_CAPITAL_MARKET_API_KEY: { required: false },
  VITE_WEBHOOK_SECRET_KEY: { required: false },
  
  // eInforma
  EINFORMA_CLIENT_ID: { required: false },
  EINFORMA_CLIENT_SECRET: { required: false },
  EINFORMA_BASE_URL: { 
    required: false, 
    defaultValue: 'https://api.einforma.com',
    validator: (url) => url.startsWith('https://')
  },
  
  // Microsoft
  MICROSOFT_CLIENT_ID: { required: false },
  MICROSOFT_CLIENT_SECRET: { required: false },
  MICROSOFT_TENANT_ID: { required: false },
  MICROSOFT_REDIRECT_URI: { required: false },
  
  // OpenAI
  OPENAI_API_KEY: { required: false },
  
  // Quantum Economics
  QUANTUM_API_TOKEN: { required: false },
  QUANTUM_BASE_URL: { 
    required: false, 
    defaultValue: 'https://app.quantumeconomics.es',
    validator: (url) => url.startsWith('https://')
  },
  
  // Integraloop
  INTEGRALOOP_SUBSCRIPTION_KEY: { required: false },
  INTEGRALOOP_API_USER: { required: false },
  INTEGRALOOP_API_PASSWORD: { required: false },
  INTEGRALOOP_BASE_URL: { 
    required: false, 
    validator: (url) => url.startsWith('https://')
  }
};

/**
 * Obtiene un secreto de forma segura
 * @param key - Clave del secreto
 * @returns Valor del secreto
 * @throws Error si el secreto es requerido pero no está configurado
 */
export const getSecret = (key: string): string => {
  const config = SECRET_CONFIGS[key];
  if (!config) {
    secureLogger.error(`Secret ${key} not configured in SECRET_CONFIGS`);
    throw new Error(`Secret ${key} not configured in SECRET_CONFIGS`);
  }

  let value = import.meta.env[key] || config.defaultValue;

  if (config.required && !value) {
    secureLogger.security('missing_required_secret', 'high', { secretKey: key });
    throw new Error(`Required secret ${key} is not configured`);
  }

  if (value && config.validator && !config.validator(value)) {
    secureLogger.security('secret_validation_failed', 'medium', { secretKey: key });
    throw new Error(`Secret ${key} failed validation`);
  }

  return value || '';
};

/**
 * Obtiene un secreto de forma segura con valor por defecto
 * @param key - Clave del secreto
 * @param defaultValue - Valor por defecto si no está configurado
 * @returns Valor del secreto o valor por defecto
 */
export const getSecretOrDefault = (key: string, defaultValue: string): string => {
  try {
    return getSecret(key);
  } catch {
    secureLogger.debug(`Using default value for secret ${key}`);
    return defaultValue;
  }
};

/**
 * Verifica si un secreto está configurado
 * @param key - Clave del secreto
 * @returns true si está configurado, false en caso contrario
 */
export const isSecretConfigured = (key: string): boolean => {
  try {
    getSecret(key);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida que todos los secretos requeridos estén configurados
 * @returns Array de errores de configuración
 */
export const validateSecrets = (): string[] => {
  const errors: string[] = [];
  
  Object.entries(SECRET_CONFIGS).forEach(([key, config]) => {
    if (config.required) {
      try {
        getSecret(key);
      } catch (error) {
        const errorMessage = `${key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        secureLogger.error(`Secret validation failed for ${key}`, { key }, error instanceof Error ? error : undefined);
      }
    }
  });
  
  return errors;
};

/**
 * Obtiene configuración de Supabase de forma segura
 */
export const getSupabaseConfig = () => {
  try {
    return {
      url: getSecret('VITE_SUPABASE_URL'),
      anonKey: getSecret('VITE_SUPABASE_ANON_KEY')
    };
  } catch (error) {
    secureLogger.error('Failed to get Supabase configuration', {}, error instanceof Error ? error : undefined);
    throw error;
  }
};

/**
 * Obtiene configuración de eInforma de forma segura
 */
export const getEInformaConfig = () => {
  return {
    clientId: getSecretOrDefault('EINFORMA_CLIENT_ID', ''),
    clientSecret: getSecretOrDefault('EINFORMA_CLIENT_SECRET', ''),
    baseUrl: getSecretOrDefault('EINFORMA_BASE_URL', 'https://api.einforma.com')
  };
};

/**
 * Obtiene configuración de Quantum Economics de forma segura
 */
export const getQuantumConfig = () => {
  return {
    token: getSecretOrDefault('QUANTUM_API_TOKEN', ''),
    baseUrl: getSecretOrDefault('QUANTUM_BASE_URL', 'https://app.quantumeconomics.es')
  };
};

/**
 * Obtiene configuración de Integraloop de forma segura
 */
export const getIntegraloopConfig = () => {
  return {
    subscriptionKey: getSecretOrDefault('INTEGRALOOP_SUBSCRIPTION_KEY', ''),
    apiUser: getSecretOrDefault('INTEGRALOOP_API_USER', ''),
    apiPassword: getSecretOrDefault('INTEGRALOOP_API_PASSWORD', ''),
    baseUrl: getSecretOrDefault('INTEGRALOOP_BASE_URL', '')
  };
};

/**
 * Obtiene configuración de Microsoft de forma segura
 */
export const getMicrosoftConfig = () => {
  return {
    clientId: getSecretOrDefault('MICROSOFT_CLIENT_ID', ''),
    clientSecret: getSecretOrDefault('MICROSOFT_CLIENT_SECRET', ''),
    tenantId: getSecretOrDefault('MICROSOFT_TENANT_ID', ''),
    redirectUri: getSecretOrDefault('MICROSOFT_REDIRECT_URI', '')
  };
};

/**
 * Obtiene configuración de OpenAI de forma segura
 */
export const getOpenAIConfig = () => {
  return {
    apiKey: getSecretOrDefault('OPENAI_API_KEY', '')
  };
};

/**
 * Obtiene configuración de Capital Market de forma segura
 */
export const getCapitalMarketConfig = () => {
  return {
    apiKey: getSecretOrDefault('VITE_CAPITAL_MARKET_API_KEY', ''),
    webhookSecret: getSecretOrDefault('VITE_WEBHOOK_SECRET_KEY', '')
  };
};

// Validación inicial al cargar el módulo
const errors = validateSecrets();
if (errors.length > 0) {
  secureLogger.warn('Secret validation errors found during initialization', { errors });
}