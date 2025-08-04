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
    console.error('Error mapping array:', error);
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
    console.error('Error mapping data:', error);
    return fallback;
  }
};