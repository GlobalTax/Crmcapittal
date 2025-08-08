import { useEffect, useState } from 'react';

/**
 * Hook para detectar si estamos en el cliente (browser)
 * Útil para componentes que requieren DOM (como DnD) y prevenir errores de hidratación
 */
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};