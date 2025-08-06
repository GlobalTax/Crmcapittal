import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Valoracion } from '@/types/Valoracion';

export const useValoracionesData = () => {
  return useQuery({
    queryKey: ['valoraciones'],
    queryFn: async (): Promise<Valoracion[]> => {
      const { data, error } = await supabase
        .from('valoraciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching valoraciones:', error);
        throw new Error('Error al cargar las valoraciones');
      }

      return (data || []) as Valoracion[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};