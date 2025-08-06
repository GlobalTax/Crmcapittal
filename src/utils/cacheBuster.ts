
// Cache buster utility para forzar recargas completas
export const CACHE_VERSION = Date.now();

// Generar IDs únicos para forzar re-render de componentes problemáticos
export const generateCacheBusterKey = (componentName: string) => {
  return `${componentName}_${CACHE_VERSION}_${Math.random().toString(36).substr(2, 9)}`;
};

// Limpiar localStorage relacionado con leads
export const clearLeadCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('lead') || key.includes('proposal')) {
      localStorage.removeItem(key);
    }
  });
};

// Forzar limpieza completa del navegador (solo desarrollo)
export const forceHardRefresh = () => {
  if (typeof window !== 'undefined') {
    // Limpiar todos los caches posibles
    clearLeadCache();
    
    // Forzar recarga completa
    window.location.reload();
  }
};
