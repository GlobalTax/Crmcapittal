// Export all mappers
export * from './leadMappers';
export * from './operationMappers';

// Generic mapper utilities
export const mapArrayWithFallback = <T, U>(
  array: T[],
  mapper: (item: T) => U,
  fallback: U[] = []
): U[] => {
  try {
    return array?.map(mapper) || fallback;
  } catch (error) {
    // Use secure logger instead of console
    import('../secureLogger').then(({ secureLogger }) => 
      secureLogger.error('Error mapping array', { error: error instanceof Error ? error.message : error })
    );
    return fallback;
  }
};

export const mapWithErrorHandling = <T, U>(
  data: T,
  mapper: (data: T) => U,
  fallback: U
): U => {
  try {
    return mapper(data);
  } catch (error) {
    // Use secure logger instead of console
    import('../secureLogger').then(({ secureLogger }) => 
      secureLogger.error('Error mapping data', { error: error instanceof Error ? error.message : error })
    );
    return fallback;
  }
};