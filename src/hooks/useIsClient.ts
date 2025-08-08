import { useState, useEffect } from 'react';

/**
 * Hook to detect if the component is running on the client side.
 * Prevents hydration mismatches for components that use browser-only APIs.
 * 
 * @returns boolean - true after hydration is complete, false during SSR/initial render
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}