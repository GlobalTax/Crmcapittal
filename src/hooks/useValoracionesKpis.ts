import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/useAuthStore';
import { supabase } from '@/integrations/supabase/client';

interface ValoracionesKpisData {
  totalValoraciones: number;
  valoracionesPendientes: number;
  valoracionesEnProceso: number;
  valoracionesCompletadas: number;
  ingresosTotales: number;
  valoracionesUrgentes: number;
  valoracionesSinAsignar: number;
  promedioEvPorValoracion: number;
}

export const useValoracionesKpis = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<ValoracionesKpisData>({
    totalValoraciones: 0,
    valoracionesPendientes: 0,
    valoracionesEnProceso: 0,
    valoracionesCompletadas: 0,
    ingresosTotales: 0,
    valoracionesUrgentes: 0,
    valoracionesSinAsignar: 0,
    promedioEvPorValoracion: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchKpis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch valoraciones data
        const { data: valoraciones, error: valoracionesError } = await supabase
          .from('valoraciones')
          .select('*');

        if (valoracionesError) throw valoracionesError;

        const totalValoraciones = valoraciones?.length || 0;
        const valoracionesPendientes = valoraciones?.filter(v => v.status === 'requested').length || 0;
        const valoracionesEnProceso = valoraciones?.filter(v => v.status === 'in_process').length || 0;
        const valoracionesCompletadas = valoraciones?.filter(v => v.status === 'completed' || v.status === 'delivered').length || 0;
        const valoracionesUrgentes = valoraciones?.filter(v => v.priority === 'urgent' || v.priority === 'high').length || 0;
        const valoracionesSinAsignar = valoraciones?.filter(v => !v.assigned_to).length || 0;
        
        // Calculate financial metrics
        const valoracionesConEv = valoraciones?.filter(v => v.valoracion_ev && v.valoracion_ev > 0) || [];
        const ingresosTotales = valoracionesConEv.reduce((sum, v) => sum + (v.valoracion_ev || 0), 0);
        const promedioEvPorValoracion = valoracionesConEv.length > 0 ? ingresosTotales / valoracionesConEv.length : 0;

        setKpis({
          totalValoraciones,
          valoracionesPendientes,
          valoracionesEnProceso,
          valoracionesCompletadas,
          ingresosTotales,
          valoracionesUrgentes,
          valoracionesSinAsignar,
          promedioEvPorValoracion,
        });

      } catch (err) {
        console.error('Error fetching valoraciones KPIs:', err);
        setError(err instanceof Error ? err.message : 'Error fetching valoraciones KPIs');
        
        // Fallback data
        setKpis({
          totalValoraciones: 0,
          valoracionesPendientes: 0,
          valoracionesEnProceso: 0,
          valoracionesCompletadas: 0,
          ingresosTotales: 0,
          valoracionesUrgentes: 0,
          valoracionesSinAsignar: 0,
          promedioEvPorValoracion: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();

    // Refresh every 5 minutes
    const interval = setInterval(fetchKpis, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return { kpis, loading, error };
};