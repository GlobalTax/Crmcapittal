/**
 * Production-safe console utilities
 * Prevents console.log statements from appearing in production builds
 */

export const devLog = (...args: any[]) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log(...args);
  }
};

export const devWarn = (...args: any[]) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(...args);
  }
};

export const devError = (...args: any[]) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.error(...args);
  }
};

// Always log errors in production for debugging
export const prodError = (...args: any[]) => {
  console.error(...args);
};

declare global {
  const __DEV__: boolean;
  const __PROD__: boolean;
}