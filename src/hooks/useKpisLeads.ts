import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LeadsKpisData {
  activeLeads: number;
  leadsValue: number;
  conversionRate: number;
  closedThisMonth: number;
}

export const useKpisLeads = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<LeadsKpisData>({
    activeLeads: 0,
    leadsValue: 0,
    conversionRate: 0,
    closedThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchKpis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get leads data from deals table
        const [activeQuery, closedQuery] = await Promise.all([
          supabase
            .from('deals')
            .select('deal_value')
            .eq('created_by', user.id)
            .eq('is_active', true)
            .eq('deal_type', 'venta'),
          supabase
            .from('deals')
            .select('id')
            .eq('created_by', user.id)
            .eq('is_active', false)
            .gte('close_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        ]);
        
        const activeLeads = activeQuery.data?.length || 0;
        const leadsValue = activeQuery.data?.reduce((sum, deal) => sum + (deal.deal_value || 0), 0) || 0;
        const closedThisMonth = closedQuery.data?.length || 0;
        
        // Calculate conversion rate (demo calculation)
        const totalLeads = activeLeads + closedThisMonth;
        const conversionRate = totalLeads > 0 ? (closedThisMonth / totalLeads) * 100 : 0;

        setKpis({
          activeLeads,
          leadsValue,
          conversionRate,
          closedThisMonth,
        });

      } catch (err) {
        console.error('Error fetching leads KPIs:', err);
        setError(err instanceof Error ? err.message : 'Error fetching leads KPIs');
        
        // Fallback data
        setKpis({
          activeLeads: 0,
          leadsValue: 0,
          conversionRate: 0,
          closedThisMonth: 0,
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