import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LeadsKpiData {
  totalLeads: number;
  hotLeads: number;
  conversionRate: number;
  pipelineValue: number;
}

interface LeadsFunnelData {
  stageName: string;
  stageOrder: number;
  stageColor: string | null;
  leadCount: number;
}

export const useLeadsKpi = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<LeadsKpiData>({
    totalLeads: 0,
    hotLeads: 0,
    conversionRate: 0,
    pipelineValue: 0,
  });
  const [funnelData, setFunnelData] = useState<LeadsFunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch KPIs data
        const { data: kpiData, error: kpiError } = await supabase
          .from('vw_dashboard_leads_kpi')
          .select('*')
          .single();

        if (kpiError) throw kpiError;

        // Fetch funnel data
        const { data: funnel, error: funnelError } = await supabase
          .from('vw_dashboard_leads_funnel')
          .select('*')
          .order('stage_order');

        if (funnelError) throw funnelError;

        setKpis({
          totalLeads: kpiData?.total_leads || 0,
          hotLeads: kpiData?.hot_leads || 0,
          conversionRate: kpiData?.conversion_rate || 0,
          pipelineValue: kpiData?.pipeline_value || 0,
        });

        setFunnelData(funnel?.map(item => ({
          stageName: item.stage_name,
          stageOrder: item.stage_order,
          stageColor: item.stage_color,
          leadCount: item.lead_count,
        })) || []);

      } catch (err) {
        console.error('Error fetching leads KPIs:', err);
        setError(err instanceof Error ? err.message : 'Error fetching leads KPIs');
        
        // Fallback data
        setKpis({
          totalLeads: 0,
          hotLeads: 0,
          conversionRate: 0,
          pipelineValue: 0,
        });
        setFunnelData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return { kpis, funnelData, loading, error };
};