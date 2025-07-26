// Cache breaker utility to force refresh of problematic queries
export const CACHE_VERSION = Date.now();

// Force reload of React Query cache for specific keys
export const invalidateQueryKeys = [
  'lead_activities',
  'valoraciones',
  'companies',
  'contacts'
];

// Add timestamp to break cache
export const getCacheKey = (baseKey: string) => `${baseKey}_v${CACHE_VERSION}`;