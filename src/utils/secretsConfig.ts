/**
 * Tests de validación para el sistema de secretos
 */

import { getSecret, getSecretOrDefault, isSecretConfigured, validateSecrets } from './secretsManager';
import { secureLogger } from './secureLogger';

/**
 * Ejecuta tests de validación del sistema de secretos
 */
export const runSecretValidationTests = () => {
  secureLogger.info('🔍 Ejecutando tests de validación del sistema de secretos...');

  const tests = [
    testRequiredSecrets,
    testOptionalSecrets,
    testSecretValidation,
    testEnvironmentDetection
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    try {
      test();
      secureLogger.info(`✅ Test ${index + 1} pasado: ${test.name}`);
      passed++;
    } catch (error) {
      secureLogger.error(`❌ Test ${index + 1} falló: ${test.name}`, {}, error instanceof Error ? error : undefined);
      failed++;
    }
  });

  secureLogger.info(`📊 Resultados: ${passed} pasados, ${failed} fallidos`);
  return { passed, failed, total: tests.length };
};

function testRequiredSecrets() {
  // Test que los secretos requeridos lanzan error si no están configurados
  const requiredSecrets = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  
  requiredSecrets.forEach(secret => {
    if (!isSecretConfigured(secret)) {
      throw new Error(`Required secret ${secret} not configured`);
    }
  });
}

function testOptionalSecrets() {
  // Test que los secretos opcionales devuelven valor por defecto
  const result = getSecretOrDefault('NONEXISTENT_SECRET', 'default_value');
  if (result !== 'default_value') {
    throw new Error('Optional secret default value not working');
  }
}

function testSecretValidation() {
  // Test validación de URLs
  const errors = validateSecrets();
  secureLogger.debug('Validation errors found', { errors });
  
  // No debe fallar la validación si todo está configurado correctamente
  if (errors.length > 2) { // Solo esperamos errores en secretos opcionales
    throw new Error(`Too many validation errors: ${errors.length}`);
  }
}

function testEnvironmentDetection() {
  // Test que detecta correctamente el entorno
  const isClient = typeof window !== 'undefined';
  secureLogger.debug('Environment detection', { isClient });
  
  // Debe poder obtener al menos las variables VITE_ en el cliente
  if (isClient) {
    try {
      getSecret('VITE_SUPABASE_URL');
      // Si no lanza error, está funcionando
    } catch (error) {
      throw new Error('Environment detection failed for client');
    }
  }
}

/**
 * Monitorea la configuración de secretos en tiempo real
 */
export const startSecretsMonitoring = () => {
  secureLogger.info('🔄 Iniciando monitoreo de configuración de secretos...');
  
  // Ejecutar tests iniciales
  runSecretValidationTests();
  
  // Configurar monitoreo periódico (cada 5 minutos)
  if (typeof window !== 'undefined') {
    setInterval(() => {
      const errors = validateSecrets();
      if (errors.length > 0) {
        secureLogger.security('secrets_validation_failed', 'medium', { 
          errorCount: errors.length,
          errors: errors.slice(0, 3) // Solo los primeros 3 para evitar spam
        });
      }
    }, 5 * 60 * 1000);
  }
};

/**
 * Obtiene estadísticas del sistema de secretos
 */
export const getSecretsStats = () => {
  const totalSecrets = Object.keys(getSecret).length;
  const configuredSecrets = Object.keys(getSecret).filter(key => isSecretConfigured(key)).length;
  const errors = validateSecrets();
  
  return {
    total: totalSecrets,
    configured: configuredSecrets,
    missing: totalSecrets - configuredSecrets,
    errors: errors.length,
    configurationHealth: configuredSecrets / totalSecrets
  };
};