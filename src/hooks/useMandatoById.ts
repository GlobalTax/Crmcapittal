import { useState, useEffect } from 'react';
import { useBuyingMandates } from './useBuyingMandates';
import { BuyingMandate } from '@/types/BuyingMandate';

export const useMandatoById = (id?: string) => {
  const { mandates, fetchMandates, isLoading: mandatesLoading } = useBuyingMandates();
  const [mandato, setMandato] = useState<BuyingMandate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (mandatesLoading) {
      setIsLoading(true);
      return;
    }

    if (!id) {
      setMandato(null);
      setIsLoading(false);
      return;
    }

    const foundMandate = mandates.find(m => m.id === id);
    if (foundMandate) {
      setMandato(foundMandate);
      setIsLoading(false);
    } else if (mandates.length === 0) {
      // Si no hay mandatos cargados, intentar cargarlos
      fetchMandates().then(() => {
        const foundAfterFetch = mandates.find(m => m.id === id);
        setMandato(foundAfterFetch || null);
        setIsLoading(false);
      });
    } else {
      // El mandato no existe
      setMandato(null);
      setIsLoading(false);
    }
  }, [id, mandates, mandatesLoading, fetchMandates]);

  return { mandato, isLoading };
};