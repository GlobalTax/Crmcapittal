import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface VentaKpisData {
  activeTx: number;
  txValue: number;
}

export const useKpisVenta = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<VentaKpisData>({
    activeTx: 0,
    txValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchKpis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get transactions data from deals table (non-venta type deals are transactions)
        const txQuery = await supabase
          .from('deals')
          .select('deal_value')
          .eq('created_by', user.id)
          .eq('is_active', true)
          .neq('deal_type', 'venta');
        
        const activeTx = txQuery.data?.length || 0;
        const txValue = txQuery.data?.reduce((sum, deal) => sum + (deal.deal_value || 0), 0) || 0;

        setKpis({
          activeTx,
          txValue,
        });

      } catch (err) {
        console.error('Error fetching venta KPIs:', err);
        setError(err instanceof Error ? err.message : 'Error fetching venta KPIs');
        
        // Fallback data
        setKpis({
          activeTx: 0,
          txValue: 0,
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