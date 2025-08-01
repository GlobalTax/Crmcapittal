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
          hotLeads: kpiData?.hot_leads || 0,
          newLeads30d: kpiData?.new_leads_30d || 0,
          newLeads7d: kpiData?.new_leads_7d || 0,
          avgScore: kpiData?.avg_score || 0,
          pipelineValue: kpiData?.pipeline_value || 0,
          conversionRate: kpiData?.conversion_rate || 0,
          growthRate30d: kpiData?.growth_rate_30d || 0,
          avgTimeToQualifyDays: kpiData?.avg_time_to_qualify_days || 0,
          leadsTrend: (kpiData?.leads_trend as 'up' | 'down' | 'stable') || 'stable',
          conversionTrendData: Array.isArray(kpiData?.conversion_trend_data) ? 
            kpiData.conversion_trend_data.map((item: any) => ({
              week: item.week,
              conversion_rate: item.conversion_rate
            })) : [],
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