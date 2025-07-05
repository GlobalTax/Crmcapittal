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
        
        // Get active leads from contacts table  
        const [activeLeadsQuery, closedDealsQuery] = await Promise.all([
          supabase
            .from('contacts')
            .select('investment_capacity_max, investment_capacity_min')
            .eq('created_by', user.id)
            .eq('is_active', true)
            .eq('lifecycle_stage', 'lead'),
          supabase
            .from('deals')
            .select('id, deal_value')
            .eq('created_by', user.id)
            .eq('is_active', false)
            .eq('deal_type', 'venta')
            .gte('close_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        ]);
        
        const activeLeads = activeLeadsQuery.data?.length || 0;
        const leadsValue = activeLeadsQuery.data?.reduce((sum, contact) => {
          // Use max capacity as estimated value, fallback to min, then 0
          return sum + (contact.investment_capacity_max || contact.investment_capacity_min || 0);
        }, 0) || 0;
        const closedThisMonth = closedDealsQuery.data?.length || 0;
        
        // Calculate conversion rate (closed deals vs total leads)
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