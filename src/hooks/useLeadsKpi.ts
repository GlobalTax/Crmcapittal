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
        
        // Fetch KPIs data from leads table directly (fallback)
        const { data: kpiData, error: kpiError } = await supabase
          .from('leads')
          .select('id, probability, created_at');

        if (kpiError) throw kpiError;

        // Fetch funnel data from leads table directly (fallback)
        const { data: funnel, error: funnelError } = await supabase
          .from('leads')
          .select('pipeline_stage_id, name')
          .order('created_at', { ascending: false })
          .limit(10);

        if (funnelError) throw funnelError;

        setKpis({
          totalLeads: kpiData?.length || 0,
          hotLeads: kpiData?.filter(lead => lead.probability > 70).length || 0,
          conversionRate: kpiData?.reduce((sum, lead) => sum + (lead.probability || 0), 0) / (kpiData?.length || 1),
          pipelineValue: (kpiData?.length || 0) * 1000,
        });

        setFunnelData(funnel?.map((item, idx) => ({
          stageName: item.pipeline_stage_id || 'Sin etapa',
          stageOrder: idx,
          stageColor: null,
          leadCount: 1, // Fixed count since we don't have aggregated data
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