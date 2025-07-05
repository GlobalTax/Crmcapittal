
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface KpisData {
  pendingTasks: number;
  leadsAssigned: number;
  activeDeals: number;
  estimatedRevenue: number;
}

export const useKpis = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KpisData>({
    pendingTasks: 0,
    leadsAssigned: 0,
    activeDeals: 0,
    estimatedRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchKpis = async () => {
      try {
        setLoading(true);
        
        // Pending tasks
        const { count: pendingTasks } = await supabase
          .from('user_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', false);

        // Leads assigned (using deals table for now)
        const { count: leadsAssigned } = await supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id)
          .eq('is_active', true);

        // Active deals (negocios) - using correct column names
        const { count: activeDeals } = await supabase
          .from('negocios')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id)
          .neq('stage', 'Cerrado');

        // For estimated revenue, make a separate query
        const { data: revenueData } = await supabase
          .from('negocios')
          .select('valor_negocio, close_date')
          .eq('created_by', user.id)
          .neq('stage', 'Cerrado');

        // Calculate estimated revenue
        const today = new Date().toISOString();
        let estimatedRevenue = 0;
        if (revenueData) {
          estimatedRevenue = revenueData
            .filter((deal: any) => !deal.close_date || deal.close_date > today)
            .reduce((sum: number, deal: any) => sum + (deal.valor_negocio || 0), 0);
        }

        setKpis({
          pendingTasks: pendingTasks || 0,
          leadsAssigned: leadsAssigned || 0,
          activeDeals: activeDeals || 0,
          estimatedRevenue,
        });
      } catch (err) {
        console.error('Error fetching KPIs:', err);
        setError(err instanceof Error ? err.message : 'Error fetching KPIs');
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();

    // Refresh every 5 minutes
    const interval = setInterval(fetchKpis, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return { kpis, loading, error };
};
