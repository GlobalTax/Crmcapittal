
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
        
        // Pending tasks - count only
        const { count: pendingTasksCount } = await supabase
          .from('user_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', false);

        // Leads assigned - count only  
        const { count: leadsCount } = await supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id)
          .eq('is_active', true);

        // Active deals - count only
        const { count: activeDealsCount } = await supabase
          .from('negocios')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id)
          .neq('stage', 'Cerrado');

        // Revenue calculation - separate simple query
        let estimatedRevenue = 0;
        const revenueResult = await supabase
          .from('negocios')
          .select('valor_negocio, fecha_cierre')
          .eq('created_by', user.id)
          .neq('stage', 'Cerrado');

        if (revenueResult.data) {
          const today = new Date().toISOString();
          
          for (const deal of revenueResult.data) {
            const dealValue = deal.valor_negocio;
            const closeDate = deal.fecha_cierre;
            
            if (dealValue && (!closeDate || closeDate > today)) {
              estimatedRevenue += dealValue;
            }
          }
        }

        setKpis({
          pendingTasks: pendingTasksCount || 0,
          leadsAssigned: leadsCount || 0,
          activeDeals: activeDealsCount || 0,
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
