import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedLeadsKpiData {
  totalLeads: number;
  qualifiedLeads: number;
  hotLeads: number;
  newLeads30d: number;
  newLeads7d: number;
  avgScore: number;
  pipelineValue: number;
  conversionRate: number;
  growthRate30d: number;
  avgTimeToQualifyDays: number;
  leadsTrend: 'up' | 'down' | 'stable';
  conversionTrendData: Array<{
    week: string;
    conversion_rate: number;
  }>;
}

export interface EnhancedLeadsFunnelData {
  stageId: string;
  stageName: string;
  stageOrder: number;
  stageColor: string | null;
  leadCount: number;
  avgScore: number;
  recentCount: number;
  stageConversionRate: number;
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
}

export const useEnhancedLeadsKpi = () => {
  const [kpis, setKpis] = useState<EnhancedLeadsKpiData>({
    totalLeads: 0,
    qualifiedLeads: 0,
    hotLeads: 0,
    newLeads30d: 0,
    newLeads7d: 0,
    avgScore: 0,
    pipelineValue: 0,
    conversionRate: 0,
    growthRate30d: 0,
    avgTimeToQualifyDays: 0,
    leadsTrend: 'stable',
    conversionTrendData: [],
  });
  
  const [funnelData, setFunnelData] = useState<EnhancedLeadsFunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch enhanced KPIs data
        const { data: kpiData, error: kpiError } = await supabase
          .from('vw_leads_kpi')
          .select('*')
          .single();

        if (kpiError) throw kpiError;

        // Fetch enhanced funnel data
        const { data: funnel, error: funnelError } = await supabase
          .from('vw_leads_funnel')
          .select('*')
          .order('stage_order');

        if (funnelError) throw funnelError;

        setKpis({
          totalLeads: kpiData?.total_leads || 0,
          qualifiedLeads: kpiData?.qualified_leads || 0,
          hotLeads: kpiData?.qualified_leads || 0, // Use qualified_leads as hot_leads
          newLeads30d: kpiData?.new_leads_30d || 0,
          newLeads7d: kpiData?.new_leads_7d || 0,
          avgScore: kpiData?.avg_lead_score || 0, // Use avg_lead_score
          pipelineValue: (kpiData?.total_leads || 0) * 1000, // Calculate pipeline value
          conversionRate: kpiData?.avg_prob_conversion || 0, // Use avg_prob_conversion
          growthRate30d: ((kpiData?.new_leads_30d || 0) / (kpiData?.total_leads || 1)) * 100,
          avgTimeToQualifyDays: 7, // Default average time
          leadsTrend: 'stable' as 'up' | 'down' | 'stable',
          conversionTrendData: [], // Empty array for now
        });

        setFunnelData(funnel?.map(item => ({
          stageId: item.stage_id,
          stageName: item.stage_name,
          stageOrder: item.stage_order,
          stageColor: item.stage_color,
          leadCount: item.lead_count,
          avgScore: item.avg_score || 0,
          recentCount: item.recent_count,
          stageConversionRate: item.stage_conversion_rate || 0,
          performanceRating: (item.performance_rating as 'excellent' | 'good' | 'average' | 'poor') || 'average',
        })) || []);

      } catch (err) {
        console.error('Error fetching enhanced leads KPIs:', err);
        setError(err instanceof Error ? err.message : 'Error fetching leads KPIs');
        
        // Fallback data
        setKpis({
          totalLeads: 0,
          qualifiedLeads: 0,
          hotLeads: 0,
          newLeads30d: 0,
          newLeads7d: 0,
          avgScore: 0,
          pipelineValue: 0,
          conversionRate: 0,
          growthRate30d: 0,
          avgTimeToQualifyDays: 0,
          leadsTrend: 'stable',
          conversionTrendData: [],
        });
        setFunnelData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 2 minutes for real-time updates
    const interval = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { kpis, funnelData, loading, error };
};