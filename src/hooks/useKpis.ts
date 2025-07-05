
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
        
        // Pending tasks - simplified query
        const pendingTasksQuery = await supabase
          .from('user_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', false);

        // Leads assigned - simplified query  
        const leadsQuery = await supabase
          .from('deals')
          .select('id', { count: 'exact', head: true })
          .eq('created_by', user.id)
          .eq('is_active', true);

        // Active deals - simplified query
        const activeDealsQuery = await supabase
          .from('negocios')
          .select('id', { count: 'exact', head: true })
          .eq('created_by', user.id)
          .neq('stage', 'Cerrado');

        // Revenue data - using correct column name fecha_cierre
        const revenueQuery = await supabase
          .from('negocios')
          .select('valor_negocio, fecha_cierre')
          .eq('created_by', user.id)
          .neq('stage', 'Cerrado');

        // Calculate estimated revenue
        const today = new Date().toISOString();
        let estimatedRevenue = 0;
        
        if (revenueQuery.data) {
          for (const deal of revenueQuery.data) {
            if (!deal.fecha_cierre || deal.fecha_cierre > today) {
              estimatedRevenue += deal.valor_negocio || 0;
            }
          }
        }

        setKpis({
          pendingTasks: pendingTasksQuery.count || 0,
          leadsAssigned: leadsQuery.count || 0,
          activeDeals: activeDealsQuery.count || 0,
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
