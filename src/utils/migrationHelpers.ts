/**
 * Utilidades para migrar de Context Providers a Zustand stores
 */

import { secureLogger } from './secureLogger';

// Mock function para simular migración de datos
export const migrateContextToZustand = (contextName: string, data: any) => {
  secureLogger.info(`Migrating ${contextName} data to Zustand store`, {
    contextName,
    dataKeys: Object.keys(data || {}),
    timestamp: new Date().toISOString()
  });

  // En una implementación real, aquí se manejaría:
  // 1. Validación de datos
  // 2. Transformación de estructura si es necesaria  
  // 3. Migración gradual
  // 4. Cleanup de providers obsoletos

  return data;
};

// Helper para deprecar Context Providers gradualmente
export const createDeprecationWarning = (contextName: string, replacementStore: string) => {
  return () => {
    secureLogger.warn(`${contextName} is deprecated. Use ${replacementStore} instead`, {
      contextName,
      replacementStore,
      migration: 'in_progress'
    });
  };
};

// Funciones de compatibilidad para migración gradual
export const createBridgeHook = <T>(
  legacyHook: () => T,
  modernStore: () => T,
  hookName: string
) => {
  return (): T => {
    try {
      // Intentar usar el store moderno primero
      return modernStore();
    } catch (error) {
      // Fallback al hook legacy con warning
      secureLogger.warn(`Falling back to legacy ${hookName}`, {
        hookName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return legacyHook();
    }
  };
};